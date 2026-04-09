# RecruitScan Pro — Exam Roll System (UK / Scotland)

A full-stack exam roll and vacancy application management platform built for the **United Kingdom (Scotland)** civil service recruitment process. Built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend.

The application supports:

- Applicant registration with National Insurance Number (NI Number) as primary identity
- Sign in with Google (pre-fills registration details)
- Login with email or mobile number
- Forced password change on first login / after password reset
- Multi-step profile completion with document uploads (including UK identity documents)
- UK address system: Nation → Council Area → City/Town → Postcode → Street Address
- Equal opportunities monitoring (ethnic group, religion, employment status)
- Vacancy publishing and application workflow
- Admin-side application review and status management
- Automatic and manual symbol number assignment
- Exam centre allocation
- Admit card generation and printing
- Email notifications for registration, password reset, approval, and rejection

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
- [Google OAuth Setup](#google-oauth-setup)
- [Frontend Routes](#frontend-routes)
- [Backend API Routes](#backend-api-routes)
- [Data Models](#data-models)
- [Important Business Logic](#important-business-logic)

---

## Overview

This project is a role-based exam application and roll management system designed for UK (Scotland) civil service recruitment.

### Applicant-side flow

1. An applicant registers with basic identity information including their **National Insurance (NI) Number**.
2. Optionally, they can use **Sign in with Google** to pre-fill their name and email.
3. The backend generates a **Master ID** and a **random password**.
4. Credentials are sent to the applicant by email.
5. The applicant logs in using **email or mobile number + password**, or signs in via Google.
6. On first login, the applicant is redirected to change their password.
7. The applicant completes a multi-step profile:
   - personal details (with UK identity document upload)
   - UK address details (Nation, Council Area, City/Town, Postcode, Street)
   - equal opportunities information
   - education details and documents
   - profile preview and final submission
8. After profile completion, the applicant can apply to published vacancies.
9. The applicant can track application status and, once available, view / print the admit card.

### Admin-side flow

1. Admin logs in from a separate admin login screen.
2. Admin can create, edit, and delete vacancies.
3. Admin can view all applicants and all applications.
4. Admin can approve or reject applications.
5. Admin can auto-assign symbol numbers.
6. Admin can assign exam centres by candidate range.
7. Admin can generate admit cards individually or in bulk.
8. Admin dashboard displays charts, counts, and application analytics.

---

## Tech Stack

### Frontend

- **React 19**
- **Vite 7**
- **React Router DOM 7**
- **Axios**
- **Tailwind CSS** (GOV.UK-inspired styling)
- **@react-oauth/google** for Google Sign-In
- **jwt-decode** for decoding Google credentials
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
- **google-auth-library** for Google OAuth verification
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
        |                         ├── Google OAuth (google-auth-library)
        |                         ├── Multer uploads
        |                         ├── Nodemailer
        |                         └── Static files: /uploads
        |
        └── Calls API at http://localhost:5000/api by default
```

### Authentication design

- Applicant auth uses JWT bearer tokens.
- Admin auth uses separate JWT bearer tokens.
- Applicant token is stored in local storage as `token`.
- Applicant user data is stored in local storage as `user`.
- Admin token is stored in local storage as `adminToken`.
- Admin data is stored in local storage as `admin`.
- Google OAuth verifies the Google credential on the backend using `google-auth-library`.

---

## Project Structure

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
│   │   ├── userRoutes.js
│   │   └── vacancyRoutes.js
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── uploads/
│   └── utils/
│       └── emailService.js
└── frontend/
    ├── .env
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── utils/
        │   ├── api.js
        │   └── ukData.js
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

### Applicant Functionalities

### 1. Registration

- Register with:
  - first name
  - last name
  - date of birth
  - gender
  - email address
  - UK mobile number (07XXXXXXXXX)
  - National Insurance Number (format: AB123456C)
- Optional: use **Sign in with Google** to pre-fill name and email
- Duplicate validation for: email, mobile, NI Number
- Backend auto-generates:
  - `masterId`
  - random initial password
- Credentials are emailed to the applicant

### 2. Login and Password Management

- Sign in using **email or mobile number + password**
- Sign in with **Google** (account must already exist in the system)
- First login forces password change
- Forgot password generates a new random password and emails it to the applicant
- Password hashes are stored securely using `bcryptjs`

### 3. Multi-step Profile Completion

The applicant profile is completed in five steps:

1. **Personal Details**
   - father / parent name
   - mother / parent name
   - spouse / partner name
   - photo upload (passport-size)
   - signature upload
   - UK identity document front upload (passport, driving licence)
   - UK identity document back upload

2. **Address Details** (UK format)
   - Nation (England, Scotland, Wales, Northern Ireland)
   - Council Area / Region
   - City / Town
   - Postcode (e.g. EH1 1AJ)
   - Street Address

3. **Equal Opportunities Details**
   - Application category (open, women, disabled, regional diversity)
   - Ethnic group (UK census categories)
   - Religion or belief
   - Employment status

4. **Document / Education Details**
   - Add education history
   - Upload multiple education documents
   - Assign document type per file

5. **Preview**
   - Review all data
   - Finalise profile completion

### 4. Vacancy Application

- Applicants can view active vacancies
- Applicants can apply only after profile completion
- Application requires category selection
- Existing duplicate applications are blocked
- Re-apply is allowed for rejected applications when `canReapply` is enabled
- Fee is calculated based on date window

### 5. My Applications

- View all submitted applications
- Track status: pending, approved, rejected, paid
- View fee amount, category, symbol number, exam centre
- If rejected, view rejection reason
- If admit card is generated, preview and print it

---

## Ports and URLs

| Service | Default | Notes |
|---|---:|---|
| Frontend dev server | `5173` | Vite default |
| Backend API server | `5000` | From backend `.env` / `server.js` |
| API base URL | `http://localhost:5000/api` | Used by frontend `VITE_API_URL` |
| Static uploads | `http://localhost:5000/uploads/...` | Uploaded files are publicly served |

---

## Environment Variables

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
EMAIL_FROM=RecruitScan Pro <no-reply@example.com>
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## Installation and Setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 3. Configure environment files

Create / update:

```bash
backend/.env
frontend/.env
```

### 4. Start MongoDB

Make sure MongoDB is running and `MONGODB_URI` is valid.

---

## Run Commands

### Start backend in development mode

```bash
cd backend
npm run dev
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

---

## Seed Admin User

```bash
cd backend
node scripts/createAdmin.js
```

Default admin credentials:

```text
Email: admin@examroll.com
Password: Admin@123
```

Change this password immediately after first use.

---

## Google OAuth Setup

To enable Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Set the application type to **Web application**
6. Add `http://localhost:5173` to **Authorised JavaScript origins**
7. Add `http://localhost:5173` to **Authorised redirect URIs**
8. Copy the **Client ID**
9. Add it to both `.env` files:
   - `backend/.env`: `GOOGLE_CLIENT_ID=your_client_id`
   - `frontend/.env`: `VITE_GOOGLE_CLIENT_ID=your_client_id`

> **Note:** Google Sign-In on the **registration page** pre-fills the applicant's name and email from their Google account. The applicant must still provide their NI Number, mobile number, date of birth, and gender to complete registration.
>
> Google Sign-In on the **login page** signs in an existing account whose email matches the Google account email.

---

## Frontend Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Redirects to login |
| `/login` | Public | Applicant login (email/password or Google) |
| `/register` | Public | Applicant registration (with Google pre-fill) |
| `/forgot-password` | Public | Applicant password reset |
| `/admin/login` | Public | Admin login |
| `/change-password` | Applicant | Forced / manual password change |
| `/dashboard` | Applicant | Applicant dashboard |
| `/profile` | Applicant | Applicant multi-step profile |
| `/vacancy` | Applicant | Vacancy listing and apply flow |
| `/my-applications` | Applicant | Application history and admit card access |
| `/admin/dashboard` | Admin | Admin dashboard with all admin modules |

---

## Backend API Routes

### Auth Routes

Base path: `/api/auth`

| Method | Route | Protected | Description |
|---|---|---|---|
| `POST` | `/register` | No | Applicant registration |
| `POST` | `/login` | No | Applicant login with email or mobile |
| `POST` | `/google-login` | No | Applicant login with Google credential |
| `POST` | `/forgot-password` | No | Reset password and email new credentials |
| `PUT` | `/change-password` | Yes | Change password |
| `POST` | `/admin/login` | No | Admin login |
| `POST` | `/admin/register` | No | Admin registration |

### User Routes

Base path: `/api/user`

| Method | Route | Protected | Description |
|---|---|---|---|
| `GET` | `/profile` | Yes | Get applicant profile |
| `PUT` | `/profile/personal` | Yes | Update personal details and upload files |
| `PUT` | `/profile/address` | Yes | Update UK address details |
| `PUT` | `/profile/extra` | Yes | Update equal opportunities details |
| `POST` | `/profile/education` | Yes | Add education record with documents |
| `PUT` | `/profile/education/:educationId` | Yes | Update education record |
| `DELETE` | `/profile/education/:educationId` | Yes | Delete education record |
| `PUT` | `/profile/complete` | Yes | Mark profile as completed |

### Vacancy Routes

Base path: `/api/vacancy`

| Method | Route | Protected | Description |
|---|---|---|---|
| `GET` | `/` | Yes | Get active vacancies |
| `POST` | `/apply` | Yes | Apply for a vacancy |
| `GET` | `/my-applications` | Yes | Get logged-in applicant's applications |

### Admin Routes

Base path: `/api/admin`

| Method | Route | Protected | Description |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Yes (admin) | Dashboard summary counts |
| `GET` | `/users` | Yes (admin) | Get all applicants |
| `POST` | `/vacancy` | Yes (admin) | Create vacancy |
| `PUT` | `/vacancy/:id` | Yes (admin) | Update vacancy |
| `DELETE` | `/vacancy/:id` | Yes (admin) | Delete vacancy if unused |
| `GET` | `/applications` | Yes (admin) | Get all applications |
| `GET` | `/applications/approved` | Yes (admin) | Get approved applications |
| `PUT` | `/applications/status` | Yes (admin) | Approve / reject / update status |
| `POST` | `/applications/auto-assign-symbols` | Yes (admin) | Auto assign symbol numbers |
| `POST` | `/applications/assign-center` | Yes (admin) | Assign exam centre by candidate range |
| `PUT` | `/applications/symbol` | Yes (admin) | Manually assign symbol number / exam centre |
| `POST` | `/admit-card/generate` | Yes (admin) | Generate admit card for one application |
| `POST` | `/admit-card/generate-all` | Yes (admin) | Generate admit cards in bulk |

---

## Data Models

### `User`

Key fields:

- `masterId`
- `firstName`, `lastName`
- `dobAD` — date of birth
- `gender`
- `email`, `mobile`
- `niNumber` — National Insurance Number (unique, required)
- `password`
- `isFirstLogin`
- `photo`, `signature`
- `idDocumentFront`, `idDocumentBack` — UK identity document (passport, driving licence, etc.)
- `permanentAddress` — `{ province (Nation), district (Council Area), localBody (City/Town), wardNo (Postcode), tole (Street) }`
- `temporaryAddress`
- `sameAddress`
- `quota` — application category
- `caste` — ethnic group (UK census categories)
- `religion` — religion or belief
- `employmentStatus`
- `education[]`
- `profileCompleted`

### `Admin`

Key fields: `email`, `password`, `role`

### `Vacancy`

Key fields: `vacancyName`, `lastDate`, `doubleFeeLastDate`, `regularFee`, `doubleFee`, `isActive`, `description`

### `Application`

Key fields: `user`, `vacancy`, `quota`, `feePaid`, `status`, `symbolNumber`, `examCenter`, `admitCardGenerated`, `admitCardData`

---

## Important Business Logic

### Registration

- NI Number replaces the previous Nepal-specific citizenship and NID fields.
- NI Number format: `AB123456C` (two letters + six digits + one letter A–D).
- Auto-generated masterId and password are emailed on registration.

### Google Sign-In

- Registration: Google pre-fills name and email only. NI Number, mobile, DOB, and gender must still be entered.
- Login: Google credential is verified by the backend using `google-auth-library`. The email must already exist in the system.

### UK Address System

- Nation → Council Area / Region → City/Town → Postcode → Street Address.
- Data covers all four nations: England, Scotland, Wales, Northern Ireland.
- Scotland includes all 32 council areas.

### Profile completion gate

- Vacancy application is blocked until `profileCompleted` is `true`.

### File uploads

- Files are stored in `backend/uploads`.
- Multer saves files with timestamp-prefixed filenames.
- Maximum upload size: **5 MB** per file.

### Vacancy fee logic

- Before `lastDate`: regular fee is charged.
- After `lastDate`: double fee is charged.

### Symbol number assignment

- Auto assignment runs for **approved** applications only.
- Sorted alphabetically by candidate full name.
- Symbol numbers assigned sequentially.

### Email notifications

Emails are sent for:
- Registration credentials
- Password reset
- Application approved
- Application rejected

---

## Summary

This is a complete full-stack civil service exam roll management system adapted for the **United Kingdom (Scotland)**, featuring:

- UK-specific identity: National Insurance Number
- Google Sign-In on registration and login
- UK address structure (Nation → Council Area → City/Town → Postcode → Street)
- GOV.UK-inspired interface styling
- UK equal opportunities monitoring (ethnic group, religion)
- Separate applicant and admin workflows
- Profile and identity document management
- Vacancy application processing
- Approval / rejection workflow
- Exam symbol and centre assignment
- Admit card generation
- Email notification support
- Analytics dashboards on both applicant and admin sides
