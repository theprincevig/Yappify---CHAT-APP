# 🎉 Yappify - CHAT APP

Yappify is a friends-only chat app built to keep conversations **fun**, **simple**, and **personal**.  
Whether you want to chat, react, or customize your profile, Yappify puts you in control of your social experience.

---

## 🚀 Core Features

- **Friend Requests:**  
  Send, accept, reject, or remove friend requests. Only accepted friends can chat!

- **Private Chat:**  
  Enjoy secure, one-on-one conversations with your friends.

- **Message Actions:**  
  React, forward, reply, or delete messages for a dynamic chat experience.

- **Profile Customization:**  
  View other profiles and fully personalize your own.

---

## 🌟 Unique Feature: Choose Your Notification Style

On your very first signup, Yappify lets you pick your notification mode:

- **Fun Mode:**  
  Notifications are always ON—never miss a moment!  
  _(This setting cannot be changed later.)_

- **Control Mode:**  
  You decide when to enable or disable notifications.

Your experience starts the way **YOU** want it.  
This special choice makes Yappify stand out from the crowd!

---

## 🛠️ Tech Stack

## 🛠️ Tech Stack

- **Frontend:**  
  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)  
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)  
  ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)  
  ![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)  
  ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

- **Backend:**  
  ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)  
  ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)  
  ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)  
  ![Mongoose](https://img.shields.io/badge/Mongoose-%23880000.svg?style=for-the-badge&logo=mongoose&logoColor=white)  
  ![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?style=for-the-badge&logo=passport&logoColor=white)

- **Real-time:**  
  ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

- **Notifications:**  
  ![Web Push API](https://img.shields.io/badge/Web%20Push%20API-FF7139?style=for-the-badge&logo=pushbullet&logoColor=white)


---

## 📦 Project Structure

```
Client/
  ├── public/
  │   └── logo/           # App logos for light & dark themes
  ├── src/
  │   ├── Components/     # UI components (Chat, Sidebar, Navbar, etc.)
  │   ├── Pages/          # Main pages (Home, Login, Signup, Settings, etc.)
  │   ├── store/          # Zustand stores for state management
  │   └── utils/          # Utility functions
Server/
  ├── models/             # Mongoose models
  ├── routes/             # Express routes
  ├── controller/         # Route controllers
  ├── middleware/         # Custom middleware
  └── utils/              # Server-side utilities
```

---

## 📲 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/theprincevig/Yappify---CHAT-APP.git
   ```

2. **Install dependencies:**
   ```bash
   cd Yappify - CHAT APP/Client
   npm install
   cd ../Server
   npm install
   ```

3. **Set up environment variables:**  
   Copy `.env.example` to `.env` in both `Client` and `Server` folders and fill in your config.

4. **Run the app:**
   - **Server:**  
     ```bash
     npm start
     ```
   - **Client:**  
     ```bash
     npm run dev
     ```

---

## 💡 Contributing

Pull requests and suggestions are welcome!  
Feel free to open issues for bugs or feature requests.

---

## 📜 License

MIT

---

> **Yappify** — Where friendship meets fun, and you’re always in control!
