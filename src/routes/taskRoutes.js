const express = require('express');
const {
  getTasks,
  getTask,
  createNewTask,
  updateExistingTask,
  removeTask,
  getDashboardStats
} = require('../controllers/taskController');

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/', getTasks);
router.post('/', createNewTask);
router.get('/:id', getTask);
router.patch('/:id', updateExistingTask);
router.delete('/:id', removeTask);

module.exports = router;
