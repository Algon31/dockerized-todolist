# 📝 Dockerized Todo List V2

[![CI/CD Pipeline](https://github.com/Algon31/dockerized-todolist/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Algon31/dockerized-todolist/actions/workflows/ci-cd.yml)

A production-grade, full-stack, cloud-native Todo List application built with **React (Vite + NGINX)**, **Node.js (Express)**, **PostgreSQL 16 (or Supabase)**, and **Redis 7 (or Upstash)**, fully containerized using **Docker**, **Docker Compose**, and **Kubernetes**.

TodoList V2 introduces **User Authentication (JWT + Bcrypt)**, **PostgreSQL Relational Persistence**, and high-performance **Redis-backed Rate Limiting** with automatic request throttling and brute-force mitigation.

---

## ✨ Features (V2)

* 🔐 **User Authentication**: Secure user registration, login, and JWT Bearer token session authorization with **Bcrypt** password hashing.
* 🗄️ **PostgreSQL Relational Storage**: Durable persistence for user accounts and todos with strict foreign key constraints and user data isolation.
* ⚡ **Redis Distributed Rate Limiting**: Request counting and sliding-window throttling on authentication routes (10 req/min) and API endpoints (100 req/min) returning standard `X-RateLimit-*` and HTTP `429 Too Many Requests`.
* ✅ **Full Todo Management**: Create, edit, toggle completion, search, filter (All / Active / Completed), and delete tasks with instant feedback.
* 📊 **Live Progress & Stats**: Interactive overview tracker with completion percentage progress bar.
* 🔄 **RESTful API**: Clean Express.js backend routing, automated database schema initialization on boot, CORS, and unified error handling.
* 🐳 **Docker Multi-Stage Builds**: Optimized, lightweight container images using Alpine Linux, PostgreSQL 16 Alpine, and Redis 7 Alpine.
* ☸️ **Kubernetes Ready**: Declarative Deployments, Services, and Persistent Volume Claims.
* 📱 **Responsive UI**: Modern glassmorphic aesthetic styled with Tailwind CSS for mobile, tablet, and desktop screens.

---

## 🛠️ Tech Stack

### 💻 Language & Core
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### 🎨 Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![NGINX](https://img.shields.io/badge/NGINX-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### ⚙️ Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens)

### 🗄️ Databases & Caching
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### 🐳 DevOps & Deployment
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

---

## 🏗️ Architecture & Data Flow

```text
  [ User Web Browser / Mobile ]
               │
               │ HTTP Requests (Header: Authorization: Bearer <JWT>)
               ▼
   ┌─────────────────────────────────────────────────────────┐
   │                  Express.js Backend                     │
   │                                                         │
   │  1. Redis Rate Limiter Middleware                       │
   │     - Sliding window counter & HTTP 429 throttling      │
   │                                                         │
   │  2. JWT Authentication Middleware                       │
   │     - Validates Bearer token & attaches req.user        │
   │                                                         │
   │  3. API Controllers (/api/auth, /todo)                  │
   └───────────────┬─────────────────────────┬───────────────┘
                   │                         │
     (Read / Write Rate Limits)    (Durable User & Task Storage)
                   │                         │
                   ▼                         ▼
         ┌───────────────────┐     ┌───────────────────┐
         │      Redis 7      │     │   PostgreSQL 16   │
         │   (Rate Limits)   │     │   (Users, Todos)  │
         └───────────────────┘     └───────────────────┘
```

---

## ⚙️ Environment Variables

### Backend (`Backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment | `development` or `production` |
| `PORT` | Backend server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection URI | `postgresql://postgres:password@localhost:5432/tododb` |
| `REDIS_URL` | Redis connection URI | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key used for signing JWTs | `your_secure_random_jwt_secret` |
| `FRONTEND_URL` | Frontend URL for CORS permissions | `http://localhost:3000` |

### Frontend (`Frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:3001` or `https://your-backend.onrender.com` |

---

## 🚀 Quick Start with Docker Compose

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Algon31/dockerized-todolist.git
   cd dockerized-todolist
   ```

2. **Start the full stack with Docker Compose:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   * **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   * **Backend API**: [http://localhost:3001](http://localhost:3001)
   * **Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

---

## ☸️ Kubernetes Deployment

Deploy all services to a Kubernetes cluster using the provided manifests:

```bash
# 1. PostgreSQL Storage & Service
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml

# 2. Redis Deployment & Service
kubectl apply -f redis-deployment.yaml
kubectl apply -f redis-service.yaml

# 3. Backend & Frontend
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
```

---

## 🧪 Running Tests

### Backend Tests (Jest & Supertest)
```bash
cd Backend
npm test
```

### Frontend Tests (Vitest & Testing Library)
```bash
cd Frontend
npm run test
```

---

## 🔒 API Endpoints

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Create account `{ email, password }`
* `POST /api/auth/login` - Login and receive JWT `{ email, password }`
* `GET /api/auth/me` - Get profile of authenticated user

### Todos (`/todo`) [Protected by JWT & Rate Limiter]
* `GET /todo` - List todos for logged-in user
* `POST /todo` - Create new todo `{ id, todo, iscompleted }`
* `PUT /todo/:id` - Update task content or toggle completion
* `DELETE /todo/:id` - Delete task
* `POST /todo/clear` - Clear all tasks for logged-in user
