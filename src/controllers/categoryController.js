const asyncHandler = require('../utils/asyncHandler');
const Category = require('../models/Category');
const Task = require('../models/Task');
const {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../services/categoryService');

const getCategories = asyncHandler(async (req, res) => {
  const result = await listCategories(req.query, { CategoryModel: Category });
  res.status(200).json({ success: true, data: result });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id, { CategoryModel: Category });
  res.status(200).json({ success: true, data: category });
});

const createNewCategory = asyncHandler(async (req, res) => {
  const category = await createCategory(req.body, { CategoryModel: Category });
  res.status(201).json({ success: true, data: category });
});

const updateExistingCategory = asyncHandler(async (req, res) => {
  const category = await updateCategory(req.params.id, req.body, { CategoryModel: Category });
  res.status(200).json({ success: true, data: category });
});

const removeCategory = asyncHandler(async (req, res) => {
  await deleteCategory(req.params.id, { CategoryModel: Category, TaskModel: Task });
  res.status(204).send();
});

module.exports = {
  getCategories,
  getCategory,
  createNewCategory,
  updateExistingCategory,
  removeCategory
};
