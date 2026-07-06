const db     = require('../config/db');
const bcrypt = require('bcryptjs');

const Admin = {

    async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM administrateurs WHERE email = ?', [email]
        );
        return rows[0] || null;
    },

    async verifierMotDePasse(motDePasse, hash) {
        return bcrypt.compare(motDePasse, hash);
    },

    async creerAdmin(nom, email, motDePasse) {
        const hash = await bcrypt.hash(motDePasse, 10);
        const [result] = await db.execute(
            'INSERT INTO administrateurs (nom, email, mot_de_passe) VALUES (?, ?, ?)',
            [nom, email, hash]
        );
        return result.insertId;
    }
};

module.exports = Admin;