# 💬 BaatCheet

<div align="center">

![BaatCheet Banner](https://img.shields.io/badge/BaatCheet-Real--Time%20Chat-8b5cf6?style=for-the-badge&logo=chat&logoColor=white)

**A modern, feature-packed real-time messaging web application built with React, Node.js, Express, MongoDB, and Socket.io.**

[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

[Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Environment Variables](#-environment-variables) • [Project Structure](#-project-structure) • [API Overview](#-api-endpoints)

</div>

---

## ✨ Key Features

### 🚀 Real-Time Communication
- **Instant Messaging**: Low-latency bi-directional messaging powered by **Socket.io**.
- **Presence System**: Real-time online/offline status indicators for all contacts.
- **Message Delivery Receipts**:
  - Single tick `✓` for Sent
  - Double grey tick `✓✓` for Delivered
  - Double blue tick `✓✓` for Read

### 💬 Rich Message Interactions
- **Emoji Reactions**: React with 5 quick reactions (👍, ❤️, 😂, 😮, 😢) with instant optimistic UI updates and toggle-off support.
- **Message Editing**: Edit sent messages within a 5-minute window with visible "(edited)" indicator.
- **Message Deletion**:
  - *Delete for me* (removes from personal conversation history)
  - *Delete for everyone* (replaces text with "🚫 This message was deleted")
- **Multi-Select & Batch Actions**: Select multiple messages with checkboxes to delete in bulk.
- **Clipboard Copy**: Quick one-click copy message text to clipboard.
- **Inline Timestamps**: WhatsApp-style inline timestamps aligned neatly in the right corner.
- **Calendar Day Grouping**: Messages automatically grouped with sticky date dividers (*Today*, *Yesterday*, or formatted calendar date).

### 📎 Media & File Sharing
- **Images & Videos**: High-resolution upload and streaming via Cloudinary.
- **Document Attachments**: Send PDFs, Word docs, spreadsheets, archives (.zip/.rar), and code files with custom icons and file sizes.
- **Media Preview Modal**: In-app lightbox viewer with zoom controls, rotation, download, and external link buttons.

### 🎨 Modern UI & Aesthetics
- **BaatCheet Theme**: Signature dark purple aesthetic (`#8b5cf6`, `#121214`) with glassmorphism and subtle glows.
- **Magic UI Effects**: Ambient particles, meteors, ripple waves, and animated shimmer buttons.
- **Audio Feedback**: Built-in zero-dependency Web Audio API synthesized notification sounds with a mute/unmute toggle.
- **Responsive Design**: Optimized layouts for mobile devices, tablets, and desktop viewports.

### 🔐 Security & Auth
- **Google OAuth 2.0**: Single sign-on authentication via Passport.js.
- **Session-Based Security**: Persistent encrypted sessions stored in MongoDB (`connect-mongo`) with `httpOnly`, `sameSite`, and `secure` cookie policies.
- **Account Management**: Ability to manage profile details or permanently delete account.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + CSS Variables
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Real-Time Client**: [Socket.io Client](https://socket.io/docs/v4/client-api/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **WebSockets**: [Socket.io](https://socket.io/)
- **Authentication**: [Passport.js](http://www.passportjs.org/) + Google OAuth 2.0 Strategy
- **Session Storage**: [express-session](https://github.com/expressjs/session) + [connect-mongo](https://github.com/jdesboeufs/connect-mongo)
- **File Storage**: [Cloudinary](https://cloudinary.com/)
- **Security & Shielding**: [@arcjet/node](https://arcjet.com/)

---

## 📁 Project Structure

```text
baatcheet/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       # Auth check, logout, delete account
│   │   │   └── message.controller.js    # Send, react, edit, delete, fetch messages
│   │   ├── lib/
│   │   │   ├── arcjet.js                # Bot detection and rate limiting
│   │   │   ├── cloudinary.js            # Cloudinary media storage client
│   │   │   ├── db.js                    # MongoDB connection
│   │   │   ├── passport.js              # Google OAuth passport strategy
│   │   │   └── socket.js                # Socket.io server and online user map
│   │   ├── middleware/
│   │   │   ├── arcjet.middleware.js     # Arcjet request inspection
│   │   │   └── auth.middleware.js       # Session authentication guard
│   │   ├── models/
│   │   │   ├── message.model.js         # Message schema (reactions, status, deletedFor)
│   │   │   └── user.model.js            # User profile schema
│   │   ├── routes/
│   │   │   ├── auth.route.js            # /api/auth routes
│   │   │   └── message.route.js         # /api/messages routes
│   │   └── server.js                    # Server initialization
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── magicui/                 # Animated particles, meteors, ripple, shiny text
│   │   │   ├── ChatArea.jsx             # Main conversation viewport & message bubble list
│   │   │   ├── ChatsSidebar.jsx         # Chat list, search, filters & unread badges
│   │   │   ├── EmptyChatState.jsx       # Fallback splash screen when no chat is selected
│   │   │   ├── HelpModal.jsx            # App info & keyboard shortcuts dialog
│   │   │   ├── MediaPreviewModal.jsx    # Fullscreen image, video & document previewer
│   │   │   ├── NewChatModal.jsx         # Contact discovery modal
│   │   │   ├── profileHeader.jsx        # User profile settings & account options
│   │   │   └── SidebarNav.jsx           # Leftmost navigation rail (Chats, Contacts, etc.)
│   │   ├── lib/
│   │   │   ├── axios.js                 # Axios instance with credentials
│   │   │   ├── downloadHelper.js        # File download & MIME type helper
│   │   │   └── utils.js                 # Classnames merge utility
│   │   ├── pages/
│   │   │   ├── Home.jsx                 # Primary chat layout
│   │   │   └── Login.jsx                # Authentication page
│   │   ├── store/
│   │   │   ├── authStore.js             # Auth Zustand state
│   │   │   └── chatStore.js             # Messages, chats, contacts & socket listeners
│   │   ├── App.jsx                      # App root with routing & toast provider
│   │   └── style.css                    # Custom styles & keyframe animations
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Create a `.env` file inside the `backend` directory:

```env
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/baatcheet?retryWrites=true&w=majority
SESSION_SECRET=your_super_secret_session_key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Optional: Arcjet Shielding
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
```

### Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)
- A [MongoDB](https://www.mongodb.com/) database instance (local or Atlas)
- A [Cloudinary](https://cloudinary.com/) account for attachments
- Google Cloud Console OAuth 2.0 Credentials

### 1. Clone the repository
```bash
git clone https://github.com/UMESH-SATPATHI/BaatCheet.git
cd BaatCheet
```

### 2. Backend Setup
```bash
cd backend
npm install
# Ensure .env is populated with your credentials
npm run dev
```
The backend server will start on `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The client app will launch on `http://localhost:5173`.

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/google` | Trigger Google OAuth login |
| `GET` | `/api/auth/google/callback` | OAuth redirect callback |
| `GET` | `/api/auth/check` | Check current session & return authenticated user |
| `POST` | `/api/auth/logout` | End session & log out |
| `DELETE` | `/api/auth/delete` | Permanently delete user account and personal data |

### Messages & Conversations (`/api/messages`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/messages/contacts` | Get list of all registered contacts |
| `GET` | `/api/messages/chats` | Get active chat conversations with previews & unread counts |
| `GET` | `/api/messages/:id` | Get all messages between logged-in user and target user |
| `POST` | `/api/messages/send/:id` | Send message (text, image, video, document) |
| `PUT` | `/api/messages/:id/react` | Add, switch, or remove emoji reaction |
| `PUT` | `/api/messages/:id/edit` | Edit message content (within 5-minute limit) |
| `PUT` | `/api/messages/read/:id` | Mark incoming unread messages as read |
| `DELETE`| `/api/messages/:id/me` | Delete message for current user only |
| `DELETE`| `/api/messages/:id/everyone` | Delete message for everyone |
| `POST` | `/api/messages/batch-delete` | Batch delete selected messages |

---

## ⚡ Real-Time Socket Events

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `getOnlineUsers` | Server → Client | `userIds[]` | Broadcast online user status updates |
| `newMessage` | Server → Client | `messageObject` | Receive incoming message |
| `messageReaction` | Server → Client | `{ messageId, reactions }` | Real-time emoji reaction updates |
| `messageEdited` | Server → Client | `{ messageId, text, editedAt }` | In-place edited message updates |
| `messageDeleted` | Server → Client | `{ messageId, isDeletedForEveryone }`| Real-time message deletion sync |
| `messagesRead` | Server → Client | `{ readerId, messageIds[] }` | Real-time double blue tick receipts |
| `messagesDelivered`| Server → Client | `{ messageIds[] }` | Real-time double grey tick receipts |

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/UMESH-SATPATHI">Umesh Satpathi</a></sub>
</div>
