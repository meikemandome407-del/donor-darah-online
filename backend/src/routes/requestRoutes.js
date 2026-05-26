const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middlewares/auth');

router.post('/', auth, requestController.createRequest);
router.get('/', auth, requestController.getAllRequests);
router.get('/my', auth, requestController.getUserRequests);
router.get('/pending/count', auth, requestController.getPendingCount);
router.get('/admin/export', auth, requestController.exportRequests);
router.patch('/:id/status', auth, requestController.updateStatus);
router.patch('/:id/cancel', auth, requestController.cancelRequest);
router.delete('/:id', auth, requestController.deleteRequest);

module.exports = router;