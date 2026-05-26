const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const auth = require('../middlewares/auth');

router.get('/', donorController.getAllDonors);
router.get('/nearby', donorController.searchNearby);
router.get('/me', auth, donorController.getProfile);
router.put('/me', auth, donorController.updateProfile);
router.patch('/:id/toggle', auth, donorController.toggleAvailability);
router.post('/me/record', auth, donorController.recordDonation);
router.get('/admin/all', auth, donorController.getAdminDonors);
router.delete('/admin/:id', auth, donorController.deleteDonor);

module.exports = router;