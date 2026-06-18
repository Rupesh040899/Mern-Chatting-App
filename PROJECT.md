# R-Sync Chat — Project Documentation

## Overview

R-Sync Chat is a full-stack realtime messaging application built with **Next.js** (frontend), **Node.js + Express** (backend), **Socket.IO** (realtime communication), and **MongoDB** (database). It features JWT-based authentication, online presence tracking, unread message counts, typing indicators, and a premium "Zinc Ember" UI with full dark/light theme support and GSAP animations.

---

## Project Structure

```
Next-App/
├── client/                  # Next.js 14 frontend
│   ├── app/
│   │   ├── layout.js        # Root layout, wraps all pages with Providers
│   │   ├── page.js          # Root redirect → /login
│   │   ├── globals.css      # Global styles, scrollbar, typing dot animation
│   │   ├── login/page.js    # Login page
│   │   ├── register/page.js # Register page
│   │   └── chat/page.js     # Chat page (renders ChatShell)
│   ├── components/
│   │   ├── ChatShell.jsx    # Main chat UI — sidebar, messages, input
│   │   ├── Providers.jsx    # Wraps app with AuthProvider + ChatProvider
│   │   └── ToastContainer.jsx # In-app toast + new message notifications
│   ├── context/
│   │   ├── AuthContext.jsx  # user, token, theme state + localStorage sync
│   │   └── ChatContext.jsx  # activeChat, messages, users, typing, online state
│   ├── hooks/
│   │   ├── useSocket.js     # Creates and returns a Socket.IO client ref
│   │   └── useGsapFade.js   # Simple GSAP fade-up hook (used on auth pages)
│   ├── services/
│   │   ├── authService.js   # loginUser(), registerUser() API calls
│   │   ├── userService.js   # fetchUsers(), fetchCurrentUser() API calls
│   │   └── messageService.js # fetchMessages(), fetchUnreadCounts() API calls
│   ├── utils/
│   │   ├── toast.js         # toast.success/error/info/newMessage() helpers
│   │   └── date.js          # formatTime() — formats timestamps to HH:MM AM/PM
│   ├── lib/
│   │   └── apiClient.js     # Axios instance + authHeader() helper
│   ├── tailwind.config.js   # darkMode: 'class', ember color palette, animations
│   └── package.json
│
└── server/                  # Express backend
    ├── server.js            # App entry — Express, CORS, routes, Socket.IO setup
    ├── config/
    │   └── db.js            # Mongoose connection (MongoDB Atlas → LiveChatApp db)
    ├── controllers/
    │   ├── authController.js    # registerUser(), loginUser()
    │   ├── userController.js    # getUsers(), getCurrentUser()
    │   └── messageController.js # getUnreadCounts(), getMessages(), createMessage()
    ├── middleware/
    │   ├── authMiddleware.js    # protect() — JWT verification, sets req.user
    │   └── errorMiddleware.js   # notFound(), errorHandler()
    ├── models/
    │   ├── User.js          # Mongoose User schema
    │   └── Message.js       # Mongoose Message schema
    ├── routes/
    │   ├── authRoutes.js    # POST /api/auth/register, POST /api/auth/login
    │   ├── userRoutes.js    # GET /api/users, GET /api/users/me
    │   └── messageRoutes.js # GET /api/messages/unread, GET /api/messages/:userId, POST /api/messages
    ├── socket/
    │   └── socketHandler.js # Socket.IO events: user-connected, send-message, typing, disconnect
    └── package.json
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS (dark mode via `class` strategy) |
| Animations | GSAP 3 |
| Realtime | Socket.IO client + server |
| HTTP client | Axios |
| Emoji picker | emoji-picker-react |
| Backend | Node.js + Express |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Database | MongoDB via Mongoose |
| Dev server | Nodemon |

---

## How It Works

### Authentication Flow
1. User submits login form → `POST /api/auth/login`
2. Server verifies email + password (bcrypt compare), returns `{ user, token }`
3. Frontend stores `{ user, token }` in `localStorage` under key `chat-auth`
4. `AuthContext` reads this on page load to restore session
5. All subsequent API calls include `Authorization: Bearer <token>` header
6. `protect` middleware on the server decodes the JWT and attaches `req.user`

### Realtime Messaging Flow
1. On login, `useSocket` hook creates a Socket.IO connection to `http://localhost:5000`
2. Client emits `user-connected` with their user ID → server registers them in `activeUsers` map
3. When a message is sent via the input, client emits `send-message` with `{ senderId, receiverId, text }`
4. Server saves the message to MongoDB (`messages` collection), then:
   - Emits `message-sent` back to the sender
   - Emits `receive-message` to the receiver's socket (if online)
5. Both events are handled by the same `onMessage` handler in ChatShell

### Typing Indicator
1. User starts typing → debounced emit of `typing: { isTyping: true }`
2. After **1.5 seconds** of no typing → auto-emit `typing: { isTyping: false }`
3. On message send → immediately emit `typing: { isTyping: false }`
4. Receiver gets `typing` event and updates `typingStatus` state

### Unread Message Counts
1. On app mount → `GET /api/messages/unread` returns `{ [senderId]: count }` for all unseen messages
2. While chatting, incoming `receive-message` events from non-active contacts increment the count in state
3. Opening a contact's chat clears their count in state and marks messages as `seen: true` on the server

### Theme System
- `AuthContext` stores theme (`'light'` or `'dark'`) in `localStorage`
- On load, toggles the `dark` class on `<html>` element
- Tailwind's `darkMode: 'class'` strategy activates `dark:` prefixed classes
- Default theme is **light**

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT token |

### Users *(protected)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users?search=` | Get all users except self, optional search |
| GET | `/api/users/me` | Get current logged-in user |

### Messages *(protected)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/unread` | Get unread message counts per sender |
| GET | `/api/messages/:userId` | Get conversation with a user, marks as seen |
| POST | `/api/messages` | Send a message `{ receiverId, text }` |

### Socket Events
| Event | Direction | Payload | Description |
|---|---|---|---|
| `user-connected` | Client → Server | `userId` | Register user as online |
| `send-message` | Client → Server | `{ senderId, receiverId, text }` | Send a message |
| `typing` | Client → Server | `{ senderId, receiverId, isTyping }` | Typing status |
| `receive-message` | Server → Client | message object | New message from another user |
| `message-sent` | Server → Client | message object | Confirmation to sender |
| `online-users` | Server → Client | `userId[]` | Updated online user list |
| `user-status` | Server → Client | `{ userId, status }` | User came online/went offline |

---

## Database Schemas

### User
```
username    String  required, unique
email       String  required, unique
password    String  required, min 6 chars (bcrypt hashed)
avatar      String  default: '/default-avatar.svg'
isOnline    Boolean default: false
createdAt   Date    auto
updatedAt   Date    auto
```

### Message
```
senderId    ObjectId  ref: User, required
receiverId  ObjectId  ref: User, required
text        String    required
seen        Boolean   default: false
createdAt   Date      auto
updatedAt   Date      auto
```

---

## Running the Project

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend
```bash
cd server
npm install
# create .env file (see below)
npm run dev       # runs on http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev       # runs on http://localhost:3000
```

### server/.env
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.i2cz6zs.mongodb.net/LiveChatApp?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_secret_key_here
PORT=5000
```

> **Note:** The database name is `LiveChatApp` (set in the URI path). Collections (`users`, `messages`) are created automatically by Mongoose on first write. If your password contains special characters (`@`, `:`, `/`, etc.), URL-encode them — e.g. `@` becomes `%40`. Ensure your current IP is allowlisted under Atlas → Network Access.

---

## Database

The app connects to **MongoDB Atlas** on startup via `connectDB()` in `server/server.js`, using the `MONGO_URI` from `server/.env`. All data is persisted in the **`LiveChatApp`** database:

| Collection | Holds |
|---|---|
| `users` | Accounts — username, email, bcrypt-hashed password, avatar, online status |
| `messages` | Chat messages — sender, receiver, text, seen flag, timestamps |

Mongoose creates these collections automatically from the `User` and `Message` models on the first insert. Passwords are never stored in plaintext — they are bcrypt-hashed inside each user document. There is no separate password collection; that is the standard, secure pattern.

> The earlier mock-data mode (`config/mockData.js`) has been removed now that the app runs against a live database. Register a new account to start; older mock accounts (Alice/Bob/etc.) no longer exist.

---

## Key Design Decisions

- **Persistence** is handled entirely by MongoDB Atlas (`LiveChatApp` db) — accounts, messages, and online status all survive server restarts.
- **Socket.IO** handles both message delivery and typing indicators — HTTP API is only used for fetching history and unread counts.
- **GSAP** animations are scoped with `gsap.context()` and cleaned up on unmount to prevent memory leaks.
- **Unread counts** are tracked both in the DB (`seen` field) and in React state for instant UI updates without refetching.
- **Typing debounce** (1.5s) prevents excessive socket emissions while the user is actively typing.
- The **Zinc Ember** design system uses amber/orange as the primary accent — intentionally different from the common blue/purple used in most chat apps.
