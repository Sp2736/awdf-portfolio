/* global process */
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task-ui';
const JWT_SECRET = process.env.JWT_SECRET || 'development-only-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err.message));

// Task Schema & Model (Practical 5 + Task Manager)
const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Custom JSON transformation so _id is also accessible as id
taskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

const Task = mongoose.model('Task', taskSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors());
app.use(express.json());

// 1. Content-Type validation middleware for POST and PUT requests
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content-Type header must be application/json'
      });
    }
  }
  next();
};

app.use(validateContentType);

// 2. Custom global request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// 3. Route-specific middleware for validating MongoDB ObjectId format or fallback numeric string
const validateTaskId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: 'Invalid Task ID',
      message: 'Task ID must be a valid MongoDB ObjectId'
    });
  }
  next();
};

const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'A Bearer token is required' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized', message: 'Token is invalid or expired' });
  }
};

const isValidEmail = (email) => typeof email === 'string'
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const validateAuthPayload = (req, res, next) => {
  const { name, email, password } = req.body || {};
  if (req.path.endsWith('/register') && (typeof name !== 'string' || name.trim().length < 2)) {
    return res.status(400).json({ error: 'Validation Error', message: 'Name must be at least 2 characters' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Validation Error', message: 'A valid email is required' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 8 characters' });
  }
  next();
};

const validateTaskPayload = (req, res, next) => {
  const body = req.body || {};
  const allowedPriorities = ['low', 'medium', 'high'];
  if (req.method === 'POST' && (typeof body.title !== 'string' || !body.title.trim())) {
    return res.status(400).json({ error: 'Validation Error', message: 'Task title is required' });
  }
  if (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim())) {
    return res.status(400).json({ error: 'Validation Error', message: 'Task title cannot be empty' });
  }
  if (body.description !== undefined && typeof body.description !== 'string') {
    return res.status(400).json({ error: 'Validation Error', message: 'Description must be a string' });
  }
  if (body.priority !== undefined && !allowedPriorities.includes(body.priority)) {
    return res.status(400).json({ error: 'Validation Error', message: 'Priority must be low, medium, or high' });
  }
  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    return res.status(400).json({ error: 'Validation Error', message: 'Completed must be a boolean' });
  }
  next();
};

const signToken = (user) => jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, {
  expiresIn: JWT_EXPIRES_IN
});

app.post('/auth/register', validateAuthPayload, async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Conflict', message: 'An account with this email already exists' });
    }
    const password = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ name: req.body.name.trim(), email, password });
    res.status(201).json({ success: true, token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login', validateAuthPayload, async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select('+password');
    const validPassword = user && await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
    }
    res.status(200).json({ success: true, token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

app.use('/tasks', authenticateToken);

// --- CRUD Endpoints ---

// READ All Tasks: GET /tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
});

// READ Single Task: GET /tasks/:id
app.get('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} not found`
      });
    }
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
});

// CREATE Task: POST /tasks
app.post('/tasks', validateTaskPayload, async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;

    const newTask = await Task.create({
      user: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: false,
      priority: priority || 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (err) {
    next(err);
  }
});

// UPDATE Task: PUT /tasks/:id
app.put('/tasks/:id', validateTaskId, validateTaskPayload, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (completed !== undefined) updateData.completed = Boolean(completed);
    if (priority !== undefined) updateData.priority = priority;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
});

// DELETE Task: DELETE /tasks/:id
app.delete('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: `Task with ID ${req.params.id} deleted successfully`,
      data: deletedTask
    });
  } catch (err) {
    next(err);
  }
});

// 4. Custom 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// 5. Global Error Handling Middleware (must be last)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err.message);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Request body must contain valid JSON'
    });
  }
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Task Manager REST API (Practicals 4 & 5 MongoDB) running on http://localhost:${PORT}`);
});

