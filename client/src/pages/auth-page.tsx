import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { ParticlesBackground } from "@/components/ui/particles-background";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedContainer } from "@/components/ui/animated-container";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Register schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  passwordConfirm: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine(data => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      passwordConfirm: "",
      email: "",
      firstName: "",
      lastName: "",
      terms: false
    }
  });
  
  // Effect to redirect after render if user is logged in
  // This ensures all hooks are called consistently before any possible returns
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left column with forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative overflow-hidden">
        {/* Interactive particle background */}
        <ParticlesBackground
          particleColor="#4F46E5"
          particleCount={30}
          particleSpeed={0.3}
          interactive={true}
        />
        
        {/* Decorative background elements */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-50 rounded-full opacity-60"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-50 rounded-full opacity-70"></div>
        
        <div className="w-full max-w-md relative z-10">
          <AnimatedContainer animation="slide-up" delay={100} duration={800}>
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">DataSync</h1>
                  <p className="text-sm text-gray-500">Sync • Customize • Visualize</p>
                </div>
              </div>
            </div>
          </AnimatedContainer>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-100 rounded-lg">
              <TabsTrigger 
                value="login" 
                className={`${activeTab === 'login' 
                  ? 'bg-white shadow-md text-blue-600 font-medium' 
                  : 'text-gray-500 hover:text-gray-700 bg-transparent'} 
                  rounded-md py-3 transition-all duration-200`}
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className={`${activeTab === 'register' 
                  ? 'bg-white shadow-md text-blue-600 font-medium' 
                  : 'text-gray-500 hover:text-gray-700 bg-transparent'} 
                  rounded-md py-3 transition-all duration-200`}
              >
                Register
              </TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <AnimatedContainer animation="scale-in" delay={200} duration={500}>
                <Card className="border-none shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-800">Welcome back</CardTitle>
                    <CardDescription className="text-gray-500">
                      Sign in to your account to continue
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                    <CardContent className="space-y-5 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-700">Username</Label>
                      <div className="relative">
                        <Input 
                          id="username" 
                          type="text" 
                          placeholder="johndoe" 
                          className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                          {...loginForm.register("username")}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-gray-700">Password</Label>
                        <a className="text-xs text-blue-600 hover:text-blue-500 font-medium" href="#">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                          {...loginForm.register("password")}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <label htmlFor="remember" className="text-sm text-gray-600">
                        Remember me for 30 days
                      </label>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <AnimatedButton 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md" 
                      disabled={loginMutation.isPending}
                      hoverScale={true}
                      hoverGlow={true}
                      rippleColor="rgba(255, 255, 255, 0.5)"
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Sign in to your account
                    </AnimatedButton>
                  </CardFooter>
                </form>
              </Card>
              <div className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                  onClick={() => setActiveTab("register")}
                >
                  Create an account
                </button>
              </div>
              </AnimatedContainer>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <AnimatedContainer animation="scale-in" delay={200} duration={500}>
                <Card className="border-none shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-800">Create an account</CardTitle>
                    <CardDescription className="text-gray-500">
                      Join DataSync to start syncing and visualizing your data
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                    <CardContent className="space-y-5 pt-4">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-700">First name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="John"
                          className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                          {...registerForm.register("firstName")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-700">Last name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Doe"
                          className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                          {...registerForm.register("lastName")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-700">Username</Label>
                      <div className="relative">
                        <Input 
                          id="username" 
                          placeholder="johndoe" 
                          className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                          {...registerForm.register("username")}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email address</Label>
                      <div className="relative">
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="john@example.com"
                          className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                          {...registerForm.register("email")}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">Password</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                          {...registerForm.register("password")}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passwordConfirm" className="text-gray-700">Confirm password</Label>
                      <div className="relative">
                        <Input 
                          id="passwordConfirm" 
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                          {...registerForm.register("passwordConfirm")}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      {registerForm.formState.errors.passwordConfirm && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {registerForm.formState.errors.passwordConfirm.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox 
                        id="terms" 
                        className="mt-0.5"
                        onCheckedChange={(checked) => {
                          registerForm.setValue("terms", checked === true);
                        }}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{" "}
                        <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    {registerForm.formState.errors.terms && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {registerForm.formState.errors.terms.message}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <AnimatedButton 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md" 
                      disabled={registerMutation.isPending}
                      hoverScale={true}
                      hoverGlow={true}
                      rippleColor="rgba(255, 255, 255, 0.5)"
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Create your account
                    </AnimatedButton>
                  </CardFooter>
                </form>
              </Card>
              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                  onClick={() => setActiveTab("login")}
                >
                  Sign in instead
                </button>
              </div>
              </AnimatedContainer>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right column with hero section */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 hidden lg:flex items-center justify-center p-12 relative overflow-hidden">
        {/* Animated particles background */}
        <ParticlesBackground
          particleColor="#ffffff"
          particleCount={40}
          particleSpeed={0.2}
          interactive={true}
          className="opacity-20"
        />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 opacity-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 opacity-10 rounded-full -translate-x-1/3 translate-y-1/3"></div>
        
        {/* Content */}
        <div className="relative max-w-lg text-white z-10">
          <AnimatedContainer animation="slide-right" delay={200} duration={800}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-8">
              <span className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-white">Real-time sync enabled</span>
            </div>
          </AnimatedContainer>
          
          <AnimatedContainer animation="slide-right" delay={400} duration={800}>
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Transform your Google Sheets into dynamic dashboards
            </h2>
          </AnimatedContainer>
          
          <AnimatedContainer animation="slide-right" delay={600} duration={800}>
            <p className="text-lg mb-10 text-blue-100">
              Connect your spreadsheets, add custom columns, and visualize your data with a modern, intuitive interface—all in one powerful platform.
            </p>
          </AnimatedContainer>
          
          <div className="space-y-6">
            <AnimatedContainer animation="fade-in" delay={800} duration={500}>
              <div className="flex items-start bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-transform duration-300 hover:translate-x-2 hover:bg-white/15">
                <div className="flex-shrink-0 p-1.5 bg-blue-500/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-white">Real-time Synchronization</h3>
                  <p className="text-blue-100 mt-1">Instant updates from your Google Sheets with no delays or manual refreshing required</p>
                </div>
              </div>
            </AnimatedContainer>
            
            <AnimatedContainer animation="fade-in" delay={1000} duration={500}>
              <div className="flex items-start bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-transform duration-300 hover:translate-x-2 hover:bg-white/15">
                <div className="flex-shrink-0 p-1.5 bg-blue-500/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-white">Custom Data Columns</h3>
                  <p className="text-blue-100 mt-1">Add dashboard-only columns that appear only in your view, keeping Google Sheets clean</p>
                </div>
              </div>
            </AnimatedContainer>
            
            <AnimatedContainer animation="fade-in" delay={1200} duration={500}>
              <div className="flex items-start bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-transform duration-300 hover:translate-x-2 hover:bg-white/15">
                <div className="flex-shrink-0 p-1.5 bg-blue-500/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-white">Secure & Private</h3>
                  <p className="text-blue-100 mt-1">Complete data isolation between users with robust authentication and session management</p>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
