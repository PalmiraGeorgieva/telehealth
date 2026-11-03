# Telehealth — Therapy Tracker

> **Project status:** Work in progress (React Native exam project)

Telehealth is a mobile application for organizing personal therapies, exercises, and progress. The MVP focuses on a simple, accessible experience: users will be able to sign in, manage their therapy sessions, and review their records.

**Repository:** https://github.com/PalmiraGeorgieva/telehealth  
**Android APK:** _To be added after an EAS Build_  
**Exam submission deadline:** December 8, 2026, 15:59

## Tech Stack

- **Mobile:** React Native, Expo, JavaScript
- **Navigation:** React Navigation (Bottom Tabs + Native Stack)
- **UI:** React Native components, StyleSheet, Ionicons
- **Backend (planned):** Supabase Authentication, PostgreSQL, and Storage
- **Android distribution (planned):** Expo Application Services (EAS Build)

## Development Progress

### Completed

- [x] Initialize Expo / React Native project
- [x] Create project structure with `src/screens` and `src/navigation`
- [x] Set up React Navigation
- [x] Create Home, Therapies, and Profile screens (initial UI)
- [x] Implement Bottom Tab Navigator
- [x] Add Ionicons to bottom tabs
- [x] Apply initial green theme and screen styling
- [x] Compose Bottom Tab Navigator with Native Stack Navigator
- [x] Create initial Therapy Form and Therapy Details screens
- [x] Navigate from Therapies to Therapy Form using **Add New Therapy**
- [x] Create public GitHub repository

### In progress / Awaiting verification

- [ ] Implement and test Therapy Form with name, description, duration, and validation (initial code drafted; phone test not yet confirmed)
- [ ] Confirm latest navigation changes are committed and pushed

### Planned

- [ ] Add therapy type selector and date picker (non-text inputs)
- [ ] Connect app to Supabase
- [ ] Implement registration, login, and logout
- [ ] Protect authenticated screens and persist login session
- [ ] Fetch therapy list from Supabase (READ)
- [ ] Save new therapies (CREATE)
- [ ] Edit existing therapies (UPDATE)
- [ ] Delete therapies (DELETE)
- [ ] Navigate from therapy list to details with a therapy ID in route params
- [ ] Add loading, empty, error, and pull-to-refresh states
- [ ] Add profile image selection and upload (native feature)
- [ ] Polish responsiveness, safe areas, keyboard handling, and validation
- [ ] Test the complete user flow on Android
- [ ] Produce an Android APK using EAS Build and add its link above
- [ ] Add screenshots and final documentation
- [ ] Complete and verify the Functional Guide below

## Screens and Navigation

```text
App
└── Main Stack Navigator [implemented]
    ├── MainTabs [implemented]
    │   ├── Home [initial UI]
    │   ├── Therapies [initial UI]
    │   └── Profile [initial UI]
    ├── TherapyDetails [placeholder]
    └── TherapyForm [placeholder / form in progress]

Planned authentication flow:
App
├── Auth Navigator (guest)
│   ├── Login
│   └── Register
└── Main Stack Navigator (authenticated)
```

The Therapy Details screen exists as a placeholder, but the **list → details** interaction with a passed ID is not implemented yet.

## Getting Started

### Prerequisites

- Node.js and npm
- Expo Go on an Android device (for development)

### Local development

```bash
git clone https://github.com/PalmiraGeorgieva/telehealth.git
cd telehealth
npm install
npx expo start
```

Scan the QR code with Expo Go. If updates are not reflected, reload the app from the Expo terminal (`r`) or restart with `npx expo start --clear`.

> **Configuration (planned):** Once Supabase is integrated, document the required environment variables here. Do not commit credentials or service-role keys.

## Functional Guide — Draft

_This section follows the SoftUni React Native Functional Guide structure. Items marked **Planned** describe the intended behavior, not completed functionality._

### 1. Project Overview

**Application name:** Telehealth — Therapy Tracker  
**Category:** Health / Productivity  
**Purpose:** Help users organize therapy sessions and track related information through a mobile interface. The first version focuses on personal therapy records rather than medical consultations or clinical advice.

### 2. User Access & Permissions

**Guest — Planned:** Access Login and Register screens only.  
**Authenticated user — Planned:** Access Home, Therapies, Profile, Therapy Details, and Therapy Form; create, edit, and delete their own therapy records.

### 3. Authentication & Session Handling — Planned

On app launch, check the saved Supabase session. If no valid session exists, show authentication screens. After successful login or registration, show the main application. Logout clears the active session and returns to the authentication flow. Persist the session securely and verify behavior after app restart.

### 4. Navigation Structure

**Implemented:** Bottom Tab Navigator with Home, Therapies, and Profile, nested inside a Native Stack Navigator with Therapy Form and Therapy Details.  
**Planned:** Separate Auth Navigator and protected root navigation based on session state.

### 5. List → Details Flow — Planned

Display the user's therapies in a list on the Therapies screen. Selecting an item will navigate to `TherapyDetails` with its `therapyId` passed through route parameters. The details screen will fetch or display the selected record.

### 6. Data Source & Backend — Planned

**Backend:** Supabase (PostgreSQL, Authentication, Storage).  
**READ:** Fetch the signed-in user's therapy records.  
**CREATE:** Save a validated Therapy Form.  
**UPDATE:** Edit an existing therapy.  
**DELETE:** Remove a therapy after confirmation.  
Refresh the list after mutations and support pull-to-refresh. No hardcoded therapy records will be used as the final data source.

### 7. Forms & Validation — In progress / Planned

**Therapy Form:** Name (required), description (required), and duration (positive whole number). The first version of the form is drafted but not yet confirmed as tested.  
**Additional inputs — Planned:** Therapy type picker and date picker.  
**Authentication forms — Planned:** Email and password with required, format, and minimum-length rules.  
**Keyboard handling:** Use `KeyboardAvoidingView` and scrollable content; test on Android.

### 8. Native Device Features — Planned

Use Expo ImagePicker to select a profile image and upload it to Supabase Storage. Show the selected image on the Profile screen.

### 9. Typical User Flow — Planned

1. Open the app and sign in or register.
2. Navigate to Therapies and view the list.
3. Add a therapy with validated fields.
4. Open its details, edit it, or delete it.
5. Visit Profile to change the profile photo.
6. Log out; sign in again with session handling verified.

### 10. Error & Edge Case Handling — Planned

Show clear messages for invalid form input, authentication failures, network errors, missing records, and empty lists. Display loading indicators during requests and provide a way to retry failed operations.

## Exam Checklist

- [x] Two composed navigators, including a Stack Navigator
- [x] Five screen components created (Home, Therapies, Profile, Therapy Form, Therapy Details)
- [ ] At least three screens with real dynamic data/behavior
- [ ] Reachable list → details flow with route parameters
- [ ] Login, Register, Logout; protected routes; session persistence
- [ ] External API and persisted data (no hardcoded final data)
- [ ] GET, POST, PUT/PATCH; DELETE recommended
- [ ] Pull-to-refresh and loading/error states
- [ ] Two non-text input types
- [ ] Three validated fields, including one with multiple rules
- [ ] Keyboard and safe-area behavior tested
- [ ] One meaningful native feature
- [ ] Functional Android APK and prominent download link
- [ ] At least five meaningful commits across three different days (verify in Git history)
- [ ] Functional Guide finalized in this README
- [ ] Final Android testing and exam submission

## Next Milestones

1. Finish and test Therapy Form UI and validation.
2. Add date and therapy-type inputs.
3. Integrate Supabase Auth and database.
4. Implement therapy CRUD, details routing, and refresh states.
5. Implement profile image upload, finish testing, and generate APK.

---

_This README is a living development plan. Update checkboxes only after the corresponding feature has been implemented and tested._
