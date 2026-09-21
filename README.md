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

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a reachable MongoDB deployment

## Setup

From the project directory:

```bash
npm install
npm install bcryptjs jsonwebtoken
```

The second command ensures the API authentication dependencies are available in installations created from the current manifest.

Create or update `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/task-ui
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=1h
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
