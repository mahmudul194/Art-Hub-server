# ArtHub - Server (Backend)

The ArtHub backend is a robust REST API built with **Node.js** and **Express.js**, designed to power the ArtHub web application. It securely handles user authentication, payments via Stripe, artwork management, and database operations using **MongoDB** and **Mongoose**.

## 🚀 Key Features & Functionalities

### 🔐 Authentication & Authorization
- **JWT & Cookie-Based Security**: Secure sessions utilizing JSON Web Tokens stored securely in HTTP-only cookies and Bearer headers.
- **Google OAuth Integration**: A dedicated authentication route for logging in with Google, intelligently identifying new users and managing their role assignments.
- **Role-Based Access Control (RBAC)**: Middleware protects endpoints based on user roles (`user`, `artist`, `admin`).

### 🖼️ Artwork Management
- **CRUD Operations**: Endpoints to create, read, update, and delete artworks.
- **Cloudinary Integration**: Images are securely uploaded, optimized, and hosted on Cloudinary, keeping the database lightweight.
- **Search & Filtering**: Retrieve artworks by artist ID, categories, or featured status.

### 💳 Payments & Sales
- **Stripe Integration**: Secure payment intents generation and webhook endpoints to listen for successful purchases.
- **Automated Sales Tracking**: Marks artworks as "sold" instantly upon successful payment.
- **Purchase History**: Securely fetch the payment history for artists (sales) and users (purchases).

### 👥 User Profiles & Subscriptions
- **Subscription Tiers**: Supports `free`, `pro`, and `premium` tiers, enforcing limits on how many artworks an artist can upload.
- **Profile Management**: Update avatars and user details.
- **Admin Control**: Fetch all users and manage their roles securely.

## 🛠️ Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- **Authentication**: JWT, bcryptjs
- **File Uploads**: Cloudinary, Multer
- **Payments**: Stripe Node SDK

## ⚙️ Getting Started

### Prerequisites
Make sure you have Node.js and MongoDB installed locally, or a MongoDB Atlas connection string.

### Environment Variables
Create a `.env` file in the root of the server directory and add the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_super_secret_key
FRONTEND_URL=http://localhost:3000

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. The server will start on `http://localhost:5000`.

## 📦 Deployment
The server is fully compatible with modern deployment platforms like [Render](https://render.com/), Heroku, or DigitalOcean. Be sure to configure all environment variables on your hosting provider, ensuring the `FRONTEND_URL` is set to your live production client domain.
