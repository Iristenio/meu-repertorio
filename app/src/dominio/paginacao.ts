// Distribui as partes da letra pelas COLUNAS das folhas A4 (regra 9 da ESPECIFICACAO.md).
// Função PURA: recebe as alturas já medidas na tela e devolve o que vai em cada coluna.
//
// Cada folha tem 1 coluna de letra (quando há o QR Code ao lado) ou 2 colunas (folhas de
// continuação e músicas sem link). Colunas diferentes podem ter largura diferente — por isso cada
// coluna traz as medidas das partes NA SUA largura (linhas longas quebram mais na coluna estreita).
//
// Regras:
//  • a parte inteira vai para a coluna seguinte se não couber no espaço que sobrou;
//  • se não couber na seguinte (ex.: coluna curta acima do violão), tenta a próxima depois dela;
//  • só quebra uma parte no meio se ela não couber inteira em nenhuma dessas colunas;
//  • nunca deixa o nome da parte sozinho no fim da coluna (pelo menos 2 linhas juntas, quando houver).

export interface BlocoMedido {
  /** Altura da faixa com o nome da parte (incluindo o espaço até a 1ª linha). */
  cabecalho: number;
  /** Altura de cada linha da letra (linhas longas que quebram ficam mais altas). */
  linhas: number[];
}

export interface Coluna {
  /** Altura disponível para a letra. */
  capacidade: number;
  /** Medidas de cada parte na largura desta coluna. */
  blocos: BlocoMedido[];
}

export interface Trecho {
  /** Posição da parte na música. */
  parte: number;
  /** Linhas [de, ate) da parte que vão nesta coluna. */
  de: number;
  ate: number;
}

const soma = (v: number[]) => v.reduce((s, n) => s + n, 0);
/** Folga para arredondamentos de medida (em px). */
const FOLGA = 0.5;
/** Quantas colunas à frente procurar uma que caiba a parte inteira. */
const OLHAR_ADIANTE = 2;

/**
 * @param partes quantidade de partes
 * @param coluna descrição da coluna nº i (0 = 1ª coluna da 1ª folha)
 * @returns trechos de cada coluna, em ordem
 */
export function paginar(partes: number, coluna: (i: number) => Coluna, espacoEntre: number): Trecho[][] {
  const colunas: Trecho[][] = [[]];
  let usado = 0;
  const atual = () => coluna(colunas.length - 1);
  const avancar = () => {
    colunas.push([]);
    usado = 0;
  };
  const espaco = () => (usado > 0 ? espacoEntre : 0);
  const totalEm = (c: Coluna, parte: number) => c.blocos[parte].cabecalho + soma(c.blocos[parte].linhas);
  const colocar = (parte: number, de: number, ate: number, altura: number) => {
    usado += espaco() + altura;
    colunas[colunas.length - 1].push({ parte, de, ate });
  };

  for (let parte = 0; parte < partes; parte++) {
    const n = atual().blocos[parte].linhas.length;

    // 1) Cabe inteira no que sobrou
    if (usado + espaco() + totalEm(atual(), parte) <= atual().capacidade + FOLGA) {
      colocar(parte, 0, n, totalEm(atual(), parte));
      continue;
    }
    // 2) Cabe inteira numa das próximas colunas
    let pulou = false;
    for (let k = 1; k <= OLHAR_ADIANTE; k++) {
      const c = coluna(colunas.length - 1 + k);
      if (totalEm(c, parte) <= c.capacidade + FOLGA) {
        for (let j = 0; j < k; j++) avancar();
        colocar(parte, 0, n, totalEm(c, parte));
        pulou = true;
        break;
      }
    }
    if (pulou) continue;

    // 3) Grande demais: quebra por linhas, coluna a coluna
    let inicio = 0;
    while (inicio < n || (n === 0 && inicio === 0)) {
      const bloco = atual().blocos[parte];
      const disponivel = atual().capacidade + FOLGA - usado - espaco() - bloco.cabecalho;
      let cabem = 0;
      let altura = 0;
      while (inicio + cabem < n && altura + bloco.linhas[inicio + cabem] <= disponivel) {
        altura += bloco.linhas[inicio + cabem];
        cabem++;
      }
      if (cabem < Math.min(2, n - inicio) && usado > 0) {
        avancar();
        continue;
      }
      if (cabem === 0) {
        // Coluna vazia e nem uma linha cabe (caso extremo): coloca uma mesmo assim
        cabem = Math.min(1, n - inicio);
        altura = soma(bloco.linhas.slice(inicio, inicio + cabem));
      }
      colocar(parte, inicio, inicio + cabem, bloco.cabecalho + altura);
      inicio += cabem;
      if (n === 0) break;
      if (inicio < n) avancar();
    }
  }

  return colunas;
}

/**
 * Agrupa as colunas em folhas. `colunasNaFolha(f)` = quantas colunas de letra a folha f tem.
 * Colunas vazias no fim são descartadas (mas a 1ª folha sempre existe).
 */
export function agruparEmFolhas(colunas: Trecho[][], colunasNaFolha: (folha: number) => number): Trecho[][][] {
  const ultimaComTexto = colunas.reduce((u, c, i) => (c.length ? i : u), 0);
  const folhas: Trecho[][][] = [];
  let i = 0;
  for (let f = 0; i <= ultimaComTexto; f++) {
    const qtd = colunasNaFolha(f);
    const folha: Trecho[][] = [];
    for (let k = 0; k < qtd; k++) folha.push(colunas[i + k] ?? []);
    folhas.push(folha);
    i += qtd;
  }
  return folhas;
}
