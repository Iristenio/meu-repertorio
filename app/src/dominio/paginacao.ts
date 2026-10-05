// Distribui as partes da letra pelas folhas A4 (regra 9 da ESPECIFICACAO.md).
// Função PURA: recebe as alturas já medidas na tela e devolve o que vai em cada folha.
//
// Regras:
//  • a parte inteira vai para a folha seguinte se não couber no espaço que sobrou;
//  • só quebra uma parte no meio se ela sozinha for maior que uma folha inteira;
//  • nunca deixa o nome da parte sozinho no fim da folha (pelo menos 2 linhas juntas, quando houver).

export interface BlocoMedido {
  /** Altura da faixa com o nome da parte (incluindo o espaço até a 1ª linha). */
  cabecalho: number;
  /** Altura de cada linha da letra (linhas longas que quebram ficam mais altas). */
  linhas: number[];
}

export interface Trecho {
  /** Posição da parte na música. */
  parte: number;
  /** Linhas [de, ate) da parte que vão nesta folha. */
  de: number;
  ate: number;
}

export interface Capacidade {
  /** Altura disponível para a letra na 1ª folha (que tem o cabeçalho completo). */
  primeira: number;
  /** Altura disponível nas folhas de continuação. */
  demais: number;
  /** Espaço entre uma parte e a seguinte. */
  espacoEntre: number;
}

const soma = (v: number[]) => v.reduce((s, n) => s + n, 0);
/** Folga para arredondamentos de medida (em px). */
const FOLGA = 0.5;

export function paginar(blocos: BlocoMedido[], cap: Capacidade): Trecho[][] {
  const paginas: Trecho[][] = [[]];
  let usado = 0;
  const limite = () => (paginas.length === 1 ? cap.primeira : cap.demais) + FOLGA;
  const novaPagina = () => {
    paginas.push([]);
    usado = 0;
  };
  const espaco = () => (usado > 0 ? cap.espacoEntre : 0);

  blocos.forEach((bloco, parte) => {
    const n = bloco.linhas.length;
    const total = bloco.cabecalho + soma(bloco.linhas);

    // 1) Cabe inteira no que sobrou
    if (usado + espaco() + total <= limite()) {
      usado += espaco() + total;
      paginas[paginas.length - 1].push({ parte, de: 0, ate: n });
      return;
    }
    // 2) Cabe inteira numa folha nova
    if (usado > 0 && total <= cap.demais + FOLGA) {
      novaPagina();
      usado = total;
      paginas[paginas.length - 1].push({ parte, de: 0, ate: n });
      return;
    }
    // 3) Maior que uma folha: quebra por linhas
    let inicio = 0;
    while (inicio < n || (n === 0 && inicio === 0)) {
      const disponivel = limite() - usado - espaco() - bloco.cabecalho;
      let cabem = 0;
      let altura = 0;
      while (inicio + cabem < n && altura + bloco.linhas[inicio + cabem] <= disponivel) {
        altura += bloco.linhas[inicio + cabem];
        cabem++;
      }
      const minimo = Math.min(2, n - inicio);
      if (cabem < minimo && usado > 0) {
        novaPagina();
        continue;
      }
      if (cabem === 0) {
        // Folha vazia e nem uma linha cabe (caso extremo): coloca uma mesmo assim
        cabem = Math.min(1, n - inicio);
        altura = soma(bloco.linhas.slice(inicio, inicio + cabem));
      }
      usado += espaco() + bloco.cabecalho + altura;
      paginas[paginas.length - 1].push({ parte, de: inicio, ate: inicio + cabem });
      inicio += cabem;
      if (n === 0) break;
      if (inicio < n) novaPagina();
    }
  });

  return paginas;
}
