// QR Code gerado no próprio aparelho (funciona sem internet).
import qrcode from 'qrcode-generator';

/** Desenho do QR como um único caminho SVG (1 unidade = 1 quadradinho), sem margem. */
export function caminhoQr(texto: string): { tamanho: number; d: string } {
  // Nível M: aguenta ~15% de dano (papel amassado, impressora fraca) sem ficar denso demais
  const qr = qrcode(0, 'M');
  qr.addData(texto);
  qr.make();
  const tamanho = qr.getModuleCount();
  let d = '';
  for (let linha = 0; linha < tamanho; linha++) {
    for (let col = 0; col < tamanho; col++) {
      if (!qr.isDark(linha, col)) continue;
      // Junta quadradinhos vizinhos da mesma linha num retângulo só
      let fim = col;
      while (fim + 1 < tamanho && qr.isDark(linha, fim + 1)) fim++;
      d += `M${col} ${linha}h${fim - col + 1}v1h${-(fim - col + 1)}z`;
      col = fim;
    }
  }
  return { tamanho, d };
}
