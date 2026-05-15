const mongoose = require('mongoose');

const ALLOWED_STATUSES = ['todo', 'in-progress', 'done'];
const ALLOWED_PRIORITIES = ['low', 'medium', 'high'];

function normalizeText(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? '' : trimmed;
}

function normalizeDate(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date('invalid') : date;
}

function validateTaskPayload(payload, options = {}) {
  const { partial = false } = options;
  const errors = [];
  const normalized = {};

  if (payload.title !== undefined) {
    const title = normalizeText(payload.title);
    if (!title) {
      errors.push('Title is required');
    } else if (title.length > 140) {
      errors.push('Title must be 140 characters or less');
    } else {
      normalized.title = title;
    }
  } else if (!partial) {
    errors.push('Title is required');
  }

  if (payload.description !== undefined) {
    const description = normalizeText(payload.description);
    if (description.length > 1000) {
      errors.push('Description must be 1000 characters or less');
    } else {
      normalized.description = description;
    }
  }

  if (payload.status !== undefined) {
    const status = normalizeText(payload.status);
    if (!ALLOWED_STATUSES.includes(status)) {
      errors.push('Status must be one of: todo, in-progress, done');
    } else {
      normalized.status = status;
    }
  }

  if (payload.priority !== undefined) {
    const priority = normalizeText(payload.priority);
    if (!ALLOWED_PRIORITIES.includes(priority)) {
      errors.push('Priority must be one of: low, medium, high');
    } else {
      normalized.priority = priority;
    }
  }

  if (payload.categoryId !== undefined) {
    if (payload.categoryId === '' || payload.categoryId === null) {
      normalized.categoryId = null;
    } else if (mongoose.isValidObjectId(payload.categoryId)) {
      normalized.categoryId = payload.categoryId;
    } else {
      errors.push('Category ID must be a valid MongoDB ObjectId');
    }
  }

  if (payload.dueDate !== undefined) {
    const dueDate = normalizeDate(payload.dueDate);
    if (dueDate && Number.isNaN(dueDate.getTime())) {
      errors.push('Due date must be a valid date');
    } else {
      normalized.dueDate = dueDate;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized
  };
}

module.exports = {
  ALLOWED_STATUSES,
  ALLOWED_PRIORITIES,
  validateTaskPayload,
  normalizeText,
  normalizeDate
};
