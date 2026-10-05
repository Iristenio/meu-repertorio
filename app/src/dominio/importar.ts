// "Colar letra inteira": transforma o texto completo da letra (como vem das ferramentas de IA,
// ex.: Suno) em partes do app. Função PURA — testada em importar.test.ts.
//
// Reconhece marcações entre colchetes/parênteses ([Verso 1], [Chorus], (Ponte)…) ou sozinhas na
// linha ("Refrão:"). Sem marcações, separa nas linhas em branco (blocos repetidos viram Refrão).
import type { TipoParte } from './tipos';
import { semAcento } from './musicas';

export interface ParteImportada {
  tipo: TipoParte;
  nome: string;
  texto: string;
}

export interface LetraImportada {
  /** Título encontrado antes da 1ª marcação (vazio se não houver). */
  titulo: string;
  partes: ParteImportada[];
  /** Marcações que tinham observações extras (ex.: "Refrão final — mais forte"), que não vão para a folha. */
  observacoes: string[];
}

/** Ordem importa: os mais específicos primeiro ("refrão final" antes de "refrão"). */
const SINONIMOS: [TipoParte, RegExp][] = [
  ['introducao', /^(intro|introducao|abertura)$/],
  ['pre_refrao', /^(pre[ -]?refrao|pre[ -]?chorus|pre[ -]?coro)$/],
  ['refrao_final', /^(refrao final|ultimo refrao|final chorus|last chorus|refrao de encerramento)$/],
  ['refrao', /^(refrao|chorus|coro|hook)$/],
  ['verso', /^(verso|verse|estrofe)$/],
  ['ponte', /^(ponte|bridge)$/],
  ['final', /^(final|outro|encerramento|fim|ending|finalizacao)$/],
];

const MARCACAO_ENTRE = /^\s*[[(]\s*([^\])]+?)\s*[\])]\s*:?\s*$/;
const MARCACAO_SOLTA =
  /^\s*(intro(du[cç][aã]o)?|verso|verse|estrofe|pr[eé][ -]?refr[aã]o|pre[ -]?chorus|refr[aã]o( final)?|chorus|ponte|bridge|final|outro)\s*\d*\s*:?\s*$/i;

/** "PRÉ-REFRÃO 2 / CHAMADA" → { base: "pre-refrao", extra: "CHAMADA" } */
function separarMarcacao(marcacao: string): { base: string; extra: string } {
  const [principal, ...resto] = marcacao.split(/\s+[—–-]\s+|\s*[/|:(]\s*/);
  const base = semAcento(principal).replace(/\d+/g, ' ').replace(/[^a-z -]/g, ' ').replace(/\s+/g, ' ').trim();
  return { base, extra: resto.join(' ').replace(/[)\]]/g, '').trim() };
}

/** "MAIS FORTE" → "Mais forte" (texto todo em maiúsculas fica só com a 1ª letra maiúscula). */
export function ajustarMaiusculas(texto: string): string {
  const t = texto.trim();
  if (!/[A-ZÀ-Ý]/.test(t) || t !== t.toUpperCase()) return t;
  const minusculo = t.toLowerCase();
  return minusculo.charAt(0).toUpperCase() + minusculo.slice(1);
}

function tipoDaMarcacao(marcacao: string): { tipo: TipoParte; nome: string; extra: string } {
  const { base, extra } = separarMarcacao(marcacao);
  for (const [tipo, regra] of SINONIMOS) if (regra.test(base)) return { tipo, nome: '', extra };
  return { tipo: 'outro', nome: ajustarMaiusculas(marcacao.replace(/\s+/g, ' ')), extra: '' };
}

/** Tira linhas em branco do começo/fim e junta várias linhas em branco seguidas numa só. */
function limparTexto(linhas: string[]): string {
  return linhas
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+|\n+$/g, '');
}

export function importarLetra(textoCompleto: string): LetraImportada {
  const linhas = textoCompleto.replace(/\r\n?/g, '\n').split('\n');
  const ehMarcacao = (l: string) => MARCACAO_ENTRE.test(l) || MARCACAO_SOLTA.test(l);
  const primeira = linhas.findIndex(ehMarcacao);

  if (primeira === -1) return importarSemMarcacoes(linhas);

  // Antes da 1ª marcação: uma linha só = título; mais que isso = uma parte sem nome (verso)
  const antes = linhas.slice(0, primeira).filter((l) => l.trim());
  const titulo = antes.length === 1 ? ajustarMaiusculas(antes[0]) : '';
  const partes: ParteImportada[] = [];
  const observacoes: string[] = [];
  if (antes.length > 1) partes.push({ tipo: 'verso', nome: '', texto: limparTexto(antes) });

  let atual: { tipo: TipoParte; nome: string; linhas: string[] } | null = null;
  const fechar = () => {
    if (!atual) return;
    const texto = limparTexto(atual.linhas);
    // Marcações sem letra (ex.: [Instrumental], [Solo]) não viram parte
    if (texto) partes.push({ tipo: atual.tipo, nome: atual.nome, texto });
  };
  for (const linha of linhas.slice(primeira)) {
    if (ehMarcacao(linha)) {
      fechar();
      const marcacao = (linha.match(MARCACAO_ENTRE)?.[1] ?? linha).replace(/:\s*$/, '').trim();
      const { tipo, nome, extra } = tipoDaMarcacao(marcacao);
      if (extra) observacoes.push(marcacao.replace(/\s+/g, ' '));
      atual = { tipo, nome, linhas: [] };
    } else atual?.linhas.push(linha);
  }
  fechar();
  return { titulo, partes, observacoes };
}

function importarSemMarcacoes(linhas: string[]): LetraImportada {
  const blocos = limparTexto(linhas)
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const vezes = new Map<string, number>();
  for (const b of blocos) vezes.set(semAcento(b), (vezes.get(semAcento(b)) ?? 0) + 1);
  return {
    titulo: '',
    partes: blocos.map((texto) => ({ tipo: (vezes.get(semAcento(texto))! > 1 ? 'refrao' : 'verso') as TipoParte, nome: '', texto })),
    observacoes: [],
  };
}
