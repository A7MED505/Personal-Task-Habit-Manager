function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePayload(payload) {
  return payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
}

function validateRegisterPayload(payload) {
  const safePayload = normalizePayload(payload);
  const errors = [];
  const username = normalizeText(safePayload.username);
  const email = normalizeText(safePayload.email).toLowerCase();
  const password = normalizeText(safePayload.password);

  if (!username) {
    errors.push('username is required');
  } else if (username.length < 3 || username.length > 32) {
    errors.push('username must be 3-32 characters');
  }

  if (!email) {
    errors.push('email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('email format is invalid');
  }

  if (!password) {
    errors.push('password is required');
  } else if (password.length < 6) {
    errors.push('password must be at least 6 characters');
  }

  return { valid: errors.length === 0, errors, normalized: { username, email, password } };
}

function validateLoginPayload(payload) {
  const safePayload = normalizePayload(payload);
  const errors = [];
  const email = normalizeText(safePayload.email).toLowerCase();
  const password = normalizeText(safePayload.password);

  if (!email) {
    errors.push('email is required');
  }

  if (!password) {
    errors.push('password is required');
  }

  return { valid: errors.length === 0, errors, normalized: { email, password } };
}

module.exports = { validateRegisterPayload, validateLoginPayload };
