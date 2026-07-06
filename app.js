const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/commandes', require('./routes/commandes'));

app.get('/', (req, res) => {
    res.json({ message: '✅ Serveur Dar El Bahja opérationnel.' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});