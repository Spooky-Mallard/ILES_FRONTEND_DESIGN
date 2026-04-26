# 📘 ILES Frontend Bible

### The Complete Technical Reference for the Internship Logging & Evaluation System

**Makerere University · Computer Science · Week 12 Technical Defense Preparation**

---

> **A note to the team:** You are coming from Python/Django, which is a great foundation. Django renders HTML on the server — the page reloads every time the user navigates. React flips this model on its head: it renders entirely in the browser and only updates the *exact* part of the page that changed. This document will explain *why* that matters and *how* to build it correctly.

---

## Table of Contents

1. [Section 1: The React Mental Model](#section-1-the-react-mental-model)
2. [Section 2: The Folder Architecture](#section-2-the-folder-architecture)
3. [Section 3: Individual Work Packages](#section-3-individual-work-packages)
4. [Section 4: The ILES Workflow Cheat-Sheet](#section-4-the-iles-workflow-cheat-sheet)
5. [The Git & PR Workflow](#the-git--pr-workflow)

---

## Section 1: The React Mental Model

### 1.1 JSX — Why Not Just Use HTML Files?

**The Problem with Plain HTML:**

In a traditional Django project, when a student clicks "Submit Logbook," Django's server processes the request, queries the database, renders a brand-new HTML template, and sends the entire page back to the browser. This is called a **full-page reload**, and it means:

- The browser re-downloads CSS, JS, and image assets.
- The user sees a flash/blank screen between pages.
- You cannot build smooth, "app-like" interactions (e.g., live character count on a form).

**The React Solution — JSX:**

JSX (JavaScript XML) is a *syntax extension* for JavaScript that lets you write what *looks like* HTML inside a `.js` file. Crucially, it is **not** HTML — it gets compiled (transformed) into plain JavaScript function calls by a tool called **Babel** (which CRA sets up for you automatically).

```jsx
// What YOU write (JSX):
function WeeklyLogCard({ weekNumber, status }) {
  return (
    <div className="log-card">
      <h3>Week {weekNumber}</h3>
      <span className={`status-badge status-${status.toLowerCase()}`}>
        {status}
      </span>
    </div>
  );
}
```

```javascript
// What Babel COMPILES it to (plain JavaScript):
function WeeklyLogCard({ weekNumber, status }) {
  return React.createElement(
    "div",
    { className: "log-card" },
    React.createElement("h3", null, "Week ", weekNumber),
    React.createElement(
      "span",
      { className: `status-badge status-${status.toLowerCase()}` },
      status
    )
  );
}
```

**Why does this matter for your defense?**

The panel will ask: *"Why didn't you just use regular HTML?"*

Your answer: *"JSX allows us to co-locate the structure (markup) with the logic (JavaScript) of a specific UI unit. A `WeeklyLogCard` component owns its own HTML structure AND its behaviour. This makes it reusable, testable, and maintainable. When the DOM updates, React uses a Virtual DOM diff algorithm — it only changes the exact nodes that changed, not the whole page."*

**Key JSX Rules (defend these too):**

| Rule                                             | Reason                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| `className` instead of `class`                   | `class` is a reserved keyword in JavaScript                         |
| Every component must return **one root element** | React's `createElement` expects a single node to reconcile          |
| Self-closing tags must close: `<img />`          | JSX is stricter than HTML5 — it enforces XML rules                  |
| JavaScript expressions go inside `{}`            | The `{}` escape hatch moves from "markup mode" to "JavaScript mode" |

---

### 1.2 State vs. Props — A Real ILES Example

This is the most important conceptual divide in React. Getting it wrong leads to bugs that are nearly impossible to trace.

**The Analogy:**

- **Props** are like *function parameters* — data passed *into* a component from its parent. The component cannot change them.
- **State** is like a component's *local memory* — data the component owns and can change itself.

**A Real ILES Scenario: The Weekly Log Status**

```
Parent: StudentDashboardPage
  └── Child: WeeklyLogList
        └── Grandchild: WeeklyLogCard (receives props)
```

```jsx
// ✅ CORRECT USE OF PROPS
// WeeklyLogCard receives data from its parent. It cannot change the status.
// It only DISPLAYS what it's given.

function WeeklyLogCard({ weekNumber, status, activities, onSubmit }) {
  // Props: weekNumber, status, activities, onSubmit
  // These come FROM the parent. This component does not "own" them.

  return (
    <div className="log-card">
      <h3>Week {weekNumber}</h3>
      <p>{activities}</p>
      <span className={`badge badge--${status.toLowerCase()}`}>{status}</span>
      {status === "DRAFT" && (
        <button onClick={onSubmit}>Submit for Review</button>
      )}
    </div>
  );
}
```

```jsx
// ✅ CORRECT USE OF STATE
// StudentDashboardPage OWNS the list of logs. It decides when to fetch them.
// It also owns the "loading" state — is the data here yet?

import { useState, useEffect } from "react";
import { getLogs } from "../services/api";

function StudentDashboardPage() {
  // State: this component owns these values and can change them.
  const [logs, setLogs] = useState([]);         // list of log objects from API
  const [isLoading, setIsLoading] = useState(true); // are we waiting for the API?
  const [error, setError] = useState(null);      // did something go wrong?

  useEffect(() => {
    getLogs()
      .then(data => {
        setLogs(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError("Failed to load logs. Please try again.");
        setIsLoading(false);
      });
  }, []); // The [] means: run this effect ONCE, when the component first mounts.

  if (isLoading) return <p>Loading your logbook...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="dashboard">
      {logs.map(log => (
        // Props are PASSED DOWN to WeeklyLogCard. The child just displays them.
        <WeeklyLogCard
          key={log.id}
          weekNumber={log.week_number}
          status={log.status}
          activities={log.activities}
          onSubmit={() => handleSubmit(log.id)}
        />
      ))}
    </div>
  );
}
```

**The Golden Rule — "Lift State Up":**

If two sibling components need the same piece of data (e.g., both the `Navbar` and the `Dashboard` need to know the current user's role), that state must live in their **closest common ancestor** and be passed down as props. This is called *lifting state up*.

For ILES, `AuthContext` (see Section 3.3) is how we share the logged-in user's role across the *entire* app without prop-drilling through every component.

---

### 1.3 Hooks — The Engine of Functional Components

**What is a Hook?**

Before React 16.8 (2019), components that needed state *had* to be written as JavaScript classes. Classes are verbose and confusing. Hooks are special functions that let functional components "hook into" React features like state and lifecycle events.

**The Two Hooks You Will Use Most:**

#### `useState` — Add Memory to a Component

```jsx
import { useState } from "react";

function LogbookEntryForm() {
  // Declare a "state variable" called `activities`.
  // `setActivities` is the ONLY way to update it — never mutate it directly.
  // "" is the initial value.
  const [activities, setActivities] = useState("");
  const [charCount, setCharCount] = useState(0);

  function handleChange(event) {
    const value = event.target.value;
    setActivities(value);     // React re-renders the component with the new value
    setCharCount(value.length);
  }

  return (
    <div>
      <textarea
        value={activities}      // The textarea is CONTROLLED by React state
        onChange={handleChange}
        placeholder="Describe your weekly activities..."
        maxLength={2000}
      />
      <p>{charCount} / 2000 characters</p>
    </div>
  );
}
```

**Why can't I just do `activities = "new value"`?**

Because JavaScript variables don't trigger browser re-renders. When you call `setActivities("new value")`, React knows to:

1. Update the internal state.
2. Re-run (re-render) the component function with the new value.
3. Compare the new Virtual DOM with the old one (diffing).
4. Apply only the minimal changes to the real browser DOM.

Directly mutating a variable skips steps 1-4 entirely — your data changes, but the screen doesn't.

#### `useEffect` — Run Code In Response to Changes (Lifecycle)

Think of `useEffect` as the answer to: *"When should this happen?"*

```jsx
import { useState, useEffect } from "react";
import { getUserProfile } from "../services/api";

function SupervisorProfilePage({ userId }) {
  const [profile, setProfile] = useState(null);

  // Pattern 1: Run ONCE on mount (empty dependency array [])
  // Equivalent to Django's "on page load"
  useEffect(() => {
    getUserProfile(userId).then(data => setProfile(data));
  }, []);

  // Pattern 2: Run whenever `userId` changes
  // If a supervisor switches to view a different student, re-fetch.
  useEffect(() => {
    getUserProfile(userId).then(data => setProfile(data));
  }, [userId]); // Re-runs every time `userId` prop changes

  // Pattern 3: Run on EVERY render (no dependency array — use rarely)
  useEffect(() => {
    document.title = `ILES | ${profile?.first_name ?? "Loading..."}`;
  });

  // Pattern 4: Cleanup function (for subscriptions, timers, etc.)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-saving draft...");
    }, 30000);

    // The return function is the "cleanup" — runs before the next effect or unmount
    return () => clearInterval(interval);
  }, []);

  if (!profile) return <p>Loading...</p>;
  return <h1>Welcome, {profile.first_name}</h1>;
}
```

**The Dependency Array — The Most Common Source of Bugs:**

| Dependency Array | When Effect Runs                                    |
| ---------------- | --------------------------------------------------- |
| `[]` (empty)     | Once, after the component first appears on screen   |
| `[userId]`       | Once on mount, then again whenever `userId` changes |
| Omitted entirely | After *every* render — usually a mistake            |

---

### 1.4 Export/Import Syntax

This is critical for keeping your codebase modular. Every file is a "module" in JavaScript.

#### Default Export — One main thing per file

```jsx
// file: src/components/common/Button.jsx

// Definition
function Button({ label, onClick, variant = "primary" }) {
  return (
    <button className={`btn btn--${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}

// Export — only ONE default export per file
export default Button;
```

```jsx
// file: src/pages/LoginPage.jsx

// Import — you can name it ANYTHING when importing a default export
import Button from "../components/common/Button";
import MyButton from "../components/common/Button"; // Also valid (but confusing — don't do this)

function LoginPage() {
  return <Button label="Sign In" onClick={() => {}} />;
}

export default LoginPage;
```

#### Named Export — Multiple things from one file

```jsx
// file: src/utils/logbookHelpers.js

// Multiple named exports from one file
export function formatWeekRange(startDate, endDate) {
  // Format: "Mon 01 Jan - Sun 07 Jan"
  return `${startDate} - ${endDate}`;
}

export function getStatusColor(status) {
  const colorMap = {
    DRAFT: "#6c757d",
    PENDING: "#fd7e14",
    SUBMITTED: "#0d6efd",
    APPROVED: "#198754",
    REVIEWED: "#6f42c1",
  };
  return colorMap[status] || "#000000";
}

export const MAX_ACTIVITIES_LENGTH = 2000;
```

```jsx
// file: src/components/logbook/WeeklyLogCard.jsx

// Named imports must use the EXACT name, inside curly braces
import { formatWeekRange, getStatusColor, MAX_ACTIVITIES_LENGTH } from "../../utils/logbookHelpers";

// You can also mix default and named imports:
import React, { useState, useEffect } from "react"; // React is default, others are named
```

**Engineering Trade-off to know for your defense:**

Default exports are convenient but can lead to naming inconsistency across a large team. Named exports enforce a contract — the importing file must use the exact exported name, which acts as a form of documentation. For utilities and constants, always use named exports.

---

## Section 2: The Folder Architecture

### 2.1 The Feature-Based / Atomic Structure

Based on the architecture pattern referenced, here is the exact folder structure for ILES and the engineering rationale for every directory.

```
/src
├── components/          # Reusable UI building blocks (Atoms & Molecules)
│   ├── common/          # Used across ALL features (Button, Input, Modal, Badge)
│   ├── layout/          # The structural skeleton (Navbar, Sidebar, Footer, Layout)
│   ├── logbook/         # Components ONLY for the logbook feature
│   ├── auth/            # Components ONLY for authentication (LoginForm, etc.)
│   └── evaluation/      # Components ONLY for the evaluation feature
│
├── context/             # Global state shared across the whole app (Auth, Theme)
│   └── AuthContext.js
│
├── hooks/               # Custom hooks (reusable stateful logic)
│   ├── useAuth.js       # Shortcut hook to read from AuthContext
│   └── useForm.js       # Generic form state management logic
│
├── pages/               # "Screen-level" components — one per URL route
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── StudentDashboardPage.jsx
│   ├── SupervisorDashboardPage.jsx
│   ├── LogbookPage.jsx
│   └── EvaluationPage.jsx
│
├── services/            # All API communication (fetch/axios calls)
│   └── api.js
│
├── styles/              # Global CSS files
│   └── base.css         # CSS reset, variables, typography, utilities
│
├── utils/               # Pure utility functions (no React, no state)
│   └── logbookHelpers.js
│
├── App.js               # Router definition — the "map" of the app
└── index.js             # Entry point — mounts the React tree into index.html
```

---

### 2.2 Purpose of Each Directory

#### `/src/components`

Components are split by **feature** (logbook, auth, evaluation) and **reusability** (common, layout).

The key rule: **A component in `/components/logbook` should NEVER import anything from `/components/evaluation`.** Features are isolated. They communicate only through shared state (Context) or by lifting state up to a parent Page.

```
components/
└── common/
    ├── Button.jsx          # <Button label="Submit" variant="primary" />
    ├── Input.jsx           # <Input type="text" label="Username" />
    ├── Modal.jsx           # <Modal isOpen={true} onClose={fn}>...</Modal>
    ├── LoadingSpinner.jsx
    └── StatusBadge.jsx     # <StatusBadge status="APPROVED" />
```

**Why separate `common` from feature-specific components?**

Components in `common` must have *zero business logic*. A `Button` doesn't know anything about logbooks. This separation lets you change the logbook feature entirely without touching the `Button`, and vice versa.

#### `/src/context`

The Context API is React's built-in answer to "how do I share state without passing props through 10 layers?" It creates a "broadcast channel" that any component in the tree can tune into.

*See Section 3.3 for the full implementation.*

**When NOT to use Context:** Don't use it for data that only one or two components need. The cost is that *every* component consuming a context re-renders when that context changes. Use it for truly global concerns: authentication, theme, language.

#### `/src/hooks`

A **Custom Hook** is a JavaScript function whose name starts with `use` and which calls other React hooks inside it. It's purely about **logic reuse**.

```javascript
// src/hooks/useAuth.js
// Instead of importing useContext and AuthContext in every component,
// wrap it in a custom hook for cleaner code.

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider. Check that AuthProvider wraps your component tree in App.js.");
  }
  return context;
}
```

**Usage:**

```jsx
// Before custom hook (verbose):
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
function MyComponent() {
  const { user, role } = useContext(AuthContext);
  ...
}

// After custom hook (clean):
import { useAuth } from "../../hooks/useAuth";
function MyComponent() {
  const { user, role } = useAuth();
  ...
}
```

#### `/src/pages`

Pages are the "screens" of your app. They correspond 1-to-1 with a URL route. Their job is to:

1. Read route parameters (e.g., `/logbook/:weekId`).
2. Fetch data (using `useEffect` and `services/api.js`).
3. Manage page-level state.
4. Compose and pass data to child components.

**A Page should be "dumb" about UI and "smart" about data.** It knows what data to fetch; it delegates how to display it to components.

#### `/src/services`

Every `fetch()` call or API request lives here. **Never** write a raw `fetch()` inside a component. This is the most important architectural rule in your entire frontend.

*See Section 3.5 for the full implementation and the detailed reasoning.*

#### `/src/styles`

```css
/* src/styles/base.css */

/* ============================================
   CSS Custom Properties (Variables)
   Define ONCE, use everywhere.
   Changing --color-primary here updates it
   across the entire app instantly.
   ============================================ */
:root {
  /* Brand Colors */
  --color-primary: #1a5276;      /* Makerere blue */
  --color-secondary: #f39c12;
  --color-success: #198754;
  --color-danger: #dc3545;
  --color-warning: #fd7e14;

  /* Status Colors (mirror backend constants) */
  --status-draft: #6c757d;
  --status-pending: #fd7e14;
  --status-submitted: #0d6efd;
  --status-approved: #198754;
  --status-reviewed: #6f42c1;

  /* Typography */
  --font-family-base: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.5;

  /* Spacing Scale (multiples of 4px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}

/* CSS Reset — Remove browser inconsistencies */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: #212529;
  background-color: #f8f9fa;
}

/* Utility classes — low-specificity helpers */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Why `base.css` exists:** The CSS Cascade means styles defined earlier can be overridden by styles defined later. `base.css` is imported once in `index.js`, making it the foundation. Component-specific CSS files (e.g., `Button.css`) are imported inside their component file and override base styles only for that component's elements. This gives you global consistency + local flexibility.

---

## Section 3: Individual Work Packages

---

### Member 1: The Routing Architect

**Responsibility:** Set up `App.js` as the application router, create "shell" pages, and configure `react-router-dom` so the team has a working skeleton to build on.

**Your Deliverables:**

1. `src/App.js` — The route map
2. `src/pages/HomePage.jsx` — Shell page
3. `src/pages/LoginPage.jsx` — Shell page
4. `src/pages/StudentDashboardPage.jsx` — Shell page
5. `src/pages/SupervisorDashboardPage.jsx` — Shell page
6. `src/pages/AdminDashboardPage.jsx` — Shell page
7. `src/components/routing/ProtectedRoute.jsx` — Route guard

---

**Step 1: Install react-router-dom (already in your package.json)**

```bash
# Already installed, but for reference:
npm install react-router-dom
```

**Step 2: Build `App.js` — The Route Map**

```jsx
// src/App.js
// This file is the "table of contents" of our application.
// Every URL the user can visit is defined here.

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout wraps all pages with the consistent Navbar + Sidebar structure
import Layout from "./components/layout/Layout";

// Auth context — tells us if the user is logged in
import { AuthProvider } from "./context/AuthContext";

// Route guard — redirects unauthenticated users to login
import ProtectedRoute from "./components/routing/ProtectedRoute";

// Pages — each one corresponds to one screen/URL
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import SupervisorDashboardPage from "./pages/SupervisorDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import LogbookPage from "./pages/LogbookPage";
import EvaluationPage from "./pages/EvaluationPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    /*
      AuthProvider MUST wrap BrowserRouter (or the other way is also valid,
      but always wrap at the highest level possible).
      This ensures EVERY component in the tree can access auth state.
    */
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — accessible without logging in */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/*
            Protected routes — Layout wraps them all in a consistent shell.
            ProtectedRoute checks if the user is authenticated before rendering.
            If not authenticated, it redirects to /login.
          */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Student routes */}
              <Route
                path="/student/dashboard"
                element={<StudentDashboardPage />}
              />
              <Route path="/student/logbook" element={<LogbookPage />} />

              {/* Supervisor routes */}
              <Route
                path="/supervisor/dashboard"
                element={<SupervisorDashboardPage />}
              />
              <Route
                path="/supervisor/evaluation"
                element={<EvaluationPage />}
              />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
          </Route>

          {/* Catch-all: redirect unknown URLs to 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

**Step 3: Build `ProtectedRoute.jsx` — The Gatekeeper**

```jsx
// src/components/routing/ProtectedRoute.jsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/*
  <Outlet /> is a react-router-dom placeholder.
  When this component is used as a parent route:
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<DashboardPage />} />
    </Route>

  <Outlet /> renders the matched child route.
  If the user is not authenticated, we redirect them INSTEAD of rendering <Outlet />.
*/
function ProtectedRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth();

  // While checking authentication (e.g., validating a stored token),
  // show nothing. Prevents "flash of unauthenticated content."
  if (isLoading) {
    return <div className="loading-screen">Verifying session...</div>;
  }

  // Not logged in at all — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but wrong role — redirect to a "not authorised" page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/not-authorised" replace />;
  }

  // Authenticated and authorised — render the child route
  return <Outlet />;
}

export default ProtectedRoute;
```

**Step 4: Shell Pages (create one, copy the pattern for others)**

```jsx
// src/pages/LoginPage.jsx
// A "shell" page — just enough structure to unblock the team.
// Member 4 will fill in the real form logic.

import React from "react";

function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-container">
        <h1>ILES — Internship Logging & Evaluation System</h1>
        <p className="login-subtitle">Sign in to your account</p>
        {/*
          Member 4 will replace this placeholder with <LoginForm />
          once they have built it.
        */}
        <p>[LoginForm component goes here — see Member 4's work]</p>
      </div>
    </main>
  );
}

export default LoginPage;
```

**How the Router Works — Defend This:**

When a user types `http://localhost:3000/student/dashboard` in the browser:

1. The browser sends a request to the React dev server.
2. CRA always returns `index.html` (this is called "serving from the root").
3. React loads in the browser. `BrowserRouter` reads `window.location.pathname`.
4. `Routes` compares the current path against all `<Route path="...">` definitions.
5. The matching route renders its `element`. No network request for a new HTML page is made.

This is called **client-side routing**. The URL changes (using the HTML5 History API — `window.history.pushState()`), but the page never fully reloads. Only the component tree changes.

**`replace` on Navigate:** Using `<Navigate to="/login" replace />` replaces the current history entry instead of pushing a new one. This means the user can't click "Back" to get back to the protected page — important for security and UX.

---

### Member 2: The Layout & Global Stylist

**Responsibility:** Build the Layout component that wraps all authenticated pages, set up `base.css`, and create the Navbar component that adapts to the user's role.

**Your Deliverables:**

1. `src/components/layout/Layout.jsx`
2. `src/components/layout/Navbar.jsx`
3. `src/components/layout/Sidebar.jsx`
4. `src/styles/base.css` (already defined in Section 2.2)
5. `src/components/layout/Layout.css`
6. `src/components/layout/Navbar.css`

---

**Step 1: The Layout Component**

```jsx
// src/components/layout/Layout.jsx
// The Layout is the consistent "shell" around all authenticated pages.
// It renders:
//   - Navbar at the top (always visible)
//   - Sidebar on the left (role-dependent)
//   - Main content area (where <Outlet /> renders the current page)

import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout() {
  return (
    <div className="layout">
      {/*
        The Navbar sits at the top.
        It reads the user's name and role from AuthContext internally.
        Layout doesn't need to pass anything — that's the power of Context.
      */}
      <Navbar />

      <div className="layout__body">
        <Sidebar />

        {/*
          <Outlet /> is where react-router-dom renders the CURRENT PAGE.
          When the user navigates to /student/logbook, the LogbookPage
          component renders here, inside this layout shell.
          This is why the Navbar stays consistent across all pages.
        */}
        <main className="layout__main" id="main-content" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
```

```css
/* src/components/layout/Layout.css */

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Layout always fills the full viewport height */
}

.layout__body {
  display: flex;
  flex: 1; /* Takes all remaining vertical space below the Navbar */
}

.layout__main {
  flex: 1; /* Takes all horizontal space not used by Sidebar */
  padding: var(--space-6);
  overflow-y: auto;
}
```

**Step 2: The Role-Aware Navbar**

```jsx
// src/components/layout/Navbar.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Navbar.css";

/*
  The Navbar adapts its links based on the user's role.
  A student should NOT see supervisor evaluation links, and vice versa.
  We use a role-to-links mapping object instead of long if/else chains.
*/

// This object defines which navigation links each role sees.
// Adding a new link for a role is as simple as adding one object to its array.
const ROLE_NAV_LINKS = {
  student: [
    { path: "/student/dashboard", label: "Dashboard" },
    { path: "/student/logbook", label: "My Logbook" },
  ],
  workplace_supervisor: [
    { path: "/supervisor/dashboard", label: "Dashboard" },
    { path: "/supervisor/evaluation", label: "Evaluations" },
  ],
  academic_supervisor: [
    { path: "/supervisor/dashboard", label: "Dashboard" },
    { path: "/supervisor/evaluation", label: "Evaluations" },
  ],
  internship_admin: [
    { path: "/admin", label: "Admin Dashboard" },
  ],
};

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Safely get the nav links for this user's role.
  // If the role is unknown, default to an empty array.
  const navLinks = ROLE_NAV_LINKS[user?.role] ?? [];

  function handleLogout() {
    logout(); // Clears auth state in AuthContext
    navigate("/login"); // Redirect to login page
  }

  return (
    <header className="navbar" role="banner">
      <div className="navbar__brand">
        {/*
          Link component from react-router-dom changes the URL WITHOUT
          a full page reload. It uses the History API internally.
          Use <Link> instead of <a href> for ALL internal navigation.
          Use <a href> only for external links (e.g., university website).
        */}
        <Link to="/" className="navbar__logo">
          ILES
        </Link>
      </div>

      {/* Skip-to-content link for keyboard/screen reader accessibility */}
      <a href="#main-content" className="visually-hidden">
        Skip to main content
      </a>

      {user && (
        <>
          <nav className="navbar__nav" aria-label="Main navigation">
            <ul className="navbar__links" role="list">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="navbar__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="navbar__user">
            <span className="navbar__username">
              {user.first_name} {user.last_name}
            </span>
            {/* Role label — shown as a small badge */}
            <span className="navbar__role-badge">
              {user.role.replace("_", " ")}
            </span>
            <button
              className="navbar__logout-btn"
              onClick={handleLogout}
              type="button"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </header>
  );
}

export default Navbar;
```

```css
/* src/components/layout/Navbar.css */
/* Note: color values come from CSS variables defined in base.css */

.navbar {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-3) var(--space-6);
  background-color: var(--color-primary);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  /*
    position: sticky keeps the navbar at the top as the user scrolls.
    This is an intentional UX decision — the user can always navigate
    without scrolling back to the top.
  */
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar__logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  letter-spacing: 0.05em;
}

.navbar__nav {
  margin-left: auto; /* Pushes nav links to the right */
}

.navbar__links {
  display: flex;
  gap: var(--space-4);
  list-style: none;
}

.navbar__link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.navbar__link:hover,
.navbar__link:focus {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  outline: 2px solid rgba(255, 255, 255, 0.5); /* Keyboard focus indicator */
}

.navbar__user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: var(--space-4);
}

.navbar__role-badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  text-transform: capitalize;
}

.navbar__logout-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #ffffff;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
}

.navbar__logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}
```

**CSS Cascading — Defend This:**

The "C" in CSS stands for *Cascading*. When two rules target the same element, the one with higher **specificity** wins. If specificity is equal, the rule declared *later* wins. This is why:

1. `base.css` is imported in `index.js` (runs first, lowest priority).
2. `Navbar.css` is imported inside `Navbar.jsx` (bundled later, can override base styles but only for `.navbar` elements).
3. Inline styles (avoid in this project) have the highest specificity.

The "scope" for CSS in CRA is **not automatic** (that requires CSS Modules). To avoid class name collisions, use a **BEM-like naming convention**:

- Block: `.navbar`
- Element: `.navbar__link`
- Modifier: `.navbar__link--active`

---

### Member 3: The Auth Context Lead

**Responsibility:** Build the `AuthContext` and `AuthProvider` that manage the logged-in user's state, role, and token across the entire application.

**Your Deliverables:**

1. `src/context/AuthContext.js`
2. `src/hooks/useAuth.js`

---

**A Deep Dive into React Context:**

Context solves the problem of **prop drilling** — passing data through component levels that don't need it just to reach a deeply nested component that does.

```
Without Context (Prop Drilling):
App → Layout → Navbar → UserMenu → Avatar
                                     ↑
                          "user" prop passed through 4 levels

With Context:
App (Provider) → ... → Avatar (Consumer reads directly from context)
```

The Context API has three parts:

1. **`createContext()`** — Creates the context object. Think of it as creating a "channel".
2. **`Provider`** — A component that wraps a subtree and "broadcasts" a value on the channel.
3. **`useContext()`** — The hook that lets any component "tune into" the channel and read its value.

---

**The Full Implementation:**

```javascript
// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from "react";

/*
  Step 1: Create the context object.

  The argument to createContext() is the DEFAULT value — used only when a component
  tries to read the context but is NOT wrapped inside a Provider.
  We pass `null` here and handle this case in useAuth.js (throws an error).

  Do NOT put real data here. Real data goes in the Provider's `value` prop.
*/
export const AuthContext = createContext(null);

/*
  The four roles as defined in our Django backend's CustomUser model.
  Keeping them as constants prevents typos like "student" vs "Student".
  Always use these constants instead of raw strings.
*/
export const USER_ROLES = {
  STUDENT: "student",
  WORKPLACE_SUPERVISOR: "workplace_supervisor",
  ACADEMIC_SUPERVISOR: "academic_supervisor",
  ADMIN: "internship_admin",
};

/*
  Step 2: Build the AuthProvider component.

  This is a regular React component that renders {children} (whatever is wrapped
  inside it in App.js) with the context value available to all descendants.
*/
export function AuthProvider({ children }) {
  // `user` holds the full user object from the backend:
  // { id, username, email, first_name, last_name, role, phone_number }
  const [user, setUser] = useState(null);

  // `isLoading` is true while we are checking localStorage for a saved session.
  // This prevents the app from briefly showing the "not authenticated" state
  // before it has had a chance to check if a token was saved.
  const [isLoading, setIsLoading] = useState(true);

  /*
    On app startup (when AuthProvider first mounts), check if the user was
    previously logged in by looking for a saved token and user data in localStorage.

    This is how "Stay logged in" features work.
    The token is saved at login and read here on refresh.
  */
  useEffect(() => {
    const storedToken = localStorage.getItem("iles_auth_token");
    const storedUser = localStorage.getItem("iles_user");

    if (storedToken && storedUser) {
      try {
        // Parse the JSON string back to an object.
        // Wrap in try/catch — if storedUser is corrupted JSON, don't crash.
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        // Data is corrupted. Clear it and force re-login.
        console.error("Failed to parse stored user data. Clearing session.");
        localStorage.removeItem("iles_auth_token");
        localStorage.removeItem("iles_user");
      }
    }

    // Whether we found a session or not, we are done loading.
    setIsLoading(false);
  }, []); // Empty array: run once on mount

  /*
    login() is called by LoginForm after a successful API call.
    It receives the user object and token returned by the Django backend.

    useCallback ensures this function reference is stable between re-renders.
    Without it, any component using `login` would re-render every time
    AuthProvider re-renders, even if login itself hasn't changed.
  */
  const login = useCallback(({ user: userData, token }) => {
    // Save to localStorage so the session persists across browser refreshes.
    localStorage.setItem("iles_auth_token", token);
    localStorage.setItem("iles_user", JSON.stringify(userData));

    // Update state — this triggers a re-render of all Context consumers.
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    // Clear persistent storage
    localStorage.removeItem("iles_auth_token");
    localStorage.removeItem("iles_user");

    // Clear state — components consuming AuthContext will re-render
    // and see `user: null`, causing ProtectedRoute to redirect to /login.
    setUser(null);
  }, []);

  /*
    Convenience getter: derive `isAuthenticated` from `user`.
    A user is authenticated if and only if `user` is not null.
    This prevents bugs from having a separate boolean that could get out of sync.
  */
  const isAuthenticated = user !== null;

  /*
    Step 3: The value object is what every consumer (useContext) will receive.
    Shape it clearly and document it — your team depends on this contract.
  */
  const contextValue = {
    user,              // Full user object | null
    isAuthenticated,   // boolean
    isLoading,         // boolean — true during initial session check
    login,             // function({ user, token }) => void
    logout,            // function() => void
  };

  /*
    Step 4: Wrap children with the Provider.
    All components nested inside AuthProvider can now read `contextValue`.
  */
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
```

```javascript
// src/hooks/useAuth.js
// A thin wrapper around useContext(AuthContext).
// This is the ONLY way team members should access auth state.

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);

  /*
    This guard is critical for debugging.
    If a developer forgets to wrap their component tree with AuthProvider,
    they get a clear error message instead of a mysterious "cannot read
    property of null" error.
  */
  if (context === null) {
    throw new Error(
      "useAuth() was called outside of <AuthProvider>. " +
      "Make sure <AuthProvider> wraps your component in App.js."
    );
  }

  return context;
}
```

**How to Use Auth in Any Component:**

```jsx
// Anywhere in the component tree:
import { useAuth } from "../../hooks/useAuth";
import { USER_ROLES } from "../../context/AuthContext";

function SomeComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div>
      <p>Welcome, {user.first_name}!</p>

      {/* Show content conditionally based on role */}
      {user.role === USER_ROLES.STUDENT && (
        <p>You are a student intern.</p>
      )}

      {(user.role === USER_ROLES.WORKPLACE_SUPERVISOR ||
        user.role === USER_ROLES.ACADEMIC_SUPERVISOR) && (
        <p>You are a supervisor.</p>
      )}

      {user.role === USER_ROLES.ADMIN && (
        <p>You are an administrator.</p>
      )}
    </div>
  );
}
```

---

### Member 4: The Logic & Form Specialist

**Responsibility:** Build `LoginForm.jsx` with full password validation, and introduce the concept of Controlled Components.

**Your Deliverables:**

1. `src/components/auth/LoginForm.jsx`
2. `src/components/auth/LoginForm.css`

---

**What is a Controlled Component?**

In plain HTML, a `<textarea>` element maintains its own internal state — the browser tracks what the user has typed. In React, we make form inputs **controlled**: React state *is* the single source of truth for the input's value. The input only shows what React tells it to show.

```
Uncontrolled (avoid):    User types → input's DOM value updates → you read it later
Controlled (use):        User types → onChange fires → setX() updates state → React re-renders → input displays new state
```

The benefit: you always know the current value of every field. Validation is instant (per keystroke), and you can programmatically clear or pre-fill fields.

---

**Full LoginForm Implementation:**

```jsx
// src/components/auth/LoginForm.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { loginUser } from "../../services/api";
import { USER_ROLES } from "../../context/AuthContext";
import "./LoginForm.css";

/*
  Password Validation Rules (from ILES requirements):
  - 8–16 characters
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one digit (0-9)
  - At least one special character from: !@#$%^&*()_+-=[]{}|;':",.<>?/`~
*/
const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 16,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasDigit: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*()\-_=+\[\]{}|;:'",.<>?/`~]/,
};

/*
  validatePassword() returns an object mapping each rule name to
  whether the current password satisfies it.
  This drives both the error display AND the submit button's disabled state.
*/
function validatePassword(password) {
  return {
    minLength: password.length >= PASSWORD_RULES.minLength,
    maxLength: password.length <= PASSWORD_RULES.maxLength,
    hasUppercase: PASSWORD_RULES.hasUppercase.test(password),
    hasLowercase: PASSWORD_RULES.hasLowercase.test(password),
    hasDigit: PASSWORD_RULES.hasDigit.test(password),
    hasSpecialChar: PASSWORD_RULES.hasSpecialChar.test(password),
  };
}

function isPasswordValid(validationResult) {
  // Returns true only if EVERY rule passes
  return Object.values(validationResult).every(Boolean);
}

// Maps the backend user role to the correct dashboard route
function getDashboardRoute(role) {
  const routeMap = {
    [USER_ROLES.STUDENT]: "/student/dashboard",
    [USER_ROLES.WORKPLACE_SUPERVISOR]: "/supervisor/dashboard",
    [USER_ROLES.ACADEMIC_SUPERVISOR]: "/supervisor/dashboard",
    [USER_ROLES.ADMIN]: "/admin",
  };
  return routeMap[role] ?? "/"; // Fall back to home if role is unknown
}

function LoginForm() {
  // Form field state — each input is "controlled"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(""); // Error from the backend
  const [showPasswordHints, setShowPasswordHints] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Recompute validation on every render — no useEffect needed,
  // because it's a pure function of the `password` state value.
  const passwordValidation = validatePassword(password);
  const passwordIsValid = isPasswordValid(passwordValidation);
  const formIsValid = username.trim().length > 0 && passwordIsValid;

  function handleUsernameChange(event) {
    setUsername(event.target.value);
    // Clear API error when user starts typing again
    if (apiError) setApiError("");
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    if (apiError) setApiError("");
  }

  async function handleSubmit(event) {
    /*
      event.preventDefault() stops the browser's default form submission
      behaviour (which would cause a full page reload — the opposite of
      what we want in a Single Page Application).
    */
    event.preventDefault();

    if (!formIsValid || isSubmitting) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      /*
        loginUser() is an async function in services/api.js.
        It POSTs to our Django backend and returns { user, token } on success.
        See Member 5's work for the implementation.
      */
      const { user: userData, token } = await loginUser({
        username: username.trim(),
        password,
      });

      /*
        On success:
        1. Store the user and token in AuthContext (and localStorage)
        2. Navigate to the correct dashboard based on their role
      */
      login({ user: userData, token });
      navigate(getDashboardRoute(userData.role));

    } catch (error) {
      /*
        On failure, display the error to the user.
        We do NOT log out or clear the form — the user should be able to try again.
      */
      setApiError(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      /*
        The `finally` block ALWAYS runs, whether the try succeeded or failed.
        This ensures the button is re-enabled even if an error occurs.
      */
      setIsSubmitting(false);
    }
  }

  return (
    /*
      `noValidate` disables the browser's built-in HTML5 validation bubbles.
      We handle all validation in JavaScript for full control over styling and messages.
    */
    <form
      className="login-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Sign in to ILES"
    >
      <h2 className="login-form__title">Sign In</h2>

      {/* Display API errors prominently */}
      {apiError && (
        <div className="login-form__api-error" role="alert" aria-live="assertive">
          {apiError}
        </div>
      )}

      {/* Username Field */}
      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          id="username"
          type="text"
          className="form-input"
          value={username}             /* Controlled: value comes from state */
          onChange={handleUsernameChange} /* Updates state on every keystroke */
          autoComplete="username"
          autoFocus
          required
          aria-required="true"
          disabled={isSubmitting}
          placeholder="Enter your university username"
        />
      </div>

      {/* Password Field */}
      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="password-input-wrapper">
          <input
            id="password"
            /* Toggle between "text" and "password" type for show/hide feature */
            type={showPassword ? "text" : "password"}
            className="form-input"
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => setShowPasswordHints(true)}
            autoComplete="current-password"
            required
            aria-required="true"
            disabled={isSubmitting}
            aria-describedby="password-requirements"
            minLength={PASSWORD_RULES.minLength}
            maxLength={PASSWORD_RULES.maxLength}
          />
          <button
            type="button" /* IMPORTANT: type="button" prevents form submission */
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Password Strength Checklist — shown when the field is focused */}
        {showPasswordHints && (
          <ul
            id="password-requirements"
            className="password-requirements"
            aria-label="Password requirements"
          >
            <PasswordRule
              satisfied={passwordValidation.minLength && passwordValidation.maxLength}
              label="8–16 characters"
            />
            <PasswordRule
              satisfied={passwordValidation.hasUppercase}
              label="At least one uppercase letter (A-Z)"
            />
            <PasswordRule
              satisfied={passwordValidation.hasLowercase}
              label="At least one lowercase letter (a-z)"
            />
            <PasswordRule
              satisfied={passwordValidation.hasDigit}
              label="At least one number (0-9)"
            />
            <PasswordRule
              satisfied={passwordValidation.hasSpecialChar}
              label="At least one special character (!@#$%...)"
            />
          </ul>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn--primary btn--full-width"
        /*
          Disabled when:
          - The form has invalid data (missing username or invalid password)
          - A request is already in flight (prevents double-submission)
        */
        disabled={!formIsValid || isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

/* Small helper component for the password requirements list */
function PasswordRule({ satisfied, label }) {
  return (
    <li
      className={`password-rule ${satisfied ? "password-rule--satisfied" : ""}`}
      aria-label={`${label}: ${satisfied ? "met" : "not met"}`}
    >
      <span className="password-rule__icon" aria-hidden="true">
        {satisfied ? "✓" : "○"}
      </span>
      {label}
    </li>
  );
}

export default LoginForm;
```

```css
/* src/components/auth/LoginForm.css */

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: var(--space-8);
  background-color: #ffffff;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login-form__title {
  text-align: center;
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.login-form__api-error {
  padding: var(--space-3) var(--space-4);
  background-color: #fff5f5;
  border: 1px solid var(--color-danger);
  border-left: 4px solid var(--color-danger);
  border-radius: var(--radius-sm);
  color: var(--color-danger);
  font-size: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #495057;
}

.form-input {
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid #dee2e6;
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(26, 82, 118, 0.15);
}

.form-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .form-input {
  padding-right: 80px; /* Space for the "Show/Hide" button */
}

.password-toggle {
  position: absolute;
  right: var(--space-3);
  background: transparent;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  padding: var(--space-1) var(--space-2);
}

/* Password Requirements Checklist */
.password-requirements {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  background-color: #f8f9fa;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: #6c757d;
}

.password-rule {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: color 0.2s ease;
}

.password-rule--satisfied {
  color: var(--color-success);
}

.password-rule__icon {
  font-size: 1rem;
  width: 1.2em;
  text-align: center;
}

/* Button Styles (reusable — also used in other forms) */
.btn {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.btn--primary {
  background-color: var(--color-primary);
  color: #ffffff;
}

.btn--primary:hover:not(:disabled) {
  background-color: #154360; /* Darken on hover */
}

.btn--full-width {
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

### Member 5: The API & Environment Lead

**Responsibility:** Create `api.js` as the single gateway between the React frontend and the Django backend. Configure environment variables. Never let API calls leak into components.

**Your Deliverables:**

1. `src/services/api.js`
2. `.env` (in project root)
3. `.env.example` (committed to git as documentation)

---

**Why API Calls MUST Live in `/services/api.js`:**

Imagine you have `fetch("http://localhost:8000/api/logs/")` written in three different components. Then your Django URL changes to `http://localhost:8000/api/v2/logs/`. You now have to find and update three different files.

With a service layer:

- The URL lives in **one place** — change it once, everything works.
- Components don't know *how* the data is fetched — they only know *what* they want.
- You can replace `fetch` with `axios` (or a GraphQL client) without touching any component.
- You can write unit tests for API logic independently of component logic.

---

**Step 1: Environment Variables**

```bash
# .env (in the project ROOT — same level as package.json)
# NEVER commit this file to git. Add it to .gitignore.
# CRA requires all environment variables to start with REACT_APP_

REACT_APP_API_BASE_URL=http://localhost:8000/api
```

```bash
# .env.example (COMMIT this file — it's the documentation)
# Copy this file to .env and fill in the values for your environment.

REACT_APP_API_BASE_URL=http://localhost:8000/api
```

```
# .gitignore (add .env to this file)
# ... existing contents ...
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

**Step 2: Build `api.js` — The API Service Layer**

```javascript
// src/services/api.js
// This module is the ONLY place in the codebase that communicates with the backend.
// All other files import from here — never write `fetch()` in a component.

/*
  Read the API base URL from the environment variable.
  In development: http://localhost:8000/api
  In production: https://iles.mak.ac.ug/api (whatever your deployment URL is)

  process.env.REACT_APP_API_BASE_URL is injected by CRA at build time.
  It is a string, or `undefined` if the variable was not set.
*/
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!BASE_URL) {
  // Fail loudly during development if the env variable is missing.
  // Better to crash early with a clear message than to silently make
  // requests to `undefined/api/login`.
  console.error(
    "REACT_APP_API_BASE_URL is not set. " +
    "Create a .env file in the project root. See .env.example."
  );
}

/*
  getAuthToken() reads the stored JWT token from localStorage.
  Returns the token string, or null if not logged in.

  This is a private helper — not exported. Only `apiFetch` uses it.
*/
function getAuthToken() {
  return localStorage.getItem("iles_auth_token");
}

/*
  apiFetch() is our internal wrapper around the native `fetch` API.
  It handles:
  1. Prepending the BASE_URL to every path.
  2. Setting default headers (Content-Type, Authorization).
  3. Throwing meaningful errors for non-OK responses.
  4. Parsing JSON response bodies.

  Every public function in this module (loginUser, getLogs, etc.)
  calls apiFetch() instead of fetch() directly.
*/
async function apiFetch(path, options = {}) {
  const token = getAuthToken();

  // Build the default headers object.
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // If a token exists, add the Authorization header.
  // Django REST Framework expects: "Authorization: Bearer <token>"
  // or "Authorization: Token <token>" depending on your auth backend.
  // Match this to your Django config.
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options, // Spread any options passed in (method, body, etc.)
    headers: {
      ...defaultHeaders,
      ...options.headers, // Allow callers to override specific headers
    },
  };

  const response = await fetch(`${BASE_URL}${path}`, config);

  /*
    fetch() only throws (rejects) for network errors (no internet, DNS failure).
    For HTTP error codes (400, 401, 403, 404, 500), fetch() resolves — it does
    NOT throw. We must check response.ok manually.
  */
  if (!response.ok) {
    let errorMessage;

    try {
      // Try to parse the error body as JSON.
      // Django REST Framework returns structured errors like:
      // { "detail": "No active account found with the given credentials" }
      // { "username": ["This field is required."] }
      const errorBody = await response.json();

      if (errorBody.detail) {
        errorMessage = errorBody.detail;
      } else {
        // For field-level validation errors, join them into one string
        errorMessage = Object.values(errorBody).flat().join(" ");
      }
    } catch {
      // Response body is not JSON — use the HTTP status text
      errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    }

    // Create a proper Error object with the message.
    // LoginForm's catch block will receive this error.
    const error = new Error(errorMessage);
    error.status = response.status; // Attach the status code for specific handling
    throw error;
  }

  // Handle 204 No Content responses (e.g., logout, delete endpoints)
  if (response.status === 204) {
    return null;
  }

  // Parse and return the JSON body for successful responses
  return response.json();
}

/* ============================================================
   AUTH ENDPOINTS
   Correspond to Django: users/auth/ URLs
   ============================================================ */

/*
  loginUser() — POST to the token endpoint.

  Expected response from Django:
  {
    "token": "eyJhbGciOiJ...",
    "user": {
      "id": 1,
      "username": "john.doe",
      "email": "john.doe@stu.mak.ac.ug",
      "first_name": "John",
      "last_name": "Doe",
      "role": "student",
      "phone_number": "+256700000000"
    }
  }
*/
export async function loginUser({ username, password }) {
  return apiFetch("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logoutUser() {
  // Blacklist the token on the server (if using token blacklisting)
  return apiFetch("/auth/logout/", { method: "POST" });
}

export async function getUserProfile() {
  return apiFetch("/auth/profile/");
}

/* ============================================================
   LOGBOOK ENDPOINTS
   Correspond to Django: logbook/ URLs
   ============================================================ */

export async function getLogs() {
  // GET /api/logs/ — returns all logs for the authenticated student
  return apiFetch("/logbook/");
}

export async function getLogById(logId) {
  return apiFetch(`/logbook/${logId}/`);
}

export async function createLog(logData) {
  /*
    logData shape: {
      week_number: 1,
      start_date: "2025-01-06",
      end_date: "2025-01-12",
      activities: "Attended orientation meeting...",
      placement: 3
    }
  */
  return apiFetch("/logbook/", {
    method: "POST",
    body: JSON.stringify(logData),
  });
}

export async function updateLog(logId, logData) {
  // PATCH updates only the provided fields (partial update)
  return apiFetch(`/logbook/${logId}/`, {
    method: "PATCH",
    body: JSON.stringify(logData),
  });
}

export async function submitLog(logId) {
  // Custom action endpoint: transitions status from DRAFT → PENDING
  return apiFetch(`/logbook/${logId}/submit/`, {
    method: "POST",
  });
}

/* ============================================================
   EVALUATION ENDPOINTS
   Correspond to Django: evaluation/ URLs
   ============================================================ */

export async function getEvaluationCriteria() {
  return apiFetch("/evaluation/criteria/");
}

export async function submitEvaluation(placementId, evaluationData) {
  return apiFetch(`/evaluation/`, {
    method: "POST",
    body: JSON.stringify({ placement: placementId, ...evaluationData }),
  });
}

/* ============================================================
   PLACEMENT ENDPOINTS
   ============================================================ */

export async function getMyPlacement() {
  return apiFetch("/placements/my-placement/");
}
```

**Step 3: How to Use the API Service in a Component**

```jsx
// Example: src/pages/LogbookPage.jsx
import React, { useState, useEffect } from "react";
import { getLogs, submitLog } from "../services/api";

function LogbookPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // The component doesn't know or care HOW data is fetched.
    // It just asks the service for it.
    getLogs()
      .then(setLogs)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmitLog(logId) {
    try {
      await submitLog(logId);
      // Refresh the logs to show updated status
      const updatedLogs = await getLogs();
      setLogs(updatedLogs);
    } catch (err) {
      setError(err.message);
    }
  }

  if (isLoading) return <p>Loading logbook...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h1>My Logbook</h1>
      {logs.map(log => (
        <div key={log.id}>
          <h3>Week {log.week_number}</h3>
          <p>Status: {log.status}</p>
          {log.status === "draft" && (
            <button onClick={() => handleSubmitLog(log.id)}>
              Submit for Review
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default LogbookPage;
```

---

## Section 4: The ILES Workflow Cheat-Sheet

### 4.1 Workflow States as a JavaScript Object (Enum Pattern)

JavaScript doesn't have native enums (TypeScript does), but we simulate them using `Object.freeze()`, which prevents accidental mutation.

```javascript
// src/utils/logbookStatus.js

/*
  LOGBOOK_STATUS mirrors the STATUS choices in the Django Logbook model:
  STATUS = [
    ('draft', 'Draft'),
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('reviewed', 'Reviewed'),
    ('submitted', 'Submitted'),
  ]

  Object.freeze() makes this object immutable.
  Attempting to set LOGBOOK_STATUS.DRAFT = "something_else" silently fails
  in non-strict mode, and throws a TypeError in strict mode.
  This catches typo-bugs at the source.
*/
export const LOGBOOK_STATUS = Object.freeze({
  DRAFT: "draft",
  PENDING: "pending",
  SUBMITTED: "submitted",
  REVIEWED: "reviewed",
  APPROVED: "approved",
});

/*
  STATUS_TRANSITIONS defines the valid state machine for a logbook entry.
  Key: current status
  Value: array of statuses this entry CAN transition to

  This is a mirror of your business logic. If the backend enforces these rules,
  the frontend should reflect them visually — don't show a "Submit" button
  on an already-approved log.
*/
export const STATUS_TRANSITIONS = Object.freeze({
  [LOGBOOK_STATUS.DRAFT]: [LOGBOOK_STATUS.PENDING],
  [LOGBOOK_STATUS.PENDING]: [LOGBOOK_STATUS.REVIEWED],
  [LOGBOOK_STATUS.REVIEWED]: [LOGBOOK_STATUS.APPROVED, LOGBOOK_STATUS.DRAFT],
  [LOGBOOK_STATUS.APPROVED]: [], // Terminal state — no further transitions
  [LOGBOOK_STATUS.SUBMITTED]: [], // Alternative terminal state
});

/*
  STATUS_DISPLAY maps backend values to human-readable labels.
  Use this in the UI instead of displaying raw backend strings.
*/
export const STATUS_DISPLAY = Object.freeze({
  [LOGBOOK_STATUS.DRAFT]: "Draft",
  [LOGBOOK_STATUS.PENDING]: "Pending Review",
  [LOGBOOK_STATUS.SUBMITTED]: "Submitted",
  [LOGBOOK_STATUS.REVIEWED]: "Reviewed",
  [LOGBOOK_STATUS.APPROVED]: "Approved",
});

/*
  STATUS_COLOR maps each status to its CSS variable name.
  Keeps colour decisions centralised — change the variable in base.css,
  everything updates automatically.
*/
export const STATUS_COLOR = Object.freeze({
  [LOGBOOK_STATUS.DRAFT]: "var(--status-draft)",
  [LOGBOOK_STATUS.PENDING]: "var(--status-pending)",
  [LOGBOOK_STATUS.SUBMITTED]: "var(--status-submitted)",
  [LOGBOOK_STATUS.REVIEWED]: "var(--status-reviewed)",
  [LOGBOOK_STATUS.APPROVED]: "var(--status-approved)",
});

/*
  Helper: Can an action button be shown?

  canTransitionTo("draft", "pending") → true
  canTransitionTo("approved", "draft") → false
*/
export function canTransitionTo(currentStatus, targetStatus) {
  const validNextStatuses = STATUS_TRANSITIONS[currentStatus] ?? [];
  return validNextStatuses.includes(targetStatus);
}
```

**Usage in a Component:**

```jsx
import { LOGBOOK_STATUS, STATUS_DISPLAY, STATUS_COLOR, canTransitionTo } from "../../utils/logbookStatus";

function WeeklyLogCard({ log, onSubmit, onApprove }) {
  return (
    <div className="log-card">
      <h3>Week {log.week_number}</h3>

      {/* Display human-readable status with colour */}
      <span
        className="status-badge"
        style={{ backgroundColor: STATUS_COLOR[log.status] }}
      >
        {STATUS_DISPLAY[log.status]}
      </span>

      {/* Only show "Submit" button if this log CAN transition to PENDING */}
      {canTransitionTo(log.status, LOGBOOK_STATUS.PENDING) && (
        <button onClick={() => onSubmit(log.id)}>
          Submit for Review
        </button>
      )}

      {/* Only show "Approve" button if this log CAN transition to APPROVED */}
      {canTransitionTo(log.status, LOGBOOK_STATUS.APPROVED) && (
        <button onClick={() => onApprove(log.id)}>
          Approve Log
        </button>
      )}
    </div>
  );
}
```

---

## The Git & PR Workflow

This workflow is as important as your code. The panel will look at your commit history. A clean, well-labelled history is evidence of professional engineering practice.

### The Branch Strategy

```
main          ← Production-ready code only. NEVER commit directly here.
└── develop   ← Integration branch. All features merge here first.
      ├── feature/routing-setup         (Member 1)
      ├── feature/layout-and-styles     (Member 2)
      ├── feature/auth-context          (Member 3)
      ├── feature/login-form            (Member 4)
      └── feature/api-service           (Member 5)
```

### Step-by-Step Git Workflow

**One-time setup (done by Member 1 — the Routing Architect):**

```bash
# 1. Clone the repository
git clone https://github.com/your-org/iles-frontend.git
cd iles-frontend

# 2. Create and push the develop branch
git checkout -b develop
git push -u origin develop

# 3. Create your own feature branch from develop
git checkout -b feature/routing-setup
git push -u origin feature/routing-setup
```

**Every other member (after the repo exists):**

```bash
# 1. Clone the repository
git clone https://github.com/your-org/iles-frontend.git
cd iles-frontend

# 2. Check out develop (the integration branch)
git checkout develop

# 3. Create YOUR feature branch from develop
# Replace "your-feature" with a descriptive name
git checkout -b feature/layout-and-styles
git push -u origin feature/layout-and-styles
```

**Daily Development Cycle:**

```bash
# Morning: Sync your branch with the latest develop changes
git checkout develop
git pull origin develop          # Get any updates merged by teammates
git checkout feature/your-feature
git merge develop                # Bring those updates into your branch
# Resolve any conflicts, then:
git add .
git commit -m "chore: merge develop into feature/your-feature"

# Work, work, work...

# After each meaningful unit of work, commit:
git add src/components/layout/Navbar.jsx
git add src/components/layout/Navbar.css
git commit -m "feat: build role-aware Navbar component

- Implements different nav links for all 4 user roles
- Role-to-links mapping object for easy extensibility
- WCAG 2.1 compliant with aria-labels and keyboard focus states
- Sticky positioning with z-index stacking context"

# Push to remote regularly (don't lose your work)
git push origin feature/your-feature
```

### Commit Message Convention (Conventional Commits)

This is the industry standard. Your panel will be impressed if you use it.

```
<type>(<optional scope>): <short description>

<optional longer description>
```

| Type       | When to Use                                                  |
| ---------- | ------------------------------------------------------------ |
| `feat`     | A new feature (new component, new API endpoint connection)   |
| `fix`      | A bug fix                                                    |
| `style`    | CSS changes, formatting (no logic change)                    |
| `refactor` | Code restructuring with no behaviour change                  |
| `chore`    | Maintenance tasks (updating dependencies, configuring tools) |
| `docs`     | Documentation changes (README, comments)                     |
| `test`     | Adding or updating tests                                     |

**Examples:**

```bash
git commit -m "feat(auth): implement AuthContext with localStorage persistence"
git commit -m "feat(form): add real-time password strength validation"
git commit -m "fix(routing): ProtectedRoute now handles isLoading state"
git commit -m "style(navbar): increase contrast on active link state"
git commit -m "chore: add .env.example with required environment variables"
git commit -m "refactor(api): extract apiFetch helper to remove duplication"
```

### Opening a Pull Request (PR)

When your feature is complete:

```bash
# 1. Make sure your branch is fully up to date with develop
git checkout develop
git pull origin develop
git checkout feature/your-feature
git merge develop
# Resolve conflicts if any
git push origin feature/your-feature
```

**On GitHub:**

1. Go to the repository → `Pull requests` → `New pull request`
2. Set **base**: `develop`, **compare**: `feature/your-feature`
3. Write a PR description using this template:

```markdown
## What does this PR do?
Implements the role-aware Navbar component with CSS and the Layout wrapper.

## Changes Made
- `src/components/layout/Layout.jsx` — Layout shell with Outlet
- `src/components/layout/Navbar.jsx` — Navbar reads role from AuthContext
- `src/components/layout/Layout.css` — Flexbox layout structure
- `src/components/layout/Navbar.css` — Styling with CSS variables from base.css

## How to Test
1. Run `npm start`
2. Log in as a student → verify only student nav links appear
3. Log in as a supervisor → verify supervisor links appear
4. Resize to mobile (<768px) → verify layout remains usable

## Screenshots
[Attach screenshots of the Navbar for each role]

## Checklist
- [x] Code follows our BEM CSS naming convention
- [x] No raw `fetch()` calls in components
- [x] All colours use CSS variables from base.css
- [x] Tested in Chrome and Firefox
```

4. Request a review from **at least one other team member**
5. The reviewer leaves comments → author fixes and pushes → reviewer approves
6. Merge using **"Squash and merge"** — this keeps the `develop` history clean.

### Resolving Merge Conflicts

```bash
# When git merge develop results in a conflict:
# 1. Open the conflicting file — you'll see markers like:
<<<<<<< HEAD (your changes)
const navLinks = ["Dashboard", "Logbook"];
=======
const navLinks = ["Home", "Dashboard", "Logbook"]; 
>>>>>>> develop (changes from develop)

# 2. Manually edit the file to keep the correct version (or combine both)
const navLinks = ["Home", "Dashboard", "Logbook"]; # The correct merged version

# 3. Remove all conflict markers (<<<<<<<, =======, >>>>>>>)
# 4. Stage and commit
git add src/components/layout/Navbar.jsx
git commit -m "chore: resolve merge conflict in Navbar nav links"
```

### The Final Merge to Main (Before the Defense)

```bash
# Only done by the team lead, after all features are merged to develop
# and everything has been tested end-to-end.
git checkout main
git merge develop
git tag -a "v1.0.0-defense" -m "Version submitted for Week 12 Technical Defense"
git push origin main --tags
```

---

## Summary — What Each Member Must Know for the Defense

| Member | Key Concept to Defend                                                                                                                                                                                            |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | How `BrowserRouter` uses `window.history.pushState()` to change the URL without a reload. Why `ProtectedRoute` uses `<Outlet />`. What happens if the user visits a protected URL directly (without logging in). |
| 2      | The CSS Cascade and specificity. Why component-level CSS can override base.css. What `position: sticky` does and why we chose it for the Navbar. What `<Outlet />` in Layout does.                               |
| 3      | The difference between `createContext`, `Provider`, and `useContext`. Why auth state in `localStorage` persists across refreshes. What happens if `AuthProvider` is missing from the tree (`useAuth` throws).    |
| 4      | What a Controlled Component is and why we use `noValidate`. Why we use `async/await` in `handleSubmit`. What `event.preventDefault()` does. What `finally` does in try/catch/finally.                            |
| 5      | Why `fetch()` resolves on HTTP 400/500 (it doesn't throw). What `BASE_URL` is and why it comes from an env variable. What the `Authorization: Bearer` header does. Why all API functions are in one file.        |

---

*Document prepared for Makerere University Computer Science — ILES Project Team · 2025*
*Version 1.0 — Week 12 Technical Defense Edition*
