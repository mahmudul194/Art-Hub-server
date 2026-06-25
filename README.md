# Art Hub - Server (Backend) ⚙️

This is the backend repository for **Art Hub**, a MERN stack marketplace for artists and art collectors. It provides a robust RESTful API built with Node.js and Express to handle user authentication, artwork management, role-based access control, and Stripe payment processing.

## 🚀 Live Demo
[Deployed on Render](https://art-hub-server-uvag.onrender.com)

## ✨ Key Features
- **JWT Authentication:** Secure user registration and login using JSON Web Tokens (HTTP-only cookies).
- **Role-Based Access Control (RBAC):** Distinct permissions for `user`, `artist`, and `admin` roles.
- **Stripe Integration:** Fully functional Stripe Checkout sessions for processing 1-click artwork purchases and subscription tier upgrades.
- **Database Architecture:** Optimized MongoDB schemas utilizing Mongoose for relational data modeling (Users, Artworks, Transactions).

## 🛠️ Tech Stack
- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Security:** bcryptjs (Password Hashing), jsonwebtoken (JWT)
- **Payments:** Stripe API
- **Deployment:** Render

## 💻 Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/mahmudul194/Art-Hub-server.git
   cd server
   npm install
   ```

2. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   CLIENT_URL=http://localhost:3000
   ```

3. **Run the server:**
   ```bash
   npm start
   # or for development with hot-reloading:
   npx nodemon index.js
   ```
   The API will be accessible at `http://localhost:5000`.
