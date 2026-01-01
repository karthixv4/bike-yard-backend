# Bike Yard Backend API

A comprehensive backend for the BikeBazaar marketplace, facilitating the buying and selling of used bikes, parts, and accessories.

## 🚀 Features

*   **User Management**:
    *   Authentication & Authorization (JWT).
    *   Role-based profiles: Buyer, Seller, Mechanic.
    *   Profile Updates (Personal details + Address management).
*   **Product Management**:
    *   Listings for Bikes, Parts, and Accessories.
    *   Image handling via Cloudinary.
    *   **Stock Management**: Strict stock control (Bikes = 1, sold-out checks, auto-restocking on cancellation).
    *   Search & Filters (Category, Price, Brand, Model).
*   **Inspections**:
    *   Schedule mechanic inspections for used bikes.
    *   Generate and view inspection reports.
*   **Orders & Cart**:
    *   Cart management (Add/Update/Remove items).
    *   Secure Checkout (Razorpay integration ready).
    *   Order Status updates (Shipped, Delivered, Cancelled).
    *   **Restocking**: Automatically restock items when orders are cancelled.
*   **Security & Performance** (Production Ready):
    *   Rate Limiting (DDoS protection).
    *   Response Compression (Gzip/Brotli).
    *   Helmet Security Headers.
    *   CORS protection.

## 🛠️ Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Storage**: Cloudinary
*   **Docs**: Swagger UI (`/api-docs`)

## ⚡ Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   PostgreSQL Database
*   Cloudinary Account
*   Razorpay Account (Optional for payments)

### 2. Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/xathon-backend.git
    cd xathon-backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment:
    Create a `.env` file in the root directory (see `.env.example` or Deployment Guide).
    ```env
    DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
    JWT_SECRET="your_jwt_secret"
    PORT=5000
    CLOUD_NAME="your_cloud_name"
    CLOUD_API_KEY="your_api_key"
    CLOUD_API_SECRET="your_api_secret"
    ```

4.  Initialize Database:
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```

### 3. Running the App

*   **Development**:
    ```bash
    npm run dev
    ```
    *Runs with nodemon for hot-reloading.*

*   **Production**:
    ```bash
    npm start
    ```
    *Runs using standard node command.*

## 📚 API Documentation

Once the server is running, visit:
**[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

to view the interactive Swagger documentation for all endpoints.

## 🚢 Deployment

Detailed deployment instructions for Vercel, Railway, and others are available in **[deployment_guide.md](./deployment_guide.md)**.

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the ISC License.
