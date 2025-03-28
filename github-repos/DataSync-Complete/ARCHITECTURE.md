# DataSync Architecture

This document provides an architectural overview of the DataSync application.

## System Overview

DataSync is a full-stack web application that enables users to connect to Google Sheets, view and manipulate data, and add custom columns that only exist within the application. The system is designed with a clean separation of concerns between frontend and backend components.

## Architecture Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│  React Frontend │◄─────►│  Node.js API    │◄─────►│  PostgreSQL DB  │
│  (Vercel)       │       │  (Render)       │       │  (Render)       │
│                 │       │                 │       │                 │
└─────────────────┘       └────────┬────────┘       └─────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │                 │
                          │  Google Sheets  │
                          │  API            │
                          │                 │
                          └─────────────────┘
```

## Key Components

### 1. Frontend (React + Vite)

- **UI Components**: Built with React using ShadCN UI components and TailwindCSS
- **State Management**: Uses React Query for server state and React Context for local state
- **Authentication**: Client-side authentication logic with JWT storage and validation
- **Real-time Updates**: WebSocket connection for live data updates
- **Routing**: Wouter for lightweight client-side routing

### 2. Backend (Node.js + Express)

- **API Layer**: RESTful API endpoints to handle data operations
- **Authentication**: JWT and session-based authentication with Passport.js
- **WebSockets**: Real-time communication via the ws library
- **External API Integration**: Google Sheets API for data retrieval
- **Business Logic**: Table management, custom column handling, etc.

### 3. Database (PostgreSQL)

- **Data Storage**: Persists user data, table configurations, and custom column values
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Well-defined tables with appropriate relationships

## Data Flow

1. **Authentication Flow**:
   - User provides credentials (username/password)
   - Backend validates credentials and issues JWT
   - Frontend stores JWT and attaches it to subsequent requests
   - Backend validates JWT on protected endpoints

2. **Table Creation Flow**:
   - User inputs Google Sheet URL and other metadata
   - Backend stores table configuration in the database
   - Backend fetches initial data from Google Sheets API
   - Frontend displays table with fetched data

3. **Custom Column Flow**:
   - User creates a custom column with name and type
   - Backend stores column definition in the database
   - User enters data into custom column cells
   - Backend stores custom values in the database
   - Data is displayed alongside Google Sheets data

4. **Real-time Update Flow**:
   - User connects to WebSocket server
   - User subscribes to updates for specific tables
   - When table data changes, backend broadcasts updates
   - Frontend receives updates and refreshes the UI

## Security Considerations

1. **Authentication**: 
   - Dual authentication system with both JWT and sessions
   - Password hashing with secure algorithms
   - CSRF protection via token validation

2. **Data Access Control**:
   - User-specific queries to prevent unauthorized access
   - Row-level security in database operations
   - Input validation on all endpoints

3. **API Security**:
   - Secure storage of Google Sheets API key
   - Rate limiting to prevent abuse
   - CORS configuration to restrict client origins

## Scalability Considerations

1. **Database Scalability**:
   - Connection pooling for efficient database access
   - Indexed queries for performance
   - Optimization for frequently accessed data

2. **API Scalability**:
   - Stateless design to support horizontal scaling
   - Efficient caching for Google Sheets data
   - Batched database operations where appropriate

3. **WebSocket Scalability**:
   - Table-specific subscriptions to minimize broadcast scope
   - Heartbeat mechanism to manage connection lifecycle
   - Efficient message handling with binary protocols

## Development and Deployment

### Development Workflow

1. Local development with hot reloading
2. Type-safe development with TypeScript
3. Shared types between frontend and backend
4. Integrated API testing with the frontend application

### Deployment Architecture

1. **Frontend**: Deployed to Vercel
   - Static assets served via CDN
   - API requests proxied to backend service

2. **Backend**: Deployed to Render
   - Web service with auto-scaling capabilities
   - Health checks for reliability

3. **Database**: PostgreSQL hosted on Render
   - Managed database with automatic backups
   - Connection pooling for performance

## Future Architectural Considerations

1. **Microservices Evolution**:
   - Separate authentication service
   - Dedicated real-time notification service
   - Specialized data processing services

2. **Advanced Caching**:
   - Redis for distributed caching
   - Query result caching
   - Client-side caching strategies

3. **Analytics and Monitoring**:
   - Application performance monitoring
   - User behavior analytics
   - Error tracking and alerting