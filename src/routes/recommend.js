const express = require('express');
const router = express.Router();
const { recommend } = require('../controllers/recommendController');

// POST /recommend — get a food recommendation
router.post('/', recommend);

module.exports = router;