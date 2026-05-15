const mongoose = require('mongoose');
const APIError = require('../utils/apiError');
const { validateCategoryPayload, normalizeText } = require('../validators/categoryValidator');

async function listCategories(query, { CategoryModel }) {
  const search = normalizeText(query.search || '');
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const categories = await CategoryModel.find(filter).sort({ name: 1 }).lean();
  return { categories, search };
}

async function getCategoryById(id, { CategoryModel }) {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError(400, 'Invalid category identifier');
  }

  const category = await CategoryModel.findById(id).lean();
  if (!category) {
    throw new APIError(404, 'Category not found');
  }

  return category;
}

async function createCategory(payload, { CategoryModel }) {
  const validation = validateCategoryPayload(payload, { partial: false });
  if (!validation.valid) {
    throw new APIError(422, 'Category validation failed', validation.errors);
  }

  const createdCategory = await CategoryModel.create(validation.normalized);
  return createdCategory.toObject();
}

async function updateCategory(id, payload, { CategoryModel }) {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError(400, 'Invalid category identifier');
  }

  const validation = validateCategoryPayload(payload, { partial: true });
  if (!validation.valid) {
    throw new APIError(422, 'Category validation failed', validation.errors);
  }

  const category = await CategoryModel.findById(id);
  if (!category) {
    throw new APIError(404, 'Category not found');
  }

  Object.assign(category, validation.normalized);
  await category.save();
  return category.toObject();
}

async function deleteCategory(id, { CategoryModel, TaskModel }) {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError(400, 'Invalid category identifier');
  }

  const taskCount = await TaskModel.countDocuments({ categoryId: id });
  if (taskCount > 0) {
    throw new APIError(409, 'Category is in use by tasks and cannot be deleted');
  }

  const deletedCategory = await CategoryModel.findByIdAndDelete(id);
  if (!deletedCategory) {
    throw new APIError(404, 'Category not found');
  }

  return deletedCategory.toObject();
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
