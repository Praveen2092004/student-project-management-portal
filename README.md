# Student Mini Project Management Portal

A full-stack project tracking application built for the Klenty placement drive.

## 🚀 Key Architectural Features
- **Frontend Engine**: React 19 bootstrapped with Vite for high-performance Hot Module Replacement (HMR).
- **Styling Layout**: Fully responsive User Interface engineered with modern Tailwind CSS, featuring persistent theme synchronization (Light/Dark Mode) via browser `localStorage`.
- **State Synchronization**: Integrated asynchronous REST API management using Axios to communicate smoothly across standard CRUD operations.
- **Robust Error Control**: Double-layered security processing via client-side data pattern matching and server-side semantic validation alongside global fallback Express error handlers.
- **Resilient Storage Architecture**: Designed to establish automatic operational fallback to an isolated JavaScript In-Memory array buffer state engine if an active relational or document-oriented database instance is unavailable on the runtime host machine.

## 🛠️ Step-by-Step Initialization

### 1. Provision the Backend Engine
```bash
cd backend
npm install
node server.js