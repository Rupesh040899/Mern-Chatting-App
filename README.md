# Realtime Chat Application

This repository contains a complete production-ready realtime one-to-one messaging application built with:

- Next.js App Router
- Express.js
- Socket.IO
- MongoDB with Mongoose
- JWT Authentication
- Tailwind CSS
- GSAP animations

## Project Structure

```
server/
  config/db.js
  controllers/
  middleware/
  models/
  routes/
  socket/
  .env.example
  package.json
  server.js
client/
  app/
    login/
    register/
    chat/
  components/
  context/
  hooks/
  lib/
  services/
  utils/
  public/
  package.json
  tailwind.config.js
  postcss.config.js
  next.config.js
  .env.example
.gitignore
README.md
```

## Features

- Register and login with JWT authentication
- Realtime one-to-one chat powered by Socket.IO
- Online/offline presence indicators
- Typing indicator and seen/unseen message support
- Animated dataset and premium glassmorphism UI
- Responsive mobile-friendly layout
- Persistent login using localStorage
- GSAP-powered page and component animations

## Setup Instructions

### 1. Install dependencies

Open a terminal in the root project folder and run:

```bash
cd "c:/Users/rupesh/dummy project/Next-App/server"
npm install

cd "c:/Users/rupesh/dummy project/Next-App/client"
npm install
```

### 2. Configure environment variables

Create `.env` files from the examples.

`server/.env`

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/realtime-chat?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

`client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Start the backend

```bash
cd "c:/Users/rupesh/dummy project/Next-App/server"
npm run dev
```

### 4. Start the frontend

```bash
cd "c:/Users/rupesh/dummy project/Next-App/client"
npm run dev
```

### 5. Open the app

Navigate to `http://localhost:3000` in your browser.

## API Endpoints

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login existing user
- `GET /api/users` — Get users list (protected)
- `GET /api/users/me` — Get current authenticated user (protected)
- `GET /api/messages/:userId` — Get chat history with a user (protected)
- `POST /api/messages` — Send a message (protected)

## Socket.IO Events

- `user-connected` — Notify server when user connects
- `send-message` — Send new message payload
- `receive-message` — Receive incoming message
- `typing` — Typing indicator events
- `online-users` — Broadcast list of online user IDs
- `user-status` — Broadcast when a user goes online/offline

## API Testing Examples

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alex","email":"alex@example.com","password":"Password123"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"Password123"}'
```

### Get users

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/users
```

### Get chat history

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/messages/<otherUserId>
```

### Send message

```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"<otherUserId>","text":"Hello there!"}'
```

## Architecture Overview

- `server/` contains the Express API, Socket.IO realtime server, Mongoose models, and authentication middleware.
- `client/` contains the Next.js App Router UI, authentication state, chat state, services, and animations.
- `AuthContext` stores login state and token persistence.
- `ChatContext` manages the active contact, messages, typing state, and online list.
- `socketHandler` in `server/socket` tracks connected clients and emits realtime events.
- `ChatShell` composes the sidebar and chat window with animated interactions.

## Future Scalability Suggestions

- Add group chat rooms and channels
- Implement message pagination and attachment support
- Add file upload and voice message features
- Add profile pages and settings
- Move to a scalable deployment with Docker or Kubernetes
- Add Redis for socket session persistence and horizontal scaling

---

Enjoy your realtime chat app! If you want, I can also add message search, group chat, or delivery receipts next.
