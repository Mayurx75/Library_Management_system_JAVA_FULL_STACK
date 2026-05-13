# Library Management System (Full Stack)

A full-stack library management application with a **Spring Boot** REST API and a **React (Vite)** web client. Manage books, students, book issuance and returns, and view dashboard statistics.

## Live demo

**Production (Netlify):** [https://lumina-library-ui-20260513.netlify.app](https://lumina-library-ui-20260513.netlify.app)

The hosted UI uses the same-origin `/api` layer on Netlify (serverless Express function) so the app works without running Spring Boot in the browser. For local development with MySQL, run the Spring API as described below.

## Repository layout

| Directory | Stack | Description |
|-----------|--------|-------------|
| `library-management/` | Java 17, Spring Boot 3, Maven | REST API, JPA entities, MySQL (local), optional Netlify serverless mirror for demos |
| `library-frontend/` | React 19, Vite, Tailwind CSS | SPA: dashboard, books, students, issue book, circulation history |

## Features

- **Books:** CRUD, search by title/author, filter by category, availability
- **Students:** CRUD, search, issue history modal
- **Circulation:** Issue (14-day loan), return, active / returned / overdue views
- **Dashboard:** Totals, recent activity, quick actions
- **API:** Validation, global exception handling, CORS for local and Netlify origins

## Prerequisites

- **Backend:** JDK 17+, Maven 3.8+, MySQL 8+ (for local Spring profile)
- **Frontend:** Node.js 18+ (20 recommended)

## Local setup

### 1. Database (MySQL)

Create a database and align credentials with `library-management/src/main/resources/application.properties` (default: `library_db`, user `root`, password `root`).

```sql
CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Run the API

```bash
cd library-management
mvn spring-boot:run
```

API base URL: `http://localhost:8080/api`

### 3. Run the frontend

```bash
cd library-frontend
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). The client uses `http://localhost:8080/api` by default when not hosted on Netlify.

### 4. Production frontend build

```bash
cd library-frontend
npm run build
```

Output: `library-frontend/dist/`. Netlify configuration lives in `library-frontend/netlify.toml` (optional deploy).

## API overview (Spring)

| Prefix | Purpose |
|--------|---------|
| `/api/books` | Books CRUD, `/search`, `/available` |
| `/api/students` | Students CRUD, `/search` |
| `/api/issued-books` | List, active, returned, overdue, issue, return, by student |
| `/api/dashboard/stats` | Aggregated stats + recent issues |

Sample data is loaded on first empty database via `DataLoader` (Spring).

## Tech stack summary

- **Backend:** Spring Web, Spring Data JPA, Validation, Lombok, MySQL Connector, optional H2 (`application-cloud.properties`) for containerized demos
- **Frontend:** React Router, Axios, react-hot-toast, lucide-react, Tailwind CSS

## License

Use and modify for your own learning or projects. Add a license file if you redistribute publicly.

## Author

Mayur — [Mayurx75](https://github.com/Mayurx75)
