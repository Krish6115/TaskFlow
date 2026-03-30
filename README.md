<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.84.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
</p>

<h1 align="center">📋 TaskFlow</h1>

<p align="center">
  <strong>A cross-platform task management app built with React Native & Express.js</strong>
</p>

<p align="center">
  <em>Stay productive with smart sorting, priority-based reminders, and a stunning dark UI.</em>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## ✨ Features

### 📱 Mobile App
- **User Authentication** — Secure registration & login with JWT-based sessions
- **Full Task Management** — Create, read, update, and delete tasks with real-time cloud sync
- **Smart Sort Algorithm** — Weighted composite scoring using priority, deadline urgency, and recency
- **Advanced Filtering** — Filter by priority (🔴 Urgent / 🟠 High / 🟡 Medium / 🟢 Low), category, and completion status
- **Task Categories** — Organize tasks into General, Work, Personal, Health, Shopping, and Study
- **Priority-Based Recurring Reminders** — Automatic notifications that repeat based on task priority:
  | Priority | Reminder Interval |
  |----------|-------------------|
  | 🚨 Urgent | Every 60 min |
  | 🔴 High | Every 90 min |
  | 🟡 Medium | Every 120 min |
  | 🟢 Low | Every 180 min |
- **Pull-to-Refresh** — Swipe down to sync latest data from the cloud
- **Swipe-to-Delete** — Intuitive gesture-based task deletion
- **Progress Tracking** — Visual progress bar showing completed vs total tasks
- **Optimistic UI Updates** — Instant feedback with background sync & automatic rollback on error
- **Motivational Quotes** — Context-aware quotes delivered with reminders based on task category

### 🎨 Design
- **Dark Gradient Theme** — Premium deep-space aesthetic with `#0A0E21` → `#1A1F3D` gradients
- **Glassmorphism Cards** — Frosted glass-style task cards with subtle borders
- **Animated FAB** — Spring-animated floating action button with gradient fill
- **Color-Coded Priorities** — Instant visual cues with priority-specific colors
- **Smooth Transitions** — Polished modal animations and screen transitions

### 🔧 Backend
- **RESTful API** — Clean, documented Express.js endpoints
- **JWT Authentication** — Secure token-based auth with bcrypt password hashing (12 salt rounds)
- **MongoDB Atlas** — Cloud-hosted NoSQL database with Mongoose ODM
- **Smart Sort (Server-side)** — Weighted scoring algorithm: `score = priority×3 + urgency×2 + recency×1`
- **Input Validation** — Comprehensive field validation with descriptive error messages
- **Health Check Endpoint** — `/api/health` for uptime monitoring

---

## 🛠 Tech Stack

### Frontend (Mobile)
| Technology | Purpose |
|---|---|
| **React Native 0.84** | Cross-platform mobile framework |
| **TypeScript** | Type safety and developer experience |
| **React Navigation** | Stack-based navigation |
| **Axios** | HTTP client for API communication |
| **Notifee** | Local push notifications & scheduling |
| **AsyncStorage** | Persistent local storage for auth tokens |
| **Linear Gradient** | Beautiful gradient backgrounds |
| **Vector Icons** | Material Community Icons |
| **Gesture Handler** | Swipe gestures for task actions |
| **DateTimePicker** | Native date & time selectors |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type-safe backend development |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

---

## 🏗 Architecture

```
TaskFlow/
├── backend/                    # Express.js REST API
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── Task.ts         # Task schema (title, deadline, priority, category)
│   │   │   └── User.ts         # User schema with password hashing
│   │   ├── routes/
│   │   │   ├── auth.ts         # Register & Login endpoints
│   │   │   └── tasks.ts        # Task CRUD with smart sort algorithm
│   │   └── server.ts           # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                     # React Native App
│   ├── src/
│   │   ├── api/                # Axios API client modules
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Button.tsx      # Gradient action button
│   │   │   ├── CategoryTag.tsx # Category label badge
│   │   │   ├── InputField.tsx  # Styled text input with icons
│   │   │   ├── PriorityBadge.tsx # Color-coded priority indicator
│   │   │   └── TaskCard.tsx    # Glass-style task card with gestures
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Global auth state management
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx # Stack navigator (Auth ↔ App)
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── TaskListScreen.tsx  # Main dashboard
│   │   │   └── AddTaskScreen.tsx   # Task creation form
│   │   ├── services/
│   │   │   └── notificationService.ts # Recurring reminder engine
│   │   ├── theme/
│   │   │   └── index.ts        # Design tokens & color system
│   │   └── types/              # TypeScript type definitions
│   ├── App.tsx                 # App entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 22.11.0
- **npm** or **yarn**
- **Android Studio** (for Android emulator/build)
- **MongoDB Atlas** account (or local MongoDB instance)
- **JDK 17+** (for React Native Android builds)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Krish6115/TaskFlow.git
cd TaskFlow
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskflow
JWT_SECRET=your_super_secret_jwt_key
```

Start the development server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3️⃣ Mobile App Setup

```bash
cd mobile
npm install
```

Configure the API base URL in `src/api/` to point to your backend:
- **Emulator**: `http://10.0.2.2:5000/api` (Android emulator)
- **Physical device**: `http://<your-local-ip>:5000/api`
- **Production**: Your deployed API URL (e.g., Render.com)

Start Metro bundler and run on Android:

```bash
npm start
# In a new terminal:
npm run android
```

### 4️⃣ Build Release APK

```bash
cd mobile/android
./gradlew assembleRelease
```

The APK will be generated at `mobile/android/app/build/outputs/apk/release/`.

---

## 📡 API Reference

All task endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Create a new account | `{ name, email, password }` |
| `POST` | `/api/auth/login` | Login & receive JWT token | `{ email, password }` |

### Tasks (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List all tasks (with sort & filter) |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### Query Parameters (GET /api/tasks)

| Parameter | Values | Description |
|-----------|--------|-------------|
| `sortBy` | `mixed` · `priority` · `deadline` · `dateTime` | Sort algorithm (default: `mixed`) |
| `filterPriority` | `urgent` · `high` · `medium` · `low` | Filter by priority level |
| `filterCategory` | `General` · `Work` · `Personal` · `Health` · `Shopping` · `Study` | Filter by category |
| `filterCompleted` | `true` · `false` | Filter by completion status |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Returns `{ status: "OK", timestamp }` |

---

## 🎯 Smart Sort Algorithm

The **Mixed Sort** mode uses a weighted scoring system to intelligently rank tasks:

```
score = (priorityWeight × 3) + (deadlineUrgency × 2) + (recency × 1)
```

| Factor | Weight | Score Range | Logic |
|--------|--------|-------------|-------|
| **Priority** | ×3 | 1–4 | urgent=4, high=3, medium=2, low=1 |
| **Deadline Urgency** | ×2 | 0–4 | Higher for tasks due sooner (normalized to 42h window) |
| **Recency** | ×1 | 0–1 | Newer tasks score slightly higher |

> Completed tasks are always pushed to the bottom, regardless of score.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — New features
- `fix:` — Bug fixes
- `docs:` — Documentation changes
- `style:` — Code style / formatting
- `refactor:` — Code refactoring
- `test:` — Adding tests
- `chore:` — Maintenance tasks

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Siva Rama Krishna Reddy Padala (SRKREDDY)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/siva-rama-krishna-reddy-padala/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Krish6115)

---

<p align="center">
  Built with ❤️ using React Native & Express.js
</p>
