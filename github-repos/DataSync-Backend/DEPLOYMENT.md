# DataSync Deployment Guide

This guide provides step-by-step instructions for deploying the DataSync application to Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account
- Vercel account
- Render account
- Google Sheets API key

## 1. Repository Setup

### Backend Repository Setup

1. Clone the backend repository:
   ```bash
   git clone https://github.com/servoserv/DataSync-Backend.git
   cd DataSync-Backend
   ```

2. Ensure the repository structure matches:
   ```
   /
   ├── server/         # Server code
   ├── shared/         # Shared types and schemas
   ├── package.json    # Backend dependencies
   ├── tsconfig.json   # TypeScript configuration
   ├── render.yaml     # Render deployment configuration
   └── README.md       # Project documentation
   ```

### Frontend Repository Setup

1. Clone the frontend repository:
   ```bash
   git clone https://github.com/servoserv/DataSync-Frontend.git
   cd DataSync-Frontend
   ```

2. Ensure the repository structure matches:
   ```
   /
   ├── src/            # React application code
   │   ├── components/ # UI components
   │   ├── hooks/      # Custom React hooks
   │   ├── lib/        # Utility functions
   │   ├── pages/      # Page components
   │   ├── shared/     # Shared types from backend
   │   └── main.tsx    # Entry point
   ├── public/         # Static assets
   ├── package.json    # Frontend dependencies
   ├── tsconfig.json   # TypeScript configuration
   ├── vite.config.ts  # Vite configuration
   └── README.md       # Project documentation
   ```

## 2. Backend Deployment (Render)

1. **Create a new Web Service on Render**:
   - Log in to your Render account
   - Click "New" -> "Web Service"
   - Connect your GitHub account and select the DataSync-Backend repository

2. **Configure the service**:
   - Name: `datasync-backend`
   - Environment: `Node`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free ($0/month)

3. **Set up environment variables**:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Generate a secure random string (e.g., use `openssl rand -hex 32`)
   - `SESSION_SECRET`: Generate a secure random string
   - `GOOGLE_SHEETS_API_KEY`: Your Google Sheets API key
   - `CORS_ORIGIN`: Your Vercel frontend URL (once deployed)

4. **Create a PostgreSQL database**:
   - In your Render dashboard, click "New" -> "PostgreSQL"
   - Name: `datasync-db`
   - Plan: Free ($0/month)
   - Create Database

5. **Link the database to your web service**:
   - In your web service settings, add an environment variable:
   - `DATABASE_URL`: The connection string from your PostgreSQL service (available in the database's "Connect" tab)

6. **Deploy the service**:
   - Click "Create Web Service"
   - Wait for the initial deploy to complete
   - Access your deployed API at the provided URL (e.g., `https://datasync-backend.onrender.com`)

7. **Run migrations**:
   - After deployment, go to your web service page
   - Click "Shell"
   - Run `npm run db:push` to set up your database schema

## 3. Frontend Deployment (Vercel)

1. **Create a new project on Vercel**:
   - Log in to your Vercel account
   - Click "Add New..." -> "Project"
   - Import your GitHub repository (DataSync-Frontend)

2. **Configure the project**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set up environment variables**:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://datasync-backend.onrender.com`)

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your frontend is now available at the provided Vercel URL

## 4. Verify Deployment

1. **Test authentication**:
   - Navigate to your Vercel URL
   - Register a new account
   - Log in with your credentials

2. **Test Google Sheets integration**:
   - Create a new table with a Google Sheet URL
   - Verify that the data loads correctly
   - Test the real-time updates feature

3. **Test custom columns**:
   - Add custom columns to a table
   - Enter values in the custom columns
   - Verify that the values persist across sessions

## 5. Custom Domain (Optional)

### Vercel Custom Domain

1. Go to your project settings in Vercel
2. Click on "Domains"
3. Add your custom domain and follow the verification steps

### Render Custom Domain

1. Go to your web service in Render
2. Click on "Settings" and then "Custom Domain"
3. Add your custom domain and follow the verification steps

## 6. Troubleshooting

### Backend Issues

- **Database Connection Errors**: Verify the DATABASE_URL environment variable
- **CORS Errors**: Ensure the CORS_ORIGIN is set correctly to your frontend URL
- **Auth Issues**: Check JWT_SECRET and SESSION_SECRET environment variables

### Frontend Issues

- **API Connection Errors**: Verify VITE_API_URL points to your backend
- **Build Failures**: Check the Vercel build logs for errors
- **Authentication Issues**: Clear browser cookies and local storage, then try again

### Google Sheets API Issues

- **API Key Errors**: Ensure your Google Sheets API key is correctly set
- **Access Denied**: Make sure your Google Sheets are accessible (public or shared with service account)

## 7. Updating Your Application

### Backend Updates

1. Push changes to your GitHub repository
2. Render will automatically deploy the new version

### Frontend Updates

1. Push changes to your GitHub repository
2. Vercel will automatically deploy the new version