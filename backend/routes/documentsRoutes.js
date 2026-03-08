const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documentsController');

router.get('/', documentsController.getDocuments);
router.get('/:id', documentsController.getDocument);
router.post('/', documentsController.saveDocument);
router.delete('/:id', documentsController.deleteDocument);
router.post('/improve', documentsController.improveDocument);

module.exports = router;
