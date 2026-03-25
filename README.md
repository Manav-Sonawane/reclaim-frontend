<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-Chat-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_OAuth-Auth-4285F4?style=for-the-badge&logo=google&logoColor=white" />

  <h1>Reclaim Frontend</h1>
  <p>Main showcase app for a lost-and-found platform with claims, chat, map-based search, and admin tooling.</p>
</div>

---

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Framework</strong><br />Next.js App Router</td>
      <td align="center"><strong>UI</strong><br />Tailwind CSS + custom components</td>
      <td align="center"><strong>Auth</strong><br />JWT + Google OAuth</td>
      <td align="center"><strong>Maps</strong><br />Leaflet</td>
    </tr>
  </table>
</div>

## Overview

**Reclaim Frontend** is the primary product experience for the project. It gives users a clean interface to report lost or found items, search through community posts, submit claims, coordinate returns through chat, and manage everything from a personal dashboard.

## Features

- **Unified Home Feed:** Browse all lost and found listings from a single landing page.
- **Search and Filters:** Search by keyword, category, type, city, state, country, or map bounds.
- **Item Reporting:** Create lost or found posts with images, descriptions, and precise location input.
- **Authentication:** Email/password auth plus Google sign-in support.
- **Claims Workflow:** Submit claims, manage pending requests, approve/reject claimants, and resolve returns.
- **Real-Time Chat:** Talk directly with matched users after claim approval.
- **Dashboard:** Track posted items, incoming claims, outgoing claims, and retrieval activity.
- **Admin Panel:** Authorized admins can inspect platform stats, users, and items.
- **AI Search:** Includes an assistant-driven search flow backed by the backend AI endpoint.

## Main Routes

- `/` home feed with search, autocomplete, and filters
- `/post` create a lost/found report
- `/items/[id]` item detail view
- `/items/[id]/claim` claim or retrieval request page
- `/dashboard` user dashboard for items and claims
- `/chat` real-time chat screen
- `/settings` user settings
- `/auth/login` login
- `/auth/register` register and Google sign-in
- `/profile/[id]` profile page
- `/admin` admin dashboard

## Tech Stack

- Next.js `15.x`
- React `18.x`
- TypeScript `5.x`
- Tailwind CSS `4.x`
- Axios
- `@react-oauth/google`
- Socket.IO Client
- Leaflet + React Leaflet
- `react-hot-toast`

## Requirements

- Node.js 20+
- npm
- Running Reclaim backend API
- Google OAuth client ID

## Environment Setup

Create `reclaim-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

- `NEXT_PUBLIC_API_URL` is used for REST requests and for deriving the Socket.IO server host.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is required for Google sign-in and sign-up flows.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Other useful commands:

```bash
npm run build
npm run start
npm run lint
```

Default local app URL:

```text
http://localhost:3000
```

## Backend Dependency

The frontend depends on the backend for:

- authentication
- item CRUD and item search
- claims and retrieval workflows
- chat history and live messaging
- admin stats and moderation
- image uploads
- AI-assisted search

If the backend is unavailable or `NEXT_PUBLIC_API_URL` is incorrect, the UI will load but data-dependent flows will fail.

## Project Structure

```text
app/           Main App Router pages
components/    UI building blocks and domain components
context/       Auth state and shared client context
lib/           Axios API client
public/        Static assets
src/           Legacy/generated app files still present in repo
```

## User Flow

1. Users sign in or create an account.
2. They browse or search lost and found posts.
3. They open an item and submit a claim or retrieval request.
4. The item owner reviews the request from the dashboard.
5. Approved users can continue in chat.
6. The owner resolves the flow once the item is returned.

## Notes

- JWTs are attached from `localStorage` through the shared API client.
- Google OAuth should use the same client ID configured in the backend.
- The active product app is primarily built from `app/`, `components/`, `context/`, and `lib/`.
- Leaflet styles are loaded globally through the root layout.
