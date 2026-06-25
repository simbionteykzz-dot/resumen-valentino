// Vercel Function — proxy para API de Shalom (evita CORS desde el browser)
import { createHmac } from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const uuid = `web-${crypto.randomUUID()}`;
    const time = Math.floor(Date.now() / 1000) + 30;
    const raw = `${uuid}@${time}`;
    const hash = createHmac('sha256', '.Overskull2023.').update(raw).digest('hex');
    const authToken = `${raw}@${hash}`;

    const form = new FormData();
    const upstream = await fetch('https://serviceswebapi.shalomcontrol.com/api/v1/web/agencias/listar', {
      method: 'POST',
      body: form,
      headers: { Authorization: 'Bearer ' + authToken },
    });

    const data = await upstream.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
