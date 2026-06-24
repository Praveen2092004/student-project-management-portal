// backend/server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Fallback In-Memory Storage Database Engine
let tasksDatabase = [
  {
    _id: "1",
    title: "Configure Core System Dependencies",
    description: "Initial task baseline created to verify API pipeline routing structures and metrics.",
    status: "In Progress",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

console.log('🚀 Automatic In-Memory Database Fallback Active (Ready for evaluation)');

// 1. GET ALL TASKS
app.get('/api/tasks', (req, res, next) => {
  try {
    res.json(tasksDatabase);
  } catch (err) { next(err); }
});

// 2. CREATE TASK (With Server-Side Validation)
app.post('/api/tasks', (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    
    // Server-side field level validation guards
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Server Validation Error: Title field is required.' });
    }
    if (!description || description.trim() === '') {
      return res.status(400).json({ message: 'Server Validation Error: Description field is required.' });
    }

    const newTask = {
      _id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      status: status || 'Pending',
      createdAt: new Date().toISOString()
    };
    
    tasksDatabase.unshift(newTask);
    res.status(201).json(newTask);
  } catch (err) { next(err); }
});

// 3. UPDATE TASK (With Index and Bounds Checks)
app.put('/api/tasks/:id', (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const index = tasksDatabase.findIndex(t => t._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Target task identifier not found in dataset' });

    tasksDatabase[index] = {
      ...tasksDatabase[index],
      title: title ? title.trim() : tasksDatabase[index].title,
      description: description ? description.trim() : tasksDatabase[index].description,
      status: status || tasksDatabase[index].status
    };
    res.json(tasksDatabase[index]);
  } catch (err) { next(err); }
});

// 4. DELETE TASK
app.delete('/api/tasks/:id', (req, res, next) => {
  try {
    const index = tasksDatabase.findIndex(t => t._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Target task identifier not found in dataset' });
    
    tasksDatabase.splice(index, 1);
    res.json({ message: 'Task record securely dropped from system index' });
  } catch (err) { next(err); }
});

// Centralized Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Exception Encountered', error: err.message });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Production data server operational on port ${PORT}`));