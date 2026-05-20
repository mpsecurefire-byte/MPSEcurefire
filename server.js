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
  res.json({ status: 'ok', message: 'Proxy PDL activo' });
});

app.post('/buscar-prospectos', async (req, res) => {
  try {
    const { person_titles, person_locations, organization_num_employees_ranges, per_page } = req.body;
    const apiKey = process.env.PDL_API_KEY;

    const [min, max] = (organization_num_employees_ranges?.[0] || '11,200').split(',');

    const params = new URLSearchParams({
      api_key: apiKey,
      pretty: true,
      size: per_page || 10,
      titleRole: person_titles?.slice(0, 3).join(';') || 'CEO',
      country: person_locations?.[0] === 'Mexico' ? 'mexico' : 'united states',
      minEmployeeCount: min || '11',
      maxEmployeeCount: max || '200'
    });

    const response = await fetch(`https://api.peopledatalabs.com/v5/person/search?${params}`, {
      headers: { 'X-Api-Key': apiKey }
    });

    const data = await response.json();
    console.log('PDL status:', response.status, 'total:', data.total);

    if (!response.ok) throw new Error(data.error?.message || `Error ${response.status}`);

    const people = (data.data || []).map(p => ({
      first_name: p.first_name,
      last_name: p.last_name,
      title: p.job_title,
      email: p.work_email || p.emails?.[0]?.address,
      phone_numbers: p.phone_numbers?.map(n => ({ raw_number: n })),
      linkedin_url: p.linkedin_url,
      city: p.location_locality,
      country: p.location_country,
      organization: { name: p.job_company_name }
    }));

    res.json({ people });
  } catch (e) {
    console.error('Error PDL:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Proxy corriendo en puerto ' + PORT));