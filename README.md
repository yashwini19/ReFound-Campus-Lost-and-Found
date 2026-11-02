# 🔎 ReFound – Campus Lost & Found Management System

<p align="center">
  **Find what's lost. Return what's found. Reconnect what matters.**
</p>

<p align="center">
  A full-stack web application designed to simplify the process of reporting, discovering, and claiming lost belongings within a campus community.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-blue?logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Backend-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-Framework-black?logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb" />
  <img src="https://img.shields.io/badge/Cloudinary-Image%20Storage-blue?logo=cloudinary" />
  <img src="https://img.shields.io/badge/Status-Development-orange" />
</p>

---

## 📌 Overview

**ReFound** is a campus-focused Lost & Found Management System that provides a centralized platform for students to report lost belongings and share information about items they have found.

Instead of relying on notice boards, social media groups, or word of mouth, ReFound allows users to manage lost-and-found reports through a single web application.

The platform also includes a claim management workflow that helps users communicate ownership requests and enables item reporters to review and respond to claims.

## ✨ Key Features

- 🔐 **User Authentication** – Secure registration and login using JWT authentication.
- 📦 **Lost Item Reporting** – Report belongings that have been lost on campus.
- 🎒 **Found Item Reporting** – Upload details of items discovered around campus.
- 🖼️ **Image Uploads** – Upload item photographs using Cloudinary.
- 🔍 **Browse & Search** – Explore reported items and search using relevant details.
- 🏷️ **Category Filtering** – Organize items by category and type.
- 🤝 **Claim Management** – Submit ownership claims for found items.
- ✅ **Claim Review** – Item reporters can approve or reject submitted claims.
- 📊 **Personal Dashboard** – View and manage your reports and claims.
- 🎨 **Responsive Interface** – Designed for a clean and accessible user experience.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Image Storage | Cloudinary, Multer |
| API Communication | REST API |
| Development Tools | VS Code, npm, Git, GitHub |

## 🏗️ Application Architecture

```text
                 ┌──────────────────────┐
                 │       Users          │
                 │   Students / Admin   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │    React Frontend    │
                 │   Vite + JavaScript  │
                 └──────────┬───────────┘
                            │
                       REST API
                            │
                            ▼
                 ┌──────────────────────┐
                 │   Express Backend    │
                 │   Node.js + JWT      │
                 └───────┬──────────────┘
                         │
              ┌──────────┴───────────┐
              ▼                      ▼
     ┌─────────────────┐    ┌─────────────────┐
     │    MongoDB      │    │   Cloudinary    │
     │  Application    │    │  Image Storage  │
     │      Data       │    │                 │
     └─────────────────┘    └─────────────────┘
```

## ⚙️ Getting Started

Follow these steps to run ReFound locally.

### 1. Clone the Repository

```bash
git clone https://github.com/yashwini19/ReFound-Campus-Lost-and-Found.git
```

```bash
cd ReFound-Campus-Lost-and-Found
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment Variables

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/refound
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace the placeholder values with your own configuration.

### 4. Start the Backend

```bash
npm run dev
```

If your backend does not have a development script, use:

```bash
node server.js
```

Backend URL:

`http://localhost:5000`

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 6. Configure Frontend Environment Variables

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

### 7. Start the Frontend

```bash
npm run dev
```

Frontend URL:

`http://localhost:5173`

## 🔗 Main API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |

### Items

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/items` | Retrieve active items |
| POST | `/api/items` | Report a lost or found item |
| GET | `/api/items/my-reports` | Retrieve personal reports |
| PATCH | `/api/items/:id/status` | Update item status |
| DELETE | `/api/items/:id` | Delete an item report |

### Claims

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/claims` | Submit a claim |
| GET | `/api/claims/my-claims` | View submitted claims |
| GET | `/api/claims/received` | View received claims |
| PATCH | `/api/claims/:claimId/review` | Approve or reject a claim |

Protected endpoints require a valid JWT authentication token.

## 🔄 How It Works

1. **Register or Log In** – Users create an account or sign in.
2. **Report an Item** – Users submit details and an optional image of a lost or found item.
3. **Discover Items** – Users browse
