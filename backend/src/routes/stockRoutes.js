const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const auth = require('../middlewares/auth');

router.get('/', stockController.getStocks);
router.post('/update', auth, stockController.updateStock);
router.delete('/:bloodType', auth, stockController.deleteStock);

module.exports = router;
