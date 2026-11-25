# Task Flow Engine

Task Flow Engine is a full-stack task management application built for the AWDF portfolio. It combines a React and Vite interface with an Express REST API, MongoDB persistence, JWT authentication, bcrypt password hashing, request validation, and an interactive API console.

The application demonstrates a complete authenticated workflow:

1. A user registers or logs in.
2. The API returns a one-hour JWT.
3. The frontend sends that token with every task request.
4. Tasks are stored against the authenticated user.
5. Users can create, inspect, complete, and delete only their own tasks.

## Highlights

- React 19 frontend powered by Vite.
- Express 5 REST API in `server.js`.
- MongoDB persistence through Mongoose.
- Password hashing with bcrypt before a user is stored.
- JWT access tokens with configurable expiry.
- User-owned task records and protected task routes.
- Server-side validation for auth and task payloads.
- MongoDB ObjectId validation for task routes.
- Dark/light theme support and responsive task dashboard.
- Built-in REST API Studio for testing requests from the UI.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Framer Motion, Lucide React |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | bcryptjs, JSON Web Tokens |
| Quality tools | ESLint, Vite production build |

## Project Structure

```text
awdf-portfolio/
├── server.js                     # Express API and Mongoose models
├── Dockerfile.backend            # Production API image
├── Dockerfile.frontend           # Multi-stage frontend image
├── docker-compose.yml            # Frontend, API, and MongoDB services
├── src/
│   ├── App.jsx                   # Portfolio and Task Engine views
│   ├── main.jsx                  # React entry point
│   └── components/
│       └── TaskManagerSystem.jsx # Auth UI, task UI, and API console
├── public/                       # Static assets
├── .env                          # Local environment configuration
├── package.json                  # Scripts and frontend dependencies
└── vite.config.js                # Vite configuration
```

## Run with Docker Compose

Docker Desktop (or Docker Engine with the Compose plugin) is required. From the project directory, start the entire application with:

```bash
docker compose up --build
```

Open the frontend at `http://localhost:5173`. The API is also published at `http://localhost:5000`; MongoDB is available only to services on the internal Compose network. MongoDB data is persisted in the named `mongodb-data` volume. To stop the services, press Ctrl+C and run `docker compose down`; the database volume is kept. To remove the database data too, run `docker compose down -v`.

The frontend sends API calls to `/api`; its Nginx server strips that prefix and proxies requests to the backend service, so the browser uses the frontend origin while containers communicate over the private `task-network`. Docker Compose DNS resolves `mongodb` to the database container. `localhost` inside the backend container would refer back to that backend container, not MongoDB.

To enable Gemini task descriptions, add `GEMINI_API_KEY` to the ignored `.env` file. Compose passes it only to the backend container; it is never included in the frontend build. The backend uses Gemini 3.1 Flash-Lite. The authenticated `POST /api/ai/generate-description` endpoint accepts `{"title":"..."}`. If Gemini is not configured, times out, or returns an error, the backend returns an editable fallback description and the task form remains usable.

`EXPOSE` in a Dockerfile documents the port an image's process listens on; it does not publish that port on the host. The `ports` entries in Compose publish the frontend and API ports (`5173:80` and `5000:5000`) so they can be reached from the host. MongoDB needs no host port mapping because only the backend connects to it.

The Docker builds install dependencies from the lockfile inside their build stages; `.dockerignore` excludes host `node_modules` and `.env` files. Copying `node_modules` from a developer machine can include OS-specific binaries, stale packages, or unnecessary files. For local Compose use, the JWT secret has a development-only fallback; set `JWT_SECRET` in the shell/environment before starting Compose for a non-development deployment.

## Continuous Integration

The GitHub Actions workflow in `.github/workflows/ci.yml` runs on every push to `main`. It installs dependencies with `npm install`, runs the automated tests with `npm test`, and builds the frontend with `npm run build`. A failed command marks the workflow run as failed; all green checks indicate the pipeline passed.

The API base tests cover both the local-development default and the `/api` path used by Docker Compose. To see a test failure locally, temporarily change one expected value in `tests/api-base.test.js`, run `npm test`, then restore the expected value and rerun `npm test` to verify the pass state.

## Prerequisites

- Node.js 22 or newer
- npm
- MongoDB running locally or a reachable MongoDB deployment

## Setup

From the project directory:

```bash
npm install
```

Create or update `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/task-ui
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=1h
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.1-flash-lite
```

Never commit a production JWT secret or real credentials. The included values are intended only for local development.

## Run Locally

Use two terminals.

Terminal 1, start the API:

```bash
node server.js
```

The API will be available at `http://localhost:5000`.

Terminal 2, start the frontend:

```bash
npm run dev
```

Open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

For a production frontend build:

```bash
npm run build
npm run preview
```

## Demo Account

The local development account used for the demo workflow is:

```text
Email:    demo@example.com
Password: demo1234
```

If the account does not exist in a fresh database, use **Register** in the Task Engine screen with a password of at least eight characters.

## Authentication API

### Register

`POST /auth/register`

```json
{
	"name": "Demo User",
	"email": "demo@example.com",
	"password": "demo1234"
}
```

### Login

`POST /auth/login`

```json
{
	"email": "demo@example.com",
	"password": "demo1234"
}
```

Successful auth responses include a JWT:

```json
{
	"success": true,
	"token": "<jwt>",
	"user": {
		"id": "<user-id>",
		"name": "Demo User",
		"email": "demo@example.com"
	}
}
```

Send the token to protected routes with:

```http
Authorization: Bearer <jwt>
```

## Task API

All task routes require a valid JWT.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/tasks` | List the signed-in user's tasks |
| GET | `/tasks/:id` | Fetch one owned task |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update an owned task |
| DELETE | `/tasks/:id` | Delete an owned task |

Create a task:

```json
{
	"title": "Review API documentation",
	"description": "Check endpoint examples and error responses",
	"priority": "medium"
}
```

Allowed priorities are `low`, `medium`, and `high`. Task titles are required and cannot be blank. Descriptions must be strings, and `completed` must be a boolean when supplied.

Example request:

```bash
curl -X POST http://localhost:5000/tasks \
	-H "Authorization: Bearer <jwt>" \
	-H "Content-Type: application/json" \
	-d '{"title":"Review API documentation","priority":"medium"}'
```

## Validation and Security

- Passwords are stored as bcrypt hashes, never as plaintext.
- Login rejects invalid credentials without revealing which field failed.
- JWTs are verified before any task handler executes.
- Task queries include the authenticated user's ID, preventing cross-user access.
- Registration validates name, email format, and password length.
- Task creation and updates validate title, description, priority, and completion state.
- Invalid JSON request bodies return a `400` validation response.
- Invalid task IDs return a `400` response before database lookup.

## Development Commands

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production frontend build
npm run preview   # Preview the production build
npm run lint      # Run ESLint across the project
node server.js    # Start the Express API
```

The full-project lint command may report existing issues in unrelated portfolio components. For the authentication and Task Engine changes, validate the touched files directly:

```bash
npx eslint server.js src/components/TaskManagerSystem.jsx
node --check server.js
```

## Troubleshooting

### MongoDB connection errors

Confirm MongoDB is running and that `MONGO_URI` points to the correct deployment.

### `401 Unauthorized` from `/tasks`

Log in again and send the returned token as `Authorization: Bearer <jwt>`. Tokens expire according to `JWT_EXPIRES_IN`, which defaults to one hour.

### `409 Conflict` during registration

The email already belongs to a user. Log in with that account or use another email address.

### Frontend cannot reach the API

Start `node server.js` on port 5000, or update `API_BASE` in `src/components/TaskManagerSystem.jsx` to match the API port.

## License

See [LICENSE](LICENSE) for the project license.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


---

## 📊 Live Stats

<!--LIVE_STATS_START-->
<!-- auto-generated by live_stats.py — do not edit this block manually -->

### 📊 Live Stats &nbsp;·&nbsp; <sub>last updated 25 Nov 2026, 11:04 PM IST</sub>

| ⭐ Stars | 🍴 Forks | 👁 Watchers | 📋 Open Issues/PRs | 💾 Repo Size |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 1,696 KB |

**Languages**
`JavaScript` 93.3%  `TypeScript` 4.0%  `CSS` 2.1%  `HTML` 0.5%

**Latest 10 commits**

| Commit | Message | Date |
|---|---|---|
| [`0706662`](https://github.com/Sp2736/awdf-portfolio/commit/07066629e94f07bfd4b1967cd37f1b40769db2bd) | fix: resolve stats workflow secrets check and API trailing slash | 2026-11-25 |
| [`3c5427f`](https://github.com/Sp2736/awdf-portfolio/commit/3c5427f038636d0fe23aaa647af2f55032da0699) | docs: add live stats markers to README | 2026-11-25 |
| [`c6dba13`](https://github.com/Sp2736/awdf-portfolio/commit/c6dba136699f36025c95304f18aecc983504b4e4) | feat: add live stats generation script | 2026-11-25 |
| [`77663c6`](https://github.com/Sp2736/awdf-portfolio/commit/77663c6ed2ee4615c8519ece3750e63d5e80b2ad) | feat: add live-stats workflow for auto-updating README stats | 2026-11-25 |
| [`cc97aa4`](https://github.com/Sp2736/awdf-portfolio/commit/cc97aa462119e3596e330406e76be42ff5d3f575) | Add Gemini task description generation | 2026-10-20 |
| [`d032909`](https://github.com/Sp2736/awdf-portfolio/commit/d0329094ab982f505e7b7add5d864f8a1a7457dd) | Add GitHub Actions CI workflow and tests | 2026-10-20 |
| [`ce0392b`](https://github.com/Sp2736/awdf-portfolio/commit/ce0392bf343afb95c660198c08550297030792da) | Handle expired task session on load | 2026-10-20 |
| [`e74542c`](https://github.com/Sp2736/awdf-portfolio/commit/e74542cc79a3c9bde37da2dfffd37f37d0964685) | Add Docker Compose setup for task app | 2026-10-20 |
| [`10eed33`](https://github.com/Sp2736/awdf-portfolio/commit/10eed333ff0bc121036c0233a94235bb111bc409) | feat: add theme-suitable frontend toast notification for new tasks | 2026-09-28 |
| [`d866b8d`](https://github.com/Sp2736/awdf-portfolio/commit/d866b8d0a12f4f6903350f85cb6271da473249f7) | feat(practical 10): implement background event notification with EventEm | 2026-09-28 |

<!--LIVE_STATS_END-->
