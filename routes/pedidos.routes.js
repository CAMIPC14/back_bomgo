const { Router } = require('express');
const ctrl = require('../controllers/pedidos.controller');

const router = Router();

router.get('/',           ctrl.getAll);
router.get('/:id',        ctrl.getById);
router.post('/',          ctrl.create);
router.patch('/:id/estado', ctrl.updateEstado);

module.exports = router;

