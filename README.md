# 🚀 JobPilot – AI Resume Analysis & Optimization Platform

> Analyze your resume against any job description, receive AI-powered feedback, optimize your resume, and improve your chances of landing interviews.

![License](https://img.shields.io/badge/License-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-Database-orange)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![AI](https://img.shields.io/badge/AI-Vercel%20AI%20SDK-purple)

## 🌐 Live Demo

**🔗 https://jobpilot.dilshad.online**

---

## 📖 Overview

JobPilot is a production-ready AI-powered web application that helps job seekers improve their resumes by comparing them against job descriptions.

Instead of only checking ATS compatibility, JobPilot provides personalized AI feedback, identifies missing skills, recommends improvements, and guides users through optimizing their resume for specific roles.

The project was built to explore modern AI-powered user experiences while applying production-level frontend architecture, authentication workflows, database management, and scalable application design.

---

# ✨ Features

### 🤖 AI Resume Analysis

* Upload resume
* Paste job description
* AI-powered resume evaluation
* ATS improvement suggestions
* Missing skills detection
* Resume scoring
* Section-by-section feedback

---

### ✍️ Resume Optimization

* AI-generated resume improvements
* Rewrite bullet points
* Improve professional summary
* Keyword optimization
* Better formatting suggestions

---

### 📂 Resume Management

* Upload multiple resumes
* Save analysis history
* Resume editing
* Download optimized resume
* Track previous analyses

---

### 🔐 Authentication

* Secure authentication
* Guest mode
* Guest-to-user account migration
* Persistent user data

---

### ⚡ User Experience

* Streaming AI responses
* Responsive UI
* Dark mode
* Loading skeletons
* Error handling
* Accessible components
* Mobile friendly

---

# 🏗️ Tech Stack

## Frontend

* React
* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS

## State Management

* React Query
* React Hook Form
* Zod

## Database

* MySQL
* Prisma ORM

## Authentication

* Better Auth

## AI

* Vercel AI SDK
* Streaming Responses

## Deployment

* Vercel

---

# 📸 Screenshots

> Replace these placeholders with actual screenshots.

## Landing Page

![Landing Page](./screenshots/landing.png)

---

## Resume Upload

![Upload](./screenshots/upload.png)

---

## AI Analysis

![Analysis](./screenshots/analysis.png)

---

## Resume Optimization

![Optimization](./screenshots/optimization.png)

---

## Dashboard

![Dashboard](./screenshots/dashboard.png)

---

# 🎥 Demo

Add a short walkthrough video here.

Suggested flow:

1. Upload Resume
2. Paste Job Description
3. AI Analysis
4. Resume Optimization
5. Resume Editor
6. Download Resume

---

# 🏛️ Application Architecture

```text
                User
                  │
                  ▼
          Next.js Application
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
 Authentication          Resume Upload
      │                       │
      ▼                       ▼
 Better Auth           Resume Parser
      │                       │
      └──────────────┬────────┘
                     ▼
              AI Analysis Engine
                     │
                     ▼
          Streaming AI Response
                     │
                     ▼
               Save Analysis
                     │
                     ▼
             MySQL + Prisma
```

---

# 💡 Technical Highlights

* Built with Next.js App Router
* Production-ready folder architecture
* AI streaming using Vercel AI SDK
* Type-safe forms with React Hook Form + Zod
* Database management with Prisma ORM
* Authentication with Better Auth
* Optimistic UI patterns
* Reusable component architecture
* Responsive and accessible UI
* Performance optimization using lazy loading and memoization

---

# 🚀 Performance

✔ Responsive Design

✔ Lazy Loading

✔ Memoization

✔ Optimized Rendering

✔ Efficient Data Fetching

✔ Type-safe API Integration

✔ Lighthouse Optimizations

---

# 🧠 Challenges Solved

During development I tackled several real-world engineering challenges including:

* AI streaming responses
* Resume parsing workflow
* Guest-to-user migration
* Authentication flow
* Persistent resume history
* Optimistic UI updates
* Efficient database design
* Reusable component architecture

---

# 🔮 Roadmap

* Resume Templates
* Multiple AI Models
* Interview Question Generator
* Cover Letter Generator
* Resume Versioning
* Recruiter Dashboard
* Team Workspaces
* Analytics Dashboard

---

# 🛠️ Running Locally

```bash
git clone https://github.com/md-dilshad/jobpilot.git

cd jobpilot

npm install

cp .env.example .env

npm run dev
```

---

# 📄 Environment Variables

```env
DATABASE_URL=

AUTH_SECRET=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

OPENAI_API_KEY=
```

---

# 🤝 Contributing

Contributions, feature requests, and suggestions are welcome.

Feel free to open an issue or submit a pull request.

---

# 👨‍💻 Author

**Md Dilshad**

Frontend Developer

Portfolio: https://dilshad.online

LinkedIn: https://linkedin.com/in/frontend-dev-shad

GitHub: https://github.com/Shad-dil

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It helps others discover the project and motivates future development.
