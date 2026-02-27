const logger = require('../utils/logger');
const { NotFoundError, AuthorizationError } = require('../exceptions/ApplicationError');
const { TaskValidator } = require('../utils/validators');
const Task = require('../models/Task');

class TaskController {
  static async createTask(req, res, next) {
    try {
      const { title, description, priority } = req.body;
      const userId = req.user.sub;
      
      TaskValidator.validateCreate(req.body);
      
      const task = new Task({
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'medium',
        status: 'pending'
      });

      await task.save();
      
      logger.info(`Task created: ${task._id}`);
      
      return res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTasks(req, res, next) {
    try {
      const userId = req.user.sub;
      const { status, priority, page = 1, limit = 10 } = req.query;
      
      const query = { user_id: userId };
      
      if (status && ['pending', 'in_progress', 'completed', 'archived'].includes(status)) {
        query.status = status;
      }
      
      if (priority && ['low', 'medium', 'high'].includes(priority)) {
        query.priority = priority;
      }
      
      const pageNum = Math.max(1, parseInt(page));
      const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * pageSize;
      
      const tasks = await Task.find(query)
        .sort({ created_at: -1 })
        .skip(offset)
        .limit(pageSize);
        
      const totalTasks = await Task.countDocuments(query);
      
      return res.json({
        success: true,
        data: tasks,
        pagination: {
          total: totalTasks,
          page: pageNum,
          limit: pageSize
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateTask(req, res, next) {
    try {
      const { taskId } = req.params;
      const { title, description, status, priority } = req.body;
      const userId = req.user.sub;
      
      const task = await Task.findById(taskId);
      
      if (!task) {
        throw new NotFoundError('Task');
      }
      
      if (task.user_id.toString() !== userId && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot update other users\' tasks');
      }
      
      let isUpdated = false;
      if (title !== undefined) {
        task.title = title.trim();
        isUpdated = true;
      }
      
      if (description !== undefined) {
        task.description = description?.trim() || null;
        isUpdated = true;
      }
      
      if (status !== undefined && ['pending', 'in_progress', 'completed', 'archived'].includes(status)) {
        task.status = status;
        isUpdated = true;
      }
      
      if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) {
        task.priority = priority;
        isUpdated = true;
      }
      
      if (isUpdated) {
         await task.save();
      }
      
      logger.info(`Task updated: ${taskId}`);
      
      return res.json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteTask(req, res, next) {
    try {
      const { taskId } = req.params;
      const userId = req.user.sub;
      
      const task = await Task.findById(taskId);
      
      if (!task) {
        throw new NotFoundError('Task');
      }
      
      if (task.user_id.toString() !== userId && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot delete other users\' tasks');
      }
      
      await Task.findByIdAndDelete(taskId);
      
      logger.info(`Task deleted: ${taskId}`);
      
      return res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
