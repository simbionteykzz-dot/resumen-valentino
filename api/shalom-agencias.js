// Vercel Function — proxy para API de Shalom (evita CORS desde el browser)
import { createHmac } from 'crypto';
import CryptoJS from 'crypto-js';

const SECRET = '.Overskull2023.';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const uuid = `web-${crypto.randomUUID()}`;
    const time = Math.floor(Date.now() / 1000) + 30;
    const raw = `${uuid}@${time}`;
    const hash = createHmac('sha256', SECRET).update(raw).digest('hex');
    const authToken = `${raw}@${hash}`;

    const upstream = await fetch('https://serviceswebapi.shalomcontrol.com/api/v1/web/agencias/listar', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + authToken,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        Origin: 'https://shalom.com.pe',
        Referer: 'https://shalom.com.pe/',
      },
    });

    const json = await upstream.json();

    if (json.encrypted && json.data) {
      const decrypted = CryptoJS.AES.decrypt(json.data, SECRET).toString(CryptoJS.enc.Utf8);
      const data = JSON.parse(decrypted);
      return res.status(200).json(data);
    }

    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
