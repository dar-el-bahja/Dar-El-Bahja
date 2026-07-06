const Commande = require('../models/Commande');

exports.creerCommande = async (req, res) => {
    try {
        const { client, items, totalProduits, fraisLivraison, canal } = req.body;

        if (!client?.nom || !client?.telephone || !client?.adresse)
            return res.status(400).json({ erreur: 'Informations client manquantes.' });
        if (!items || items.length === 0)
            return res.status(400).json({ erreur: 'Panier vide.' });
        if (!/^(05|06|07)\d{8}$/.test(client.telephone))
            return res.status(400).json({ erreur: 'Numéro de téléphone invalide.' });
        if ((totalProduits + fraisLivraison) < 130)
            return res.status(400).json({ erreur: 'Montant minimum 130 DH non atteint.' });

        const result = await Commande.creer({
            client, items,
            totalProduits: parseFloat(totalProduits),
            fraisLivraison: parseFloat(fraisLivraison) || 30,
            canal: canal || 'site_panier'
        });

        res.status(201).json({
            message: 'Commande enregistrée.',
            idCommande: result.idCommande,
            totalFinal: result.totalFinal
        });
    } catch (err) {
        console.error('Erreur creerCommande :', err);
        res.status(500).json({ erreur: 'Erreur serveur.' });
    }
};

exports.getCommandes = async (req, res) => {
    try {
        const commandes = await Commande.getAll();
        res.json(commandes);
    } catch (err) {
        console.error('Erreur getCommandes :', err);
        res.status(500).json({ erreur: 'Erreur serveur.' });
    }
};

exports.changerStatut = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        const statutsValides = ['recue','confirmee','en_preparation','expediee','livree','annulee'];
        if (!statutsValides.includes(statut))
            return res.status(400).json({ erreur: 'Statut invalide.' });

        await Commande.changerStatut(id, statut);
        const commande = await Commande.getById(id);
        res.json({ message: 'Statut mis à jour.', commande });
    } catch (err) {
        console.error('Erreur changerStatut :', err);
        res.status(500).json({ erreur: 'Erreur serveur.' });
    }
};