const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = 'darelbahja_secret_2024';

exports.login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;
        if (!email || !motDePasse)
            return res.status(400).json({ erreur: 'Email et mot de passe requis.' });

        const admin = await Admin.findByEmail(email);
        if (!admin)
            return res.status(401).json({ erreur: 'Identifiants incorrects.' });

        const valide = await Admin.verifierMotDePasse(motDePasse, admin.mot_de_passe);
        if (!valide)
            return res.status(401).json({ erreur: 'Identifiants incorrects.' });

        const token = jwt.sign(
            { idAdmin: admin.id_admin, email: admin.email, role: admin.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, nom: admin.nom, role: admin.role });
    } catch (err) {
        console.error('Erreur login :', err);
        res.status(500).json({ erreur: 'Erreur serveur.' });
    }
};

exports.verifierToken = (req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ erreur: 'Token manquant.' });

    const token = auth.split(' ')[1];
    try {
        req.admin = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ erreur: 'Token invalide ou expiré.' });
    }
};