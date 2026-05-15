const express = require('express');
const router = express.Router();
const { autocomplete } = require('../controllers/locationController');

// GET /location/autocomplete?q=query
router.get('/autocomplete', autocomplete);

module.exports = router;