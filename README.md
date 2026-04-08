# Exam Roll System

A full-stack exam roll / vacancy application management platform built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend.

The application supports:

- student registration with auto-generated credentials
- login with email or mobile number
- forced password change on first login / after password reset
- multi-step profile completion with document uploads
- vacancy publishing and application workflow
- admin-side application review and status management
- automatic and manual symbol number assignment
- exam center allocation
- admit card generation and printing
- email notifications for registration, password reset, approval, and rejection

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Core Functionalities](#core-functionalities)
- [Ports and URLs](#ports-and-urls)
- [Environment Variables](#environment-variables)
- [Installation and Setup](#installation-and-setup)
- [Run Commands](#run-commands)
- [Seed Admin User](#seed-admin-user)
- [Frontend Routes](#frontend-routes)
- [Backend API Routes](#backend-api-routes)
- [Data Models](#data-models)
- [Important Business Logic](#important-business-logic)
- [Implementation Notes from Source Review](#implementation-notes-from-source-review)
- [Suggested Improvements](#suggested-improvements)

---

## Overview

This project is a role-based exam application and roll management system.

### Student-side flow

1. A student registers with basic identity information.
2. The backend generates a **Master ID** and a **random password**.
3. Credentials are sent to the student by email.
4. The student logs in using **email or mobile number + password**.
5. On first login, the student is redirected to change their password.
6. The student completes a multi-step profile:
   - personal details
   - address details
   - quota / extra details
   - education details and documents
   - profile preview and final submission
7. After profile completion, the student can apply to published vacancies.
8. The student can track application status and, once available, view / print the admit card.

### Admin-side flow

1. Admin logs in from a separate admin login screen.
2. Admin can create, edit, and delete vacancies.
3. Admin can view all students and all applications.
4. Admin can approve or reject applications.
5. Admin can auto-assign symbol numbers.
6. Admin can assign exam centers by candidate range.
7. Admin can generate admit cards individually or in bulk.
8. Admin dashboard displays charts, counts, and application analytics.

---

## Tech Stack

### Frontend

- **React 19**
- **Vite 7**
- **React Router DOM 7**
- **Axios**
- **Tailwind CSS**
- **Recharts**
- **react-hot-toast**
- **lucide-react**

### Backend

- **Node.js**
- **Express 5**
- **MongoDB + Mongoose**
- **JWT authentication**
- **bcryptjs** for password hashing
- **multer** for file uploads
- **nodemailer** for email sending
- **express-validator**
- **cookie-parser** and **cors**

### Storage / Delivery

- MongoDB for application data
- Local disk storage for uploaded files (`backend/uploads`)
- Static file serving from `/uploads`

---

## Architecture

```text
Frontend (React/Vite)  --->  Backend API (Express)  --->  MongoDB
        |                         |
        |                         ├── JWT auth
        |                         ├── Multer uploads
        |                         ├── Nodemailer
        |                         └── Static files: /uploads
        |
        └── Calls API at http://localhost:5000/api by default
```

### Authentication design

- Student auth uses JWT bearer tokens.
- Admin auth uses separate JWT bearer tokens.
- Student token is stored in local storage as `token`.
- Student user data is stored in local storage as `user`.
- Admin token is stored in local storage as `adminToken`.
- Admin data is stored in local storage as `admin`.

---

## Project Structure

> `node_modules`, `.git`, and individual uploaded runtime files are omitted for readability.

```text
exam-roll-system/
├── README.md
├── backend/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── mailTestController.js
│   │   ├── userController.js
│   │   └── vacancyController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Application.js
│   │   ├── User.js
│   │   └── Vacancy.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── mailTestRoutes.js
│   │   ├── userRoutes.js
│   │   └── vacancyRoutes.js
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── uploads/
│   │   └── ... uploaded photos, signatures, citizenship files, education docs ...
│   └── utils/
│       └── emailService.js
└── frontend/
    ├── .env
    ├── .gitignore
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    ├── public/
    │   └── vite.svg
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── assets/
        │   └── react.svg
        ├── context/
        │   └── AuthContext.jsx
        ├── utils/
        │   ├── api.js
        │   └── nepalData.js
        └── components/
            ├── Admin/
            │   ├── AdminDashboard.jsx
            │   ├── AdminLogin.jsx
            │   ├── AdmitCardGenerator.jsx
            │   ├── ApplicationDetails.jsx
            │   ├── ApplicationManagement.jsx
            │   ├── StudentsView.jsx
            │   ├── SymbolAssignment.jsx
            │   └── VacancyManagement.jsx
            ├── Auth/
            │   ├── ChangePassword.jsx
            │   ├── ForgotPassword.jsx
            │   ├── Login.jsx
            │   └── Register.jsx
            ├── Common/
            │   ├── Layout.jsx
            │   ├── Navbar.jsx
            │   └── Sidebar.jsx
            └── Student/
                ├── Dashboard.jsx
                ├── MyApplication.jsx
                ├── Vacancy.jsx
                └── Profile/
                    ├── AddressDetails.jsx
                    ├── DocumentDetails.jsx
                    ├── ExtraDetails.jsx
                    ├── PersonalDetails.jsx
                    ├── Preview.jsx
                    └── Profile.jsx
```

---

## Core Functionalities

### Student Functionalities

### 1. Registration

- Register with:
  - first name
  - last name
  - date of birth
  - gender
  - email
  - mobile
  - citizenship number
  - national ID (NID)
- Duplicate validation exists for:
  - email
  - mobile
  - citizenship
  - NID
- Backend auto-generates:
  - `masterId`
  - random initial password
- Credentials are emailed to the student.

### 2. Login and Password Management

- Student can log in using **email or mobile number**.
- First login forces password change.
- Forgot password generates a new random password and emails it to the user.
- Password hashes are stored securely using `bcryptjs`.

### 3. Multi-step Profile Completion

The student profile is completed in five steps:

1. **Personal Details**
   - father name
   - mother name
   - grandfather name
   - citizenship issue place/date
   - photo upload
   - signature upload
   - citizenship front upload
   - citizenship back upload

2. **Address Details**
   - permanent address
   - temporary address
   - same-address toggle

3. **Extra Details**
   - quota
   - caste
   - religion
   - employment status

4. **Document / Education Details**
   - add education history
   - upload multiple education documents
   - assign document type per file

5. **Preview**
   - review all data
   - finalize profile completion

### 4. Vacancy Application

- Students can view active vacancies.
- Students can apply only after profile completion.
- Application requires quota selection.
- Existing duplicate applications are blocked.
- Re-apply is allowed for rejected applications when `canReapply` is enabled.
- Fee is calculated based on date window:
  - regular fee before `lastDate`
  - double fee after `lastDate`

### 5. My Applications

- View all submitted applications.
- Track status:
  - pending
  - approved
  - rejected
  - paid
- View fee amount, quota, symbol number, exam center.
- If rejected, view rejection reason.
- If admit card is generated, preview and print it.

### 6. Student Dashboard

- Total application count summary
- Pending / approved / rejected / paid stats
- Company-wise application chart
- Vacancy countdown tracker
- Recent application activity

---

### Admin Functionalities

### 1. Admin Authentication

- Separate admin login screen
- JWT-protected admin routes
- Admin registration API exists in backend

### 2. Vacancy Management

- Create vacancy
- Edit vacancy
- Delete vacancy (only when no applications exist)
- Fields include:
  - vacancy name
  - last date
  - double fee last date
  - regular fee
  - double fee
  - description
  - active status

### 3. Application Management

- View all applications
- Filter by vacancy
- Filter by status
- Open full application details
- Approve application
- Reject application with mandatory rejection reason
- Approval / rejection triggers email notifications

### 4. Student Management

- View all registered students
- Search by:
  - name
  - master ID
  - email
  - mobile
- See profile completion status

### 5. Symbol Assignment

- View approved applications only
- Auto-assign symbol numbers
- Manual symbol / center editing for individual applications
- Assign exam center by candidate range

### 6. Admit Card Generation

- Generate admit card for one candidate
- Generate admit cards in bulk for a selected vacancy
- Requires:
  - approved application
  - symbol number assigned
  - exam center assigned
- Stores exam date, exam time, and exam rules

### 7. Admin Dashboard Analytics

- Total applications
- Pending applications
- Approved applications
- Rejected applications
- Paid applications
- Gender distribution chart
- Application status overview
- Company-wise trend chart
- Vacancy countdown widgets
- Exam schedule summary
- Recent applications list

---

## Ports and URLs

| Service | Default | Notes |
|---|---:|---|
| Frontend dev server | `5173` | Vite default; also referenced by backend `CLIENT_URL` |
| Backend API server | `5000` | From backend `.env` / `server.js` |
| API base URL | `http://localhost:5000/api` | Used by frontend `VITE_API_URL` |
| Static uploads | `http://localhost:5000/uploads/...` | Uploaded files are publicly served |
| Health / root API | `http://localhost:5000/` | Returns API message |

---

## Environment Variables

Use your own values. Do **not** commit real secrets to source control.

### Backend: `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/exam_roll_system
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_app_password
EMAIL_FROM=Exam Roll System <no-reply@example.com>
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000
```

### Notes

- `VITE_API_URL` is the main API base used by the frontend.
- `VITE_API_BASE_URL` exists in the frontend env file, but the current API helper primarily uses `VITE_API_URL`.
- Email delivery depends on valid SMTP credentials.
- Backend CORS is configured to allow the `CLIENT_URL` origin.

---

## Installation and Setup

> The zip appears to include installed dependencies. A clean reinstall is recommended after extraction.

### 1. Extract the project

```bash
unzip exam-roll-system.zip -d exam-roll-system
cd exam-roll-system
```

### 2. Recommended clean install

```bash
rm -rf backend/node_modules frontend/node_modules frontend/dist
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 5. Configure environment files

Create / update:

```bash
backend/.env
frontend/.env
```

### 6. Start MongoDB

Make sure MongoDB is running and `MONGODB_URI` is valid.

---

## Run Commands

### Start backend in development mode

```bash
cd backend
npm run dev
```

### Start backend in normal mode

```bash
cd backend
npm start
```

### Start frontend in development mode

```bash
cd frontend
npm run dev
```

### Build frontend for production

```bash
cd frontend
npm run build
```

### Preview built frontend

```bash
cd frontend
npm run preview
```

### Access the app

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API base: `http://localhost:5000/api`

---

## Seed Admin User

The project contains a helper script to create a default admin.

### Command

```bash
cd backend
node scripts/createAdmin.js
```

### Default admin credentials created by the script

```text
Email: admin@examroll.com
Password: Admin@123
```

Change this password immediately after first use.

---

## Frontend Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Redirects to login |
| `/login` | Public | Student login |
| `/register` | Public | Student registration |
| `/forgot-password` | Public | Student password reset |
| `/admin/login` | Public | Admin login |
| `/change-password` | Student | Forced / manual password change |
| `/dashboard` | Student | Student dashboard |
| `/profile` | Student | Student multi-step profile |
| `/vacancy` | Student | Vacancy listing and apply flow |
| `/my-applications` | Student | Student application history and admit card access |
| `/admin/dashboard` | Admin | Admin dashboard with tabs for all admin modules |

### Admin dashboard internal tabs

- Dashboard
- Create Vacancy
- Applications
- All Students
- Symbol Assignment
- Admit Cards

---

## Backend API Routes

### Auth Routes

Base path: `/api/auth`

| Method | Route | Protected | Description |
|---|---|---|---|
| `POST` | `/register` | No | Student registration |
| `POST` | `/login` | No | Student login with email or mobile |
| `POST` | `/forgot-password` | No | Reset student password and email new credentials |
| `PUT` | `/change-password` | Yes (student) | Change student password |
| `POST` | `/admin/login` | No | Admin login |
| `POST` | `/admin/register` | No | Admin registration API |

### User Routes

Base path: `/api/user`

| Method | Route | Protected | Description |
|---|---|---|---|
| `GET` | `/profile` | Yes (student) | Get student profile |
| `PUT` | `/profile/personal` | Yes (student) | Update personal details and upload files |
| `PUT` | `/profile/address` | Yes (student) | Update address details |
| `PUT` | `/profile/extra` | Yes (student) | Update extra / quota details |
| `POST` | `/profile/education` | Yes (student) | Add education record with documents |
| `PUT` | `/profile/education/:educationId` | Yes (student) | Update education record |
| `DELETE` | `/profile/education/:educationId` | Yes (student) | Delete education record |
| `PUT` | `/profile/complete` | Yes (student) | Mark profile as completed |

### Vacancy Routes

Base path: `/api/vacancy`

| Method | Route | Protected | Description |
|---|---|---|---|
| `GET` | `/` | Yes (student) | Get active vacancies |
| `POST` | `/apply` | Yes (student) | Apply for a vacancy |
| `GET` | `/my-applications` | Yes (student) | Get logged-in student's applications |

### Admin Routes

Base path: `/api/admin`

| Method | Route | Protected | Description |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Yes (admin) | Dashboard summary counts |
| `GET` | `/users` | Yes (admin) | Get all students |
| `GET` | `/vacancy/status` | Yes (admin) | Get vacancy list / vacancy status data |
| `POST` | `/vacancy` | Yes (admin) | Create vacancy |
| `PUT` | `/vacancy/:id` | Yes (admin) | Update vacancy |
| `DELETE` | `/vacancy/:id` | Yes (admin) | Delete vacancy if unused |
| `GET` | `/applications` | Yes (admin) | Get all applications |
| `GET` | `/applications/approved` | Yes (admin) | Get approved applications |
| `PUT` | `/applications/status` | Yes (admin) | Approve / reject / update status |
| `POST` | `/applications/auto-assign-symbols` | Yes (admin) | Auto assign symbol numbers |
| `POST` | `/applications/assign-center` | Yes (admin) | Assign exam center by candidate range |
| `PUT` | `/applications/symbol` | Yes (admin) | Manually assign symbol number / exam center |
| `POST` | `/admit-card/generate` | Yes (admin) | Generate admit card for one application |
| `POST` | `/admit-card/generate-all` | Yes (admin) | Generate admit cards in bulk |

### Other / Internal Route File Present

There is also a route file:

- `backend/routes/mailTestRoutes.js`

However, it is **not currently mounted in `server.js`**, so it is not active unless added manually.

---

## Data Models

### `User`

Stores student identity, contact, address, quota, education, and uploaded document paths.

Key fields include:

- `masterId`
- `firstName`, `lastName`
- `dobAD`
- `gender`
- `email`, `mobile`
- `citizenship`, `nid`
- `password`
- `isFirstLogin`
- `photo`, `signature`, `citizenshipFront`, `citizenshipBack`
- `permanentAddress`
- `temporaryAddress`
- `sameAddress`
- `quota`, `caste`, `religion`, `employmentStatus`
- `education[]`
- `profileCompleted`

### `Admin`

Stores admin login credentials and role.

Key fields:

- `email`
- `password`
- `role`

### `Vacancy`

Stores vacancy metadata and fee windows.

Key fields:

- `vacancyName`
- `companySymbolPrefix`
- `lastDate`
- `doubleFeeLastDate`
- `regularFee`
- `doubleFee`
- `isActive`
- `description`

### `Application`

Represents a student's application for a vacancy.

Key fields:

- `user`
- `vacancy`
- `quota`
- `feePaid`
- `status`
- `rejectionReason`
- `canReapply`
- `symbolNumber`
- `examCenter`
- `admitCardGenerated`
- `admitCardData`
- `applicationDate`

---

## Important Business Logic

### Registration

- Student registration generates:
  - a 6-digit style master ID
  - a random 6-character password
- Credentials are emailed to the student.

### First login handling

- `isFirstLogin` is `true` initially.
- After successful password change, it becomes `false`.
- Forgot password resets it back to `true`.

### Profile completion gate

- Vacancy application is blocked until `profileCompleted` is `true`.

### File uploads

- Files are stored in `backend/uploads`.
- Multer saves files with timestamp-prefixed filenames.
- Backend upload size limit is **5 MB**.

### Vacancy fee logic

- Before `lastDate`: regular fee is used.
- After `lastDate`: double fee is used.

### Re-application flow

- If a previous application was rejected, the student can re-apply.
- Re-applying resets status to `pending` and clears rejection-related fields.

### Symbol number assignment

- Auto assignment runs for **approved** applications only.
- Applications are sorted alphabetically by candidate name.
- Symbol numbers are assigned sequentially.

### Exam center assignment

- Admin assigns the same exam center to a candidate range (`startIndex` to `endIndex`) for a vacancy.

### Admit card generation

Admit card generation requires:

- approved application
- symbol number assigned
- exam center assigned

Stored admit card data includes:

- exam date
- exam time
- rules / instructions

### Email notifications

The backend sends emails for:

- registration credentials
- forgot password / new password
- application approved
- application rejected

---

## Implementation Notes from Source Review

These points are based on the current source code behavior.

1. **The project zip appears to include installed dependencies.**
   A clean reinstall is recommended because bundled dependencies can carry permission issues or stale packages.

2. **`mailTestRoutes.js` exists but is not mounted.**
   The controller / route file is present, but the server does not register it.

3. **`companySymbolPrefix` exists in the `Vacancy` model but is not currently used by symbol assignment logic.**
   Current symbol assignment is based on vacancy order and alphabetical application sorting.

4. **Frontend expiry behavior is stricter than backend application logic.**
   The frontend blocks applying after the double-fee deadline, but the backend `applyVacancy` logic does not hard-stop expired submissions after `doubleFeeLastDate`. Add server-side validation if strict enforcement is required.

5. **`frontend/src/utils/nepalData.js` does not currently look Nepal-specific.**
   The labels and values resemble UK-style regions / divisions. Review this file before production use.

6. **`VITE_API_BASE_URL` is present but not central to the current API helper.**
   The main API helper uses `VITE_API_URL`.

7. **The repository currently contains `.env` files and uploaded personal documents.**
   Before sharing or deploying publicly:
   - rotate credentials
   - remove personal data
   - remove test uploads
   - replace real secrets with environment placeholders

8. **Admin route protection on the frontend is page-driven.**
   The `/admin/dashboard` screen checks admin auth state itself instead of using the same student protected-route pattern.

9. **Dashboard “paid applications” count is derived from `feePaid > 0`.**
   It is not strictly tied to `status === 'paid'`.

---

## Suggested Improvements

- Add backend validation to reject applications after `doubleFeeLastDate`.
- Add `.env.example` files for safer onboarding.
- Remove committed uploads and sensitive environment values from the repository.
- Add role-based route guards for admin routes on the frontend.
- Normalize quota option values between frontend and backend.
- Use `companySymbolPrefix` in symbol generation if prefix-based numbering is required.
- Add unit / integration tests.
- Add Docker support for easier local setup.
- Add production-ready storage for uploads (for example S3 or equivalent) instead of local disk.
- Add logging and centralized error handling.

---

## Summary

This repository is a complete full-stack exam roll management system with:

- separate student and admin workflows
- profile and document management
- vacancy application processing
- approval / rejection workflow
- exam symbol and center assignment
- admit card generation
- email notification support
- analytics dashboards on both student and admin sides

It is a strong functional base for a recruitment, exam, or entrance-management platform and is already organized into clear frontend and backend modules.
