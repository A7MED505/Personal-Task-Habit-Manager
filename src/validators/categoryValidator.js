function normalizeText(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? '' : trimmed;
}

function validateCategoryPayload(payload, options = {}) {
  const { partial = false } = options;
  const errors = [];
  const normalized = {};

  if (payload.name !== undefined) {
    const name = normalizeText(payload.name);
    if (!name) {
      errors.push('Category name is required');
    } else if (name.length > 80) {
      errors.push('Category name must be 80 characters or less');
    } else {
      normalized.name = name;
    }
  } else if (!partial) {
    errors.push('Category name is required');
  }

  if (payload.description !== undefined) {
    const description = normalizeText(payload.description);
    if (description.length > 240) {
      errors.push('Category description must be 240 characters or less');
    } else {
      normalized.description = description;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized
  };
}

module.exports = {
  validateCategoryPayload,
  normalizeText
};
