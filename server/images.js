import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Identifica el formato por los bytes iniciales; nunca confía en el nombre ni en el tipo declarado.
export function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return 'png';
  if (buffer.length >= 12 && buffer.toString('latin1', 0, 4) === 'RIFF' && buffer.toString('latin1', 8, 12) === 'WEBP') {
    return 'webp';
  }
  return null;
}

// Guarda la foto con nombre aleatorio y la extensión del formato detectado.
export function saveImage(buffer, type, uploadsDir) {
  const name = `${crypto.randomUUID()}.${type}`;
  fs.writeFileSync(path.join(uploadsDir, name), buffer);
  return name;
}

// Borra una foto de la carpeta de fotos; ignora si ya no existe y nunca sale de la carpeta.
export function deleteImage(name, uploadsDir) {
  if (!name || name === '.' || name === '..' || name !== path.basename(name)) return;
  fs.rmSync(path.join(uploadsDir, name), { force: true });
}
