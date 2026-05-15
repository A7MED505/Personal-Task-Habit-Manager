function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateRegisterPayload(payload) {
  const errors = [];
  const username = normalizeText(payload.username);
  const email = normalizeText(payload.email).toLowerCase();
  const password = normalizeText(payload.password);

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
  const errors = [];
  const email = normalizeText(payload.email).toLowerCase();
  const password = normalizeText(payload.password);

  if (!email) {
    errors.push('email is required');
  }

  if (!password) {
    errors.push('password is required');
  }

  return { valid: errors.length === 0, errors, normalized: { email, password } };
}

module.exports = { validateRegisterPayload, validateLoginPayload };
