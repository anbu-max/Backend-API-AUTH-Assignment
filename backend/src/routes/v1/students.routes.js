const express = require('express');
const StudentController = require('../../controllers/studentController');
const AuthMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();
router.use(AuthMiddleware.verifyToken);

router.post('/', StudentController.createRecord);
router.get('/', StudentController.getRecords);
router.put('/:recordId', StudentController.updateRecord);
router.delete('/:recordId', StudentController.deleteRecord);

module.exports = router;
