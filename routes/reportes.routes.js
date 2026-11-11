const { Router } = require('express');
const ctrl = require('../controllers/reportes.controller');

const router = Router();

router.get('/mas-vendidos', ctrl.masVendidos);

module.exports = router;

