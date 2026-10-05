import { describe, expect, it } from 'vitest';
import { agruparEmFolhas, paginar, type BlocoMedido, type Coluna } from './paginacao';

/** Parte com cabeçalho de 10 e `n` linhas de altura `linha`. */
const bloco = (n: number, linha = 10): BlocoMedido => ({ cabecalho: 10, linhas: Array(n).fill(linha) });
const resumo = (c: ReturnType<typeof paginar>) => c.map((col) => col.map((t) => `${t.parte}:${t.de}-${t.ate}`));

/** Folhas de UMA coluna: a 1ª com 100 de altura, as demais com 120. */
const umaColuna = (blocos: BlocoMedido[]) => (i: number): Coluna => ({ capacidade: i === 0 ? 100 : 120, blocos });

describe('paginação da letra (uma coluna por folha)', () => {
  it('tudo numa coluna quando cabe', () => {
    const b = [bloco(3), bloco(3)]; // 40 + 5 + 40 = 85 ≤ 100
    expect(resumo(paginar(b.length, umaColuna(b), 5))).toEqual([['0:0-3', '1:0-3']]);
  });

  it('parte que não cabe no resto vai inteira para a coluna seguinte', () => {
    const b = [bloco(5), bloco(4)]; // 60 + 5 + 50 > 100
    expect(resumo(paginar(b.length, umaColuna(b), 5))).toEqual([['0:0-5'], ['1:0-4']]);
  });

  it('parte maior que uma coluna é quebrada por linhas', () => {
    const b = [bloco(20)]; // 1ª: 10 + 9×10; 2ª: 10 + 11×10
    expect(resumo(paginar(b.length, umaColuna(b), 5))).toEqual([['0:0-9'], ['0:9-20']]);
  });

  it('não deixa o nome da parte sozinho no fim da coluna', () => {
    const b = [bloco(7), bloco(30)];
    const c = paginar(b.length, umaColuna(b), 5);
    expect(c[0].map((t) => t.parte)).toEqual([0]);
    expect(c[1][0]).toEqual({ parte: 1, de: 0, ate: 11 });
  });

  it('linhas altas (texto que quebra) contam mais espaço', () => {
    const b = [bloco(1), { cabecalho: 10, linhas: [10, 30, 30, 10] }];
    expect(resumo(paginar(b.length, umaColuna(b), 5))).toEqual([['0:0-1'], ['1:0-4']]);
  });

  it('parte vazia ocupa só o cabeçalho e sem partes há uma coluna vazia', () => {
    expect(resumo(paginar(1, umaColuna([bloco(0)]), 5))).toEqual([['0:0-0']]);
    expect(paginar(0, umaColuna([]), 5)).toEqual([[]]);
  });
});

describe('duas colunas por folha', () => {
  it('coluna estreita usa as medidas da sua largura e pula a curta quando a parte não cabe', () => {
    const larga = [bloco(6), bloco(4), bloco(4)];
    const estreita = [bloco(6), bloco(4, 20), bloco(4)]; // a 2ª parte quebra mais na coluna estreita (90)
    // colunas: 0 larga (100) | 1 estreita curta (60) | 2 estreita (150) | 3 estreita (60)…
    const coluna = (i: number): Coluna =>
      i === 0 ? { capacidade: 100, blocos: larga } : { capacidade: i % 2 === 1 ? 60 : 150, blocos: estreita };
    // parte 0 (70) na coluna 0; parte 1: não cabe no resto (70+5+50), na coluna 1 precisa de 90 > 60 → pula para a 2
    expect(resumo(paginar(3, coluna, 5))).toEqual([['0:0-6'], [], ['1:0-4', '2:0-4']]);
  });

  it('agrupa colunas em folhas e descarta colunas vazias no fim', () => {
    const cols = [[{ parte: 0, de: 0, ate: 1 }], [{ parte: 1, de: 0, ate: 1 }], [{ parte: 2, de: 0, ate: 1 }]];
    // 1ª folha com 1 coluna (tem QR), demais com 2
    expect(agruparEmFolhas(cols, (f) => (f === 0 ? 1 : 2)).map((f) => f.length)).toEqual([1, 2]);
    // 1ª folha com 2 colunas: tudo em 2 folhas, a 2ª com a coluna da direita vazia
    expect(agruparEmFolhas(cols, () => 2)).toEqual([[cols[0], cols[1]], [cols[2], []]]);
    expect(agruparEmFolhas([[]], () => 2)).toEqual([[[], []]]);
  });
});
