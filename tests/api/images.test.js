import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deleteImage, detectImageType, saveImage } from '../../server/images.js';
import { JPG, PNG, WEBP } from './helpers.js';

describe('detectImageType', () => {
  it('reconoce JPG, PNG y WebP por sus bytes iniciales', () => {
    expect(detectImageType(JPG)).toBe('jpg');
    expect(detectImageType(PNG)).toBe('png');
    expect(detectImageType(WEBP)).toBe('webp');
  });

  it('devuelve null para HTML, GIF, SVG, vacío y buffers cortos', () => {
    expect(detectImageType(Buffer.from('<!doctype html><title>x</title>'))).toBeNull();
    expect(detectImageType(Buffer.from('GIF89a......'))).toBeNull();
    expect(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
    expect(detectImageType(Buffer.alloc(0))).toBeNull();
    expect(detectImageType(Buffer.from([0xff, 0xd8]))).toBeNull();
    expect(detectImageType(Buffer.from('RIFF....WAVE'))).toBeNull();
  });

  it('un HTML con nombre foto.png y tipo image/png se rechaza: solo importan los bytes', () => {
    const disguised = Buffer.from('<html><script>alert(1)</script></html>');
    expect(detectImageType(disguised)).toBeNull();
  });
});

describe('saveImage y deleteImage', () => {
  let dir;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chaski-images-'));
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  it('guarda con nombre aleatorio y la extensión según el formato detectado', () => {
    const png = saveImage(PNG, 'png', dir);
    const jpg = saveImage(JPG, 'jpg', dir);
    const webp = saveImage(WEBP, 'webp', dir);
    expect(png).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(jpg).toMatch(/^[0-9a-f-]{36}\.jpg$/);
    expect(webp).toMatch(/^[0-9a-f-]{36}\.webp$/);
    expect(new Set([png, jpg, webp]).size).toBe(3);
    expect(fs.readFileSync(path.join(dir, png))).toEqual(PNG);
  });

  it('deleteImage borra el archivo y no falla si ya no existe', () => {
    const name = saveImage(PNG, 'png', dir);
    deleteImage(name, dir);
    expect(fs.existsSync(path.join(dir, name))).toBe(false);
    expect(() => deleteImage(name, dir)).not.toThrow();
  });

  it('deleteImage no sale de la carpeta de fotos', () => {
    const outside = path.join(path.dirname(dir), `fuera-${path.basename(dir)}.txt`);
    fs.writeFileSync(outside, 'no me borres');
    deleteImage(`../${path.basename(outside)}`, dir);
    expect(fs.existsSync(outside)).toBe(true);
    fs.rmSync(outside, { force: true });
  });
});
