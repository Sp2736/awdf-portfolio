/* global process */
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task-ui';

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('🍃 Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// Task Schema & Model (Practical 5 + Task Manager)
const taskSchema = new mongoose.Schema({
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

// Seed initial default tasks if DB is empty
const seedInitialTasks = async () => {
  try {
    const count = await Task.countDocuments();
    if (count === 0) {
      await Task.insertMany([
        {
          title: 'Design API Schema',
          description: 'Structure REST endpoints for the task manager backend',
          completed: true,
          priority: 'high'
        },
        {
          title: 'Implement Middleware Pipeline',
          description: 'Add logging, content-type verification, and error handlers',
          completed: false,
          priority: 'medium'
        },
        {
          title: 'Integrate Express with React',
          description: 'Connect Practical 4 & 5 backend to the portfolio React frontend',
          completed: false,
          priority: 'high'
        }
      ]);
      console.log('🌱 Default tasks seeded into MongoDB');
    }
  } catch (err) {
    console.error('Error seeding initial tasks:', err.message);
  }
};

mongoose.connection.once('open', seedInitialTasks);

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

// --- CRUD Endpoints ---

// READ All Tasks: GET /tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
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
    const task = await Task.findById(req.params.id);
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
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Task title is required'
      });
    }

    const newTask = await Task.create({
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
app.put('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Task title cannot be empty'
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (completed !== undefined) updateData.completed = Boolean(completed);
    if (priority !== undefined) updateData.priority = priority;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
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
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
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
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Task Manager REST API (Practicals 4 & 5 MongoDB) running on http://localhost:${PORT}`);
});

