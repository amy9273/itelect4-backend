# itelect4-backend

Backend REST API for ITELECT4 Session 9 (Node.js, Express, TypeScript, MongoDB Atlas, and JWT authentication).

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
PORT=4000
```

## Available Scripts

- `npm run dev`: Starts the development server with live reload via `tsx watch`
- `npm run build`: Compiles TypeScript to JavaScript in `dist/`
- `npm run start`: Runs compiled production code with `node dist/server.js`
- `npm run typecheck`: Runs TypeScript type check without emitting files (`tsc --noEmit`)

## API Endpoints

### Health Check
- `GET /api/health` -> `{ ok: true, db: true }`

### Authentication (Public)
- `POST /api/auth/register` -> Register a new user
- `POST /api/auth/login` -> Authenticate and receive a signed JWT token

### Resource Routes (Protected with `Authorization: Bearer <token>`)
- `GET /api/appointments` -> List current user's appointments
- `GET /api/appointments/:id` -> Get appointment details
- `POST /api/appointments` -> Create a new appointment
- `PATCH /api/appointments/:id` -> Update an existing appointment
- `DELETE /api/appointments/:id` -> Delete an appointment
