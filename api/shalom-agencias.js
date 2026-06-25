// Vercel Function — proxy para API de Shalom (evita CORS desde el browser)
import { createHmac, createDecipheriv } from 'crypto';

const SECRET = '.Overskull2023.';

function decryptShalom(encryptedBase64) {
  const hex = Buffer.from(encryptedBase64, 'base64').toString('hex');
  const iv = Buffer.from(hex.substring(0, 32), 'hex');
  const ciphertext = Buffer.from(hex.substring(32), 'hex');
  // Key: UTF-8 del secret, paddeado a 32 bytes con ceros
  const key = Buffer.alloc(32, 0);
  Buffer.from(SECRET, 'utf8').copy(key);
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

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
      const decryptedStr = decryptShalom(json.data);
      const data = JSON.parse(decryptedStr);
      return res.status(200).json(data);
    }

    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
