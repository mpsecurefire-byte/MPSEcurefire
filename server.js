const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy Apollo activo' });
});

app.post('/buscar-prospectos', async (req, res) => {
  try {
    const { api_key, ...filtros } = req.body;
    const keyToUse = process.env.APOLLO_API_KEY || api_key;

    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': keyToUse
      },
      body: JSON.stringify(filtros)
    });

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Proxy corriendo en puerto ' + PORT));