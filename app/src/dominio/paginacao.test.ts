import { describe, expect, it } from 'vitest';
import { paginar, type BlocoMedido } from './paginacao';

/** Parte com cabeçalho de 10 e `n` linhas de 10. */
const bloco = (n: number, linha = 10): BlocoMedido => ({ cabecalho: 10, linhas: Array(n).fill(linha) });
const cap = { primeira: 100, demais: 120, espacoEntre: 5 };
const resumo = (p: ReturnType<typeof paginar>) => p.map((pag) => pag.map((t) => `${t.parte}:${t.de}-${t.ate}`));

describe('paginação da letra', () => {
  it('tudo numa folha quando cabe', () => {
    // 40 + 5 + 40 = 85 ≤ 100
    expect(resumo(paginar([bloco(3), bloco(3)], cap))).toEqual([['0:0-3', '1:0-3']]);
  });

  it('parte que não cabe no resto vai inteira para a folha seguinte', () => {
    // 60 + 5 + 50 = 115 > 100 → a 2ª parte vai para a folha 2
    expect(resumo(paginar([bloco(5), bloco(4)], cap))).toEqual([['0:0-5'], ['1:0-4']]);
  });

  it('a 2ª folha usa a capacidade das folhas de continuação', () => {
    // folha 1: 100 → só a 1ª (90). folha 2 (120): 50 + 5 + 50 = 105 cabe
    expect(resumo(paginar([bloco(8), bloco(4), bloco(4)], cap))).toEqual([['0:0-8'], ['1:0-4', '2:0-4']]);
  });

  it('parte maior que uma folha é quebrada por linhas', () => {
    // 20 linhas: folha 1 cabe 9 (10 + 90), folha 2 cabe 11 (10 + 110)
    expect(resumo(paginar([bloco(20)], cap))).toEqual([['0:0-9'], ['0:9-20']]);
  });

  it('não deixa o nome da parte sozinho no fim da folha', () => {
    // 1ª parte usa 80; sobram 20 - 5 de espaço - 10 de cabeçalho = 5 → nenhuma linha → vai para a próxima
    const p = paginar([bloco(7), bloco(30)], cap);
    expect(p[0].map((t) => t.parte)).toEqual([0]);
    expect(p[1][0]).toEqual({ parte: 1, de: 0, ate: 11 });
  });

  it('linhas altas (texto que quebra) contam mais espaço', () => {
    const alta: BlocoMedido = { cabecalho: 10, linhas: [10, 30, 30, 10] }; // 90
    expect(resumo(paginar([bloco(1), alta], cap))).toEqual([['0:0-1'], ['1:0-4']]);
  });

  it('parte vazia ocupa só o cabeçalho e sem partes há uma folha vazia', () => {
    expect(resumo(paginar([bloco(0)], cap))).toEqual([['0:0-0']]);
    expect(paginar([], cap)).toEqual([[]]);
  });
});
