import Task from '../models/Task.js';

// @desc    Get all tasks for the logged in user's workspace/projects
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    let query = {};
    
    // Only employees are restricted to see their own tasks.
    // Admins, HR, and Managers can see everything.
    if (req.user.role === 'employee') {
      query = { 
        $or: [
          { assignees: req.user._id },
          { createdBy: req.user._id }
        ]
      };
    }

    const tasks = await Task.find(query)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name role');

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, workspace, assignees } = req.body;

    const task = await Task.create({
      title,
      description,
      status: status || 'Todo',
      priority: priority || 'Medium',
      // If workspace is not provided, use the creator's ID as a dummy workspace ID
      workspace: workspace || req.user._id, 
      createdBy: req.user._id,
      assignees: assignees && assignees.length > 0 ? assignees : [req.user._id]
    });

    const populatedTask = await Task.findById(task._id).populate('assignees', 'name email avatar');
    
    // Emit socket event if io is available
    const io = req.app.get('io');
    if (io) {
      io.emit('taskCreated', populatedTask);
    }
    
    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status / column dropping
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignees', 'name email avatar');

    // Emit socket event if io is available
    const io = req.app.get('io');
    if (io) {
      io.emit('taskUpdated', updatedTask);
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await task.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
