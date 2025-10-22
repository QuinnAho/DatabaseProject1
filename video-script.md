# Video Demonstration Script - Database Project 1
**Target Duration:** 30 minutes  
**Format:** Bullet-led walkthrough with live demo followed by code explanation.

---

## Section 1 - Implementation Walkthrough (Frontend Experience & Live Demo)
- **Opening (~2 min)**
  - Greet the viewer and introduce the user-management system built with Node.js, Express, MySQL, and vanilla JavaScript.
  - Preview that every required feature, the SQL powering it, and the polished user experience will be demonstrated end to end.
- **Environment & Setup (~3 min)**
  - Show the project tree: `Frontend/`, `Backend/`, `schema.sql`, `sql.txt`, `.env template`.
  - Point out the XAMPP control panel with Apache and MySQL running, and confirm the `web_app` database in phpMyAdmin.
  - Highlight `.env` variables (PORT=5050, DB credentials, HOST=localhost) and mention launching the server with `npm run dev`.
  - Display the browser connected to the local frontend (e.g., `http://localhost:5050`).
- **Modern UI Overview (~2 min)**
  - Highlight the minimalist palette (primary blues, neutral grays), ample whitespace, and Inter typography.
  - Show subtle motion cues: panels lift slightly, buttons deepen in color, inputs gain a slim focus halo, table rows tint softly.
  - Point out the persistent results banner that stays live between actions and gently fades when updated.
  - Note responsive layout behavior and visible focus indicators for accessibility.
- **Live Feature Demos (~15 min total)**
  - **1. User Registration**
    - Register `alice` (salary 75000, age 28), confirm success message and table update.
    - Add `bob`, `charlie`, and `diana`; verify records in phpMyAdmin with hashed passwords and registerday timestamps.
  - **2. Secure Sign-In**
    - Sign in as `alice`; show updated `signintime`.
    - Demonstrate error handling with a wrong password and a non-existent username.
  - **3. Search by First/Last Name**
    - Filter for `Alice Smith`, then try partial inputs (for example `Sm`) and explain wildcard behavior.
  - **4. Search by Username**
    - Retrieve `charlie` directly; mention index support for fast lookup.
  - **5. Salary Range Query**
    - Filter between 60000 and 90000; optionally display backend logs or `sql.txt` for the matching query.
  - **6. Age Range Query**
    - Filter ages 25 to 35; note that the UI keeps previously applied filters.
  - **7. Registered After Another User**
    - Choose `alice` as the reference; confirm later registrations and cross-check timestamps in phpMyAdmin.
  - **8. Never Signed In**
    - Use the dedicated button; highlight rows with `signintime` set to NULL.
  - **9. Registered Same Day as Another User**
    - Select `bob` and show users sharing the same registerday.
  - **10. Registered Today**
    - Trigger the "Registered Today" action; if empty, create a fresh test user to demonstrate the query.
  - For each feature, briefly reveal the corresponding SQL snippet in `sql.txt` and mention prepared statement placeholders.
- **Messaging & Validation (~2 min)**
  - Trigger a client-side validation warning (for example, missing salary) and show the message styling.
  - Attempt a duplicate username to display backend validation errors in the UI.
  - Highlight that status feedback appears beside each form while the results panel maintains a steady confirmation message.
- **Wrap-Up of Live Demo (~1 min)**
  - Summarize that all UI flows, visual states, and database updates were covered.
  - Transition to the in-depth code and architecture explanation.

---

## Section 2 - Code, Architecture, and Supporting Details
- **Backend Structure (~4 min)**
  - Walk through `Backend/server.js`, focusing on Express routes for registration, authentication, and search features.
  - Explain the database helper that wraps MySQL with prepared statements and async/await.
  - Highlight centralized error handling and consistent JSON responses.
- **Security Practices (~3 min)**
  - Review bcrypt hashing on registration and verification on sign-in.
  - Emphasize parameterized queries (`?` placeholders) and `multipleStatements: false` to block SQL injection.
  - Mention layered validation (frontend checks plus backend enforcement).
- **SQL Documentation (~3 min)**
  - Open `sql.txt` and map each demo feature to its documented query.
  - Discuss indexing strategy: primary key on `username`, composite index on `(firstname, lastname)`, individual indexes on `registerday`, `signintime`, `salary`, and `age`.
  - Justify data types (DECIMAL for salary, DATETIME for timestamps).
- **Frontend Code Highlights (~4 min)**
  - Show `Frontend/index.js` functions for fetch calls, rendering results, and handling form state.
  - Explain the local data array, filter logic, and UI updates.
  - Review `stylesheet.css`: CSS variables for theming, reduced-motion interactions, responsive grid, accessible focus styling.
- **Testing & Verification (~2 min)**
  - Mention manual test coverage: invalid credentials, boundary values for ranges, no-result scenarios.
  - Suggest future automated tests (Supertest for API, Playwright for end-to-end).
- **Best Practices Recap (~3 min)**
  - Separation of concerns between routes, services, and SQL utilities.
  - Consistent async/await usage for readability and error handling.
  - Environment configuration managed through `.env` and dotenv.
  - Logging balanced between visibility and security.
- **Performance & Scalability Notes (~2 min)**
  - Discuss the impact of indexes and returning only required columns.
  - Suggest moving to a MySQL connection pool and adding pagination for large datasets.
- **Future Enhancements (~2 min)**
  - Session or token-based authentication, rate limiting, enhanced sanitization, automated testing, richer reporting.
- **Recording Logistics & Checklist (~4 min)**
  - Pre-record: reset database, seed demo users, double-check routes, close distractions, adjust browser zoom (125-150 percent), test microphone.
  - Screen layout: split view (browser plus editor) or full-screen browser with quick switches to code and phpMyAdmin.
  - During recording: narrate what and why, zoom on key code blocks, pause between sections, maintain a steady pace.
  - Time guide: Intro 2, Setup 4, Demo 15, Security 4, Code deep dive 6, DB verification 3, Best practices 3, Conclusion 2.
- **Closing Script (~2 min)**
  - Confirm that all ten query requirements and documentation were satisfied.
  - Thank the viewer, invite questions, and mention readiness for future enhancements.

---

- **Quick Reference Checklist**
  - Ten feature queries demonstrated live and cross-verified in phpMyAdmin.
  - UI behaviors (hover, focus, responsive layout) showcased alongside feature workflows.
  - Code explanations reference exact files: backend routes, SQL helpers, frontend logic, stylesheet.
  - Security, performance, and UX best practices explicitly highlighted.
  - Recording plan prepared to keep the presentation within the 30-minute target.
