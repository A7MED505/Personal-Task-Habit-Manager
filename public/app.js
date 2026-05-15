const API_BASE = '/api';

const state = {
  tasks: [],
  categories: [],
  stats: {
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
    categories: 0
  },
  filters: {
    search: '',
    status: '',
    priority: '',
    categoryId: ''
  },
  activeView: 'dashboard',
  taskEditingId: '',
  categoryEditingId: '',
  messageTimer: null,
  searchTimer: null
};

const elements = {};

function cacheElements() {
  const ids = [
    'flashMessage',
    'dashboardView',
    'tasksView',
    'categoriesView',
    'taskSearch',
    'taskStatusFilter',
    'taskPriorityFilter',
    'taskCategoryFilter',
    'clearFiltersBtn',
    'refreshAllBtn',
    'taskForm',
    'taskId',
    'taskTitle',
    'taskDescription',
    'taskStatus',
    'taskPriority',
    'taskCategoryId',
    'taskDueDate',
    'taskFormTitle',
    'taskFormSubtitle',
    'cancelTaskEdit',
    'taskList',
    'dashboardRecent',
    'taskCountLabel',
    'categoryForm',
    'categoryId',
    'categoryName',
    'categoryDescription',
    'categoryFormTitle',
    'categoryFormSubtitle',
    'cancelCategoryEdit',
    'categoryList',
    'categoryCountLabel',
    'statTotal',
    'statTodo',
    'statProgress',
    'statDone',
    'statOverdue',
    'statCategories'
  ];

  ids.forEach((id) => {
    elements[id] = document.getElementById(id);
  });
}

function setView(view) {
  state.activeView = view;
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });

  elements.dashboardView.classList.toggle('active', view === 'dashboard');
  elements.tasksView.classList.toggle('active', view === 'tasks');
  elements.categoriesView.classList.toggle('active', view === 'categories');
}

function formatDateTime(value) {
  if (!value) {
    return 'No due date';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function toDateTimeLocalValue(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

function isOverdue(task) {
  if (!task.dueDate || task.status === 'done') {
    return false;
  }

  const dueDate = new Date(task.dueDate);
  return !Number.isNaN(dueDate.getTime()) && dueDate < new Date();
}

function getCategoryName(categoryId) {
  if (!categoryId || typeof categoryId !== 'object') {
    return 'Uncategorized';
  }

  return categoryId.name || 'Uncategorized';
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const details = payload?.details ? ` ${payload.details.join(', ')}` : '';
    throw new Error(payload?.message ? `${payload.message}${details}` : 'Request failed');
  }

  return payload?.data ?? payload;
}

function setMessage(message, type = 'success') {
  elements.flashMessage.textContent = message;
  elements.flashMessage.classList.toggle('error', type === 'error');

  window.clearTimeout(state.messageTimer);
  state.messageTimer = window.setTimeout(() => {
    elements.flashMessage.textContent = '';
    elements.flashMessage.classList.remove('error');
  }, 3500);
}

function setLoading(isLoading) {
  elements.refreshAllBtn.disabled = isLoading;
  elements.refreshAllBtn.textContent = isLoading ? 'Loading...' : 'Refresh Data';
}

function syncFiltersUI() {
  elements.taskSearch.value = state.filters.search;
  elements.taskStatusFilter.value = state.filters.status;
  elements.taskPriorityFilter.value = state.filters.priority;
  elements.taskCategoryFilter.value = state.filters.categoryId;
}

function updateStats() {
  elements.statTotal.textContent = state.stats.total;
  elements.statTodo.textContent = state.stats.todo;
  elements.statProgress.textContent = state.stats.inProgress;
  elements.statDone.textContent = state.stats.done;
  elements.statOverdue.textContent = state.stats.overdue;
  elements.statCategories.textContent = state.stats.categories;
}

function updateCategorySelects() {
  const options = ['<option value="">All categories</option>'];
  const formOptions = ['<option value="">Uncategorized</option>'];

  state.categories.forEach((category) => {
    const option = `<option value="${escapeHtml(category._id)}">${escapeHtml(category.name)}</option>`;
    options.push(option);
    formOptions.push(option);
  });

  elements.taskCategoryFilter.innerHTML = options.join('');
  elements.taskCategoryId.innerHTML = formOptions.join('');
  syncFiltersUI();
}

function renderTaskList(list, container, compact = false) {
  container.innerHTML = '';

  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = compact ? 'No recent tasks yet.' : 'No tasks found. Create one using the form on the right.';
    container.appendChild(empty);
    return;
  }

  list.forEach((task) => {
    const article = document.createElement('article');
    article.className = `task-card ${task.status} ${isOverdue(task) ? 'overdue' : ''}`;

    const top = document.createElement('div');
    top.className = 'task-top';

    const titleBlock = document.createElement('div');
    const title = document.createElement('h4');
    title.className = 'task-title';
    title.textContent = task.title;
    titleBlock.appendChild(title);

    const status = document.createElement('span');
    status.className = `badge status-${task.status}`;
    status.textContent = task.status.replace('-', ' ');
    top.append(titleBlock, status);

    const description = document.createElement('p');
    description.className = 'task-description';
    description.textContent = task.description || 'No description provided.';

    const meta = document.createElement('div');
    meta.className = 'task-meta';
    meta.innerHTML = `
      <span class="meta-chip priority-${task.priority}">Priority: ${escapeHtml(task.priority)}</span>
      <span class="meta-chip">Category: ${escapeHtml(getCategoryName(task.categoryId))}</span>
      <span class="meta-chip">Due: ${escapeHtml(formatDateTime(task.dueDate))}</span>
      ${isOverdue(task) ? '<span class="badge overdue">Overdue</span>' : ''}
    `;

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    actions.innerHTML = `
      <button type="button" data-action="edit-task" data-id="${escapeHtml(task._id)}">Edit</button>
      <button type="button" data-action="delete-task" data-id="${escapeHtml(task._id)}" class="danger">Delete</button>
    `;

    article.append(top, description, meta, actions);
    container.appendChild(article);
  });
}

function renderCategories() {
  elements.categoryList.innerHTML = '';

  if (!state.categories.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No categories yet. Add one to organize your tasks.';
    elements.categoryList.appendChild(empty);
    elements.categoryCountLabel.textContent = '0 items';
    return;
  }

  state.categories.forEach((category) => {
    const taskCount = state.tasks.filter((task) => {
      if (!task.categoryId) {
        return false;
      }

      if (typeof task.categoryId === 'string') {
        return task.categoryId === category._id;
      }

      return task.categoryId._id === category._id;
    }).length;

    const card = document.createElement('article');
    card.className = 'category-card';
    card.innerHTML = `
      <div class="category-top">
        <div>
          <h4 class="category-title">${escapeHtml(category.name)}</h4>
          <p class="subtle">${escapeHtml(category.description || 'No description provided.')}</p>
        </div>
        <span class="badge">${taskCount} tasks</span>
      </div>
      <div class="category-actions">
        <button type="button" data-action="edit-category" data-id="${escapeHtml(category._id)}">Edit</button>
        <button type="button" data-action="delete-category" data-id="${escapeHtml(category._id)}" class="danger">Delete</button>
      </div>
    `;
    elements.categoryList.appendChild(card);
  });

  elements.categoryCountLabel.textContent = `${state.categories.length} items`;
}

function renderDashboard() {
  renderTaskList(state.tasks.slice(0, 3), elements.dashboardRecent, true);
}

function renderTaskCount() {
  elements.taskCountLabel.textContent = `${state.tasks.length} items`;
}

function renderAll() {
  updateStats();
  updateCategorySelects();
  renderTaskList(state.tasks, elements.taskList);
  renderTaskCount();
  renderCategories();
  renderDashboard();
}

async function loadCategories() {
  const result = await request('/categories');
  state.categories = Array.isArray(result?.categories) ? result.categories : [];
}

async function loadTasks() {
  const params = new URLSearchParams();
  Object.entries(state.filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const result = await request(`/tasks?${params.toString()}`);
  state.tasks = Array.isArray(result?.tasks) ? result.tasks : [];
}

async function loadStats() {
  const result = await request('/tasks/stats');
  state.stats = {
    total: result.total || 0,
    todo: result.todo || 0,
    inProgress: result.inProgress || 0,
    done: result.done || 0,
    overdue: result.overdue || 0,
    categories: result.categories || 0
  };
}

async function refreshData({ reloadCategories = true } = {}) {
  setLoading(true);

  try {
    if (reloadCategories) {
      await loadCategories();
    }

    await Promise.all([loadTasks(), loadStats()]);
    renderAll();
  } catch (error) {
    setMessage(error.message, 'error');
  } finally {
    setLoading(false);
  }
}

function resetTaskForm() {
  state.taskEditingId = '';
  elements.taskForm.reset();
  elements.taskId.value = '';
  elements.taskStatus.value = 'todo';
  elements.taskPriority.value = 'medium';
  elements.taskCategoryId.value = '';
  elements.taskFormTitle.textContent = 'Add Task';
  elements.taskFormSubtitle.textContent = 'Create new item';
  elements.cancelTaskEdit.classList.add('hidden');
}

function resetCategoryForm() {
  state.categoryEditingId = '';
  elements.categoryForm.reset();
  elements.categoryId.value = '';
  elements.categoryFormTitle.textContent = 'Add Category';
  elements.categoryFormSubtitle.textContent = 'Create new category';
  elements.cancelCategoryEdit.classList.add('hidden');
}

function startTaskEdit(task) {
  state.taskEditingId = task._id;
  elements.taskId.value = task._id;
  elements.taskTitle.value = task.title || '';
  elements.taskDescription.value = task.description || '';
  elements.taskStatus.value = task.status || 'todo';
  elements.taskPriority.value = task.priority || 'medium';
  elements.taskCategoryId.value = task.categoryId && task.categoryId._id ? task.categoryId._id : '';
  elements.taskDueDate.value = toDateTimeLocalValue(task.dueDate);
  elements.taskFormTitle.textContent = 'Edit Task';
  elements.taskFormSubtitle.textContent = 'Update item details';
  elements.cancelTaskEdit.classList.remove('hidden');
  setView('tasks');
}

function startCategoryEdit(category) {
  state.categoryEditingId = category._id;
  elements.categoryId.value = category._id;
  elements.categoryName.value = category.name || '';
  elements.categoryDescription.value = category.description || '';
  elements.categoryFormTitle.textContent = 'Edit Category';
  elements.categoryFormSubtitle.textContent = 'Update category details';
  elements.cancelCategoryEdit.classList.remove('hidden');
  setView('categories');
}

function buildTaskPayload() {
  return {
    title: elements.taskTitle.value.trim(),
    description: elements.taskDescription.value.trim(),
    status: elements.taskStatus.value,
    priority: elements.taskPriority.value,
    categoryId: elements.taskCategoryId.value || null,
    dueDate: elements.taskDueDate.value ? new Date(elements.taskDueDate.value).toISOString() : null
  };
}

function buildCategoryPayload() {
  return {
    name: elements.categoryName.value.trim(),
    description: elements.categoryDescription.value.trim()
  };
}

async function saveTask(event) {
  event.preventDefault();
  const payload = buildTaskPayload();
  const editing = Boolean(state.taskEditingId);

  try {
    await request(editing ? `/tasks/${state.taskEditingId}` : '/tasks', {
      method: editing ? 'PATCH' : 'POST',
      body: JSON.stringify(payload)
    });

    setMessage(editing ? 'Task updated successfully.' : 'Task created successfully.');
    resetTaskForm();
    await refreshData();
  } catch (error) {
    setMessage(error.message, 'error');
  }
}

async function saveCategory(event) {
  event.preventDefault();
  const payload = buildCategoryPayload();
  const editing = Boolean(state.categoryEditingId);

  try {
    await request(editing ? `/categories/${state.categoryEditingId}` : '/categories', {
      method: editing ? 'PATCH' : 'POST',
      body: JSON.stringify(payload)
    });

    setMessage(editing ? 'Category updated successfully.' : 'Category created successfully.');
    resetCategoryForm();
    await refreshData();
  } catch (error) {
    setMessage(error.message, 'error');
  }
}

async function deleteTask(id) {
  if (!window.confirm('Delete this task?')) {
    return;
  }

  try {
    await request(`/tasks/${id}`, { method: 'DELETE' });
    setMessage('Task deleted.');
    if (state.taskEditingId === id) {
      resetTaskForm();
    }
    await refreshData();
  } catch (error) {
    setMessage(error.message, 'error');
  }
}

async function deleteCategory(id) {
  if (!window.confirm('Delete this category? Linked tasks must be cleared first.')) {
    return;
  }

  try {
    await request(`/categories/${id}`, { method: 'DELETE' });
    setMessage('Category deleted.');
    if (state.categoryEditingId === id) {
      resetCategoryForm();
    }
    await refreshData();
  } catch (error) {
    setMessage(error.message, 'error');
  }
}

function handleTaskListAction(event) {
  const action = event.target.dataset.action;
  const id = event.target.dataset.id;
  if (!action || !id) {
    return;
  }

  const task = state.tasks.find((item) => item._id === id);
  if (action === 'edit-task' && task) {
    startTaskEdit(task);
  }

  if (action === 'delete-task') {
    deleteTask(id);
  }
}

function handleCategoryListAction(event) {
  const action = event.target.dataset.action;
  const id = event.target.dataset.id;
  if (!action || !id) {
    return;
  }

  const category = state.categories.find((item) => item._id === id);
  if (action === 'edit-category' && category) {
    startCategoryEdit(category);
  }

  if (action === 'delete-category') {
    deleteCategory(id);
  }
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  elements.refreshAllBtn.addEventListener('click', () => refreshData());

  elements.clearFiltersBtn.addEventListener('click', () => {
    state.filters = {
      search: '',
      status: '',
      priority: '',
      categoryId: ''
    };
    syncFiltersUI();
    refreshData({ reloadCategories: false });
  });

  elements.taskSearch.addEventListener('input', (event) => {
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(() => {
      state.filters.search = event.target.value.trim();
      refreshData({ reloadCategories: false });
    }, 250);
  });

  elements.taskStatusFilter.addEventListener('change', (event) => {
    state.filters.status = event.target.value;
    refreshData({ reloadCategories: false });
  });

  elements.taskPriorityFilter.addEventListener('change', (event) => {
    state.filters.priority = event.target.value;
    refreshData({ reloadCategories: false });
  });

  elements.taskCategoryFilter.addEventListener('change', (event) => {
    state.filters.categoryId = event.target.value;
    refreshData({ reloadCategories: false });
  });

  elements.taskForm.addEventListener('submit', saveTask);
  elements.categoryForm.addEventListener('submit', saveCategory);
  elements.cancelTaskEdit.addEventListener('click', resetTaskForm);
  elements.cancelCategoryEdit.addEventListener('click', resetCategoryForm);
  elements.taskList.addEventListener('click', handleTaskListAction);
  elements.dashboardRecent.addEventListener('click', handleTaskListAction);
  elements.categoryList.addEventListener('click', handleCategoryListAction);
}

async function bootstrap() {
  cacheElements();
  bindEvents();
  setView('dashboard');
  resetTaskForm();
  resetCategoryForm();
  await refreshData();
}

document.addEventListener('DOMContentLoaded', bootstrap);
