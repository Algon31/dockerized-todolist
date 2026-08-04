# 📝 Dockerized Todo List

A full-stack Todo List application built with **React**, **Node.js**, **Express**, and **Redis**, fully containerized using **Docker** and **Docker Compose** for seamless local development and production deployment.

The application allows users to create, edit, mark as completed, delete, and clear daily tasks through a clean, responsive interface.

---

## ✨ Features

* ✅ **Create Tasks**: Quickly add new tasks with immediate UI updates.
* ✏️ **Edit Tasks**: Inline edit mode to update task descriptions without losing state.
* 🗑️ **Delete Tasks**: Remove individual tasks safely.
* ✔️ **Complete Tasks**: Toggle completion status with visual line-through feedback.
* 🧹 **Clear All**: Bulk clear all tasks with confirmation dialogs.
* 🔄 **RESTful API**: Clean Express.js backend routing and error handling.
* ⚡ **Redis In-Memory Storage**: Fast Hash storage (`hSet`, `hGetAll`, `hDel`).
* 🐳 **Docker & Docker Compose**: Automated multi-container build and execution.
* 📱 **Responsive UI**: Styled with Tailwind CSS for mobile and desktop screens.

---

## 🛠️ Tech Stack

### 💻 Language

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### 🎨 Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
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

---

## 🏗️ Architecture & Deployment Overview

In deployment, the application runs as 3 decoupled services:

```text
  [ User Web Browser ]
           │
           │ (HTTP Requests to Port 3001)
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
           ▼ (REDIS_URL: redis://redis:6379 OR Cloud DB)
 ┌────────────────────────────────────────────────┐
 │     Redis Container / Online Redis Database    │
 └────────────────────────────────────────────────┘
```

1. **Frontend**: Serves compiled React assets via Nginx. Runs in the user's browser and issues REST requests to the Backend API.
2. **Backend**: Express.js server providing API endpoints to manage tasks.
3. **Redis Database**: Stores tasks as Redis Hash key-value entries.
   * **Local / Docker**: Runs automatically as a `redis:alpine` container.
   * **Cloud / Online DB**: Can connect to a remote online Redis instance (e.g. Redis Cloud, Upstash) by setting `REDIS_URL` in environment configuration.

---

## 📂 Project Structure

```text
ToDo-list/
├── Frontend/                 # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Body.jsx     # Main Todo list interface & state logic
│   │   │   └── Navbar.jsx   # Header navigation
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile           # Multi-stage Nginx build
│   └── package.json
├── Backend/                  # Express API Backend
│   ├── Todooperations/
│   │   └── todoOperations.js # Redis operations & router
│   ├── server.js            # Express server configuration & CORS
│   ├── .env                 # Environment variables
│   ├── Dockerfile           # Node 18 Alpine image
│   └── package.json
├── docker-compose.yml        # Orchestrates Frontend, Backend & Redis
├── backend-deployment.yaml   # Kubernetes backend deployment manifest
├── backend-service.yaml      # Kubernetes backend service manifest
├── frontend-deployment.yaml  # Kubernetes frontend deployment manifest
├── frontend-service.yaml     # Kubernetes frontend service manifest
├── redis-deployment.yaml     # Kubernetes redis deployment manifest
├── redis-service.yaml        # Kubernetes redis service manifest
└── README.md
```

---

## 🚀 How to Run with Docker

Running the app with Docker Compose automatically builds and launches all containers seamlessly:

### 1. Clone the repository

```bash
git clone https://github.com/Algon31/ToDo-list.git
cd ToDo-list
```

### 2. Build and start the containers

```bash
docker compose up --build
```

Docker Compose will automatically:
* Build the **Frontend** image and serve it on port `3000`.
* Build the **Backend** image and serve it on port `3001`.
* Spin up the **Redis** container on port `6379`.
* Connect all 3 containers on a unified bridge network.

### 3. Access the Application

* **Frontend UI**: Open [`http://localhost:3000`](http://localhost:3000) in your browser.
* **Backend API**: Accessible at [`http://localhost:3001/todo`](http://localhost:3001/todo).

To stop the running containers:

```bash
docker compose down
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/todo` | Fetch all todo items from Redis |
| `POST` | `/todo` | Create a new todo item |
| `PUT` | `/todo/:id` | Update an existing todo text or completion status |
| `DELETE` | `/todo/:id` | Delete a single todo item by ID |
| `POST` | `/todo/clear` | Delete all todo items |

---

## 🎯 Future Improvements

* 🔐 User Authentication & JWT Sessions
* ☁️ Cloud Database Integration (Redis Cloud / MongoDB)
* 📅 Due Dates, Priorities & Reminders
* 🏷️ Task Categories & Labels
* 🌙 Dark Mode Theme
* 📊 Task Completion Analytics

---

## 📖 What I Learned

This project provided hands-on experience with:

* Designing RESTful APIs with Node.js & Express.
* State management and hooks in React 19.
* In-memory key-value data modeling using Redis Hashes.
* Multi-stage Docker builds and Nginx container configuration.
* Multi-container orchestration using Docker Compose and Kubernetes manifests.

---

## 👨‍💻 Author

**Ravi Bhuvan**

* GitHub: [https://github.com/Algon31](https://github.com/Algon31)
* LinkedIn: [https://www.linkedin.com/in/ravi-bhuvan-985399286/](https://www.linkedin.com/in/ravi-bhuvan-985399286/)
