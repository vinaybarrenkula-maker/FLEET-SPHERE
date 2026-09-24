const express = require('express');
const router = express.Router();
const c = require('../controllers/documentController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');
const { uploaders } = require('../config/cloudinary');

router.use(authenticate, authorizeBranch);
router.get('/', c.getDocuments);
router.post('/', uploaders.documents.single('file'), c.uploadDocument);
router.delete('/:id', c.deleteDocument);

module.exports = router;
