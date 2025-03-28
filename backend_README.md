# DataSync Backend

This is the backend API service for the DataSync application, a robust data management platform that integrates with Google Sheets.

## Features

- RESTful API for managing data tables and custom columns
- Google Sheets integration for real-time data synchronization
- Authentication system with both JWT and session-based auth
- PostgreSQL database for data persistence
- WebSocket support for real-time updates

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Drizzle ORM
- Passport.js for authentication
- WebSockets for real-time updates
- TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/DataSync-Backend.git
   cd DataSync-Backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/datasync
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   GOOGLE_SHEETS_API_KEY=your_google_api_key
   CORS_ORIGIN=http://localhost:3000
   PORT=5000
   ```

4. Run database migrations
   ```bash
   npm run db:push
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## Deployment

### Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add the required environment variables mentioned above
5. Create a PostgreSQL database on Render and link it to your service

## API Documentation

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login with username and password
- `POST /api/logout` - Logout the current user
- `GET /api/user` - Get the current authenticated user

### Tables

- `GET /api/tables` - Get all tables for the authenticated user
- `GET /api/tables/:id` - Get a specific table by ID
- `POST /api/tables` - Create a new table
- `PATCH /api/tables/:id` - Update a table
- `DELETE /api/tables/:id` - Delete a table

### Custom Columns

- `GET /api/tables/:tableId/columns` - Get all custom columns for a table
- `POST /api/tables/:tableId/columns` - Create a custom column for a table

### Column Values

- `GET /api/columns/:columnId/values` - Get all values for a column
- `POST /api/columns/:columnId/values` - Save a new value for a column
- `PATCH /api/columns/values/:id` - Update a column value
- `DELETE /api/columns/values/:id` - Delete a column value

## License

[MIT](LICENSE)