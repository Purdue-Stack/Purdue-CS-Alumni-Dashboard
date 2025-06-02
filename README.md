# Purdue CS Alumni Dashboard

This is a full-stack application with a React frontend and Express backend.

## Prerequisites

-   Node.js and npm must be installed on your machine

## Project Structure

-   `client/` - React+Vite frontend application
-   `server/` - Express backend application

## Installation

1. Install root dependencies:

```sh
npm install
```

2. Install client dependencies:

```sh
cd client
npm install
```

3. Install server dependencies:

```sh
cd server
npm install
```

## Running the Application

You can run both the frontend and backend concurrently using:

```sh
npm start
```

This will start:

-   React development server on `http://localhost:5173`
-   Express backend server on `http://localhost:3000`

### Running Individual Components

To run only the frontend:

```sh
npm run client
```

To run only the backend:

```sh
npm run server
```

## Available Scripts

-   `npm start` - Runs both frontend and backend
-   `npm run client` - Runs only the React frontend
-   `npm run server` - Runs only the Express backend
