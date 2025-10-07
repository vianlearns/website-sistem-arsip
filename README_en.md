# DINUS Archive - Digital Archive Management System

Digital archive management application for Dian Nuswantoro University that enables efficient storage, search, and management of archives.

## Table of Contents

- About the Project
- Project Structure
- Technologies Used
- Features
- Installation and Usage
- Backend & Frontend Docs
- Contributing

## About the Project

DINUS Archive is a digital archive management system designed for Dian Nuswantoro University. The application allows users to upload, categorize, search, and manage digital archives easily and efficiently.

The project consists of two main parts:
- `frontend`: Web-based user interface (React + TypeScript)
- `backend`: RESTful API (Node.js + Express)

## Project Structure

```
dinus-archive/
├── backend/           # Node.js/Express API server
├── frontend/          # React/TypeScript application
├── arsip_udinus.sql   # SQL file for database
├── README.md          # Project documentation (Indonesian)
└── README_en.md       # Project documentation (English)
```

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- shadcn/ui (Radix UI-based components)
- Axios

### Backend
- Node.js
- Express.js
- MySQL
- JWT for authentication
- Multer for file uploads

## Features

- Authentication and user management
- Digital archive management (upload, edit, delete)
- Archive categorization (category, subcategory, position)
- Archive search and filtering (category, subcategory, position, keyword, date)
- Archive image preview
- Admin dashboard
- Responsive design for desktop and mobile

## Installation and Usage

### Prerequisites

- Node.js (version 16.x or newer)
- MySQL (version 5.7 or newer)
- npm or yarn

### Backend Setup

```powershell
cd backend
npm install
```

Create a `.env` file based on `.env.example` and adjust it to your database configuration:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret_key
```

Run the server:

```powershell
npm run dev
# or
nodemon server.js
```

Backend runs at `http://localhost:5000` (Base API: `http://localhost:5000/api`).

### Frontend Setup

```powershell
cd frontend
npm install
```

Run the application:

```powershell
npm run dev
```

Frontend runs at `http://localhost:8080`.

## Backend & Frontend Docs

- Backend: see `backend/README.md`
- Frontend: see `frontend/README.md`

## Recent Changes

- Backend: `GET /api/archives` now supports `position_id` filtering and returns `position_name` via `positions` join.
- Frontend: Dashboard displays position badge using `position_name` from the backend; position filter works correctly when subcategory changes.
- CategoryModal: The “Position” tab now renders positions correctly for the active subcategory.

## Contributing

Contributions are welcome. Please fork the repository, create a new branch, and submit a pull request.

---

Developed for Dian Nuswantoro University © 2025