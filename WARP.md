# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Core commands

This is a Vite + React frontend with a Node/Express backend (single `package.json` at the repo root).

All commands below assume the working directory is the repo root.

- **Frontend dev server**: `npm run dev`
  - Vite dev server, defaults to `http://localhost:5173`.
- **Backend API server**: `npm run server`
  - Starts Express API from `backend/server.js` (defaults to `http://localhost:5000`).
- **Frontend + backend together (recommended during development)**: `npm run dev:full`
  - Uses `concurrently` to run both `npm run server` and `npm run dev`.
- **Seed sample data explicitly**: `npm run seed`
  - Runs `backend/seed.js` to populate the in‑memory database with richer sample campaigns, donations, volunteers, and users.
- **Build frontend for production**: `npm run build`
  - Outputs static assets to `dist/` using Vite.
- **Preview built frontend**: `npm run preview`
  - Serves `dist/` via Vite’s preview server.
- **Lint frontend code**: `npm run lint`
  - Runs ESLint on JS/JSX files.
- **Start backend only (alt entry)**: `npm start`
  - Alias for `node backend/server.js`.

> **Note on tests:** There are currently no test scripts defined in `package.json` and no test framework configured.

## Environment & configuration

- **API base URL** is defined in `src/config.js`:
  - `API_URL` = `import.meta.env.VITE_API_URL || 'http://localhost:5000'`.
  - For local dev with the default backend port, you typically do **not** need to set `VITE_API_URL`.
- **Backend configuration** (`backend/server.js` / `backend/.env`):
  - Uses `dotenv` with `require('dotenv').config({ path: path.join(__dirname, '.env') });`.
  - Expects at least `JWT_SECRET` (and optionally `PORT`).
  - Despite the README mentioning MongoDB, the current implementation uses an **in‑memory data store** (see below) and does not require a running Mongo instance.

## High-level architecture

### Overview

- **Frontend** (`src/`)
  - React 18 SPA bootstrapped with Vite.
  - Tailwind CSS for styling, configured via `tailwind.config.js` and `postcss.config.js`.
  - Routing handled by `react-router-dom` with a set of public and protected routes.
  - Global state for authentication and campaign data provided via React Context.
- **Backend** (`backend/`)
  - Express.js server (`backend/server.js`) exposing a REST API under `/api/...`.
  - Authentication via JWT (`jsonwebtoken`) with password hashing using `bcryptjs`.
  - Data persistence through an **in‑memory database service** (`backend/database.js`) that mimics typical CRUD operations for users, campaigns, donations, volunteers, equipment, and volunteer applications.
  - Seeding/initialization logic in both `backend/server.js` (on startup) and `backend/seed.js` (explicit seeding script).

### Frontend architecture

**Entry & composition**

- `src/main.jsx`
  - Renders `<App />` inside `React.StrictMode` and imports global styles (`index.css`).
- `src/App.jsx`
  - Wraps the app in:
    - `<Router>` from `react-router-dom`.
    - `<AuthProvider>` and `<CampaignProvider>` context providers.
  - Defines the top-level layout:
    - `<Navbar />` and `<Footer />` from `src/components/layout/`.
    - `<main>` hosts route content via `<Routes>`.

**Routing & pages**

- Routes are defined in `App.jsx` using `Routes`/`Route`:
  - Public pages: `/`, `/login`, `/register`, `/forgot-password`, `/campaigns`, `/campaigns/:id`, `/poverty-map`, `/about`, `/contact`.
  - Protected pages (wrapped with `ProtectedRoute`): `/create-campaign`, `/admin`, `/platform-admin`, `/volunteer-application/*`, `/dashboard`, `/profile`.
- `ProtectedRoute` uses `useAuth()` to:
  - Show a full-screen loading spinner while auth state is loading.
  - Redirect unauthenticated users to `/login`.

**Global state via Context**

- `src/contexts/AuthContext.jsx`
  - Provides `AuthContext` and the `useAuth()` hook.
  - Manages `user`, `token`, and `loading` state.
  - On mount, reads `token` and `user` from `localStorage` to restore sessions.
  - Exposes async methods:
    - `login(email, password)` → POST `${API_URL}/api/auth/login`.
    - `register(name, email, password, userType)` → POST `${API_URL}/api/auth/register`.
    - `logout()` → clears auth state and localStorage.
  - `isAuthenticated` is derived from the presence of `user`.
  - When backend is unreachable, `login`/`register` return a descriptive error indicating that the backend must be running on port 5000.

- `src/contexts/CampaignContext.jsx`
  - Provides `CampaignContext` and the `useCampaigns()` hook.
  - Holds `campaigns` and `loading`.
  - Defines a baked-in set of **default demo campaigns** for offline/first-load UX.
  - `fetchCampaigns()`:
    - GET `${API_URL}/api/campaigns`.
    - On success, merges backend campaigns with `defaultCampaigns`.
    - On failure, falls back to `defaultCampaigns` only.
  - `getCampaignById(id)`:
    - Returns a default campaign if `id` matches one of the demo entries.
    - Otherwise fetches `/api/campaigns/:id` from the backend.
  - Mutating operations (require a valid JWT token from `AuthContext`):
    - `createCampaign(campaignData)` → POST `/api/campaigns` (Authorization: Bearer token), then refreshes via `fetchCampaigns()` on success.
    - `updateCampaign(id, updates)` → PUT `/api/campaigns/:id` (Authorization: Bearer token), then refreshes via `fetchCampaigns()` on success.

**Components & pages (high level)**

- Layout (`src/components/layout/`):
  - `Navbar.jsx`, `Footer.jsx` implement the shared chrome around all pages.
- Core pages (`src/pages/`):
  - Auth & profile: `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `Profile.jsx`.
  - Campaign browsing & details: `Home.jsx`, `Campaigns.jsx`, `CampaignDetail.jsx`, `CreateCampaign.jsx`.
  - Dashboards/admin: `Dashboard.jsx`, `AdminPanel.jsx`, `PlatformAdminPanel.jsx`.
  - Other experiences: `PovertyMap.jsx` (map-based visualization, uses Leaflet), `About.jsx`, `Contact.jsx`.
  - Volunteer experiences live both in top-level pages and `src/pages/volunteer/` (e.g. `VolunteerDashboard.jsx`, `AssignedTasks.jsx`, `RewardsLeaderboard.jsx`, `TaskDetail.jsx`, `VerificationHistory.jsx`, `VolunteerProfile.jsx`), plus shared volunteer UI in `src/components/volunteer/` (e.g. `VolunteerSidebar`, `VolunteerTopNavbar`, `Card`).

### Backend architecture

**Server entry**

- `backend/server.js`
  - Loads environment variables from `backend/.env`.
  - Imports the in‑memory `db` service from `backend/database.js`.
  - Configures Express app:
    - `cors` with `origin: true` and `credentials: true` for dev.
    - `express.json()` for JSON bodies.
  - Defines a reusable `authenticateToken` middleware:
    - Reads `Authorization: Bearer <token>` header.
    - Verifies JWT with `process.env.JWT_SECRET`.
    - Attaches decoded `user` to `req.user`.

**Auth routes**

- `POST /api/auth/register`
  - Checks for existing user via `db.getUserByEmail(email)`.
  - Hashes password with `bcrypt.hash`.
  - Creates a new user in the in‑memory DB.
  - Returns a JWT token and basic user profile.
- `POST /api/auth/login`
  - Looks up user by email.
  - Validates password using `bcrypt.compare`.
  - Issues a JWT containing `userId`, `email`, and `userType`.
- `POST /api/auth/forgot-password`
  - Verifies that the email exists.
  - Generates a 6-digit reset code and expiry, stored via `db.updateUser`.
- `POST /api/auth/reset-password`
  - Validates `email` + `resetCode` + non-expired `resetCodeExpiry`.
  - Hashes new password and clears reset fields.
- `POST /api/auth/google`
  - Simulated Google OAuth flow.
  - Either creates or reuses a user and returns a JWT.

**Domain routes & responsibilities**

All data access is delegated to `backend/database.js`, which acts as a repository layer.

- **Campaigns**
  - `GET /api/campaigns` → `db.getCampaigns()`.
  - `GET /api/campaigns/:id` → `db.getCampaignById(id)`.
  - `POST /api/campaigns` (auth required) → `db.addCampaign(req.body)`.
  - `PUT /api/campaigns/:id` (auth required) → `db.updateCampaign(id, req.body)`.

- **Donations**
  - `GET /api/donations` (optional `?campaignId=`) → `db.getDonations(campaignId)`.
  - `GET /api/donations/transaction/:transactionId` → `db.getDonationByTransactionId`.
  - `POST /api/donations` → `db.addDonation(req.body)`.

- **Volunteers**
  - `GET /api/volunteers` (optional `?campaignId=`) → `db.getVolunteers(campaignId)`.
  - `POST /api/volunteers` → `db.addVolunteer(req.body)`.

- **Equipment**
  - `GET /api/equipment` (optional `?campaignId=`) → `db.getEquipment(campaignId)`.
  - `POST /api/equipment` (auth required) → `db.addEquipment(req.body)`.
  - `PUT /api/equipment/:id` (auth required) → `db.updateEquipment(id, req.body)`.
  - `DELETE /api/equipment/:id` (auth required) → `db.deleteEquipment(id)`.

- **Users**
  - `GET /api/users/:id` (auth required) → `db.getUserById(id)`.
  - `PUT /api/users/:id` (auth required) → `db.updateUser(id, req.body)`.

- **Volunteer applications**
  - `POST /api/volunteer-applications` (auth required)
    - Attaches `userId` from `req.user.userId` to the payload.
    - Persists via `db.addVolunteerApplication`.
  - `GET /api/volunteer-applications` (auth required; filters via `status`, `userId`, `campaignId`)
    - Delegates to `db.getVolunteerApplications(filters)`.
  - `PUT /api/volunteer-applications/:id` (auth required)
    - Delegates to `db.updateVolunteerApplication(id, req.body)`.

- **Health check**
  - `GET /api/health` returns `{ success: true, message: 'Server is running' }`.

**Database service (in‑memory)**

- Implemented in `backend/database.js` as a class `InMemoryDatabaseService`, exported as a singleton.
- Maintains `Map` instances for `users`, `campaigns`, `donations`, `volunteers`, `volunteerApplications`, and `equipment`.
- Uses simple numeric ID counters (stored as strings) and adds a pseudo‑`_id` field with `toString()` to resemble typical MongoDB documents.
- Each domain has CRUD-style helpers, for example:
  - Campaigns: `addCampaign`, `getCampaigns`, `getCampaignById`, `updateCampaign`.
  - Donations: `addDonation`, `getDonations`, `getDonationByTransactionId`.
  - Volunteers: `addVolunteer`, `getVolunteers`.
  - Volunteer applications: `addVolunteerApplication`, `getVolunteerApplications`, `updateVolunteerApplication`.
  - Equipment: `addEquipment`, `getEquipment`, `updateEquipment`, `deleteEquipment`.
  - Users: `addUser`, `getUserById`, `getUserByEmail`, `updateUser`.

**Seeding & initialization**

- On server start (`backend/server.js`):
  - Connects to the in‑memory DB and calls `initializeDatabase()`.
  - If there are no campaigns yet, it seeds a small fixed set of campaigns, donations, and volunteers.
- Explicit seeding script (`backend/seed.js`):
  - Can be run via `npm run seed`.
  - Connects to the same in‑memory DB and seeds a more detailed set of campaigns, donations, volunteers, and users, then disconnects.

## Important notes from README

- The project branding and high-level description in `README.md` refer to the app as a **Social Impact Platform** connecting NGOs, donors, and volunteers with transparency and impact tracking.
- The README’s technology stack mentions MongoDB; however, the **current codebase uses `backend/database.js` as an in‑memory data store** instead of MongoDB.
- Available npm scripts and their meanings match the "Core commands" section above.
- There are three main user types: **NGO**, **Donor**, and **Volunteer**, plus a `platform_admin` type used in backend/user records and some admin pages.
