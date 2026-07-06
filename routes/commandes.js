const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/commandeController');
const { verifierToken } = require('../controllers/authController');

// Route publique — le site envoie la commande ici
router.post('/', ctrl.creerCommande);

// Routes protégées — admin uniquement
router.get('/',             verifierToken, ctrl.getCommandes);
router.patch('/:id/statut', verifierToken, ctrl.changerStatut);

module.exports = router;