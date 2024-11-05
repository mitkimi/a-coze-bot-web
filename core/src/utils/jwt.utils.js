import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import fs from 'fs'
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = currentFilePath.substring(0, currentFilePath.lastIndexOf('/') - 6)
.substring(0, currentFilePath.lastIndexOf('/'))
const secretKey = fs.readFileSync(currentDir + '/configs/private_key.pem', 'utf-8')
export const createToken = (header, payload) => {
  const JWT = jwt.sign(payload, secretKey, {
    header: { ...header }
  })
  return JWT
}

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    console.log('Decoded Payload:', decoded);
    return decoded;
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return null;
  }
}