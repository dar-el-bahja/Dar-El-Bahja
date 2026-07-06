const db = require('../config/db');

const Commande = {

    async upsertClient(nom, telephone, adresse) {
        const [rows] = await db.execute(
            'SELECT id_client FROM clients WHERE telephone = ?', [telephone]
        );
        if (rows.length > 0) {
            await db.execute(
                'UPDATE clients SET adresse = ?, nom_complet = ? WHERE id_client = ?',
                [adresse, nom, rows[0].id_client]
            );
            return rows[0].id_client;
        }
        const [result] = await db.execute(
            'INSERT INTO clients (nom_complet, telephone, adresse) VALUES (?, ?, ?)',
            [nom, telephone, adresse]
        );
        return result.insertId;
    },

    async creer({ client, items, totalProduits, fraisLivraison, canal }) {
        const totalFinal = totalProduits + fraisLivraison;

        const idClient = await Commande.upsertClient(
            client.nom, client.telephone, client.adresse
        );

        const [cmdResult] = await db.execute(
            `INSERT INTO commandes
             (id_client, canal_origine, total_produits, frais_livraison, total_final)
             VALUES (?, ?, ?, ?, ?)`,
            [idClient, canal, totalProduits, fraisLivraison, totalFinal]
        );
        const idCommande = cmdResult.insertId;

        for (const item of items) {
            await db.execute(
                `INSERT INTO lignes_commande (id_commande, id_produit, poids_choisi, prix_unitaire)
                 VALUES (?, NULL, ?, ?)`,
                [idCommande, item.nom || 'Article', item.prix || 0]
            );
        }

        await db.execute(
            'INSERT INTO livraisons (id_commande) VALUES (?)',
            [idCommande]
        );

        return { idCommande, totalFinal };
    },

    async getAll() {
        const [commandes] = await db.execute(`
            SELECT
                c.id_commande, c.statut, c.total_produits,
                c.frais_livraison, c.total_final,
                c.date_commande, c.canal_origine,
                cl.nom_complet, cl.telephone, cl.adresse
            FROM commandes c
            JOIN clients cl ON c.id_client = cl.id_client
            ORDER BY c.date_commande DESC
        `);
        for (const cmd of commandes) {
            const [lignes] = await db.execute(
                `SELECT poids_choisi, prix_unitaire FROM lignes_commande WHERE id_commande = ?`,
                [cmd.id_commande]
            );
            cmd.lignes = lignes;
        }
        return commandes;
    },

    async changerStatut(idCommande, statut) {
        await db.execute(
            'UPDATE commandes SET statut = ? WHERE id_commande = ?',
            [statut, idCommande]
        );
        if (statut === 'expediee') {
            await db.execute(
                `UPDATE livraisons SET statut_livraison = 'en_route', date_envoi = NOW()
                 WHERE id_commande = ?`, [idCommande]
            );
        }
        if (statut === 'livree') {
            await db.execute(
                `UPDATE livraisons SET statut_livraison = 'livree', date_livraison = NOW()
                 WHERE id_commande = ?`, [idCommande]
            );
        }
        return true;
    },

    async getById(idCommande) {
        const [rows] = await db.execute(`
            SELECT c.*, cl.nom_complet, cl.telephone, cl.adresse
            FROM commandes c
            JOIN clients cl ON c.id_client = cl.id_client
            WHERE c.id_commande = ?
        `, [idCommande]);
        return rows[0] || null;
    }
};

module.exports = Commande;