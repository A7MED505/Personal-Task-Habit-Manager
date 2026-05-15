const mongoose = require('mongoose');
const APIError = require('../utils/apiError');
const { validateTaskPayload, normalizeText } = require('../validators/taskValidator');

function buildTaskQuery(query = {}) {
  const filter = {};
  const search = normalizeText(query.search || query.q || '');
  const status = normalizeText(query.status || '');
  const priority = normalizeText(query.priority || '');
  const categoryId = normalizeText(query.categoryId || '');
  const sortBy = normalizeText(query.sortBy || 'createdAt');
  const sortOrder = normalizeText(query.sortOrder || 'desc') === 'asc' ? 1 : -1;
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50);

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (['todo', 'in-progress', 'done'].includes(status)) {
    filter.status = status;
  }

  if (['low', 'medium', 'high'].includes(priority)) {
    filter.priority = priority;
  }

  if (categoryId && mongoose.isValidObjectId(categoryId)) {
    filter.categoryId = categoryId;
  }

  const sort = {};
  const sortableFields = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'];
  sort[sortableFields.includes(sortBy) ? sortBy : 'createdAt'] = sortOrder;

  return {
    filter,
    page,
    limit,
    skip: (page - 1) * limit,
    sort,
    search,
    status,
    priority,
    categoryId
  };
}

function applyCompletionMetadata(taskData) {
  if (taskData.status === 'done') {
    taskData.completedAt = taskData.completedAt || new Date();
  } else {
    taskData.completedAt = null;
  }

  return taskData;
}

async function ensureCategoryExists(categoryId, CategoryModel) {
  if (!categoryId) {
    return null;
  }

  const category = await CategoryModel.findById(categoryId);
  if (!category) {
    throw new APIError(404, 'Category not found');
  }

  return category;
}

async function listTasks(query, { TaskModel, userId }) {
  const criteria = buildTaskQuery(query);
  const scopedFilter = { ...criteria.filter, userId };
  const [tasks, total] = await Promise.all([
    TaskModel.find(scopedFilter)
      .populate('categoryId')
      .sort(criteria.sort)
      .skip(criteria.skip)
      .limit(criteria.limit)
      .lean(),
    TaskModel.countDocuments(scopedFilter)
  ]);

  return {
    tasks,
    pagination: {
      page: criteria.page,
      limit: criteria.limit,
      total,
      pages: Math.ceil(total / criteria.limit) || 0
    },
    filters: {
      search: criteria.search,
      status: criteria.status,
      priority: criteria.priority,
      categoryId: criteria.categoryId
    }
  };
}

async function getTaskById(id, { TaskModel, userId }) {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError(400, 'Invalid task identifier');
  }

  const task = await TaskModel.findOne({ _id: id, userId }).populate('categoryId').lean();
  if (!task) {
    throw new APIError(404, 'Task not found');
  }

  return task;
}

async function createTask(payload, { TaskModel, CategoryModel, userId }) {
  const validation = validateTaskPayload(payload, { partial: false });
  if (!validation.valid) {
    throw new APIError(422, 'Task validation failed', validation.errors);
  }

  await ensureCategoryExists(validation.normalized.categoryId, CategoryModel);
  const taskData = applyCompletionMetadata({ ...validation.normalized, userId });
  const createdTask = await TaskModel.create(taskData);
  await createdTask.populate('categoryId');
  return createdTask.toObject();
}

async function updateTask(id, payload, { TaskModel, CategoryModel, userId }) {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError(400, 'Invalid task identifier');
  }

  const validation = validateTaskPayload(payload, { partial: true });
  if (!validation.valid) {
    throw new APIError(422, 'Task validation failed', validation.errors);
  }

  const task = await TaskModel.findOne({ _id: id, userId });
  if (!task) {
    throw new APIError(404, 'Task not found');
  }

  if (validation.normalized.categoryId !== undefined) {
    await ensureCategoryExists(validation.normalized.categoryId, CategoryModel);
    task.categoryId = validation.normalized.categoryId;
  }

  Object.entries(validation.normalized).forEach(([key, value]) => {
    if (key !== 'categoryId') {
      task[key] = value;
    }
  });

  applyCompletionMetadata(task);
  await task.save();
  await task.populate('categoryId');
  return task.toObject();
}

async function deleteTask(id, { TaskModel, userId }) {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError(400, 'Invalid task identifier');
  }

  const deletedTask = await TaskModel.findOneAndDelete({ _id: id, userId });
  if (!deletedTask) {
    throw new APIError(404, 'Task not found');
  }

  return deletedTask.toObject();
}

async function getTaskStats({ TaskModel, userId }) {
  const [total, todo, inProgress, done, overdue] = await Promise.all([
    TaskModel.countDocuments({ userId }),
    TaskModel.countDocuments({ userId, status: 'todo' }),
    TaskModel.countDocuments({ userId, status: 'in-progress' }),
    TaskModel.countDocuments({ userId, status: 'done' }),
    TaskModel.countDocuments({
      userId,
      dueDate: { $ne: null, $lt: new Date() },
      status: { $ne: 'done' }
    })
  ]);

  return {
    total,
    todo,
    inProgress,
    done,
    overdue
  };
}

module.exports = {
  buildTaskQuery,
  applyCompletionMetadata,
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  ensureCategoryExists
};
