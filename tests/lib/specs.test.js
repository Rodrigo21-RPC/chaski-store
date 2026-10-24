import { describe, expect, it } from 'vitest';
import { parseSpecs } from '../../client/src/lib/specs.js';

describe('parseSpecs', () => {
  it('convierte las líneas "Etiqueta: valor" en filas', () => {
    expect(parseSpecs('Pantalla: 6.1 pulgadas\nAlmacenamiento: 256 GB')).toEqual([
      { type: 'row', label: 'Pantalla', value: '6.1 pulgadas' },
      { type: 'row', label: 'Almacenamiento', value: '256 GB' },
    ]);
  });

  it('muestra como texto las líneas sin el formato Etiqueta: valor', () => {
    expect(parseSpecs('Garantía de 12 meses')).toEqual([{ type: 'text', text: 'Garantía de 12 meses' }]);
  });

  it('mezcla filas y texto respetando el orden', () => {
    expect(parseSpecs('Pantalla: 6.1 pulgadas\nGarantía de 12 meses')).toEqual([
      { type: 'row', label: 'Pantalla', value: '6.1 pulgadas' },
      { type: 'text', text: 'Garantía de 12 meses' },
    ]);
  });

  it('ignora líneas vacías y recorta espacios', () => {
    expect(parseSpecs('  Peso :  1.2 kg  \n\n   \n  Con estuche  ')).toEqual([
      { type: 'row', label: 'Peso', value: '1.2 kg' },
      { type: 'text', text: 'Con estuche' },
    ]);
  });

  it('acepta saltos de línea de Windows', () => {
    expect(parseSpecs('RAM: 8 GB\r\nSSD: 512 GB')).toEqual([
      { type: 'row', label: 'RAM', value: '8 GB' },
      { type: 'row', label: 'SSD', value: '512 GB' },
    ]);
  });

  it('divide en el primer dos puntos', () => {
    expect(parseSpecs('Garantía: 12 meses: nacional')).toEqual([
      { type: 'row', label: 'Garantía', value: '12 meses: nacional' },
    ]);
  });

  it('devuelve una lista vacía para texto vacío', () => {
    expect(parseSpecs('')).toEqual([]);
    expect(parseSpecs('   \n  ')).toEqual([]);
  });
});
