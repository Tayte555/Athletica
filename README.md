# 🏋️ Athletica

Athletica is a social fitness web application designed to help users create, manage, discover, and share workout routines. The platform allows users to build personalised training plans, explore community-created routines, follow other users, and stay motivated through social fitness features.

---

## ✨ Features

- User authentication (Register / Login)
- JWT protected routes
- Create, edit, and delete workout routines
- Public and private profile settings
- Routine discovery and search
- Follow system with private account requests
- Notifications system
- Routine optimisation and recommendations
- Admin moderation tools

---

## 🛠️ Tech Stack

### 💻 Frontend

- React + Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide Icons

### ⚙️ Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication

---

## 🚀 Running Athletica Locally (Development Environment)

## 📥 1. Clone the Repository

```bash
git clone <your-repository-url>
cd athletica
```

---

## 📦 2. Install Dependencies

Install all required dependencies for the root project, server, and client:

```bash
npm run install:all
```

Alternatively, you can install them separately:

```bash
npm install
npm run server:i
npm run client:i
```

---

## 🔐 3. Environment Variables

This project requires environment variables to run correctly for development.

Please contact me directly to receive the required `.env` files and setup instructions.

These include values such as:

- MongoDB connection string
- JWT secret
- Server port configuration
- Any third-party service keys (if required)

Do not commit `.env` files to version control.

---

## ▶️ 4. Start the Development Server

To run both frontend and backend together:

```bash
npm run dev
```

This uses `concurrently` to start both services at the same time.

---

## 📜 Available Scripts

### 🔄 Run both frontend and backend

```bash
npm run dev
```

### 🖥️ Run backend only

```bash
npm run server
```

### 🌐 Run frontend only

```bash
npm run client
```

### 📥 Install backend dependencies

```bash
npm run server:i
```

### 📥 Install frontend dependencies

```bash
npm run client:i
```

### 🧩 Install everything

```bash
npm run install:all
```

---

## 🗂️ Project Structure

```text
athletica/
│
├── client/        # React frontend
│
├── server/        # Express backend
│
├── package.json   # Root project scripts
│
└── README.md
```

---

## 📝 Notes

This project is currently configured for local development use.

Make sure MongoDB is running and your environment variables are correctly configured before starting the application.

If you experience setup issues, please contact me directly.

---

## 👨‍💻 Author

Developed by Tayte Keates

For setup support, environment variables, or project questions, please get in touch.
