import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

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

// In-memory data store for tasks
let tasks = [
  {
    id: 1,
    title: 'Design API Schema',
    description: 'Structure REST endpoints for the task manager backend',
    completed: true,
    priority: 'high',
    createdAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 2,
    title: 'Implement Middleware Pipeline',
    description: 'Add logging, content-type verification, and error handlers',
    completed: false,
    priority: 'medium',
    createdAt: '2026-08-10T11:00:00.000Z'
  },
  {
    id: 3,
    title: 'Integrate Express with React',
    description: 'Connect Practical 4 backend to the portfolio React frontend',
    completed: false,
    priority: 'high',
    createdAt: '2026-08-10T12:00:00.000Z'
  }
];

let nextId = 4;

// 3. Route-specific middleware for validating task ID format
const validateTaskId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      error: 'Invalid Task ID',
      message: 'Task ID must be a positive integer'
    });
  }
  req.taskId = id;
  next();
};

// --- CRUD Endpoints ---

// READ All Tasks: GET /tasks
app.get('/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// READ Single Task: GET /tasks/:id
app.get('/tasks/:id', validateTaskId, (req, res) => {
  const task = tasks.find(t => t.id === req.taskId);
  if (!task) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${req.taskId} not found`
    });
  }
  res.status(200).json({
    success: true,
    data: task
  });
});

// CREATE Task: POST /tasks
app.post('/tasks', (req, res, next) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Task title is required'
      });
    }

    const newTask = {
      id: nextId++,
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: false,
      priority: priority || 'medium',
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
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
app.put('/tasks/:id', validateTaskId, (req, res, next) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);
    if (taskIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.taskId} not found`
      });
    }

    const { title, description, completed, priority } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Task title cannot be empty'
      });
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(completed !== undefined && { completed: Boolean(completed) }),
      ...(priority !== undefined && { priority })
    };

    tasks[taskIndex] = updatedTask;
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
app.delete('/tasks/:id', validateTaskId, (req, res, next) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);
    if (taskIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.taskId} not found`
      });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    res.status(200).json({
      success: true,
      message: `Task with ID ${req.taskId} deleted successfully`,
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
app.use((err, req, res, _next) => {
  console.error('[Global Error Handler]:', err.stack || err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Task Manager REST API (Practical 4) running on http://localhost:${PORT}`);
});
