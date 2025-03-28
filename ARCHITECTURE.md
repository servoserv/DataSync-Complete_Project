# DataSync Architecture Overview

This document provides a comprehensive overview of the DataSync application architecture, explaining key components, data flow, and design decisions.

## System Architecture

DataSync follows a modern full-stack architecture with clearly separated concerns:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│   React         │      │   Express       │      │   PostgreSQL    │
│   Frontend      │◄────►│   Backend       │◄────►│   Database      │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        ▲                        ▲
        │                        │
        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│   Google Sheets │      │   WebSockets    │
│   API           │      │   Real-time     │
│                 │      │                 │
└─────────────────┘      └─────────────────┘
```

## Core Components

### Frontend (React + Vite)

The frontend is built with React and uses Vite as the build tool. Key architectural aspects include:

- **Component Structure**: Follows a modular approach with reusable UI components
- **State Management**: Uses React Query for server state and React hooks for local state
- **Routing**: Implements client-side routing with Wouter
- **Styling**: Utilizes Tailwind CSS with Shadcn UI components
- **TypeScript**: Ensures type safety across the entire application

### Backend (Node.js + Express)

The backend is built with Express.js and provides API endpoints for the frontend. Key components include:

- **API Routes**: RESTful endpoints for data operations
- **Authentication**: JWT and session-based authentication
- **WebSockets**: Real-time data updates
- **External API Integration**: Google Sheets API connectivity

### Database (PostgreSQL + Drizzle ORM)

The application uses PostgreSQL with Drizzle ORM for data persistence:

- **Schema**: Well-defined schema with relationships between entities
- **Migrations**: Schema changes managed through Drizzle migrations
- **Query Building**: Type-safe queries via Drizzle ORM

## Data Models

The core data models of the application include:

### User

Represents application users with authentication details.

### Table

Represents a connection to a Google Sheet with metadata.

### CustomColumn

Defines custom columns that only exist in the dashboard.

### ColumnValue

Stores values for custom columns.

## Authentication Flow

DataSync implements a dual authentication system:

1. **Session-based Authentication**: For web browser access, with cookie management
2. **JWT Authentication**: For API access, enabling programmatic integration

The authentication flow is as follows:

```
┌─────────┐          ┌─────────┐          ┌─────────┐
│         │          │         │          │         │
│  User   │          │  Server │          │  DB     │
│         │          │         │          │         │
└────┬────┘          └────┬────┘          └────┬────┘
     │                    │                     │
     │  Login Request     │                     │
     │ ─────────────────► │                     │
     │                    │                     │
     │                    │  Verify Credentials │
     │                    │ ────────────────────►
     │                    │                     │
     │                    │  Credentials Valid  │
     │                    │ ◄────────────────────
     │                    │                     │
     │  Session + JWT     │                     │
     │ ◄─────────────────┤                     │
     │                    │                     │
```

## Google Sheets Integration

The application connects to Google Sheets via the Google Sheets API:

1. User adds a Google Sheet URL and access credentials
2. Application retrieves sheet data via the API
3. Data is displayed in the application UI
4. Custom columns are added locally without modifying the original sheet

## Real-time Updates

WebSocket connections maintain real-time synchronization:

1. When a user makes changes to data, the changes are sent to the server
2. The server broadcasts these changes to all connected clients
3. Clients update their UI in real-time without page refresh

## Deployment Architecture

The application is designed for deployment on modern cloud platforms:

- **Frontend**: Static assets deployed on Vercel
- **Backend**: Node.js service deployed on Render
- **Database**: PostgreSQL database hosted on a managed service (e.g., Neon Database)

## Security Considerations

The application implements several security best practices:

- **Authentication**: Secure password hashing and session management
- **Authorization**: Role-based access control for data operations
- **API Security**: Input validation, rate limiting, and CORS protection
- **Data Encryption**: Sensitive data encrypted at rest and in transit

## Scalability Considerations

The architecture supports horizontal scaling:

- **Stateless Backend**: Enables multiple server instances
- **Connection Pooling**: Efficient database connection management
- **Caching**: Strategic caching for frequently accessed data

## Future Architectural Enhancements

Planned enhancements to the architecture include:

- **Microservices**: Breaking down the backend into domain-specific services
- **Event-driven Architecture**: Implementing event sourcing for certain operations
- **GraphQL API**: Adding a GraphQL layer for more flexible data queries
- **Edge Computing**: Deploying portions of the application to edge locations

## Development Workflow

The development workflow follows modern practices:

- **TypeScript**: Shared types between frontend and backend
- **Code Quality**: Linting and formatting with ESLint and Prettier
- **Testing**: Unit and integration tests with Jest
- **CI/CD**: Automated testing and deployment pipelines