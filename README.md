# 🌌 Zenith-Cloud

**Zenith-Cloud** is a high-performance, self-hosted personal cloud storage server designed for extreme privacy, hardware-level control, and premium OLED aesthetics. Built by **Vadik Goel**, it allows you to transform any physical drive into a secure, distributed data node.

---

## 🚀 Key Infrastructure Features

- **OLED-Grade UI:** A premium, high-contrast "OLED Black" interface optimized for modern displays.
- **Hardware Tunneling:** Direct mapping to physical drives (C:\, D:\, /mnt/storage) with zero virtualization overhead.
- **Automated User Isolation:** Admins can set a `Storage Base Path`. New users automatically get an isolated hardware folder created for them, ensuring they can never access other nodes' data.
- **Secure Sharing Protocol:** 
  - Unique UUID-based links.
  - Optional password protection.
  - "Max Uses" (Self-destruct) and expiration dates.
  - Live access tracker (view count).
- **Zenith Media Engine:** Advanced video player with multi-control, precision seeking, and auto-hide UI for immersive viewing.
- **Armored Database:** SQLite with **WAL (Write-Ahead Logging)** mode and automated integrity checks to prevent data corruption.
- **Command Center:** Full-page admin dashboard for node management, storage limiting, and global registration control.
- **SMTP Relay:** Automated OTP verification for new registrations via secure mail relay.
- **Cross-Platform:** Native support for Windows, Linux, and macOS.

---

## 🛠️ System Requirements

- **Backend:** Python 3.9+
- **Frontend:** Node.js 18+ (npm or pnpm)
- **Browser:** Any modern browser (Chrome, Firefox, Edge, etc.)

---

## ⚡ Setup & Installation

### 1. Backend Synchronization
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install fastapi uvicorn sqlalchemy passlib[bcrypt] python-jose[cryptography] python-multipart
```

### 2. Frontend Initialization
```bash
cd frontend
npm install
```

### 3. Launching the Matrix
You can use the provided `run.py` script in the root directory to start both servers simultaneously:
```bash
python run.py
```
- **UI Gate:** `http://localhost:3000`
- **Data Gate:** `http://localhost:8000`

---

## 🛡️ Admin Authorization

To manage the network, login with the default Root credentials:
- **Identifier:** `cloudadmin`
- **Master Key:** `StrongAdminPass123!`

**CRITICAL:** Change the admin password immediately via the "Modify Identity" section in the profile.

---

## ⚙️ Configuration (Command Center)

Once logged in as admin, click **Console** to access the System Core:

1.  **Storage Base Path:** Set this to a folder on your largest drive (e.g., `D:\ZenithData`). All new users will be contained here.
2.  **Public Registration:** Toggle this **OFF** to lock your server once your trusted nodes are established.
3.  **SMTP Config:** Enter your Gmail address and **App Password** to enable email OTP codes.
4.  **Application Name:** Rebrand the entire platform instantly by changing this setting.

---

## 🏗️ Technical Architecture

- **Backend:** FastAPI (Python) - Handles asynchronous I/O and secure block streaming.
- **Frontend:** React 19 + TypeScript - Modular component architecture for high performance.
- **Styling:** Tailwind CSS - Utility-first OLED design language.
- **Icons:** Lucide-React - High-fidelity hardware iconography.
- **Database:** SQLAlchemy + SQLite (WAL Mode) - Efficient, corruption-resistant data storage.

---

## 👨‍💻 Node Architect

Developed with absolute precision by **Vadik Goel**.

- **GitHub:** [https://github.com/vadikgoel](https://github.com/vadikgoel)
- **Vision:** To provide individuals and small businesses with hardware-first privacy and absolute control over their digital blocks.

---

## 📧 SMTP Relay Integration (Gmail)

To enable automated node verification via OTP, you must configure a secure mail relay in the Command Center:

1.  **Generate App Password:**
    - Go to your [Google Account Security](https://myaccount.google.com/security).
    - Enable **2-Step Verification**.
    - Search for "App Passwords" at the top.
    - Create a new app called `Zenith-Cloud`.
2.  **Apply Config:**
    - **Host:** `smtp.gmail.com`
    - **Port:** `587`
    - **Sender Email:** Your Gmail address.
    - **App Password:** The 16-character code (no spaces).

---

## 🔒 Security Protocols

Zenith-Cloud is built with a "Zero-Trust" hardware philosophy:

- **Isolated Block Architecture:** Users are physically restricted to their own directory inside the `Storage Base Path`.
- **Database Protector:** Uses WAL (Write-Ahead Logging) to ensure that even during a sudden power loss, the database remains uncorrupted.
- **Master Key Hashing:** Passwords and node keys are never stored in plain text; they are hashed using industry-standard Bcrypt protocols.
- **JWT Authorization:** Every hardware request is signed with a high-entropy JSON Web Token (JWT) that expires automatically.

---

## 🤝 Contributing

The Zenith Infrastructure is an open hardware protocol. We welcome all architects, engineers, and security researchers who wish to help harden the core or add new block-management features.

1.  **Fork** the repository.
2.  Create a new **Feature Branch** (`git checkout -b feature/NewProtocol`).
3.  **Commit** your changes with architectural integrity.
4.  Open a **Pull Request** for review by the Node Architect.

---

## 📜 License

Internal Use / Hardware Node Protocol. 

*Watermark "Node Architect: Vadik Goel" is hardcoded into the platform core and must remain visible as per the architecture protocol.*
