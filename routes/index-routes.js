const express = require('express');
const { indexDaily, indexClearance } = require('../controllers/index-ctrl');

const router = express.Router();

router.use(function (req, res, next) {
    next()
})

router.get('/daily', indexDaily);

router.get('/clearance', indexClearance);

module.exports = router;
