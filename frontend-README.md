# DataSync Frontend

The frontend client for DataSync - a sophisticated data management platform leveraging Google Sheets integration with advanced visualization and user experience features.

## Features

- Beautiful, responsive UI built with React and Tailwind CSS
- Google Sheets integration
- Real-time updates with WebSockets
- Custom column functionality
- Authentication system
- Dynamic theming with color palette generator
- Interactive data visualization

## Getting Started

### Prerequisites

- Node.js (v16+)
- DataSync Backend API running

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/servoserv/DataSync-Frontend.git
   cd DataSync-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following contents:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Building for Production

```bash
npm run build
```

This will create a production-ready build in the `dist` directory.

## Features

### Google Sheets Integration

DataSync allows users to connect to Google Sheets and view the data in a user-friendly interface. The app pulls data directly from Google Sheets, ensuring that the data is always up-to-date.

### Real-time Updates

The application uses WebSockets to provide real-time updates to the data. When a user makes a change to the data, all other users viewing the same table will see the change immediately.

### Custom Columns

Users can add custom columns to their tables that only appear in DataSync, not in the original Google Sheet. This allows for additional data and annotations without modifying the source data.

### Authentication

DataSync includes a robust authentication system that allows users to register, log in, and manage their data securely.

### Dynamic Theming

The app includes a color palette generator that allows users to customize the look and feel of the application. Users can choose from a variety of pre-defined themes or create their own.

## Deploying to Vercel

This application can be deployed to Vercel with minimal configuration.

For detailed deployment instructions, see the [DEPLOYMENT.md](https://github.com/servoserv/DataSync-Frontend/blob/main/DEPLOYMENT.md) file.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Archit Narayan