const express = require('express');
const TaskController = require('../../controllers/taskController');
const AuthMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all task routes
router.use(AuthMiddleware.verifyToken);

router.post('/', TaskController.createTask);
router.get('/', TaskController.getTasks);
router.put('/:taskId', TaskController.updateTask);
router.delete('/:taskId', TaskController.deleteTask);

module.exports = router;
