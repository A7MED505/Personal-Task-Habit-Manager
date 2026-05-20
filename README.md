# TaskFlow Studio

A full-stack task and habit manager built with Vanilla JavaScript, Node.js, Express, MongoDB, and Swagger.

## Overview

TaskFlow Studio provides:

- A Vanilla JavaScript SPA frontend
- A REST API with authentication using JWT
- CRUD operations for tasks and categories
- Search, filtering, pagination, and task statistics
- Interactive API docs with Swagger UI
- Unit tests for service and validation layers

## Tech Stack

- Frontend: Vanilla JavaScript, HTML, CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT + bcrypt
- API Docs: swagger-jsdoc + swagger-ui-express
- Testing: Node.js built-in test runner

## Project Structure

- `public/` - frontend SPA files
- `src/app.js` - Express app and middleware wiring
- `src/config/` - database connection
- `src/controllers/` - request handlers
- `src/services/` - business logic
- `src/routes/` - API route definitions
- `src/models/` - Mongoose models
- `src/validators/` - request payload validation
- `src/middleware/` - auth and error middleware
- `src/docs/` - Swagger/OpenAPI configuration
- `tests/` - unit tests
- `server.js` - application bootstrap

## Requirements

- Node.js 18+
- MongoDB (local instance or cloud URI)

## Environment Variables

Create `.env` from `.env.example` and update values:

```bash
copy .env.example .env
```

Required variables:

- `PORT` - server port (default `3000`)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - token expiration (default `7d`)

## Installation

```bash
npm install
```

## Run

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## URLs

- App: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/api/health`

## Authentication Flow

1. Register a user with `POST /api/auth/register`
2. Login with `POST /api/auth/login`
3. Copy the returned Bearer token
4. Use header `Authorization: Bearer <token>` for protected endpoints

Protected route groups:

- `/api/tasks/*`
- `/api/categories/*`
- `/api/auth/me`

Public route groups:

- `/api/health`
- `/api/auth/register`
- `/api/auth/login`
- `/api-docs`
- `/`

## API Overview

### Auth

- `POST /api/auth/register` - register a new user
- `POST /api/auth/login` - login and get token
- `GET /api/auth/me` - get current user profile (protected)

### Tasks (protected)

- `GET /api/tasks` - list tasks with search/filter/pagination/sorting
- `POST /api/tasks` - create task
- `GET /api/tasks/:id` - get task by id
- `PATCH /api/tasks/:id` - update task
- `DELETE /api/tasks/:id` - delete task
- `GET /api/tasks/stats` - dashboard task stats

### Categories (protected)

- `GET /api/categories` - list categories
- `POST /api/categories` - create category
- `GET /api/categories/:id` - get category by id
- `PATCH /api/categories/:id` - update category
- `DELETE /api/categories/:id` - delete category

## Data Models

### Task

- `title`
- `description`
- `status` (`todo`, `in-progress`, `done`)
- `priority` (`low`, `medium`, `high`)
- `categoryId` (optional relation)
- `dueDate`
- `completedAt`

### Category

- `name`
- `description`

## Testing

Run all tests:

```bash
npm test
```

Tests focus on:

- business logic in services
- validation behavior

## Quick API Example (Windows curl)

```bash
curl -X POST http://localhost:3000/api/auth/register ^
   -H "Content-Type: application/json" ^
   -d "{\"username\":\"ahmed\",\"email\":\"ahmed@gmail.com\",\"password\":\"Ahmed123\"}"
```

## Notes

- Use Swagger UI to explore and test endpoints quickly.
- Keep business logic in `src/services/` and thin controllers in `src/controllers/`.
