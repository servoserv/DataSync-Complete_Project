# DataSync - Full Stack Data Management Platform

A sophisticated data management platform leveraging Google Sheets integration with advanced visualization and user experience features. The application provides seamless data interaction through an intuitive, feature-rich interface designed for both technical and non-technical users.

## Project Overview

This repository contains the complete DataSync project, including both frontend and backend components. For deployment purposes, these components are also available as separate repositories:

- [DataSync-Frontend](https://github.com/servoserv/DataSync-Frontend)
- [DataSync-Backend](https://github.com/servoserv/DataSync-Backend)

## Technology Stack

- **Frontend**: React, Tailwind CSS, Radix UI components, Framer Motion animations
- **Backend**: Node.js, Express, WebSockets
- **Database**: PostgreSQL with Drizzle ORM
- **APIs**: Google Sheets API
- **Authentication**: JWT and session-based authentication

## Features

- Connect to Google Sheets and view data in a clean interface
- Add custom columns that only appear in the dashboard
- Real-time updates with WebSockets
- Authentication system with secure login and registration
- Dynamic theming with customizable color palettes
- Interactive data visualization
- Responsive design for all device sizes

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Instructions for deploying frontend and backend
- [Architecture Overview](./ARCHITECTURE.md) - Technical architecture of the application
- [Stripe Integration](./STRIPE_INTEGRATION.md) - How to integrate Stripe payments
- [Premium Features](./PREMIUM_FEATURES.md) - Information about premium features and pricing

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- Google Sheets API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/servoserv/DataSync-Complete.git
   cd DataSync-Complete
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
   ```

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Archit Narayan