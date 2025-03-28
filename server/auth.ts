import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Get JWT secret from environment variables with fallback
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";
const JWT_EXPIRATION = '24h'; // Token expires in 24 hours

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "session_secret_key_here",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create user with hashed password
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
      });
      
      // Generate JWT token
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      const token = jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
      
      // Login user automatically after registration
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ user: userWithoutPassword, token });
      });
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // User successfully authenticated
    const userWithoutPassword = { ...req.user } as any;
    delete userWithoutPassword.password;
    
    // Generate JWT token
    const token = jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    
    res.status(200).json({ user: userWithoutPassword, token });
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint - using both JWT and session auth
  app.get("/api/user", async (req, res) => {
    try {
      // First try JWT token from Authorization header
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        // Verify JWT token
        jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
          if (err) {
            // If JWT fails, check session authentication as fallback
            if (req.isAuthenticated()) {
              const userWithoutPassword = { ...req.user } as any;
              delete userWithoutPassword.password;
              return res.json(userWithoutPassword);
            }
            return res.status(401).json({ message: "Not authenticated" });
          }
          
          // JWT is valid, fetch fresh user data from database
          const user = await storage.getUser(decoded.id);
          if (!user) {
            return res.status(401).json({ message: "User not found" });
          }
          
          const userWithoutPassword = { ...user };
          delete userWithoutPassword.password;
          
          return res.json(userWithoutPassword);
        });
      } else if (req.isAuthenticated()) {
        // No JWT but session auth is valid
        const userWithoutPassword = { ...req.user } as any;
        delete userWithoutPassword.password;
        return res.json(userWithoutPassword);
      } else {
        // Neither JWT nor session auth is valid
        return res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error("Error in /api/user endpoint:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // JWT verification middleware with fallback to session
  const verifyToken = (req: any, res: any, next: any) => {
    // Check if already authenticated via session
    if (req.isAuthenticated()) {
      return next();
    }
    
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Verify the token
    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: "Token expired" });
        }
        return res.status(403).json({ message: "Invalid token" });
      }
      
      try {
        // Fetch full user data from database
        const user = await storage.getUser(decoded.id);
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }
        
        // Add the user to the request
        req.user = user;
        next();
      } catch (error) {
        console.error("Error fetching user in verifyToken middleware:", error);
        return res.status(500).json({ message: "Server error" });
      }
    });
  };

  // Protected route example
  app.get("/api/protected", verifyToken, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
  });

  return { verifyToken };
}
