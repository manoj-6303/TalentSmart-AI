# Implementation Plan - User Authentication (Login / Registration System)

This plan details the steps required to build and integrate a secure, beautiful, glassmorphic login and registration system for the HireSmart application.

## User Review Required

> [!IMPORTANT]
> - **Security Implementation**: Password hashing will be implemented using Node.js's native `crypto` module (via PBKDF2). This avoids the need to install external packages like `bcrypt` which might cause platform-dependent installation issues.
> - **Session Management**: Session tokens will be generated using a custom URL-safe base64-encoded JWT structure signed with HMAC-SHA256 via the native `crypto` module, avoiding the need for `jsonwebtoken` library.
> - **No Routing Dependency**: Instead of forcing React Router installation (`react-router-dom`), which isn't currently used/configured in `App.jsx`, we will handle user authentication state dynamically in `App.jsx` (`isAuthenticated` and `authScreen` states). This ensures zero configuration errors and instant compatibility with the existing single-page layout.

## Proposed Changes

---

### Backend Components

#### [MODIFY] [db.js](file:///d:/syam/HireSmart/backend/services/db.js)
- Define a Mongoose `UserSchema` with `name`, `email`, and `password`.
- Expose the unified `User` model proxy supporting both live MongoDB mode and local mock JSON-database mode (`MockUser`).
- Modify the mock DB handler to automatically initialize new collection keys (like `users`) as an empty array if they do not yet exist in `db.json`.

#### [NEW] [auth.js](file:///d:/syam/HireSmart/backend/routes/auth.js)
- Implement `POST /api/auth/register`:
  - Validates registration inputs.
  - Checks if a user already exists with the given email.
  - Hashes passwords using PBKDF2.
  - Creates the user in the database (or mock database).
  - Returns a signed JWT token and user profile info.
- Implement `POST /api/auth/login`:
  - Finds the user by email.
  - Verifies the PBKDF2 password hash.
  - Returns a signed JWT token and user profile info.
- Implement `GET /api/auth/me`:
  - Decodes and verifies the token from the request header.
  - Returns the logged-in user's details if valid.

#### [MODIFY] [server.js](file:///d:/syam/HireSmart/backend/server.js)
- Import `authRouter` from `./routes/auth.js`.
- Mount the router at `/api/auth` using `app.use('/api/auth', authRouter)`.

---

### Frontend Components

#### [NEW] [Login.jsx](file:///d:/syam/HireSmart/frontend/src/pages/Login.jsx)
- Overwrite the empty file with a stunning glassmorphic login card.
- Styled to match the dark neon dashboard theme.
- Connects to the backend login API, manages loading state, displays errors, and sets the active user session in `localStorage`.
- Includes a link to transition to the Register screen.

#### [MODIFY] [Register.jsx](file:///d:/syam/HireSmart/frontend/src/pages/Register.jsx)
- Overwrite/refactor to use the cohesive glassmorphic styling.
- Connects to the backend registration API, manages input validation, saves token on success, and logs in the user automatically.
- Includes a link to transition to the Login screen.

#### [MODIFY] [App.jsx](file:///d:/syam/HireSmart/frontend/src/App.jsx)
- Add `user` and `authScreen` states.
- On startup, check `localStorage` for a user session and token. Verify it against the backend.
- If not logged in, render the active authentication page (`Login` or `Register`).
- If logged in, render the main dashboard grid as normal.
- Pass the logged-in user info to components.

#### [MODIFY] [Navbar.jsx](file:///d:/syam/HireSmart/frontend/src/components/Navbar.jsx)
- Accept the logged-in user object.
- Show user avatar / name greeting.
- Add a logout button to clear `localStorage` and reset the user state.

#### [MODIFY] [App.css](file:///d:/syam/HireSmart/frontend/src/App.css)
- Add custom CSS classes for the auth layouts (`.auth-wrapper`, `.auth-card`, `.auth-header`, etc.) ensuring full alignment with the application's Plus Jakarta Sans font, gradients, and blur panels.

---

## Verification Plan

### Automated Tests
We will verify endpoints manually using curl/fetch commands:
- Register a test user:
  ```powershell
  Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/register" -ContentType "application/json" -Body '{"name":"Test User","email":"test@example.com","password":"Password123"}'
  ```
- Login with the test user:
  ```powershell
  Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body '{"email":"test@example.com","password":"Password123"}'
  ```

### Manual Verification
1. Run the frontend and backend services concurrently using `npm run dev` at the root.
2. Open the browser to the application local address (e.g. `http://localhost:5173`).
3. Verify that the user is immediately redirected to the Login page.
4. Try clicking the "Sign Up" link, fill in the Registration form, and verify that registration is successful, logging the user in.
5. In the Navbar, verify the user greeting and the working logout button.
6. Log out, verify redirect back to Login, and try logging in using the registered credentials.
