const express = require('express');
const {
  getCategories,
  getCategory,
  createNewCategory,
  updateExistingCategory,
  removeCategory
} = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getCategories);
router.post('/', createNewCategory);
router.get('/:id', getCategory);
router.patch('/:id', updateExistingCategory);
router.delete('/:id', removeCategory);

module.exports = router;
