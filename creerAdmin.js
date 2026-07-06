const Admin = require('./models/Admin');

(async () => {
    try {
        const id = await Admin.creerAdmin(
            'Admin Dar El Bahja',
            'darelbahja1@gmail.com',
            'darelbahja2024'
        );
        console.log('✅ Admin créé avec ID :', id);
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur :', err.message);
        process.exit(1);
    }
})();