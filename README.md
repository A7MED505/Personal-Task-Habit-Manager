# TaskFlow Studio

A full-stack web-based CRUD application built with Vanilla JavaScript, Node.js, Express, MongoDB, and Swagger.

## Features

- Vanilla JavaScript SPA frontend with no React, Vue, or Angular
- Full CRUD for tasks
- Category management for a simple relationship between tasks and categories
- Search, filter, and status/priority tracking
- RESTful JSON API with proper HTTP methods and status codes
- Swagger UI at `/api-docs`
- Unit tests for business logic and validation functions

## Project Structure

- `public/` - SPA frontend
- `src/controllers/` - request handlers
- `src/services/` - business logic
- `src/routes/` - API routes only
- `src/models/` - MongoDB schemas
- `tests/` - unit tests

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a cloud MongoDB URI

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an `.env` file from `.env.example`:

   ```bash
   copy .env.example .env
   ```

3. Update `MONGODB_URI` in `.env` if needed.

## Running the Project

Start the API and frontend:

```bash
npm run dev
```

Open:

- App: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`
- Health check: `http://localhost:3000/api/health`

## Testing

Run the unit tests:

```bash
npm test
```

The tests focus on the business logic in the service and validation layers, not the routes themselves.

## Database Model

### Task

Fields:

- `title`
- `description`
- `status` (`todo`, `in-progress`, `done`)
- `priority` (`low`, `medium`, `high`)
- `categoryId` (optional reference to a category)
- `dueDate`
- `completedAt`

### Category

Fields:

- `name`
- `description`

## API Overview

### Tasks

- `GET /api/tasks` - list tasks with search and filters
- `POST /api/tasks` - create task
- `GET /api/tasks/:id` - get one task
- `PATCH /api/tasks/:id` - update task
- `DELETE /api/tasks/:id` - delete task
- `GET /api/tasks/stats` - dashboard stats

### Categories

- `GET /api/categories` - list categories
- `POST /api/categories` - create category
- `GET /api/categories/:id` - get one category
- `PATCH /api/categories/:id` - update category
- `DELETE /api/categories/:id` - delete category

## Example Request

```bash
curl -X POST http://localhost:3000/api/tasks ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Read chapter 1\",\"status\":\"todo\",\"priority\":\"medium\"}"
```

## Doctor Notes

- Business logic lives in `src/services/`, not in the routes.
- Unit tests cover validation and core CRUD logic helpers.
- Swagger UI can be used to inspect and try every API endpoint.
- The frontend updates with `fetch()` without page reloads.
