# ITELECT4 Backend Development & Quality Guide

> **Module 4: Node.js, Express, TypeScript, MongoDB Atlas, JWT, WebSockets & Deployment**  
> **Course Repository:** `itelect4-backend` (Separate from `itelect4-project`)  
> **Session Span:** Sessions 9 to 11

---

## Table of Contents
1. [Session 9 Objectives & Graded Task (GT4 Part 1)](#1-session-9-objectives--graded-task-gt4-part-1)
2. [Module 4 Project Architecture & Roadmap](#2-module-4-project-architecture--roadmap)
3. [Coding Quality & Engineering Standards](#3-coding-quality--engineering-standards)
   - [Separation of Concerns & Startup Sequencing](#separation-of-concerns--startup-sequencing)
   - [Middleware Order of Execution](#middleware-order-of-execution)
   - [TypeScript Strict Type Safety](#typescript-strict-type-safety)
   - [Mongoose Schemas vs. TypeScript Interfaces](#mongoose-schemas-vs-typescript-interfaces)
   - [Data Transformation (`toJSON`)](#data-transformation-tojson)
   - [Centralized Error Handling](#centralized-error-handling)
4. [Authentication & Security Best Practices](#4-authentication--security-best-practices)
   - [Password Storage & Hashing](#password-storage--hashing)
   - [JWT Lifecycle & Route Protection](#jwt-lifecycle--route-protection)
   - [Data Isolation & User-Scoped Queries](#data-isolation--user-scoped-queries)
   - [Secrets & Environment Management](#secrets--environment-management)
5. [Git Workflow & Push Instructions](#5-git-workflow--push-instructions)
   - [Branching & Commit Standards](#branching--commit-standards)
   - [Pre-Push Verification Checklist](#pre-push-verification-checklist)
   - [Pull Request & Submission Workflow](#pull-request--submission-workflow)
6. [Common Pitfalls & Troubleshooting Matrix](#6-common-pitfalls--troubleshooting-matrix)

---

## 1. Session 9 Objectives & Graded Task (GT4 Part 1)

### Key Objectives
* **Transition from Mock to Production Backend:** Replace `json-server` with a custom Node.js/Express server written in TypeScript.
* **Database Modeling with MongoDB Atlas & Mongoose:** Map domain entities from Session 1 frontend interfaces to resilient MongoDB schemas with server-side validation.
* **Stateless Authentication via JWT:** Implement secure user registration (`/api/auth/register`), password hashing with `bcryptjs`, and login (`/api/auth/login`) issuing 2-hour JWT tokens.
* **Securing Routes & Data Isolation:** Create `requireAuth` middleware to verify Bearer tokens and guarantee that all CRUD operations are strictly scoped to the authenticated user (`req.userId`).
* **Full CRUD API:** Implement complete REST endpoints for the primary project resource.

### Graded Task Requirements (GT4 Part 1)
* **Repository:** Work strictly within `itelect4-backend`.
* **Branch:** Create and work on branch `gt4-part1`.
* **Core Deliverables:**
  1. `src/types/index.ts`: TypeScript interfaces and derived document types (`UserDoc`, resource doc, new payload types).
  2. `src/models/`: `User` schema (with hashed password) and custom resource schema with **at least 3 validation rules** (e.g., `required`, `enum`/`match`, `min`/`max`, `trim`, `uppercase`).
  3. `src/middleware/auth.ts`: `requireAuth` middleware setting `req.userId` via global Express namespace declaration.
  4. `src/routes/`: Authentication routes (`/api/auth`) and all **5 CRUD routes** for the primary resource (`GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`).
  5. **User Scoping:** Every resource route must filter by `req.userId`.
  6. **Build Integrity:** `npm run build` (`tsc`) must finish with **0 TypeScript errors**.
  7. **Pull Request:** Open a PR from `gt4-part1` into `main` and merge it. *(Do NOT tag release today; GT4 is tagged and submitted after Session 11)*.

---

## 2. Module 4 Project Architecture & Roadmap

```
itelect4-project (Frontend - Port 5173 / Deployed UI)
       │
       │  HTTP REST (Session 9) / WebSockets (Session 10)
       ▼
itelect4-backend (Backend - Port 4000 / Deployed API)
 ├── src/
 │    ├── config/db.ts         --> MongoDB Atlas connection & timeout handling
 │    ├── middleware/auth.ts   --> JWT verification & req.userId decoration
 │    ├── models/              --> Mongoose Schemas with validation & toJSON hooks
 │    ├── routes/              --> Modular Express Routers (auth, resources)
 │    ├── types/index.ts       --> Base interfaces & utility-derived types
 │    ├── app.ts               --> Express app configuration, middleware, error handlers
 │    └── server.ts            --> Startup sequencer: connects DB first, then binds port
```

### Module 4 Timeline
* **Session 9:** REST API, MongoDB connection, JWT Auth, Full CRUD, User scoping.
* **Session 10:** Real-time WebSockets integration within the same backend repo.
* **Session 11:** Production deployment, environment variable configuration on live hosting, and full end-to-end integration with `itelect4-project`.

---

## 3. Coding Quality & Engineering Standards

### Separation of Concerns & Startup Sequencing
1. **Never bind ports in `app.ts`:** `src/app.ts` configures the Express application and routes. It must remain importable for tests or server wrappers without binding network sockets.
2. **Deterministic Startup in `server.ts`:** Always connect to MongoDB Atlas **before** calling `app.listen()`. This prevents requests from hitting the server when the database connection is not yet established.
   ```typescript
   connectDB()
     .then(() => {
       app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
     })
     .catch((err) => {
       console.error("Could not start:", err);
       process.exit(1);
     });
   ```
3. **Database Fail-Fast Timeout:** Configure `serverSelectionTimeoutMS: 5000` in `mongoose.connect()` so unreachable hosts fail within 5 seconds instead of hanging for 30+ seconds.

### Middleware Order of Execution
Middleware executes strictly in registration order. The order in `src/app.ts` must always be:
1. `app.use(cors())`: Allow cross-origin requests from frontend apps.
2. `app.use(express.json())`: Parse JSON bodies into `req.body` (requires `Content-Type: application/json`).
3. Health check route: `GET /api/health`.
4. Feature routers: `app.use("/api/auth", authRouter)`, `app.use("/api/...", resourceRouter)`.
5. 404 Catch-All Middleware: Catches unmatched routes and returns JSON (never default HTML).
6. Centralized Error Handler: 4-parameter middleware `(err, req, res, next)`.

### TypeScript Strict Type Safety
* **Avoid `any`:** Strongly type route requests using Express generic parameters:
  `Request<ParamsDictionary, ResBody, ReqBody, ReqQuery>`.
* **Derive Types with Utility Types:** Derive database document types and request payload shapes from base interfaces using `Omit` and `Pick`:
  ```typescript
  export type UserDoc = Omit<User, "id"> & { password: string };
  export type AppointmentDoc = Omit<Appointment, "id"> & { userId: Types.ObjectId };
  export type NewAppointmentBody = Pick<Appointment, "type" | "notes" | "status"> & {
    scheduledAt?: string | Date;
    fee?: number;
  };
  ```
* **Express Namespace Merging:** Augment `Express.Request` in `src/middleware/auth.ts` to allow `req.userId?: string` across the entire project without ad-hoc casting:
  ```typescript
  declare global {
    namespace Express {
      interface Request {
        userId?: string;
      }
    }
  }
  ```

### Mongoose Schemas vs. TypeScript Interfaces
| Aspect | TypeScript Interface (`src/types/`) | Mongoose Schema (`src/models/`) |
| :--- | :--- | :--- |
| **Execution** | Compile-time only (erased at runtime) | Runtime on every database write |
| **Enforcement** | Catches developer typos & type mismatches | Validates incoming request payloads |
| **Capabilities** | Declares types (`string`, `number`) | Validates rules (`min`, `max`, `match`, `enum`, `trim`, `uppercase`) |

### Data Transformation (`toJSON`)
MongoDB documents use `_id` (`ObjectId`) and `__v`. Frontend applications expect clean `id: string` identifiers. Every schema must include a `toJSON` transform:
```typescript
schema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password; // For User schema
    return ret;
  },
});
```

### Centralized Error Handling
Express 5 automatically forwards unhandled rejections from async route handlers to the error middleware. Do not scatter manual `try/catch` blocks in every route unless custom fallback handling is needed.

The error handler must format errors into standard JSON responses:
* **`mongoose.Error.ValidationError`** $\rightarrow$ `400 Bad Request` with array of validation error messages.
* **`mongoose.Error.CastError`** $\rightarrow$ `400 Bad Request` (e.g., malformed 24-character hex ID in URL).
* **Generic Errors** $\rightarrow$ `500 Internal Server Error` (`{ message: "Something went wrong" }`).

---

## 4. Authentication & Security Best Practices

### Password Storage & Hashing
* **`bcryptjs` Library:** Always use `bcryptjs` (pure JS, cross-platform) instead of native `bcrypt`.
* **Pre-Save Hook:** Hash passwords with salt rounds $\ge 10$ before saving to the database:
  ```typescript
  userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
  });
  ```
* **Field Projection:** Set `password: { type: String, select: false }` in `userSchema` so passwords are excluded from queries by default. When authenticating during login, explicitly re-include it via `.select("+password")`.

### JWT Lifecycle & Route Protection
* **Payload Content:** Store only non-sensitive identifiers (e.g., `{ userId: string }`). Never include passwords, secrets, or PII.
* **Expiration:** Set an explicit expiration (e.g., `expiresIn: "2h"`).
* **Header Structure:** Expect `Authorization: Bearer <token>`. Reject missing headers, malformed prefixes, or expired signatures with `401 Unauthorized`.

### Data Isolation & User-Scoped Queries
* **Never Trust Request Payload for Identity:** Always override or set ownership fields (`userId`/`studentId`) using `req.userId` extracted from the verified JWT.
* **Ownership Verification on Retrieval/Mutation:**
  * `find({ userId: req.userId })`
  * `findOne({ _id: req.params.id, userId: req.userId })`
  * `findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true, runValidators: true })`
  * `findOneAndDelete({ _id: req.params.id, userId: req.userId })`
* **Security Response Pattern:** When a record does not belong to the requesting user, return **`404 Not Found`** (not `403 Forbidden`). A `403` confirms that the record exists to unauthorized attackers.

### Secrets & Environment Management
1. **`.env` is Local & Secret:** Never commit `.env` to Git. Ensure `.env` is listed in `.gitignore` **before the first commit**.
2. **`.env.example` is Committed:** Maintain `.env.example` with empty keys to document required environment variables for collaborators and deployment platforms.
3. **Connection String Hygiene:** Ensure passwords containing special characters (e.g., `@`, `/`, `?`, `#`) in MongoDB Atlas URIs are percent-encoded (e.g., `@` becomes `%40`). Always specify the target database name in the connection string (`...mongodb.net/yourdbname?...`).

---

## 5. Git Workflow & Push Instructions

### Branching & Commit Standards
* **Branch Name:** `gt4-part1`
* **Base Branch:** `main`
* **Commit Messages:** Use clear, descriptive commit messages following conventional commit style:
  - `feat(auth): implement user registration, login, and jwt verification`
  - `feat(models): add user and resource schemas with validation rules`
  - `feat(routes): implement 5 user-scoped crud routes`
  - `chore(config): configure typescript, environment, and error handling`

### Pre-Push Verification Checklist

Run through this 6-point checklist before creating your pull request:

```bash
# 1. Verify secrets are ignored and working tree is clean
git status
# Confirm .env is NOT listed in untracked/staged files

# 2. Verify TypeScript compiles with ZERO errors
npm run typecheck
npm run build

# 3. Verify Health Check
# GET http://localhost:4000/api/health -> { "ok": true, "db": true }

# 4. Verify Auth & Token in Postman
# POST /api/auth/register -> 201 Created (no password returned)
# POST /api/auth/login    -> 200 OK with { "token": "...", "user": { ... } }

# 5. Verify Protected Routes & Security
# GET /api/<resource> (without token) -> 401 Unauthorized
# GET /api/<resource> (with Bearer token) -> 200 OK
# GET /api/<resource>/<other_user_id> -> 404 Not Found

# 6. Verify CRUD & Validations
# POST /api/<resource> (invalid body) -> 400 Bad Request with validation messages
# DELETE /api/<resource>/:id          -> 204 No Content
```

### Pull Request & Submission Workflow
1. **Push Branch:**
   ```bash
   git checkout -b gt4-part1
   git add .
   git commit -m "feat: complete GT4 part 1 backend setup and crud"
   git push -u origin gt4-part1
   ```
2. **Create Pull Request on GitHub:**
   - Base: `main` $\leftarrow$ Compare: `gt4-part1`
   - Title: `GT4 Part 1: Node, Express, MongoDB & JWT Backend`
   - Description: Outline the models created, validation rules, authentication endpoints, and CRUD routes.
3. **Merge Pull Request:**
   - Merge `gt4-part1` into `main`.
   - **Do NOT create a Git release tag for GT4 today.** GT4 tagging occurs at the end of Session 11 after full deployment.

---

## 6. Common Pitfalls & Troubleshooting Matrix

| Symptom | Root Cause | Fix |
| :--- | :--- | :--- |
| **Terminal hangs for 6s $\rightarrow$ `MongooseServerSelectionError`** | `MONGODB_URI` missing/incorrect or IP not in Atlas Access List | Check `.env` URI and add current IP / `0.0.0.0/0` in Atlas Security tab |
| **`TypeError: Cannot destructure property 'x' of req.body as it is undefined`** | Missing `app.use(express.json())` or client omitted `Content-Type: application/json` | Ensure `express.json()` middleware is placed before routers and verify Postman headers |
| **Login always fails with 401 even with correct password** | `User.findOne({ email })` did not select password because `select: false` | Use `User.findOne({ email }).select("+password")` in login handler |
| **`PATCH` saves invalid data (e.g. invalid URL/score)** | `findOneAndUpdate` skips validators by default | Pass `{ new: true, runValidators: true }` in update options |
| **Client receives old document after `PATCH`** | `new` defaults to `false` in `findOneAndUpdate` | Set `{ new: true }` in `findOneAndUpdate` options |
| **Token works in Postman but browser fails with CORS error** | Missing `app.use(cors())` | Register `cors()` as the very first middleware in `app.ts` |
| **Invalid ID returns 500 error instead of 400** | Missing `CastError` branch in error handler | Handle `err instanceof mongoose.Error.CastError` in centralized error middleware |
| **TypeScript shows type errors across models for `ObjectId`** | `studentId`/`userId` typed as `string` in document type instead of `Types.ObjectId` | Import `Types` from `mongoose` and use `Types.ObjectId` in `*Doc` types |
