# Deployment Guide

This document provides detailed instructions for deploying the DataSync application to production environments. The deployment strategy separates the frontend and backend for optimal performance and scalability.

## Deployment Overview

DataSync consists of two main components that can be deployed separately:

1. **Frontend Application**: Static React application to be deployed on Vercel
2. **Backend Service**: Express API server to be deployed on Render or similar services
3. **Database**: PostgreSQL database hosted on a managed service (e.g., Neon Database)

## Prerequisites

Before deployment, ensure you have:

1. Account on Vercel (for frontend deployment)
2. Account on Render or similar service (for backend deployment)
3. PostgreSQL database setup (e.g., on Neon Database, Render, or similar)
4. Google Sheets API key
5. Environment variables ready for each environment

## Frontend Deployment (Vercel)

### Preparation

1. Ensure the frontend code is in a separate repository (DataSync-Frontend)
2. If not already split, use the `frontend-package.json` as your `package.json`
3. Verify that the backend API URL is configurable via environment variables

### Deployment Steps

1. Log in to Vercel and create a new project
2. Connect your GitHub repository (DataSync-Frontend)
3. Configure the following settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add the following environment variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_GOOGLE_SHEETS_API_KEY=your-google-sheets-api-key
   ```

5. Deploy the project

### Post-Deployment

1. Configure a custom domain if needed
2. Set up HTTPS (automatically handled by Vercel)
3. Verify the frontend is working correctly
4. Consider setting up preview deployments for pull requests

## Backend Deployment (Render)

### Preparation

1. Ensure the backend code is in a separate repository (DataSync-Backend)
2. If not already split, use the `backend-package.json` as your `package.json`
3. Verify all environment variables are properly configured

### Deployment Steps

1. Log in to Render and create a new Web Service
2. Connect your GitHub repository (DataSync-Backend)
3. Configure the following settings:
   - **Name**: datasync-api (or your preferred name)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: Choose appropriate plan (starter for development)

4. Add the following environment variables:
   ```
   DATABASE_URL=postgres://username:password@host:port/database
   JWT_SECRET=your-secure-jwt-secret
   SESSION_SECRET=your-secure-session-secret
   GOOGLE_SHEETS_API_KEY=your-google-sheets-api-key
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   NODE_ENV=production
   PORT=8080
   ```

5. Deploy the service

### Database Setup on Render

If you're using Render for both the backend and database:

1. Create a new PostgreSQL database in Render
2. Note the connection details provided by Render
3. Use the connection string in your backend deployment environment variables

## Cross-Origin Resource Sharing (CORS)

Ensure CORS is properly configured in the backend to allow requests from your frontend domain:

```javascript
// Existing code in server/index.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
```

## Environment Variables

Properly manage your environment variables across environments:

1. Development: Use `.env.local` files (not committed to git)
2. Production: Configure via the deployment platform's UI
3. CI/CD: Configure in your pipeline settings

## Continuous Deployment

Set up continuous deployment for both frontend and backend:

1. Configure GitHub Actions for automated testing
2. Connect repositories to Vercel and Render for automatic deployments
3. Set up branch protections and preview environments

## Post-Deployment Verification

After deployment, verify:

1. Frontend can communicate with backend API
2. Authentication flows work correctly
3. Google Sheets integration functions properly
4. WebSockets for real-time updates are operational
5. Database operations perform as expected

## Monitoring and Logging

Set up monitoring for your production deployment:

1. Configure error tracking with a service like Sentry
2. Set up performance monitoring
3. Implement structured logging
4. Create alerts for critical errors or performance issues

## Scaling Considerations

As your application grows:

1. Consider using a CDN for static assets
2. Implement caching strategies
3. Scale your database as needed
4. Configure auto-scaling for your backend service

## Troubleshooting Common Issues

### CORS Errors
- Verify the `CORS_ORIGIN` environment variable matches your frontend URL exactly
- Check that credentials are properly handled in both frontend and backend

### Database Connection Issues
- Verify the DATABASE_URL is correct
- Check network permissions and firewall settings
- Ensure the database is accessible from your backend service

### Authentication Problems
- Verify JWT and session secrets are set correctly
- Check cookie settings and domain configuration
- Test authentication flow end-to-end

## Deployment Checklist

Before considering deployment complete, verify:

- [ ] Frontend successfully deployed to Vercel
- [ ] Backend successfully deployed to Render
- [ ] Database is properly configured and accessible
- [ ] All environment variables are set correctly
- [ ] CORS is properly configured
- [ ] Authentication works in production
- [ ] Google Sheets integration functions correctly
- [ ] Real-time updates via WebSockets work
- [ ] Error tracking and monitoring are in place
- [ ] Custom domain(s) configured (if applicable)
- [ ] SSL/HTTPS working properly
- [ ] Documentation updated with production URLs