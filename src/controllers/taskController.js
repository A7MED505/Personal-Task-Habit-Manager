const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const Category = require('../models/Category');
const {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../services/taskService');

const getTasks = asyncHandler(async (req, res) => {
  const result = await listTasks(req.query, { TaskModel: Task, userId: req.user._id });
  res.status(200).json({ success: true, data: result });
});

const getTask = asyncHandler(async (req, res) => {
  const task = await getTaskById(req.params.id, { TaskModel: Task, userId: req.user._id });
  res.status(200).json({ success: true, data: task });
});

const createNewTask = asyncHandler(async (req, res) => {
  const task = await createTask(req.body, { TaskModel: Task, CategoryModel: Category, userId: req.user._id });
  res.status(201).json({ success: true, data: task });
});

const updateExistingTask = asyncHandler(async (req, res) => {
  const task = await updateTask(req.params.id, req.body, { TaskModel: Task, CategoryModel: Category, userId: req.user._id });
  res.status(200).json({ success: true, data: task });
});

const removeTask = asyncHandler(async (req, res) => {
  await deleteTask(req.params.id, { TaskModel: Task, userId: req.user._id });
  res.status(204).send();
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await getTaskStats({ TaskModel: Task, userId: req.user._id });
  const categoryCount = await Category.countDocuments({ userId: req.user._id });
  res.status(200).json({
    success: true,
    data: {
      ...stats,
      categories: categoryCount
    }
  });
});

module.exports = {
  getTasks,
  getTask,
  createNewTask,
  updateExistingTask,
  removeTask,
  getDashboardStats
};
