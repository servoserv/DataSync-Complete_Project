# DataSync Backend

This repository contains the Express.js backend for the DataSync application. It provides API endpoints, database connectivity, and WebSocket real-time updates for the DataSync frontend.

## Technology Stack

- **Node.js / Express**: API server and middleware
- **TypeScript**: Type-safe JavaScript
- **PostgreSQL**: Database with Drizzle ORM
- **Passport.js**: Authentication framework
- **WebSockets**: Real-time updates
- **Google Sheets API**: Data integration

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/servoserv/DataSync-Backend.git
   cd DataSync-Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/datasync
   JWT_SECRET=your-jwt-secret
   SESSION_SECRET=your-session-secret
   GOOGLE_SHEETS_API_KEY=your-google-sheets-api-key
   CORS_ORIGIN=http://localhost:3000
   ```

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

The backend exposes the following main API endpoints:

### Authentication
- `POST /api/login`: Authenticate a user
- `POST /api/register`: Register a new user
- `POST /api/logout`: Log out a user
- `GET /api/user`: Get the current authenticated user

### Tables
- `GET /api/tables`: Get all tables for the user
- `POST /api/tables`: Create a new table
- `GET /api/tables/:id`: Get a table by ID
- `PUT /api/tables/:id`: Update a table
- `DELETE /api/tables/:id`: Delete a table

### Custom Columns
- `GET /api/tables/:id/columns`: Get custom columns for a table
- `POST /api/tables/:id/columns`: Add a custom column to a table
- `PUT /api/columns/:id`: Update a custom column
- `DELETE /api/columns/:id`: Delete a custom column

### Column Values
- `GET /api/columns/:id/values`: Get values for a custom column
- `PUT /api/values/:id`: Update a column value

### Google Sheets
- `GET /api/tables/:id/sheet-data`: Get Google Sheet data for a table

## WebSockets

The backend implements WebSockets for real-time updates. When data changes are made, connected clients are notified automatically.

## Database Schema

The application uses Drizzle ORM with the following main data models:

- **Users**: Authentication and user information
- **Tables**: Google Sheet connections with metadata
- **CustomColumns**: Additional columns defined only in the dashboard
- **ColumnValues**: Values for custom columns

## Deployment

For deployment instructions, see the [Deployment Guide](./DEPLOYMENT.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.