# DataSync Frontend

This is the frontend application for DataSync, a sophisticated data management platform that integrates with Google Sheets and provides advanced data visualization features.

## Features

- Interactive dashboard for managing data tables
- Real-time Google Sheets data visualization
- Custom columns for manual data entry
- Theme customization with color palette generator
- Responsive design for all device sizes
- Advanced animations and transitions

## Tech Stack

- React with TypeScript
- Vite for fast development and building
- TanStack Query for data fetching
- Tailwind CSS for styling
- Shadcn UI components
- Framer Motion for animations
- Recharts for data visualization
- Wouter for routing

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/DataSync-Frontend.git
   cd DataSync-Frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Create a new project on Vercel
3. Import your GitHub repository
4. Configure the build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add the environment variable `VITE_API_URL` with your backend API URL
6. Deploy

## Building for Production

To build the application for production, run:

```bash
npm run build
```

This will create optimized files in the `dist` directory that you can deploy to any static hosting service.

## Project Structure

```
src/
├── components/       # UI components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── pages/            # Page components
├── types/            # TypeScript types
└── main.tsx          # Application entry point
```

## Authentication

DataSync uses a dual authentication system with both session cookies and JWT tokens. The `useAuth` hook provides the following functions:

- `loginMutation` - Log in a user
- `registerMutation` - Register a new user
- `logoutMutation` - Log out the current user

## License

[MIT](LICENSE)