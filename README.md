# Patient Management System

A comprehensive system for managing patient test results with search and filtering capabilities.

## Project Structure

This monorepo contains both the frontend and backend components of the Patient Management System:

- `frontend/`: React-based web application for displaying and searching patient data
- `backend/`: Node.js API server with PostgreSQL database for storing and retrieving patient data

## Features

- Display patient test results with pagination (15 results per page)
- Search by patient name, sample barcode, activation date, and result date
- Organization-specific views with additional fields (result type, patient ID)
- Docker containerization for easy deployment

## Getting Started

### Prerequisites

- Node.js (v14+)
- Docker and Docker Compose
- Git

### Running the Application

#### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Access the application
Frontend: http://localhost:3000
Backend API: http://localhost:8080
Swagger UI: http://localhost:9080
```

#### Manual Setup

Backend:
```bash
cd backend
npm install
npm run build
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm start
```

## Development

### Backend Development

The backend is built with:
- Node.js and Express
- TypeScript
- TypeORM for database access
- PostgreSQL database

### Frontend Development

The frontend is built with:
- React
- Modern JavaScript/TypeScript
- CSS for styling

## Testing

Each component includes its own testing framework:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## License

[MIT](LICENSE)
