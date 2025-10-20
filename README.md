# Reddit Clone — Next.js + Firebase

A Reddit-inspired clone built with Next.js and Firebase. This project implements core Reddit-like features such as communities (subreddits), posts (text & images), nested comments, voting, and user profiles — all powered by Firebase Authentication, Cloud Firestore and Firebase Storage.

<!-- Badges (optional) -->
![Next.js](https://img.shields.io/badge/Next.js-13.3.1-000000)
![Firebase](https://img.shields.io/badge/Firebase-9.x-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Table of Contents

- [About](#about)
- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [🔥 Firebase Setup](#-firebase-setup)
- [Installation & Setup](#installation--setup)
- [🔐 Environment Variables](#-environment-variables)
- [Project Structure](#project-structure)
- [Key Features Explanation](#key-features-explanation)
- [📊 Database Structure](#-database-structure)
- [Firebase Services Used](#firebase-services-used)
- [Components Overview](#components-overview)
- [API Routes (if applicable)](#api-routes-if-applicable)
- [State Management](#state-management)
- [Authentication Flow](#authentication-flow)
- [Deployment](#deployment)
- [Development](#development)
- [Known Issues & Limitations](#known-issues--limitations)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Credits & Acknowledgments](#credits--acknowledgments)

---

## About

This project is a learning-focused Reddit clone built with Next.js (Pages Router) and Firebase (modular SDK v9). It demonstrates building a full-stack application using server-side and client-side features of Next.js and Firebase-backed services for auth, data, and file storage.

---

## Demo

- Live demo: reddit-clone-six.vercel.app

---

## Features

- User authentication (Email/Password, Google via Firebase Auth)
- Create and browse communities (subreddits-equivalent)
- Create text and image posts
- Nested comments with replies
- Upvote / Downvote system with vote tracking
- Post edit & delete (author-only)
- Community membership (join/leave)
- User profiles with karma tracking
- Image uploads via Firebase Storage
- Responsive UI using Chakra UI
- Local state management using Recoil

Unique / notable differences from Reddit:

- Lightweight feature set focused on learning Firebase + Next.js
- Simpler moderation tools (no complex flair, awards, or reports)

---

## Tech Stack

- Next.js 13.3.1 (Pages Router)
- React 18
- Firebase JS SDK v9 (modular): Auth, Firestore, Storage, Functions
- Chakra UI (component library)
- Recoil (state management)
- react-firebase-hooks
- Typescript

Key package versions (from `package.json`):

```
next@13.3.1
firebase@^9.20.0
@chakra-ui/react@^2.5.5
recoil@^0.7.7
react-firebase-hooks@^5.1.1
```

---

## Prerequisites

- Node.js 16+ (Recommend Node 18)
- A Firebase account (https://firebase.google.com/)
- Yarn or npm
- Optional: Vercel account for deployment

---

## 🔥 Firebase Setup

Follow these steps to create and configure a Firebase project for this app.

1. Create a Firebase Project
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the wizard

2. Register a Web App
   - In Project Settings > Your apps, click "</>" to register a web app
   - Provide an app nickname and register the app
   - You'll receive a Firebase config object (API key, project ID, etc.) — these become your environment variables

3. Enable Authentication
   - Navigate to Authentication > Sign-in method
   - Enable Email/Password
   - Optionally enable Google provider (setup requires OAuth client id if you restrict domains)

4. Create Cloud Firestore
   - Firestore > Create database
   - Start in production mode (recommended) or test mode while developing
   - Choose a location/region nearest to your users

5. Set up Firestore security rules (starter example)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection: authenticated users can read/write their own user doc
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Communities: allow read to everyone, writes only to authenticated users
    match /communities/{commId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.creatorId;
    }

    // Posts: public reads; create by authenticated users; updates/deletes by author
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }

    // Comments: similar to posts
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
```

> Note: These rules are simplified. Harden them according to your app's model and security posture before production.

6. Enable Firebase Storage
   - Storage > Get started
   - Choose a default storage bucket

7. Storage rules (starter example)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{allPaths=**} {
      // Allow read to everyone, write only to authenticated users
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

8. (Optional) Cloud Functions
   - If you use Firebase Functions (`functions/` exists), deploy with `firebase deploy --only functions`

---

## Installation & Setup

1. Clone the repo

```bash
git clone https://github.com/markmysler/reddit-clone.git
cd reddit-clone
```

2. Install dependencies

```bash
# npm
npm install

# or yarn
yarn
```

3. Create `.env.local` in the project root and add your Firebase config (see next section)

4. Run the dev server

```bash
npm run dev
# or
yarn dev
```

5. Open http://localhost:3000

Build for production

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Create a `.env.local` file at the project root with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Where to find values:
- Go to Firebase Console > Project Settings > General > Your apps > SDK setup and config. Copy the values listed in the config object.

The app imports these env vars in `src/firebase/clientApp.ts`.

---

## Project Structure

Top-level structure (important files/folders):

- `src/` - main application code
  - `components/` - React components organized by feature (Community, Layout, Modal, NavBar, Posts, etc.)
  - `firebase/` - Firebase client initialization and helper utilities (`clientApp.ts`, `errors.ts`)
  - `hooks/` - custom React hooks (`useCommunityData.tsx`, `usePosts.tsx`, `useSelectFile.tsx`)
  - `atoms/` - Recoil atoms for global state
  - `pages/` - Next.js pages: index, community pages, posts, API routes
- `public/Images/` - images used by the app (logos, screenshots, sample images)
- `functions/` - Firebase Cloud Functions (optional)
- `package.json` - project dependencies & scripts

Key pages and features:
- `src/pages/index.tsx` - Home page
- `src/pages/r/[communityId]/index.tsx` - Community page
- `src/pages/r/[communityId]/submit.tsx` - Create a new post in a community
- `src/pages/r/[communityId]/comments/[pid].tsx` - Post detail + comments

Firebase utilities:
- `src/firebase/clientApp.ts` - initializes Firebase (auth, firestore, storage)
- `src/firebase/errors.ts` - maps Firebase errors to friendly messages

---

## Key Features Explanation

### Authentication

- Email/password sign up and login
- Google OAuth (if enabled in Firebase)
- Uses Firebase Auth via `src/firebase/clientApp.ts` and react-firebase-hooks
- Auth state is passed through Recoil atoms and used to protect actions like creating posts/comments

### Communities

- Users can create new communities. Each community stores metadata like description, image, creatorId, and member count.
- Users can join or leave communities. Membership is tracked in Firestore.

### Posts

- Posts have title, body, optional image, authorId, communityId, and counters (votes, comments).
- Image uploads go to Firebase Storage; the URL is stored on the post document.

### Comments

- Nested comments are supported via `comments` collection and relations to postId and parentCommentId for replies.

### Voting

- Votes are recorded per user per post in a `votes` collection or as subcollection on user/doc; the system prevents multiple identical votes by the same user and allows toggling/updating vote values.

### User Profiles

- Profiles store username, photoURL, createdAt, and karma. Users can view profile pages and see their posts/comments.

---

## 📊 Database Structure (Firestore)

Below are the core collections and example document shapes.

### Collections

#### `users`

```typescript
{
  uid: string,
  username: string,
  email: string,
  photoURL?: string,
  createdAt: timestamp,
  karma: number
}
```

#### `communities`

```typescript
{
  id: string,
  name: string,
  creatorId: string,
  description?: string,
  memberCount: number,
  createdAt: timestamp,
  imageURL?: string
}
```

#### `posts`

```typescript
{
  id: string,
  title: string,
  body?: string,
  authorId: string,
  communityId: string,
  voteCount: number,
  commentCount: number,
  createdAt: timestamp,
  imageURL?: string
}
```

#### `comments`

```typescript
{
  id: string,
  postId: string,
  authorId: string,
  body: string,
  parentCommentId?: string, // for replies
  createdAt: timestamp
}
```

#### `communityMembers` or `members` subcollection

Documents listing membership or a `members` map/array on `communities`.

#### `votes` (per-user or per-post storage)

```typescript
{
  id: string,
  userId: string,
  postId: string,
  voteValue: 1 | -1
}
```

Data relationships:
- posts reference `communityId` and `authorId`
- comments reference `postId` and optionally `parentCommentId`
- votes reference `userId` & `postId`

---

## Firebase Services Used

- Firebase Authentication: Email/Password, Google (optional)
- Cloud Firestore: primary database for users, communities, posts, comments, votes
- Firebase Storage: image uploads for posts and community/user images
- Firebase Functions: (optional) server-side logic in `functions/`

---

## Components Overview

Major UI components are organized in `src/components/` by feature. Examples:

- `NavBar/` - top navigation, search input, user menu
- `Community/` - components for displaying community pages and sidebar
- `Posts/` - post list, post item, post form, comment components
- `Modal/` - auth modals, create community modal
- `Layout/` - page layout and content wrapper

Shared vs page-specific:
- Shared components (NavBar, Layout, UI primitives) live at the top-level `components` folder
- Page-specific components live inside feature subfolders (e.g., `Community`, `Posts`)

Responsibilities:
- `PostItem.tsx` - renders a post, handles voting and navigation to post detail
- `NewPostForm.tsx` - form to create posts (handles text + image upload)
- `CommentItem.tsx` & `Comments.tsx` - visualize nested comments and reply flows

---

## API Routes (if applicable)

This project primarily uses Firestore directly from the client. If you have server-side endpoints in `src/pages/api/`, use them for secure operations or to call Firebase Admin SDK.

Example endpoints (if present):

| Route | Purpose |
|---|---|
| `/api/hello` | Example/placeholder API route |

If you add server-side logic that requires service account credentials (Admin SDK), keep those credentials out of the frontend and use cloud functions or serverless endpoints.

---

## State Management

- Recoil is used for global state (atoms stored in `src/atoms/`) such as auth modal state, selected community, and post editing state.
- Local component state is used for form inputs and ephemeral UI state.

Key atoms:
- `AuthModalAtom.ts` — controls visibility of auth modal
- `communitiesAtom.ts` — selected community and community list
- `PostAtom.ts` — current post draft or selected post

---

## Authentication Flow

- On sign up, the app creates a user with Firebase Auth and stores profile data in the `users` collection.
- `react-firebase-hooks` hooks are used to listen for auth state changes on the client.
- Protected actions (create post/comment, join community) check `auth.currentUser` and redirect to login modal if unauthenticated.

Protected routes: any page or action requiring auth should enforce checks in `getServerSideProps` or client-side guards.

---

## Deployment

Recommended: Vercel (first-class for Next.js)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel project settings (same names as `.env.local`)
4. Configure build command: `npm run build` and output directory: automatic (Next.js)

Firebase in production:
- Use production Firestore rules
- Consider stricter Storage rules and domain restrictions for OAuth

---

## Development

Run the dev server:

```bash
npm run dev
```

Linting:

```bash
npm run lint
```

Tests:
- No tests included by default. Consider adding Jest + React Testing Library for unit/feature tests.

Code style and contribution tips:
- Follow existing code style (TypeScript + Chakra UI patterns)
- Write small, focused PRs

Git workflow suggestion:
- Feature branches named `feat/<short-desc>`
- Use PRs and code reviews

---

## Known Issues & Limitations

- Not all Reddit features are implemented (awards, advanced moderation, private messages)
- Security rules in this README are examples only — review and tighten before production
- Image uploads rely on client-side token; for advanced protections, implement server-side signed URLs or functions

Browser support: modern evergreen browsers (Chrome, Edge, Firefox, Safari). Mobile responsive but may need UX tweaks.

---

## Future Enhancements

- Real-time notifications
- Improved moderation UI and roles
- Post editing history and versioning
- Better testing coverage
- Offline support with Firestore persistence

---

## Troubleshooting

<details>
<summary>Common Firebase setup issues</summary>

- "Missing or invalid API key" — ensure `.env.local` values match Firebase SDK config for your web app.
- CORS / Storage access errors — check Storage rules and that you are authenticated when writing files.
- Firestore permission-denied — review Firestore rules; emulate locally with Firebase Emulator for easier debugging.
- OAuth redirect mismatch for Google sign-in — add your development and production origins in the OAuth client settings.

</details>

If you run into unclear errors, check browser console and server logs. Use `firebase emulators:start` for local emulation of Firestore, Auth, and Functions.

---

## License

This project is released under the MIT License. See `LICENSE` file for details.

---

## Credits & Acknowledgments

- Built with Next.js and Firebase
- UI components from Chakra UI
- Inspired by Reddit and many open-source tutorials and examples

If you found this repo useful, feel free to star it and open issues or PRs.

---

## Contact

Created by markmysler. For questions or help setting up, open an issue or reach out via GitHub.
# Reddit-clone

Un clon de reddit con las funcionalidades mas importantes:
autenticacion,
creacion de comunidades,
posts,
comentarios y
votos.

## 🛠 Tools

React, TypeScript, Firebase, Recoil, Next.js.

## Deployment

El proyecto esta desplegado en https://reddit-clone-kz7sf3jc7-markmysler.vercel.app/

## Proba el proyecto localmente

Clona el repositorio

```bash
  git clone https://github.com/markmysler/reddit-clone
```

Navega al directorio del proyecto en la consola

```bash
  cd reddit-clone
```

Instala las dependencias

```bash
  npm install
```

Inicia el server

```bash
  npm run start
```
