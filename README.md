# Yappify - CHAT APP

Yappify is a friends-only chat app built to keep conversations **fun**, **simple**, and **personal**.  
Whether you want to chat, react, or customize your profile, Yappify puts you in control of your social experience.

---

## Core Features

- **Friend Requests Management:**  
  Send, accept, reject, or remove friend requests. Only accepted friends can chat!

- **Private One-on-One Messaging:**  
  Enjoy secure, encrypted conversations with your friends in real-time.

- **Rich Message Actions:**  
  React, forward, reply, or delete messages with an intuitive UI.

- **Profile Customization:**  
  View other profiles and fully personalize your own with custom avatars and bios.

- **Real-time Notifications:**  
  Stay updated instantly with Socket.io powered notifications.

- **Push Notifications:**  
  Never miss a message with Web Push API integration and service worker support.

---

## Unique Feature: Choose Your Notification Style

On your very first signup, Yappify lets you pick your notification mode:

- **Fun Mode:**  
  Notifications are **ALWAYS ON**—never miss a moment!  
  _(This setting cannot be changed later.)_

- **Control Mode:**  
  **You decide** when to enable or disable notifications with granular controls.

Your experience starts the way **YOU** want it.  
This special choice makes Yappify stand out from the crowd!

---

## Tech Stack

### Frontend
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)  
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)  
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)  
![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)  
![Zustand](https://img.shields.io/badge/zustand-%23000000.svg?style=for-the-badge&logo=zustand&logoColor=white)

### Backend
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)  
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)  
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)  
![Mongoose](https://img.shields.io/badge/Mongoose-%23880000.svg?style=for-the-badge&logo=mongoose&logoColor=white)

### Authentication & Security
![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?style=for-the-badge&logo=passport&logoColor=white)  
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

### Real-time & Notifications
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)  
![Web Push API](https://img.shields.io/badge/Web%20Push%20API-FF7139?style=for-the-badge&logo=pushbullet&logoColor=white)  
![Service Worker](https://img.shields.io/badge/Service%20Worker-4285F4?style=for-the-badge&logo=javascript&logoColor=white)

---

## Project Structure

```
Yappify - CHAT APP/
├── Client/                          # React Frontend
│   ├── public/
│   │   ├── logo/                    # App logos (light & dark themes)
│   │   └── sw.js                    # Service Worker for push notifications
│   ├── src/
│   │   ├── Components/              # Reusable UI components
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SidebarLoader.jsx
│   │   │   ├── ThemeChanger.jsx
│   │   │   ├── PasswordStrengthMeter.jsx
│   │   │   ├── UnreadCounts.jsx
│   │   │   ├── About/
│   │   │   ├── ChatBox/             # Chat interface components
│   │   │   ├── LoaderEffects/       # Loading skeleton components
│   │   │   ├── Messages/            # Message interaction components
│   │   │   └── PopupModals/         # Modal dialogs
│   │   ├── Pages/                   # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── AddFriendPage.jsx
│   │   │   ├── ProfilePage/         # Profile management
│   │   │   └── PasswordPage/        # Password management
│   │   ├── Config/                  # App configuration
│   │   │   ├── appInfo.js
│   │   │   └── settingsItems.js
│   │   ├── Constant/                # Constants & themes
│   │   │   └── themes.js
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── usePushNotifications.js
│   │   ├── lib/                     # External library configs
│   │   │   ├── axios.js             # API client
│   │   │   ├── socket.js            # Socket.io client
│   │   │   └── utils.js
│   │   ├── store/                   # Zustand state management
│   │   │   ├── useAuthStore.js
│   │   │   ├── useFriendStore.js
│   │   │   ├── useMessageStore.js
│   │   │   └── useThemeStore.js
│   │   ├── utils/                   # Client utilities
│   │   │   ├── apiPaths.js
│   │   │   ├── validators.js
│   │   │   ├── friendActionsMap.js
│   │   │   └── urlBase64ToUint8Array.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   └── package.json
│
├── Server/                          # Express Backend
│   ├── config/                      # Configuration files
│   │   ├── db.js                    # MongoDB connection
│   │   ├── session.Config.js        # Session management
│   │   ├── socket.Config.js         # Socket.io setup
│   │   ├── webPush.Config.js        # Web push configuration
│   │   └── cloud.Config.js          # Cloud storage config
│   ├── models/                      # Mongoose schemas
│   │   ├── user.js
│   │   ├── message.js
│   │   ├── friendRequest.js
│   │   └── chat.js
│   ├── controller/                  # Route controllers
│   │   ├── user.controller.js
│   │   ├── message.controller.js
│   │   ├── friend.controller.js
│   │   └── profile.controller.js
│   ├── routes/                      # API routes
│   │   ├── user.routes.js
│   │   ├── message.routes.js
│   │   ├── friend.routes.js
│   │   └── profile.routes.js
│   ├── middleware/                  # Custom middleware
│   │   ├── auth.middleware.js       # Authentication
│   │   ├── validator.middleware.js  # Input validation
│   │   ├── passport.middleware.js   # Passport config
│   │   └── profile.middleware.js    # Profile handling
│   ├── services/                    # Business logic services
│   │   └── pushNotification.service.js
│   ├── errors/                      # Error handling
│   │   └── AppError.js
│   ├── utils/                       # Server utilities
│   │   ├── asyncHandler.js
│   │   └── emitToUser.js
│   ├── script.js                    # Setup/seed scripts
│   ├── .env                         # Environment variables
│   └── package.json
│
├── .gitignore
├── README.md                        # This file
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/theprincevig/Yappify---CHAT-APP.git
   cd "Yappify - CHAT APP"
   ```

2. **Install Server dependencies:**
   ```bash
   cd Server
   npm install
   ```

3. **Install Client dependencies:**
   ```bash
   cd ../Client
   npm install
   ```

### Configuration

1. **Server Setup:**
   ```bash
   cd Server
   cp .env.example .env
   ```
   Update `.env` with:
   - MongoDB connection URI
   - JWT secret
   - Passport.js credentials
   - Web Push API keys
   - Cloud storage credentials

2. **Client Setup:**
   ```bash
   cd ../Client
   cp .env.example .env
   ```
   Update `.env` with:
   - Backend API URL
   - Socket.io server URL
   - Web Push public key

### Running the Application

**Terminal 1 - Start Backend:**
```bash
cd Server
npm start
```
Server runs on `http://localhost:5000` (or your configured port)

**Terminal 2 - Start Frontend:**
```bash
cd Client
npm run dev
```
Client runs on `http://localhost:5173`

---

## Key Features Explained

### Real-time Chat with Socket.io
- Instant message delivery
- Real-time typing indicators
- Online/offline status
- Message read receipts

### Message Reactions & Actions
- React to messages with emojis
- Forward messages to other friends
- Reply to specific messages
- Delete sent messages

### Push Notifications
- Web Push API integration
- Service Worker for background notifications
- Customizable notification preferences
- Fun Mode (always ON) vs Control Mode (user controlled)

### User Authentication
- Secure login/signup with Passport.js
- Password strength validation
- Session management
- Profile customization

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Bug Reports
- Open an issue with detailed description
- Include steps to reproduce
- Add screenshots if applicable

---

## License

MIT License - see LICENSE file for details

---

## Author

**Yappify** is built with ❤️ by [theprincevig](https://github.com/theprincevig)

---

> **Yappify** — Where friendship meets fun, and you're always in control!
