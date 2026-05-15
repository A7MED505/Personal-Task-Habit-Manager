const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateCategoryPayload
} = require('../src/validators/categoryValidator');
const { deleteCategory } = require('../src/services/categoryService');

test('validateCategoryPayload trims category fields', () => {
  const result = validateCategoryPayload(
    {
      name: '  Learning  ',
      description: '  Study sessions and notes  '
    },
    { partial: false }
  );

  assert.equal(result.valid, true);
  assert.equal(result.normalized.name, 'Learning');
  assert.equal(result.normalized.description, 'Study sessions and notes');
});

test('deleteCategory blocks removal when tasks still reference it', async () => {
  const CategoryModel = {
    findOneAndDelete: async () => null
  };

  const TaskModel = {
    countDocuments: async () => 2
  };

  await assert.rejects(
    () => deleteCategory('507f1f77bcf86cd799439011', { CategoryModel, TaskModel }),
    (error) => error.statusCode === 409
  );
});

test('deleteCategory removes an unused category', async () => {
  const deleted = { _id: '507f1f77bcf86cd799439011', name: 'Learning', toObject: () => deleted };

  const CategoryModel = {
    findOneAndDelete: async () => deleted
  };

  const TaskModel = {
    countDocuments: async () => 0
  };

  const result = await deleteCategory('507f1f77bcf86cd799439011', { CategoryModel, TaskModel });

  assert.equal(result.name, 'Learning');
});
