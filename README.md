# 📝 Dockerized Todo List

[![CI/CD Pipeline](https://github.com/Algon31/dockerized-todolist/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Algon31/dockerized-todolist/actions/workflows/ci-cd.yml)

A full-stack, cloud-native Todo List application built with **React (Vite + NGINX)**, **Node.js (Express)**, and **Redis**, fully containerized using **Docker**, **Docker Compose**, and **Kubernetes** for seamless local development, testing, and production deployment.

The application features **client session isolation** and **automatic Redis TTL data expiration**, allowing visitors to create and manage their own private, temporary todo lists without needing a login account.

---

## ✨ Features

* 🔒 **Anonymous Session Isolation**: Each visitor gets an isolated todo list using client-generated session IDs (`x-session-id` header) stored in `localStorage`.
* ⏳ **Automatic Redis Expiration (TTL)**: Tasks automatically expire and clean up from Redis after **7 days** of inactivity.
* ✅ **Create Tasks**: Add new tasks with instant UI updates and unique UUIDs.
* ✏️ **Edit Tasks**: Inline edit mode to update task descriptions without losing state.
* 🗑️ **Delete Tasks**: Remove individual tasks safely.
* ✔️ **Complete Tasks**: Toggle completion status with visual line-through feedback.
* 🧹 **Clear All**: Bulk clear all tasks for the current session with confirmation dialogs.
* 🔄 **RESTful API**: Clean Express.js backend routing, dynamic CORS, and error handling.
* ⚡ **Redis In-Memory Storage**: Fast Hash storage (`hSet`, `hGetAll`, `hDel`, `del`, `expire`).
* 🐳 **Docker Multi-Stage Builds**: Optimized, lightweight container images using Alpine Linux and NGINX.
* ☸️ **Kubernetes Ready**: Declarative Deployments and Services for production scaling and service discovery.
* 📱 **Responsive UI**: Styled with Tailwind CSS for mobile, tablet, and desktop screens.

---

## 🛠️ Tech Stack

### 💻 Language
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### 🎨 Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![NGINX](https://img.shields.io/badge/NGINX-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### ⚙️ Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![REST API](https://img.shields.io/badge/REST_API-02569B?style=for-the-badge)

### 🗄️ Database
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### 🐳 DevOps & Deployment
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

---

## 🏗️ Architecture & Data Flow

```text
  [ User Web Browser ]
           │
           │ HTTP Requests (Header: x-session-id)
           ▼
 ┌────────────────────────────────────────────────┐
 │  Frontend Container (Nginx / React Port 3000)   │
 └────────────────────────────────────────────────┘
           │
           ▼
 ┌────────────────────────────────────────────────┐
 │   Backend Container (Express API Port 3001)    │
 └────────────────────────────────────────────────┘
           │
           ▼ Redis Hashes (Key: todos:<session_id>, TTL: 7 Days)
 ┌────────────────────────────────────────────────┐
 │          Redis In-Memory Data Store            │
 └────────────────────────────────────────────────┘
```

1. **Frontend**: The React UI checks `localStorage` for a `todo_session_id` (or creates one with `uuidv4()`), attaching it as `x-session-id` in all HTTP requests. In production, static assets are served via high-performance **NGINX**.
2. **Backend**: Express REST API extracts the session ID and queries or modifies Redis hashes scoped specifically to `todos:<session_id>`.
3. **Redis**: Stores tasks in memory and maintains a **7-day expiration timer (TTL)** refreshed upon task additions or edits.

---

## 📂 Project Structure

```text
dockerized-todolist/
├── Frontend/                 # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Body.jsx     # Main Todo list interface & session state logic
│   │   │   ├── Navbar.jsx   # Header navigation
│   │   │   └── Navbar.test.jsx # Vitest component tests
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile           # Multi-stage build (Node.js -> NGINX)
│   ├── .dockerignore        # Excludes node_modules & dist
│   └── package.json
├── Backend/                  # Express API Backend
│   ├── Todooperations/
│   │   └── todoOperations.js # Session-scoped Redis operations & router
│   ├── app.js               # Express application & CORS configuration
│   ├── server.js            # Server startup
│   ├── todo.test.js         # Jest API unit & integration tests
│   ├── Dockerfile           # Node.js 18 Alpine container image
│   ├── .dockerignore        # Excludes node_modules
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci-cd.yml        # CI/CD pipeline (Lint, Test, Build & GHCR push)
├── docker-compose.yml        # Multi-container orchestration (Frontend, Backend, Redis)
├── backend-deployment.yaml   # Kubernetes backend deployment manifest
├── backend-service.yaml      # Kubernetes backend service manifest
├── frontend-deployment.yaml  # Kubernetes frontend deployment manifest
├── frontend-service.yaml     # Kubernetes frontend service manifest
├── redis-deployment.yaml     # Kubernetes redis deployment manifest
├── redis-service.yaml        # Kubernetes redis service manifest
├── .dockerignore             # Root Docker ignore rules
└── README.md
```

---

## 🚀 How to Run with Docker

Running the app with Docker Compose automatically builds and launches all containers:

### 1. Clone the repository

```bash
git clone https://github.com/Algon31/dockerized-todolist.git
cd dockerized-todolist
```

### 2. Build and start the containers

```bash
docker compose up --build
```

Docker Compose will automatically:
* Build the **Frontend** multi-stage image and serve it via NGINX on port `3000`.
* Build the **Backend** Node.js image and serve it on port `3001`.
* Spin up the **Redis** container on port `6379`.
* Connect all 3 containers on a unified bridge network with automatic DNS resolution.

### 3. Access the Application

* **Frontend UI**: Open [`http://localhost:3000`](http://localhost:3000) in your browser.
* **Backend API**: Accessible at [`http://localhost:3001/todo`](http://localhost:3001/todo).

To stop the running containers:

```bash
docker compose down
```

---

## 🧪 Testing

### Backend Unit & Integration Tests (Jest)
```bash
cd Backend
npm test
```
* Tests API CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE`, `/clear`).
* Validates session isolation (`x-session-id` header handling).
* Mocks Redis client and verifies TTL expiration calls.

### Frontend Component Tests (Vitest)
```bash
cd Frontend
npm test
```
* Runs component tests and verifies DOM rendering with `@testing-library/react`.

---

## 🔌 API Endpoints

All endpoints support the optional `x-session-id` header for user data isolation.

| Method | Endpoint | Headers | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/todo` | `x-session-id: <id>` | Fetch all todos for the active session |
| `POST` | `/todo` | `x-session-id: <id>` | Create a new todo and set/refresh 7-day TTL |
| `PUT` | `/todo/:id` | `x-session-id: <id>` | Update an existing todo text or completion status |
| `DELETE` | `/todo/:id` | `x-session-id: <id>` | Delete a single todo item by ID |
| `POST` | `/todo/clear` | `x-session-id: <id>` | Clear all todos belonging to the active session |

---

## 🔄 CI/CD Pipeline

Automated Continuous Integration and Continuous Deployment (CI/CD) is implemented using **GitHub Actions** (`.github/workflows/ci-cd.yml`).

### ⚙️ Pipeline Overview

1. **Backend CI (`test-backend`)**:
   * Installs Node 18 dependencies.
   * Runs backend test suite via Jest (`npm test`).

2. **Frontend CI (`test-frontend`)**:
   * Installs Node 18 dependencies.
   * Runs ESLint (`npm run lint`).
   * Executes unit & component tests via Vitest (`npm test`).
   * Validates production application build (`npm run build`).

3. **Docker Build & Push CD (`build-and-push`)**:
   * Triggered automatically after tests pass on `main` branch or tag releases (`v*.*.*`).
   * Builds production Docker images for **Backend** and **Frontend**.
   * Pushes tagged container images to **GitHub Container Registry (GHCR)** (`ghcr.io/algon31/todo-backend`, `ghcr.io/algon31/todo-frontend`).

---

## 👨‍💻 Author

**Ravi Bhuvan**

* GitHub: [https://github.com/Algon31](https://github.com/Algon31)
* LinkedIn: [https://www.linkedin.com/in/ravi-bhuvan-985399286/](https://www.linkedin.com/in/ravi-bhuvan-985399286/)
