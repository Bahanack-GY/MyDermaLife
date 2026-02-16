# MyDermaLife — Patient User Interface

> A modern, bilingual (French / English) dermatology telemedicine platform built with **React 19**, **TypeScript**, **Vite**, and **TailwindCSS 4**. It offers patients AI-powered skin diagnosis, real-time video teleconsultations via WebRTC, an immersive 3D waiting room, a full e-commerce skincare shop, and comprehensive medical record management.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
  - [Authentication & Authorization](#1-authentication--authorization)
  - [Home Page & Landing](#2-home-page--landing)
  - [Doctor Search & Profile](#3-doctor-search--doctor-profile)
  - [Appointment Booking Wizard](#4-appointment-booking-wizard)
  - [Consultation Lifecycle](#5-consultation-lifecycle)
  - [3D Immersive Waiting Room](#6-3d-immersive-waiting-room)
  - [Video Teleconsultation (WebRTC)](#7-video-teleconsultation-webrtc)
  - [AI-Powered Skin Diagnosis](#8-ai-powered-skin-diagnosis)
  - [User Profile & Medical Records](#9-user-profile--medical-records)
  - [Prescriptions Management](#10-prescriptions-management)
  - [E-Commerce (Products & Checkout)](#11-e-commerce-products--checkout)
  - [Internationalization (i18n)](#12-internationalization-i18n)
  - [Page Transitions & Animations](#13-page-transitions--animations)
  - [Notifications & Toasts](#14-notifications--toasts)
  - [Chat FAB (Floating Action Button)](#15-chat-fab-floating-action-button)
  - [Protected Routes](#16-protected-routes)
- [API Layer Architecture](#api-layer-architecture)
- [Custom Hooks](#custom-hooks)
- [Utility Libraries](#utility-libraries)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Tech Stack

| Category             | Technology                                                            |
| -------------------- | --------------------------------------------------------------------- |
| **Framework**        | React 19 + TypeScript                                                 |
| **Build Tool**       | Vite 7                                                                |
| **Styling**          | TailwindCSS 4 (via `@tailwindcss/vite`)                               |
| **Routing**          | React Router DOM 7 (`HashRouter`)                                     |
| **State Management** | TanStack React Query 5 (server state caching, mutations, invalidation)|
| **HTTP Client**      | Axios (with interceptors for JWT refresh)                             |
| **Real-time**        | Socket.IO Client (WebRTC signaling)                                   |
| **WebRTC**           | Native `RTCPeerConnection` API                                        |
| **3D Engine**        | Three.js + React Three Fiber + Drei                                   |
| **Animations**       | Framer Motion                                                         |
| **i18n**             | i18next + react-i18next (FR / EN)                                     |
| **PDF Generation**   | jsPDF                                                                 |
| **Date Utilities**   | date-fns                                                              |
| **Icons**            | Lucide React                                                          |
| **Notifications**    | Sonner                                                                |
| **UI Utilities**     | Headless UI, clsx, tailwind-merge                                     |
| **SSL (Dev)**        | `@vitejs/plugin-basic-ssl`                                            |

---

## Project Structure

```
user-ui/
├── index.html                  # SPA entry point
├── vite.config.ts              # Vite config (React, TailwindCSS, SSL, port 8082)
├── package.json
├── tsconfig.json
├── .env / .env.example
├── public/
│   ├── logo.webp
│   └── vite.svg
└── src/
    ├── main.tsx                # ReactDOM entrypoint (StrictMode, QueryProvider, HashRouter)
    ├── App.tsx                 # Route definitions + AnimatePresence + ChatFAB + Toaster
    ├── index.css               # Global styles
    │
    ├── api/                    # Centralized API layer
    │   ├── config.ts           # API_BASE_URL, API_ENDPOINTS, QUERY_KEYS
    │   ├── client.ts           # Axios instance, tokenManager, request/response interceptors
    │   ├── queryClient.ts      # TanStack Query client instance
    │   ├── types.ts            # Shared TypeScript interfaces (User, Doctor, Consultation, etc.)
    │   └── features/           # Feature-scoped API modules
    │       ├── auth.ts         # login, register, logout, getProfile
    │       ├── consultations.ts# CRUD, book, accept, reject, joinWaitingRoom, finish
    │       ├── doctors.ts      # getAll, getById, getBookedSlots
    │       ├── prescriptions.ts# getMyPrescriptions
    │       └── users.ts        # updateProfilePhoto, updateMedicalRecord, skinLogs CRUD
    │
    ├── hooks/                  # Custom React hooks
    │   ├── useAuth.ts          # useLogin, useRegister, useLogout, useProfile, useSkinLogs, useAuth
    │   ├── useConsultations.ts # useConsultations, useConsultation, useCreateConsultation, useMyAppointments, useAcceptConsultation, useRejectConsultation
    │   ├── useDoctors.ts       # useDoctors, useDoctor, useBookedSlots
    │   ├── usePrescriptions.ts # usePrescriptions
    │   └── useWebRTC.ts        # Full WebRTC hook (peer connection, ICE, signaling, media controls, connection quality)
    │
    ├── i18n/                   # Internationalization
    │   ├── index.ts            # i18next init (default: French)
    │   └── locales/
    │       ├── fr.json         # French translations (~25 KB)
    │       └── en.json         # English translations (~22 KB)
    │
    ├── lib/                    # Utility functions
    │   ├── utils.ts            # `cn()` — clsx + tailwind-merge helper
    │   └── slots.ts            # `generateTimeSlots()` — availability/booking slot engine
    │
    ├── data/
    │   └── doctors.ts          # Static/fallback doctor data
    │
    ├── assets/
    │   ├── images/             # WebP hero, product, condition, and trust images
    │   ├── 3D/
    │   │   └── waitingRoom.glb # 3D GLTF model of the waiting room
    │   └── waitingSound.mp3    # Ambient audio for the waiting room
    │
    ├── components/             # Reusable UI components
    │   ├── Navbar.tsx           # Responsive navigation with auth state, language toggle, cart
    │   ├── Footer.tsx           # Site footer with links
    │   ├── Hero.tsx             # Animated hero section (homepage)
    │   ├── BenefitsSection.tsx  # Skin care benefits display
    │   ├── ConditionsSection.tsx # Treated dermatological conditions
    │   ├── FoundersSection.tsx  # Founders / team showcase
    │   ├── MedicalExpertsSection.tsx # Expert dermatologists showcase
    │   ├── ProductsSection.tsx  # Featured products carousel
    │   ├── TestimonialsSection.tsx   # Patient testimonials
    │   ├── TrustSection.tsx     # Trust indicators
    │   ├── BookingWizard.tsx     # Multi-step booking modal (doctor → date → slot → payment)
    │   ├── VideoCall.tsx        # Video call UI (local/remote streams, controls, quality indicator)
    │   ├── EndConsultationModal.tsx  # End-call confirmation dialog
    │   ├── AddPhotoModal.tsx    # Skin log photo upload modal
    │   ├── ChatFAB.tsx          # Floating chat action button
    │   ├── PageTransition.tsx   # Framer Motion wrapper for page enter/exit animations
    │   ├── ProtectedRoute.tsx   # Auth guard (redirects to /login)
    │   └── ThreeD/              # 3D waiting room components
    │       ├── WaitingRoomModel.tsx          # Three.js Canvas, GLTF model, first-person controls
    │       ├── WaitingRoomLoader.tsx         # Loading spinner/progress for 3D assets
    │       └── WaitingRoomInstructionsModal.tsx # Controls instructions overlay
    │
    └── pages/                  # Route-level page components (21 pages)
        ├── HomePage.tsx
        ├── LoginPage.tsx
        ├── DoctorSearchPage.tsx
        ├── DoctorProfilePage.tsx
        ├── BookingSuccessPage.tsx
        ├── PreConsultationForm.tsx
        ├── ConsultationsPage.tsx
        ├── ConsultationDetailPage.tsx
        ├── WaitingRoomPage.tsx
        ├── TeleconsultationPage.tsx
        ├── RateConsultationPage.tsx
        ├── UserProfilePage.tsx
        ├── AIDiagnosisPage.tsx
        ├── ProductsPage.tsx
        ├── ProductPage.tsx
        ├── CategoryPage.tsx
        ├── CollectionPage.tsx
        ├── CartPage.tsx
        ├── CheckoutPage.tsx
        ├── BenefitsPage.tsx
        └── PrescriptionVerificationPage.tsx
```

---

## Features

### 1. Authentication & Authorization

**Files:** `api/features/auth.ts`, `hooks/useAuth.ts`, `api/client.ts`, `pages/LoginPage.tsx`, `components/ProtectedRoute.tsx`

- **Login & Registration** — Dual-tab interface (`LoginPage.tsx`) allowing patients to either sign in or create a new account. Registration collects email, password, first/last name, phone, date of birth, and gender.
- **Role Validation** — The auth API explicitly prevents doctor accounts from logging into the patient interface, redirecting them to the doctor portal.
- **JWT Token Management** — Tokens (access + refresh) are stored in `localStorage` via a centralized `tokenManager` utility. The Axios `apiClient` automatically:
  - **Injects** the `Bearer` token in every outgoing request via a request interceptor.
  - **Refreshes** the token on `401 Unauthorized` responses via a response interceptor, then retries the original request transparently.
  - **Redirects** to `/login` if the refresh token is also expired/invalid.
- **Protected Routes** — The `ProtectedRoute` component wraps authenticated pages. It checks `tokenManager.isAuthenticated()` and redirects unauthenticated users to `/login`, preserving the intended destination via `state.from`.
- **Optimistic Profile Caching** — On login/register success, the user profile is immediately cached in TanStack Query for instant access across the app.
- **Password Visibility Toggle** — The login form includes an eye icon to show/hide password input.
- **Language Toggle on Login** — Users can switch between French and English directly from the login page.

---

### 2. Home Page & Landing

**Files:** `pages/HomePage.tsx`, `components/Hero.tsx`, `components/BenefitsSection.tsx`, `components/ConditionsSection.tsx`, `components/FoundersSection.tsx`, `components/MedicalExpertsSection.tsx`, `components/ProductsSection.tsx`, `components/TestimonialsSection.tsx`, `components/TrustSection.tsx`

- **Animated Hero Section** — Full-width hero with engaging copy, CTA buttons, and animated background elements using Framer Motion.
- **Skin Conditions** — Visual grid showcasing treatable dermatological conditions (acne, rosacea, melasma, aging) with images and descriptions.
- **Medical Experts** — Highlights real dermatologists available on the platform with photos, specializations, and ratings.
- **Featured Products** — Curated skincare product carousel with pricing and quick-add-to-cart functionality.
- **Patient Testimonials** — Social proof section with animated testimonial cards.
- **Trust Indicators** — Badges and statistics reinforcing platform credibility (certified doctors, number of consultations, etc.).
- **Benefits** — Dedicated section explaining the advantages of online dermatology consultations.
- **Founders** — Team/founders showcase with photos and bios.

---

### 3. Doctor Search & Doctor Profile

**Files:** `pages/DoctorSearchPage.tsx`, `pages/DoctorProfilePage.tsx`, `hooks/useDoctors.ts`, `api/features/doctors.ts`

- **Doctor Directory** — Searchable and filterable list of available dermatologists fetched from the backend API (`doctorsApi.getAll()`). Displays specialization, years of experience, ratings, fees, and spoken languages.
- **Doctor Profile Page** — Detailed view for a single doctor (`/doctors/:id`) showing:
  - Profile photo, bio, and education history.
  - Consultation fees (in-person and video).
  - Availability calendar with real-time slot generation.
  - Reviews and ratings.
  - Direct booking CTA opening the `BookingWizard`.
- **Booked Slots Filtering** — The `useBookedSlots` hook fetches already-booked time slots for a given doctor and date, ensuring they are excluded from the available slots displayed to the user.

---

### 4. Appointment Booking Wizard

**Files:** `components/BookingWizard.tsx`, `lib/slots.ts`, `hooks/useConsultations.ts`

- **Multi-Step Modal** — The `BookingWizard` is a portal-rendered overlay with a step indicator guiding the user through:
  1. **Select Doctor** — Choose from all available doctors (or use a preselected doctor from the profile page).
  2. **Select Date & Time** — Interactive date picker + dynamically generated time slots based on:
     - The doctor's availability configuration (recurring weekly or specific dates).
     - Automatic filtering of past time slots (if the selected date is today).
     - Real-time exclusion of already-booked slots via the `getBookedSlots` API.
  3. **Select Consultation Type** — Choose between video consultation or in-cabinet appointment.
  4. **Payment** — Payment information input with validation.
  5. **Confirmation** — Summary review before final booking.
- **Smart Slot Engine** (`lib/slots.ts`) — The `generateTimeSlots()` function:
  - Prioritizes **specific-date** availability entries over recurring ones.
  - Falls back to **recurring day-of-week** entries when no specific date is set.
  - Generates 30-minute interval slots between `startTime` and `endTime`.
  - Filters out past slots and already-booked slots.
  - Deduplicates overlapping availability ranges.
- **Booking API Integration** — Uses `useCreateConsultation` (TanStack mutation) to POST the booking and automatically invalidates the consultations cache on success.

---

### 5. Consultation Lifecycle

**Files:** `pages/ConsultationsPage.tsx`, `pages/ConsultationDetailPage.tsx`, `pages/BookingSuccessPage.tsx`, `pages/PreConsultationForm.tsx`, `pages/RateConsultationPage.tsx`, `hooks/useConsultations.ts`, `api/features/consultations.ts`

The full consultation lifecycle is supported:

| Status       | Description                                         |
| ------------ | --------------------------------------------------- |
| `proposed`   | Patient has requested a consultation                |
| `scheduled`  | Doctor has accepted the consultation                |
| `in_progress`| Active teleconsultation session                     |
| `completed`  | Session ended, ready for rating                     |
| `cancelled`  | Cancelled by patient or doctor                      |
| `rejected`   | Doctor declined the request                         |
| `no_show`    | Patient did not attend                              |

- **My Consultations** (`/consultations`) — Lists all patient consultations with status badges, doctor info, and dates. Filterable by status.
- **Consultation Detail** (`/consultations/:id`) — Full details of a single consultation including doctor info, scheduled date/time, status, and actions (join waiting room, cancel, etc.).
- **Booking Success** (`/booking-success`) — Confirmation page with:
  - Consultation details summary (doctor, date, time, file number, location).
  - **PDF Receipt Download** — Generates a branded PDF receipt using jsPDF with consultation details, formatted in French.
- **Pre-Consultation Form** (`/pre-consultation`) — Medical questionnaire patients fill out before their appointment.
- **Rate Consultation** (`/consultations/:id/rate`) — Post-consultation rating page.
- **Accept / Reject** — Hooks for handling proposed consultations (`useAcceptConsultation`, `useRejectConsultation`).

---

### 6. 3D Immersive Waiting Room

**Files:** `pages/WaitingRoomPage.tsx`, `components/ThreeD/WaitingRoomModel.tsx`, `components/ThreeD/WaitingRoomLoader.tsx`, `components/ThreeD/WaitingRoomInstructionsModal.tsx`

- **Full-Page 3D Environment** — When a patient enters the waiting room (`/waiting-room/:id`), they are immersed in a fully rendered 3D model of a real medical waiting room, loaded from a `.glb` GLTF file using React Three Fiber and Drei.
- **First-Person Navigation** — Custom `FirstPersonController` enables WASD/Arrow key movement within the 3D space with configurable speed.
- **Drag-Based Camera Look** — `DragLookControls` allow mouse-drag rotation of the camera to look around the environment.
- **Camera Boundaries** — The camera is constrained to stay inside the model to prevent users from navigating outside the waiting room.
- **Predefined Starting Position** — The camera starts at a specific interior coordinate for an optimal entry experience.
- **Instructions Modal** — On entry, a modal overlay explains navigation controls (WASD/arrows for movement, mouse drag to look around). Controls are disabled while the modal is visible and enabled upon dismissal.
- **Camera Reset** — The camera resets to the predefined position when the instructions modal is closed.
- **Ambient Sound** — Background waiting room audio (`waitingSound.mp3`) plays during the wait, creating a realistic atmosphere.
- **Loading Screen** — A custom `WaitingRoomLoader` displays progress while the 3D model and textures are being loaded.
- **Environment Lighting** — HDR environment lighting (via Drei `Environment`) for realistic material rendering.
- **Socket.IO Integration** — The page connects to the signaling server to listen for when the doctor starts the consultation session, automatically transitioning the patient to the teleconsultation page.
- **Leave Waiting Room** — Patients can leave the waiting room, which calls the `leaveWaitingRoom` API.

---

### 7. Video Teleconsultation (WebRTC)

**Files:** `pages/TeleconsultationPage.tsx`, `components/VideoCall.tsx`, `components/EndConsultationModal.tsx`, `hooks/useWebRTC.ts`

- **Full WebRTC Implementation** — The `useWebRTC` hook implements a complete peer-to-peer video/audio call:
  - **Signaling** via Socket.IO — Handles `offer`, `answer`, `ice-candidate`, and `consultation-ended` events.
  - **STUN Servers** — Uses Google STUN servers (`stun.l.google.com`) for NAT traversal and ICE candidate gathering.
  - **Peer Connection Lifecycle** — Creates `RTCPeerConnection`, manages tracks, handles ICE candidate exchange, and monitors connection state changes.
  - **Automatic Reconnection** — Detects `disconnected` or `failed` states and attempts recovery.
- **Media Controls**:
  - **Toggle Mute** — Mute/unmute local microphone.
  - **Toggle Video** — Enable/disable local camera.
  - **Peer Media State** — Displays whether the remote peer has video/audio enabled.
- **Connection Quality Monitoring** — Tracks and displays connection quality levels: `excellent`, `good`, `fair`, `poor`, or `audio-only`.
- **VideoCall UI Component** — Dual video layout:
  - Large remote video (doctor's feed) with placeholder when video is off.
  - Picture-in-picture local video (patient's camera).
  - Control bar with mute, video toggle, and end call buttons.
  - Connection quality indicator with color-coded badge.
- **End Consultation Modal** — When ending a call, patients choose between:
  - **Leave** — Return to the waiting room (pause the session).
  - **End** — Finish the consultation entirely, which calls the `finish` API and navigates to the rating page.
- **Browser Unload Protection** — A `beforeunload` event handler warns users before accidentally closing the browser during an active call.
- **Protocol-Aware Signaling** — Automatically switches between `http`/`https` and `ws`/`wss` based on the page protocol.

---

### 8. AI-Powered Skin Diagnosis

**Files:** `pages/AIDiagnosisPage.tsx`

- **Chat-Based Interface** — Conversational AI interface where patients describe their skin concerns in a chat format.
- **Image Upload** — Patients can upload photos of their skin condition directly in the chat for AI analysis.
- **Camera Capture** — Direct camera access for taking live photos of skin areas.
- **AI Response Types** — The system supports text responses, image-request messages, and structured result messages with severity indicators.
- **Animated Messages** — Chat messages appear with smooth Framer Motion animations using `AnimatePresence`.
- **Auto-Scroll** — Chat automatically scrolls to the latest message.

---

### 9. User Profile & Medical Records

**Files:** `pages/UserProfilePage.tsx`, `components/AddPhotoModal.tsx`, `hooks/useAuth.ts`, `api/features/users.ts`

A comprehensive patient profile page (`/profile`) with multiple sections:

- **Profile Overview** — Displays user photo, name, email, age (auto-calculated from date of birth), and gender. Profile photo can be updated by clicking on it, which triggers a file picker that converts the image to base64 and uploads via API.
- **Medical Record Management**:
  - **Allergies** — Add and remove allergies with real-time API sync (optimistic updates).
  - **Medical History** — Add conditions with status (`ongoing` or `resolved`) and dates; remove entries.
  - **Vaccines** — Track vaccination history with names and dates.
  - All medical record mutations use the `useUpdateMedicalRecord` hook with TanStack Query cache invalidation.
- **Skin Progress Journal (Skin Logs)**:
  - Photo diary for tracking skin condition over time.
  - **Add Photo Modal** — Upload skin photos with date, title, and notes.
  - **Delete Skin Logs** — Remove individual entries.
  - Base64 image handling for uploads.
- **My Appointments** — View all upcoming and past consultations directly from the profile page. Accept or reject proposed consultations.
- **Prescriptions** — View all prescriptions issued by doctors (see section 10).
- **Section-Based Navigation** — Profile uses URL parameter sections (`/profile/:section`) for navigating between sub-views (appointments, prescriptions, skin logs, etc.).
- **Logout** — Calls the logout API, clears all TanStack Query cache, and redirects to login.

---

### 10. Prescriptions Management

**Files:** `hooks/usePrescriptions.ts`, `api/features/prescriptions.ts`, `pages/PrescriptionVerificationPage.tsx`, `api/types.ts`

- **My Prescriptions** — Fetches all prescriptions issued to the patient via `prescriptionsApi.getMyPrescriptions()`.
- **Prescription Data** — Each prescription includes:
  - Diagnosis and doctor notes.
  - Medications list with name, dosage, frequency, duration, and instructions.
  - Issuing doctor details (name, specialization).
  - PDF download URL.
  - Issue date.
- **Prescription Verification** (`/verify-prescription/:id`) — Public page for verifying the authenticity of a prescription, accessible via a shareable link.

---

### 11. E-Commerce (Products & Checkout)

**Files:** `pages/ProductsPage.tsx`, `pages/ProductPage.tsx`, `pages/CategoryPage.tsx`, `pages/CollectionPage.tsx`, `pages/CartPage.tsx`, `pages/CheckoutPage.tsx`

- **Product Catalog** (`/products`) — Browse all skincare products with filtering, sorting, and search capabilities. Products include images, prices, descriptions, and ingredients.
- **Product Detail** (`/product`) — Single product view with detailed information, images, and add-to-cart functionality.
- **Category Pages** (`/category/:categoryId`) — Filter products by dermatological categories.
- **Collection Pages** (`/collection/:collectionId`) — Curated product collections.
- **Shopping Cart** (`/cart`) — View selected products, adjust quantities, and see order totals.
- **Multi-Step Checkout** (`/checkout`) — A comprehensive checkout flow with:
  1. **Delivery Address** — Saved address selection, new address form, and GPS geolocation (via `navigator.geolocation`).
  2. **Payment** — Payment method selection and processing.
  3. **Order Confirmation** — Final review and order submission.
  - Includes a visual step indicator showing progress through the checkout flow.

---

### 12. Internationalization (i18n)

**Files:** `i18n/index.ts`, `i18n/locales/fr.json`, `i18n/locales/en.json`

- **Full Bilingual Support** — Every user-facing string is internationalized using `react-i18next`.
- **Default Language** — French (`fr`) is the default and fallback language.
- **Language Switching** — Users can toggle between French and English from the Navbar and Login page.
- **Comprehensive Coverage** — Translation files cover ~22-25 KB of content each, including:
  - Navigation, authentication forms, doctor search/profile.
  - Consultation statuses and actions.
  - Product catalog, cart, and checkout.
  - Error messages (network, unauthorized, not found, server error, generic).
  - Medical record labels, AI diagnosis, waiting room instructions.
  - Document categories for medical files.
- **Error Message i18n** — The `getErrorMessage()` function in `api/client.ts` uses `i18n.t()` to return translated error messages based on HTTP status codes.

---

### 13. Page Transitions & Animations

**Files:** `components/PageTransition.tsx`, `App.tsx`

- **AnimatePresence** — Wraps all routes in Framer Motion's `AnimatePresence` with `mode="wait"` for seamless page enter/exit transitions.
- **PageTransition Component** — Reusable wrapper that applies consistent fade/slide animations to every page.
- **Scroll Restoration** — The app scrolls to top on every route change via a `useEffect` hook in `App.tsx`.
- **Component-Level Animations** — Individual components (Hero, Testimonials, AI Chat, etc.) use Framer Motion for:
  - Staggered list reveals.
  - Fade-in / slide-up on scroll.
  - Animated modals and dropdowns.
  - Scale-in animations (e.g., booking success page).

---

### 14. Notifications & Toasts

- **Sonner** — The `<Toaster>` component is mounted at the app root, configured with `position="top-right"`, `expand={true}`, and `richColors`.
- Used throughout the app for success/error/info feedback on actions like booking, profile updates, medical record changes, consultation acceptance/rejection, and API errors.

---

### 15. Chat FAB (Floating Action Button)

**File:** `components/ChatFAB.tsx`

- A persistent floating action button visible on all pages, providing quick access to support or chat functionality.

---

### 16. Protected Routes

**File:** `components/ProtectedRoute.tsx`

Protected pages (requiring authentication):
- `/consultations` and `/consultations/:id`
- `/waiting-room/:id`
- `/teleconsultation/:consultationId`
- `/consultations/:consultationId/rate`
- `/profile` and `/profile/:section`

Public pages (no authentication required):
- `/` (Home), `/login`, `/products`, `/product`, `/category/:id`, `/collection/:id`
- `/doctors`, `/doctors/:id`, `/benefits`, `/booking-success`
- `/pre-consultation`, `/ai-diagnosis`, `/cart`, `/checkout`
- `/verify-prescription/:id`

---

## API Layer Architecture

The API layer follows a **feature-based modular architecture**:

```
api/
├── config.ts          # Centralized configuration
├── client.ts          # Axios instance + interceptors
├── queryClient.ts     # TanStack Query client
├── types.ts           # Shared TypeScript interfaces
└── features/          # Feature-scoped API modules
    ├── auth.ts
    ├── consultations.ts
    ├── doctors.ts
    ├── prescriptions.ts
    └── users.ts
```

### Key Design Decisions

1. **Centralized Endpoints** — All API endpoints are defined in `config.ts` as a typed constant object (`API_ENDPOINTS`), grouped by feature (auth, consultations, users, prescriptions, patientConsultations).

2. **Query Keys** — TanStack Query cache keys are co-located with endpoint definitions in `config.ts` (/`QUERY_KEYS`), ensuring consistent cache invalidation across all hooks.

3. **Automatic Token Refresh** — The Axios response interceptor transparently handles expired tokens:
   - Catches `401` responses.
   - Uses the refresh token to obtain a new access token.
   - Retries the failed request with the new token.
   - On refresh failure, clears all tokens and redirects to login.

4. **Protocol-Aware Base URL** — The `API_BASE_URL` automatically detects `https:` vs `http:` based on the page protocol, ensuring correct API communication in both development and production.

5. **Optimistic Updates** — Profile photo updates use optimistic mutation patterns: the UI updates immediately, with rollback on error and server confirmation on success.

6. **Error Handling** — The `getErrorMessage()` utility extracts user-friendly, i18n-translated error messages from Axios errors based on HTTP status codes and API response payloads.

---

## Custom Hooks

| Hook                     | Purpose                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| `useAuth()`              | Returns `{ isAuthenticated, isLoading, user }` based on profile query status    |
| `useLogin()`             | TanStack mutation for email/password login                                      |
| `useRegister()`          | TanStack mutation for new account registration                                  |
| `useLogout()`            | TanStack mutation that clears all cached state on success                        |
| `useProfile()`           | TanStack query for current user profile (5 min stale time)                      |
| `useUpdateProfilePhoto()`| Optimistic mutation for profile photo (rollback on error)                        |
| `useUpdateMedicalRecord()` | Mutation for allergies, history, vaccines                                    |
| `useSkinLogs()`          | Query for patient's skin log entries                                            |
| `useCreateSkinLog()`     | Mutation to create a new skin log entry                                         |
| `useDeleteSkinLog()`     | Mutation to delete a skin log entry                                             |
| `useConsultations()`     | Query for all patient consultations                                             |
| `useConsultation(id)`    | Query for a single consultation by ID                                           |
| `useCreateConsultation()`| Mutation to book a new consultation                                             |
| `useUpdateConsultation()`| Mutation to update consultation data                                            |
| `useMyAppointments()`    | Query for patient's appointment list                                            |
| `useAcceptConsultation()`| Mutation to accept a proposed consultation                                      |
| `useRejectConsultation()`| Mutation to reject a proposed consultation                                      |
| `useDoctors()`           | Query for all doctors listing                                                   |
| `useDoctor(id)`          | Query for a single doctor by ID                                                 |
| `useBookedSlots(id, date)` | Query for booked time slots for a doctor on a date                           |
| `usePrescriptions()`     | Query for patient's prescriptions                                               |
| `useWebRTC(options)`     | Full WebRTC hook: signaling, peer connection, media controls, connection quality |

---

## Utility Libraries

### `lib/utils.ts`

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Combines `clsx` (conditional class composition) with `tailwind-merge` (deduplicates conflicting Tailwind classes) for clean, conflict-free class names.

### `lib/slots.ts`

The `generateTimeSlots()` function is the core scheduling engine:

1. Checks for **specific-date availability** entries first (these override recurring schedules).
2. Falls back to **recurring day-of-week** entries if no specific dates are set.
3. Generates **30-minute interval** time slots between each availability's `startTime` and `endTime`.
4. Filters out **already-booked slots** (from the API).
5. Filters out **past slots** if the selected date is today.
6. **Deduplicates** slots from overlapping availability ranges.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A running **MyDermaLife backend server** (default: port `3070`)

### Installation

```bash
cd user-ui
npm install
```

### Development Server

```bash
npm run dev
```

The app starts on **https://localhost:8082** (SSL enabled via `@vitejs/plugin-basic-ssl`, accessible on the local network at `https://<your-ip>:8082`).

---

## Environment Variables

Create a `.env` file based on `.env.example`:

| Variable           | Description                          | Default                                        |
| ------------------ | ------------------------------------ | ---------------------------------------------- |
| `VITE_API_URL`     | Full base URL of the backend API     | Auto-detected: `https://<hostname>:3070/api/v1` |
| `VITE_API_BASE_URL`| Alternative base URL (fallback)      | Same auto-detection logic                       |

---

## Scripts

| Script            | Command                | Description                                  |
| ----------------- | ---------------------- | -------------------------------------------- |
| `dev`             | `vite --host`          | Start development server (SSL, port 8082)    |
| `build`           | `tsc -b && vite build` | Type-check and build for production          |
| `lint`            | `eslint .`             | Run ESLint on the entire project             |
| `preview`         | `vite preview`         | Preview the production build locally         |
