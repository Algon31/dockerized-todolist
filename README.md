# 📝 Dockerized Todo List

A full-stack Todo List application built with **React**, **Node.js**, **Express**, and **Redis**, fully containerized using **Docker** and **Docker Compose** for seamless local development.

The application allows users to create, update, complete, and manage daily tasks through a clean and responsive interface.

---

## ✨ Features

* ✅ Create new tasks
* ✏️ Edit existing tasks
* 🗑️ Delete tasks
* ✔️ Mark tasks as completed
* 🔄 RESTful API architecture
* ⚡ Redis for fast data storage
* 🐳 Dockerized frontend, backend, and database
* 📱 Responsive user interface

---

## 🛠️ Tech Stack

### 💻 Language

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)

### 🎨 Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge\&logo=css3\&logoColor=white)

### ⚙️ Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge\&logo=nodedotjs\&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge\&logo=express\&logoColor=white)
![REST API](https://img.shields.io/badge/REST_API-02569B?style=for-the-badge)

### 🗄️ Database

![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge\&logo=redis\&logoColor=white)

### 🐳 DevOps

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)

---

## 🏗️ Architecture

```text
Client (React)
       │
       ▼
REST API (Express.js)
       │
       ▼
     Redis
```

Docker Compose orchestrates all services, allowing the entire application stack to run with a single command.

---

## 📂 Project Structure

```text
ToDo-list/
│
├── client/          # React Frontend
├── server/          # Express Backend
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/Algon31/ToDo-list.git
```

### Build and start the containers

```bash
docker compose up --build
```

The application will automatically start all required services.

---

## 🎯 Future Improvements

* 🔐 User Authentication
* ☁️ Cloud Database Integration
* 📅 Due Dates & Reminders
* 🏷️ Categories & Labels
* 🌙 Dark Mode
* 📊 Task Analytics
* 👥 Multi-user Support

---

## 📖 What I Learned

This project helped me gain practical experience with:

* Building RESTful APIs using Express.js
* Managing application state with React
* Using Redis as a data store
* Containerizing applications with Docker
* Multi-container orchestration using Docker Compose
* Backend and frontend integration

---

## 👨‍💻 Author

**Ravi Bhuvan**

* GitHub: https://github.com/Algon31
* LinkedIn: https://www.linkedin.com/in/ravi-bhuvan-985399286/
