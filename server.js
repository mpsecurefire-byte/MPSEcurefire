const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy Apollo activo' });
});

app.post('/buscar-prospectos', async (req, res) => {
  try {
    const { api_key, ...filtros } = req.body;
    const keyToUse = process.env.APOLLO_API_KEY || api_key;

    console.log('Buscando con filtros:', JSON.stringify(filtros));

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
    console.log('Respuesta Apollo status:', response.status);
    res.json(data);
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Proxy corriendo en puerto ' + PORT));