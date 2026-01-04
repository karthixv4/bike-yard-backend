# Bike Yard Backend API

A comprehensive backend for the **Bike Yard** marketplace, facilitating the buying and selling of used bikes, parts, and accessories, along with mechanic services and inspections.

## 🚀 Features

### 👤 User Management
*   **Authentication**: Secure JWT-based auth.
*   **Role-Based Access**: Specialized profiles for Buyers, Sellers, Mechanics, and Admins.
*   **My Garage**: Users can add and manage their own bikes for service history and inspections.
*   **Addresses**: Manage multiple shipping/billing addresses.

### 🛒 Marketplace & Products
*   **Listings**: Sell Bikes, Accessories, and Parts.
*   **Stock Management**: Auto-handling of stock levels (Single unit for bikes).
*   **Search & Filter**: Find products by category, price, brand, etc.
*   **Cart & Orders**: Full shopping cart functionality with Razorpay integration support.
*   **Images**: Optimized image handling using Cloudinary.

### 🔧 Services & Inspections
*   **Inspections**: Schedule pre-purchase inspections for used bikes.
*   **Mechanic Services**: Mechanics can offer specific services (Oil Change, Wash, etc.) with customizable pricing.
*   **Service Bookings**: Users can book mechanics for their "Garage" bikes.
*   **Reports**: Detailed inspection reports with pass/fail criteria and notes.

### 🛡️ Admin & Security
*   **Admin Panel**: Backend support for platform administration.
*   **Seller Verification**: Business name and GST verification flows.
*   **Security**: Rate limiting, Helmet headers, CORS, and Data compression.

## 🛠️ Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Storage**: Cloudinary
*   **Docs**: Swagger UI

## ⚡ Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   PostgreSQL
*   Cloudinary Account

### 2. Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/bike-yard-backend.git
    cd bike-yard-backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment:
    Create a `.env` file (see `.env.example`):
    ```env
    DATABASE_URL="postgresql://..."
    JWT_SECRET="your_secret"
    CLOUD_NAME="your_cloud_name"
    CLOUD_API_KEY="your_key"
    CLOUD_API_SECRET="your_secret"
    ```

4.  Database Setup:
    ```bash
    npx prisma migrate dev --name init
    ```

### 3. Running the App

*   **Development** (Hot-reload):
    ```bash
    npm run dev
    ```
*   **Production**:
    ```bash
    npm start
    ```

## 📚 API Documentation

Visit **`http://localhost:5000/api-docs`** for interactive Swagger documentation.

## 🚢 Deployment

See **[deployment_guide.md](./deployment_guide.md)** for Vercel/Railway deployment instructions.

## 📄 License
ISC License.
