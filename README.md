# CampusConnect 🎓

**AI-Powered College Community and Networking Platform**

CampusConnect is a full-stack web application designed to provide a centralized platform for college students to connect, communicate, and share academic resources. Think of it as a LinkedIn — but built specifically for college students, with mentorship, resource sharing, real-time chat, club management, and AI-powered interview preparation.

---

## 🚀 Live Demo

https://campusconnect-iota-seven.vercel.app

.

---

## 🧩 Features

- 🔐 **User Authentication** — Secure registration and login using JWT and bcrypt
- 👤 **Student Profiles** — Create and manage your academic profile with skills and links
- 📚 **Resource Hub** — Upload and access notes, question papers, and reference links filtered by branch, subject, and year
- 🧑‍🤝‍🧑 **Student Directory** — Browse seniors and students, send connection requests, and build your network
- 💬 **Real-Time Chat** — Instant messaging between connected users using Socket.io
- 📢 **Clubs & Announcements** — College clubs can post events and announcements
- 🤖 **AI Mock Interview** — Practice interviews with AI-generated questions and feedback (Gemini API)
- 🧠 **AI Assistant** — Get academic and career guidance powered by Gemini AI
- ☁️ **Cloud Storage** — File uploads handled via Cloudinary

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | User interface |
| React Router | Client-side navigation |
| Tailwind CSS | Styling and responsive design |
| Axios | API communication |
| Socket.io Client | Real-time messaging |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Backend framework |
| Socket.io | Real-time communication |
| JWT | Authentication and security |
| bcrypt | Password encryption |
| Multer | File upload handling |

### Database & Cloud
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Mongoose | Database modeling |
| Cloudinary | Cloud file and image storage |
| Gemini AI API | AI assistant and mock interviews |

---

## 📁 Project Structure

```
campus_connect/
│
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary + Multer setup
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protection
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Resource.js         # Resource model
│   │   └── Club.js             # Club and Announcement models
│   ├── routes/
│   │   ├── auth.js             # Register/Login routes
│   │   ├── users.js            # Profile and connection routes
│   │   ├── resources.js        # Resource upload/fetch/delete
│   │   └── clubs.js            # Club and announcement routes
│   ├── server.js               # Express server entry point
│   └── .env                    # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Profile.js
│   │   │   ├── EditProfile.js
│   │   │   ├── ResourceHub.js
│   │   │   ├── UploadResource.js
│   │   │   ├── StudentDirectory.js
│   │   │   ├── Chat.js
│   │   │   ├── Clubs.js
│   │   │   ├── ClubDetails.js
│   │   │   ├── Announcements.js
│   │   │   ├── AIMockInterview.js
│   │   │   └── AIAssistant.js
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── api/
│   │   │   └── axiosInstance.js  # Auto attaches JWT token
│   │   ├── App.js                # React Router setup
│   │   └── index.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Getting Started (Run Locally)

### Prerequisites
- Node.js installed
- MongoDB Atlas account
- Cloudinary account
- Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/sakshi21pawar/campus-connect.git
cd campus-connect
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:

```bash
node server.js
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000` and backend on `http://localhost:5000`.

---

## 🔗 API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/users/profile` | Get my profile |
| PUT | `/api/users/profile` | Update my profile |
| POST | `/api/resources` | Upload a resource |
| GET | `/api/resources` | Fetch all resources (with filters) |
| DELETE | `/api/resources/:id` | Delete own resource |
| POST | `/api/users/connect/:id` | Send connection request |
| PUT | `/api/users/accept/:id` | Accept connection request |

---

## 📸 Screenshots




---

## 👩‍💻 Developer

**Sakshi Pawar**
- GitHub: [@sakshi21pawar](https://github.com/sakshi21pawar)
- LinkedIn: [Sakshi Pawar](https://www.linkedin.com/in/sakshi-pawar)

---

