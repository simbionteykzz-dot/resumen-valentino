// Vercel Function — proxy para API de Shalom (evita CORS desde el browser)
import { createHmac, createDecipheriv, createHash } from 'crypto';

const SECRET = '.Overskull2023.';

// CryptoJS.AES.encrypt con passphrase usa OpenSSL EVP_BytesToKey (MD5, 1 iter)
function evpBytesToKey(password, salt, keyLen) {
  const result = [];
  let prev = Buffer.alloc(0);
  while (result.reduce((sum, b) => sum + b.length, 0) < keyLen) {
    prev = createHash('md5').update(Buffer.concat([prev, password, salt])).digest();
    result.push(prev);
  }
  return Buffer.concat(result).slice(0, keyLen);
}

function decryptShalom(encryptedBase64) {
  const raw = Buffer.from(encryptedBase64, 'base64');
  const password = Buffer.from(SECRET, 'utf8');

  // CryptoJS OpenSSL format: "Salted__" + 8-byte salt + ciphertext
  if (raw.slice(0, 8).toString('ascii') === 'Salted__') {
    const salt = raw.slice(8, 16);
    const ciphertext = raw.slice(16);
    const keyiv = evpBytesToKey(password, salt, 48); // 32 key + 16 iv
    const key = keyiv.slice(0, 32);
    const iv = keyiv.slice(32, 48);
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }

  // Fallback: raw AES-256-CBC con key/iv derivados del secret (padding con ceros)
  const key = Buffer.alloc(32, 0);
  const iv = Buffer.alloc(16, 0);
  password.copy(key, 0, 0, Math.min(32, password.length));
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(raw), decipher.final()]).toString('utf8');
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
