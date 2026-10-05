import { describe, expect, it } from 'vitest';
import { caminhoQr } from './qr';

describe('QR Code', () => {
  it('gera um desenho quadrado para um link do YouTube', () => {
    const { tamanho, d } = caminhoQr('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(tamanho).toBeGreaterThanOrEqual(21);
    expect(d.startsWith('M0 0h7')).toBe(true); // marcador do canto superior esquerdo
  });
  it('links maiores geram QR maiores', () => {
    expect(caminhoQr('https://youtu.be/a'.padEnd(200, 'x')).tamanho).toBeGreaterThan(caminhoQr('https://youtu.be/a').tamanho);
  });
});
