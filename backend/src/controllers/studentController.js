const logger = require('../utils/logger');
const { NotFoundError, AuthorizationError, ValidationError } = require('../exceptions/ApplicationError');
const StudentRecord = require('../models/StudentRecord');

class StudentController {
  static async createRecord(req, res, next) {
    try {
      const { student_name, student_id_number, grade } = req.body;
      const teacherId = req.user.sub;
      
      if (req.user.role !== 'teacher') {
         throw new AuthorizationError('Only teachers can add student records');
      }
      
      if (!student_name || student_name.trim().length === 0) {
        throw new ValidationError('Validation failed', { name: 'Student name is required' });
      }

      if (!student_id_number || student_id_number.trim().length === 0) {
        throw new ValidationError('Validation failed', { name: 'Student ID number is required' });
      }
      
      const record = new StudentRecord({
        teacher_id: teacherId,
        student_name: student_name.trim(),
        student_id_number: student_id_number.trim(),
        grade: grade || 'Pending'
      });

      await record.save();
      
      logger.info(`Student record created: ${record._id}`);
      
      return res.status(201).json({
        success: true,
        data: record,
        message: 'Student record added successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getRecords(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      let query = {};
      
      // If user is a student, only show records matching their name
      if (req.user.role === 'student' && req.user.first_name && req.user.last_name) {
        const fullName = `${req.user.first_name} ${req.user.last_name}`.trim();
        // Use case-insensitive regex to find their specific record
        query = { student_name: { $regex: new RegExp(`^${fullName}$`, 'i') } };
      }
      
      const pageNum = Math.max(1, parseInt(page));
      const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * pageSize;
      
      const records = await StudentRecord.find(query)
        .sort({ created_at: -1 })
        .skip(offset)
        .limit(pageSize);
        
      const totalRecords = await StudentRecord.countDocuments(query);
      
      return res.json({
        success: true,
        data: records,
        pagination: {
          total: totalRecords,
          page: pageNum,
          limit: pageSize
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateRecord(req, res, next) {
    try {
      const { recordId } = req.params;
      const { student_name, student_id_number, grade } = req.body;
      
      if (req.user.role !== 'teacher') {
         throw new AuthorizationError('Only teachers can update student records');
      }
      
      const record = await StudentRecord.findById(recordId);
      
      if (!record) {
        throw new NotFoundError('Student Record');
      }
      
      let isUpdated = false;
      if (student_name !== undefined) {
        record.student_name = student_name.trim();
        isUpdated = true;
      }
      
      if (student_id_number !== undefined) {
        record.student_id_number = student_id_number.trim();
        isUpdated = true;
      }
      
      if (grade !== undefined && ['A', 'B', 'C', 'D', 'F', 'Pending'].includes(grade)) {
        record.grade = grade;
        isUpdated = true;
      }
      
      if (isUpdated) {
         record.updated_at = Date.now();
         await record.save();
      }
      
      logger.info(`Student record updated: ${recordId}`);
      
      return res.json({
        success: true,
        data: record
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteRecord(req, res, next) {
    try {
      const { recordId } = req.params;
      
      if (req.user.role !== 'teacher') {
         throw new AuthorizationError('Only teachers can delete student records');
      }
      
      const record = await StudentRecord.findById(recordId);
      
      if (!record) {
        throw new NotFoundError('Student Record');
      }
      
      await StudentRecord.findByIdAndDelete(recordId);
      
      logger.info(`Student record deleted: ${recordId}`);
      
      return res.json({ success: true, message: 'Student record deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StudentController;
