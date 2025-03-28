# DataSync Backend

The backend service for DataSync - a sophisticated data management platform leveraging Google Sheets integration with advanced visualization and user experience features.

## Features

- RESTful API for data management
- PostgreSQL database using Drizzle ORM
- Google Sheets API integration
- Real-time data synchronization with WebSockets
- Authentication with JWT and session support
- Custom column functionality

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- Google Sheets API key

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

3. Create a `.env` file in the root directory with the following contents:
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

## API Documentation

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Log in an existing user
- `POST /api/logout` - Log out the current user
- `GET /api/user` - Get the current user's information

### Tables

- `GET /api/tables` - Get all tables for the current user
- `GET /api/tables/:id` - Get a specific table
- `POST /api/tables` - Create a new table
- `PUT /api/tables/:id` - Update a table
- `DELETE /api/tables/:id` - Delete a table

### Custom Columns

- `GET /api/tables/:id/columns` - Get all custom columns for a table
- `POST /api/tables/:id/columns` - Add a custom column to a table

### Data

- `GET /api/tables/:id/data` - Get data from a Google Sheet
- `POST /api/tables/:id/columns/:columnId/values` - Save a custom column value
- `PUT /api/column-values/:id` - Update a custom column value

## WebSocket API

The WebSocket API is available at `/ws-api` and supports the following message types:

### Client to Server

- `{ type: "subscribe", tableId: number }` - Subscribe to updates for a table
- `{ type: "unsubscribe", tableId: number }` - Unsubscribe from updates for a table

### Server to Client

- `{ type: "subscribed", tableId: number }` - Confirmation of subscription
- `{ type: "unsubscribed", tableId: number }` - Confirmation of unsubscription
- `{ type: "tableUpdate", tableId: number, ... }` - Update to a table

## Deployment

This application can be deployed to Render using the included `render.yaml` configuration file.

For detailed deployment instructions, see the [DEPLOYMENT.md](https://github.com/servoserv/DataSync-Backend/blob/main/DEPLOYMENT.md) file.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Archit Narayan