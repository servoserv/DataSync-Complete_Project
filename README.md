# DataSync Dashboard

![DataSync Dashboard](https://img.shields.io/badge/DataSync-Dashboard-0052CC?style=for-the-badge) ![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

<div align="center">
  <img src="generated-icon.png" alt="DataSync Dashboard Logo" width="120" />
  <h3>Seamlessly integrate Google Sheets with your own customizable dashboard</h3>
</div>

## 🌟 Overview

DataSync Dashboard is a powerful, full-stack web application that bridges the gap between Google Sheets data and personalized dashboards. The application enables users to create custom views of their Google Sheets data, augmented with user-defined columns for additional contextual information that exists only within the dashboard.

Built with performance and user experience in mind, DataSync Dashboard employs modern web technologies and architectural patterns to deliver a responsive, intuitive interface for managing and visualizing spreadsheet data.

### 🎨 Design Philosophy

DataSync Dashboard emphasizes exceptional UI/UX design quality, integrating modern design principles with functional utility. The interface balances aesthetic appeal with practical usability through:

- **Thoughtful animations** that enhance user understanding rather than distract
- **Consistent visual language** creating a cohesive, professional experience
- **Micro-interactions** providing immediate feedback to user actions
- **Accessibility considerations** ensuring the application is usable by everyone
- **Performance-optimized effects** that maintain smooth operation even on less powerful devices

This focus on visual quality and interaction design significantly elevates the user experience, making complex data management tasks feel intuitive and engaging.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Theme System](#-theme-system)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Development Workflow](#-development-workflow)
- [Deployment](#-deployment)
- [Performance Optimizations](#-performance-optimizations)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality

- **Google Sheets Integration**: Connect any Google Sheets document to visualize data in a customizable dashboard interface
- **Custom Columns**: Create additional columns that exist only in the dashboard but not in the source spreadsheet
- **Real-time Updates**: Changes in the Google Sheet are reflected in the dashboard with minimal delay
- **Editable Custom Fields**: Add, edit, and manage values for custom columns in the dashboard

### User Experience

- **Intuitive Interface**: Clean, modern UI with context-appropriate visual feedback
- **Responsive Design**: Fully functional across desktop, tablet, and mobile devices
- **Visual Differentiation**: Clear visual cues distinguish between Google Sheets data and custom dashboard data
- **Guided Workflows**: Step-by-step creation and configuration processes with clear instructions

### Technical Features

- **Multi-user Support**: Complete data isolation between users, ensuring privacy and security
- **JWT & Session Authentication**: Dual-authentication approach with both token and session-based auth
- **Intelligent Error Handling**: Comprehensive error states with actionable messages
- **Optimized Data Loading**: Efficient data fetching patterns to minimize loading times

### Enhanced Visual & Interactive Elements

- **Animated Containers**: Components with configurable entrance animations including slide, fade, scale, and bounce effects
- **Particle Background**: Interactive particle system on the login page that responds to mouse movement
- **Animated Buttons**: Custom buttons with ripple effects, hover scaling, and glow animations
- **Smart Tooltips**: Context-aware tooltips with helpful information throughout the application
- **Feature Preview Cards**: Interactive cards showcasing upcoming AI capabilities with hover animations
- **Micro-interactions**: Subtle animations and transitions triggered by user actions
- **Visual Feedback**: Animated state changes providing clear feedback on user interactions
- **Form Enhancements**: Animated validation states and input field transitions
- **Custom Scrolling Effects**: Scroll-triggered animations for content elements
- **Loading States**: Elegant loading indicators with animated transitions

### User Interface Improvements

- **Modern Color Gradients**: Gradient backgrounds and text for visual emphasis
- **Depth Effects**: Subtle shadows and layering to create visual hierarchy
- **Design System**: Consistent design language across all components
- **Interactive Elements**: Elements that respond visually to user interaction
- **Motion Design**: Purposeful animations that enhance the user experience
- **Advanced Theme Customization**: 
  - Light/dark mode toggle with system preference detection
  - Dynamic color palette generator for personalized UI themes
  - Real-time theme preview and application
  - Theme persistence across sessions
  - Accessible from anywhere via the settings button
- **Accessibility Enhancements**: Improved keyboard navigation and screen reader support
- **Consistent Iconography**: Well-defined icon system with visual meaning
- **Enhanced Typography**: Carefully selected font weights and sizes for readability

## 🛠 Technology Stack

### Frontend

- **React**: UI library for building component-based interfaces
- **TanStack Query**: Data fetching and state management
- **Shadcn UI**: Component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Zod**: Schema validation for form inputs
- **React Hook Form**: Form state management and validation
- **Wouter**: Lightweight routing library
- **Recharts**: Charting library for data visualization

### Custom Animation Components

- **AnimatedContainer**: Reusable component supporting multiple animation types (fade, slide, scale, bounce)
- **ParticlesBackground**: Interactive particles canvas with mouse movement tracking
- **AnimatedButton**: Enhanced button component with ripple effects and hover animations
- **TooltipHelper**: Context-aware tooltips with animated appearance

### Theme Customization Components

- **ThemeProvider**: Context-based theme provider with theme persistence
- **ThemeToggle**: Interactive toggle for switching between light, dark, and system themes
- **ColorPaletteGenerator**: Dynamic color palette creator with harmonious color generation
- **SettingsModal**: Comprehensive settings interface with tabbed navigation
- **SettingsButton**: Globally accessible button for quick theme adjustments

### Backend

- **Node.js**: JavaScript runtime for the server
- **Express**: Web framework for handling API requests
- **Drizzle ORM**: Type-safe database toolkit
- **PostgreSQL**: Relational database for data persistence
- **Google Sheets API**: External API for sheet data access
- **Passport.js**: Authentication middleware
- **WebSockets**: Real-time communication protocol

## 📁 Project Structure

```
/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions and configurations
│   │   ├── pages/             # Page components
│   │   └── App.tsx            # Main application component
│   └── index.html             # HTML entry point
├── server/                    # Backend application
│   ├── auth.ts                # Authentication logic
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API route definitions
│   ├── storage.ts             # Database operations
│   └── vite.ts                # Vite integration
├── shared/                    # Shared code between client and server
│   └── schema.ts              # Database schema and type definitions
├── drizzle.config.ts          # Drizzle ORM configuration
└── package.json               # Project dependencies and scripts
```

## 📊 Database Schema

The application utilizes a relational database model with PostgreSQL, defined through Drizzle ORM:

### Users

Stores user authentication and profile information:
- `id`: Primary key
- `username`: Unique username for login
- `email`: User's email address
- `password`: Securely hashed user password
- `firstName`, `lastName`: Optional profile information
- `createdAt`: Account creation timestamp

### Tables

Represents a connected Google Sheet with dashboard configurations:
- `id`: Primary key
- `userId`: Foreign key to Users table
- `name`: User-defined table name
- `googleSheetUrl`: URL to the Google Sheet
- `columns`: JSON array of custom column definitions
- `createdAt`, `lastUpdatedAt`: Timestamps

### Custom Columns

Defines additional columns added to the dashboard view:
- `id`: Primary key
- `tableId`: Foreign key to Tables table
- `name`: Column display name
- `type`: Data type (text, number, date, etc.)
- `createdAt`: Column creation timestamp

### Column Values

Stores custom values entered by users:
- `id`: Primary key
- `columnId`: Foreign key to CustomColumns table
- `rowIndex`: Row index corresponding to the Google Sheet
- `value`: User-entered value
- `createdAt`, `updatedAt`: Timestamps

## 📡 API Documentation

### Authentication Endpoints

- `POST /api/register`: Create a new user account
- `POST /api/login`: Authenticate and receive session + JWT token
- `POST /api/logout`: End the current user session
- `GET /api/user`: Get the current authenticated user's profile

### Table Management

- `GET /api/tables`: List all tables for the authenticated user
- `GET /api/tables/:id`: Get a specific table's details
- `POST /api/tables`: Create a new table with Google Sheet connection
- `PATCH /api/tables/:id`: Update an existing table's properties
- `DELETE /api/tables/:id`: Remove a table and its associated data

### Custom Columns

- `GET /api/tables/:id/columns`: List custom columns for a table
- `POST /api/columns`: Create a new custom column
- `GET /api/columns/:id`: Get a specific column's details

### Data Operations

- `GET /api/tables/:id/data`: Get combined Google Sheets and custom column data
- `GET /api/columns/:id/values`: Get all values for a specific custom column
- `GET /api/columns/:columnId/values/:rowIndex`: Get a specific cell value
- `POST /api/columns/values`: Save a new value to a custom column
- `PATCH /api/columns/values/:id`: Update an existing custom column value

### Real-time Updates

- WebSocket connection on `/ws` with table subscription protocol:
  - Send: `{ action: "subscribe", tableId: number }`
  - Receive: `{ type: "tableUpdate", tableId: number, data: {...} }`

## 🔐 Authentication

The application implements a dual authentication approach:

### Session-based Authentication

- Express sessions with PostgreSQL session store
- Middleware-based protection of server routes
- Cookie-based session management for traditional web flows

### JWT Authentication

- Token-based authentication for API requests
- Stateless authentication for certain operations
- Useful for external API integrations

### Security Measures

- Password hashing with scrypt and salt
- CSRF protection
- Rate limiting on authentication endpoints
- Proper error handling to prevent information leakage

## 🎨 Theme System

DataSync features a comprehensive theme customization system that elevates the user experience while maintaining consistency throughout the application:

### Theme Provider

A context-based React provider that manages theme state across the entire application. Features include:

- System theme detection for automatic light/dark mode switching
- Theme persistence using localStorage for remembering user preferences
- Support for light, dark, and system-based themes
- Seamless transitions between themes with CSS variables

### Dynamic Color Palette Generator

Enables personalized visual experiences through intelligent color palette creation:

- Generates harmonious color schemes based on data context
- Offers one-click application of new color themes
- Provides real-time preview of theme changes
- Creates balanced color palettes with proper contrast ratios
- Ensures accessibility standards are maintained across theme changes

### Settings Interface

The centralized settings system allows comprehensive customization:

- Accessible via the settings button present in all application views
- Tabbed interface separating appearance settings from other preferences
- Animated transitions between settings panels for a polished experience
- Real-time application of theme changes for immediate feedback
- Supports both aesthetic and functional customization options

### Implementation Details

- CSS variables for dynamic theme application without page reload
- Context API for efficient theme state management
- Centralized theme utilities for consistent application of theme properties
- Type-safe theme definitions with TypeScript interfaces
- Responsive design maintaining theme consistency across all screen sizes

## 🚀 Installation

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v14+)
- Google API Credentials with Sheets API enabled

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/datasync-dashboard.git
   cd datasync-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (see [Environment Variables](#-environment-variables))

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Connection
DATABASE_URL=postgresql://username:password@localhost:5432/datasync

# Authentication
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key

# Google API
GOOGLE_SHEETS_API_KEY=your_google_api_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 💻 Development Workflow

### Running the Application

The application uses a workflow system for development:

1. Start the application:
   ```bash
   npm run dev
   ```

This command starts both the backend Express server and the frontend Vite development server.

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Consistent component patterns
- Separation of concerns between UI and data logic

### Database Migrations

The project uses Drizzle ORM's schema-based migrations:

1. Make changes to `shared/schema.ts`
2. Run migration:
   ```bash
   npm run db:push
   ```

## 📦 Deployment

### Deploying Frontend to Vercel

1. Push your code to a GitHub repository

2. Connect Vercel to your GitHub repository:
   - Create an account on [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Configure the project settings:
     - Framework Preset: Vite
     - Root Directory: client
     - Build Command: npm run build
     - Output Directory: dist

3. Configure environment variables in Vercel:
   - Add the backend URL (e.g., VITE_API_URL=https://your-app-name.herokuapp.com)

4. Deploy with these settings

### Deploying Backend to Heroku

1. Create a Heroku account and install the Heroku CLI:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. Create a `Procfile` in the root directory:
   ```
   web: npm start
   ```

3. Prepare your application for Heroku:
   ```bash
   # Initialize Git repository if not already done
   git init
   git add .
   git commit -m "Initial commit"
   
   # Create Heroku app
   heroku create your-app-name
   
   # Add PostgreSQL add-on
   heroku addons:create heroku-postgresql:hobby-dev
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_jwt_secret_key
   heroku config:set SESSION_SECRET=your_session_secret_key
   heroku config:set GOOGLE_SHEETS_API_KEY=your_google_api_key
   ```

4. Deploy to Heroku:
   ```bash
   git push heroku main
   ```

5. Run database migrations:
   ```bash
   heroku run npm run db:push
   ```

### Environment Considerations

- Set `NODE_ENV=production`
- Configure proper SSL certificates (automatic with Vercel/Heroku)
- Set up database connection pooling
- Ensure CORS is properly configured between frontend and backend

## ⚡ Performance Optimizations

### Frontend Optimizations

- Code splitting via dynamic imports
- Memoization of expensive calculations
- Virtualized lists for large datasets
- Optimistic UI updates
- Resource prefetching

### Backend Optimizations

- Query optimization with appropriate indices
- Connection pooling
- Rate limiting
- Caching of frequently accessed data
- Batch processing for bulk operations

### Network Optimizations

- Compression middleware
- Resource minification
- CDN integration for static assets
- Service worker implementation for offline capabilities

## 🔮 Future Enhancements

### Smart Features (UI Preview Available)

The dashboard currently showcases UI previews of upcoming intelligent features that are in development:

- **Accessibility Voice-over Mode**: Navigate and interact with the dashboard using voice commands for an inclusive experience
- **Smart Data Prediction Hints**: Advanced data-driven insights and predictions based on your usage patterns
- **Personalized Dashboard Layout**: Save preferred dashboard arrangements, widgets, and view settings
- **One-click Data Export Wizard**: Export data in multiple formats with smart filtering and scheduling
- **Contextual Help Bubbles**: Interactive help system with playful animations to guide through complex features

These features are currently implemented as UI demonstrations to showcase the future vision of the application. The interactive cards and modals provide a preview of the planned functionality without modifying the core application behavior.

### Additional Planned Features

- **Filtering and Sorting**: Advanced data filtering capabilities
- **Data Export**: Export table data to various formats (CSV, Excel, PDF)
- **User Profiles**: Enhanced user profile management
- **Role-based Access Control**: Granular permissions system
- **Audit Logging**: Track changes made to data
- **Advanced Visualizations**: Additional chart types and visualization options
- **Custom Table Views**: Save and switch between different table configurations

### Technical Roadmap

- **Offline Support**: Progressive Web App capabilities
- **Localization**: Multi-language support
- **Enhanced Security**: Additional security layers and compliance
- **API Integrations**: Connect with additional data sources beyond Google Sheets
- **Mobile Application**: Native mobile app versions

## 👥 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Submit a pull request against the `develop` branch

### Coding Standards

- Write clear, commented code
- Include tests for new features
- Follow the established project patterns
- Update documentation for significant changes

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <p>Developed by Archit Narayan</p>
  <p>
    <a href="mailto:contact@example.com">Email</a> ·
    <a href="https://github.com/yourusername">GitHub</a> ·
    <a href="https://linkedin.com/in/yourprofile">LinkedIn</a>
  </p>
</div>