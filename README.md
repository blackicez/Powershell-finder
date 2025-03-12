# PowerShell Command Finder

A web application that helps users search for PowerShell commands by name, description, or usage. The application includes a simulated PowerShell environment for testing commands.

## Features

- Search for PowerShell commands using keywords
- Filter commands by categories
- View detailed information about each command
- Interactive PowerShell simulator for testing commands
- Responsive design for desktop and mobile devices

## Project Structure

- **Frontend**: Built with Vite.js and vanilla JavaScript
- **Backend**: Node.js server with Express

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd powershell-command-finder
   ```

2. Install backend dependencies
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server
   ```
   cd backend
   node server.js
   ```

2. Start the frontend development server
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Technologies Used

- **Frontend**:
  - Vite.js
  - Axios for API requests
  - Vanilla JavaScript
  - CSS3

- **Backend**:
  - Node.js
  - Express
  - node-powershell for PowerShell integration
  - CORS for cross-origin resource sharing

## License

MIT