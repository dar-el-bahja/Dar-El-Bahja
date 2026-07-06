const mysql = require('mysql2');

const pool = mysql.createPool({
    host:     'localhost',
    user:     'root',       // votre utilisateur MySQL Workbench
    password: 'VotreNouveauMotDePasse',           // votre mot de passe MySQL Workbench (laisser vide si pas de mdp)
    database: 'dar_elbahja',
    waitForConnections: true,
    connectionLimit: 10,
});

const db = pool.promise();

pool.getConnection((err, conn) => {
    if (err) {
        console.error('❌ Erreur connexion MySQL :', err.message);
    } else {
        console.log('✅ Connecté à la base MySQL dar_elbahja');
        conn.release();
    }
});

module.exports = db;