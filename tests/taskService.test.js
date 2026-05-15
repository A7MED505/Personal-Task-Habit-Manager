const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildTaskQuery,
  createTask,
  updateTask
} = require('../src/services/taskService');
const { validateTaskPayload } = require('../src/validators/taskValidator');

const validCategoryId = '507f1f77bcf86cd799439011';

test('validateTaskPayload normalizes valid task input', () => {
  const result = validateTaskPayload(
    {
      title: '  Read chapter 1  ',
      description: '  Review the introduction  ',
      status: 'todo',
      priority: 'high',
      categoryId: validCategoryId,
      dueDate: '2026-05-30T10:00:00.000Z'
    },
    { partial: false }
  );

  assert.equal(result.valid, true);
  assert.equal(result.normalized.title, 'Read chapter 1');
  assert.equal(result.normalized.description, 'Review the introduction');
  assert.equal(result.normalized.status, 'todo');
  assert.equal(result.normalized.priority, 'high');
  assert.equal(result.normalized.categoryId, validCategoryId);
  assert.equal(result.normalized.dueDate instanceof Date, true);
});

test('validateTaskPayload rejects invalid status values', () => {
  const result = validateTaskPayload({ title: 'Task', status: 'blocked' }, { partial: false });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('Status must be one of')));
});

test('buildTaskQuery maps filters and pagination safely', () => {
  const result = buildTaskQuery({
    search: 'lesson',
    status: 'done',
    priority: 'medium',
    categoryId: validCategoryId,
    page: '2',
    limit: '8',
    sortBy: 'title',
    sortOrder: 'asc'
  });

  assert.deepEqual(result.filter.$or.length, 2);
  assert.equal(result.filter.status, 'done');
  assert.equal(result.filter.priority, 'medium');
  assert.equal(result.filter.categoryId, validCategoryId);
  assert.equal(result.page, 2);
  assert.equal(result.limit, 8);
  assert.deepEqual(result.sort, { title: 1 });
});

test('createTask sets completedAt when status is done', async () => {
  const taskDoc = {
    ...{
      title: 'Complete assignment',
      status: 'done',
      priority: 'medium',
      categoryId: validCategoryId
    },
    populate: async () => taskDoc,
    toObject: () => taskDoc
  };

  const TaskModel = {
    create: async (payload) => {
      Object.assign(taskDoc, payload);
      return taskDoc;
    }
  };

  const CategoryModel = {
    findById: async (id) => (id === validCategoryId ? { _id: id } : null)
  };

  const result = await createTask(
    {
      title: 'Complete assignment',
      status: 'done',
      priority: 'medium',
      categoryId: validCategoryId
    },
    { TaskModel, CategoryModel }
  );

  assert.equal(result.title, 'Complete assignment');
  assert.equal(result.completedAt instanceof Date, true);
});

test('updateTask clears completedAt when task returns to todo', async () => {
  const savedTask = {
    _id: '507f1f77bcf86cd799439012',
    title: 'Complete assignment',
    status: 'done',
    priority: 'medium',
    categoryId: validCategoryId,
    completedAt: new Date('2026-05-10T10:00:00.000Z'),
    save: async () => savedTask,
    populate: async () => savedTask,
    toObject: () => savedTask
  };

  const TaskModel = {
    findOne: async () => savedTask
  };

  const CategoryModel = {
    findById: async (id) => (id === validCategoryId ? { _id: id } : null)
  };

  const result = await updateTask(
    savedTask._id,
    {
      status: 'todo',
      title: 'Complete assignment'
    },
    { TaskModel, CategoryModel }
  );

  assert.equal(result.status, 'todo');
  assert.equal(result.completedAt, null);
});
