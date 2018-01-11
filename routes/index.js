const express = require('express');
const router = express.Router();

router.use('/', require('./user_api'));
router.use('/', require('./product_api'));
router.use('/', require('./device_api'));
router.use('/', require('./place_api'));
router.use('/', require('./trade_api'));

module.exports = router;