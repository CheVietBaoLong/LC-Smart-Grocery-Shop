=======
# 🛒 Smart Grocery Shopping App
=======
A full-stack online grocery shopping application that helps customers plan meals, manage grocery spending, and optimize their shopping experience.

---

## 📌 Overview

This app serves two types of users:

- **Customers** — Track spending analytics, plan meals, optimize grocery budgets, and manage their accounts
- **Staff** — Manage product inventory, update pricing based on retailer information, and assist customers with account management

---

## ✅ Current Features

### Authentication
- User registration and login/logout
- Password hashing with `bcrypt`
- Session management with `JWT (jsonwebtoken)`
- Role-based access (Customer vs Staff)

### Customer
- Browse and search products with pricing
- View and manage personal account information
- Shopping cart management

### Staff
- View and manage product stock levels
- Update product pricing based on retailer data
- Access customer information for support purposes

---

## 🚧 In Progress

- Enhanced UI/UX across all pages
- Meal planning feature
- Spending analytics dashboard
- Shopping cart checkout flow
- Route optimization (shortest distance / least time / lowest cost)

---

## 📋 Planned Features

- Spending analytics and visualization
- Meal planning with budget optimization
- Delivery route optimization
- Deployment to Vercel

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, HTML/CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Prisma ORM |
| Cloud DB | Supabase |
| Auth | bcrypt, JSON Web Tokens (JWT) |
| Hosting | Local (Vercel deployment planned) |

---

## 🏗️ Project Structure

```
project/
├── backend/
│   ├── middleware/      # Auth and role-based access control
│   ├── routes/          # API endpoints (auth, customer, orders, products, staff)
│   ├── prisma/          # Database schema and Prisma client
│   ├── .env             # Environment variables
│   └── index.js         # Server entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components (Navbar, etc.)
    │   ├── context/     # Auth context for global state
    │   ├── pages/       # App pages (Login, Register, Cart, Orders, Products, etc.)
    │   └── api.js       # API communication layer
    └── public/
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL or Supabase account
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/CheVietBaoLong/LC-Smart-Grocery-Shop.git
cd LC-Smart-Grocery-Shop
```

```bash
# Install backend dependencies
cd backend
npm install
```

```bash
# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create a `.env` file in the `/backend` directory:

```env
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Running the App

```bash
# Start backend (from /backend)
npm start

# Start frontend (from /frontend)
npm start
```

Frontend and backend runs at `http://localhost:5000`

---

## 👥 Team Contributions

| Member | Contributions | GitHub |
|--------|---------------|--------|
| Viet Bao Long | Backend development, database schema design, authentication system (JWT + bcrypt), API routes, page structure | CheVietBaoLong |
| Lan Duong | Frontend development, UI/UX design, backend architecture optimization | |
| Eirlys Vo | ER model design, database schema design and development | |
---

## 📚 Database Design

The app uses a PostgreSQL relational database with the following core entities:

- `Users` (Customers & Staff)
- `Products` (with categories, pricing, stock)
- `Orders` (with delivery plans and status tracking)
- `Warehouses` (stock management)
- `Addresses` & `Credit Cards` (customer account management)

---
