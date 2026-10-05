// Regras de negócio das músicas (ver ESPECIFICACAO.md, seção 3).
// Funções PURAS (sem tela, sem banco) — testadas em musicas.test.ts.
import type { Id, Musica, Parte, StatusMusica, TipoParte } from './tipos';

/* ---------------- Criação ---------------- */

export function novaMusica(campos: Partial<Musica> & { id: Id }, agora = new Date()): Musica {
  const carimbo = agora.toISOString();
  return {
    titulo: '',
    compositor: '',
    estilo: '',
    link: '',
    partes: [],
    compacta: false,
    data: null,
    observacoes: '',
    status: 'rascunho',
    criado_em: carimbo,
    atualizado_em: carimbo,
    ...campos,
  };
}

export function novaParte(id: Id, tipo: TipoParte, texto = '', nome = ''): Parte {
  return { id, tipo, nome, texto };
}

/* ---------------- Tipos de parte e rótulos ---------------- */

/** Ordem dos botões "+ Verso", "+ Refrão"… no formulário. */
export const TIPOS_PARTE: { tipo: TipoParte; rotulo: string }[] = [
  { tipo: 'introducao', rotulo: 'Introdução' },
  { tipo: 'verso', rotulo: 'Verso' },
  { tipo: 'pre_refrao', rotulo: 'Pré-refrão' },
  { tipo: 'refrao', rotulo: 'Refrão' },
  { tipo: 'ponte', rotulo: 'Ponte' },
  { tipo: 'refrao_final', rotulo: 'Refrão final' },
  { tipo: 'final', rotulo: 'Final' },
  { tipo: 'outro', rotulo: 'Outro' },
];

const ROTULO_TIPO = Object.fromEntries(TIPOS_PARTE.map((t) => [t.tipo, t.rotulo])) as Record<TipoParte, string>;

/**
 * Rótulo de cada parte, na ordem: os versos são numerados sozinhos (Verso 1, Verso 2…);
 * "outro" usa o nome digitado (ou "Outro", se vazio).
 */
export function rotulosDasPartes(partes: Parte[]): string[] {
  let verso = 0;
  return partes.map((p) => {
    if (p.tipo === 'verso') return `Verso ${++verso}`;
    if (p.tipo === 'outro') return p.nome.trim() || ROTULO_TIPO.outro;
    return ROTULO_TIPO[p.tipo];
  });
}

/* ---------------- Edição da lista de partes (devolvem uma lista NOVA) ---------------- */

export function moverParte(partes: Parte[], indice: number, direcao: -1 | 1): Parte[] {
  const destino = indice + direcao;
  if (destino < 0 || destino >= partes.length) return partes;
  const lista = [...partes];
  [lista[indice], lista[destino]] = [lista[destino], lista[indice]];
  return lista;
}

/** Copia a parte (mesmo tipo, nome e texto) logo abaixo dela. */
export function duplicarParte(partes: Parte[], indice: number, novoId: Id): Parte[] {
  const lista = [...partes];
  lista.splice(indice + 1, 0, { ...partes[indice], id: novoId });
  return lista;
}

export function removerParte(partes: Parte[], indice: number): Parte[] {
  return partes.filter((_, i) => i !== indice);
}

/* ---------------- Link do YouTube ---------------- */

/** Aceita youtube.com, m.youtube.com, music.youtube.com e youtu.be (com ou sem https://). */
export function linkYoutubeValido(link: string): boolean {
  const texto = link.trim();
  if (!texto) return false;
  try {
    const url = new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com');
  } catch {
    return false;
  }
}

/** Completa o "https://" quando o usuário cola o link sem ele. */
export function normalizarLink(link: string): string {
  const texto = link.trim();
  if (!texto) return '';
  return /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;
}

/* ---------------- Validação ---------------- */

/** Lista de erros (vazia = válido). */
export function validarMusica(m: Pick<Musica, 'titulo' | 'link' | 'partes'>): string[] {
  const erros: string[] = [];
  if (!m.titulo.trim()) erros.push('Informe o título da música.');
  if (m.link.trim() && !linkYoutubeValido(m.link)) erros.push('O link precisa ser do YouTube (youtube.com ou youtu.be).');
  return erros;
}

/** Regra 5: só gera a folha se houver título e pelo menos uma parte com texto. */
export function podeGerarFolha(m: Pick<Musica, 'titulo' | 'partes'>): boolean {
  return !!m.titulo.trim() && m.partes.some((p) => p.texto.trim());
}

/** Tira espaços sobrando antes de gravar (sem mexer nas quebras de linha internas da letra). */
export function limparMusica(m: Musica): Musica {
  return {
    ...m,
    titulo: m.titulo.trim(),
    compositor: m.compositor.trim(),
    estilo: m.estilo.trim().replace(/\s+/g, ' '),
    link: normalizarLink(m.link),
    observacoes: m.observacoes.trim(),
    partes: m.partes.map((p) => ({ ...p, nome: p.nome.trim(), texto: p.texto.replace(/\s+$/, '').replace(/^\n+/, '') })),
  };
}

/* ---------------- Lista, busca e estilos ---------------- */

/** Sem acentos e em minúsculas, para buscar "coracao" e achar "Coração". */
export function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export type FiltroStatus = 'todas' | Exclude<StatusMusica, 'excluida'>;

/** Tira as excluídas, aplica filtro e busca (título, estilo ou trecho da letra) e ordena pelo título. */
export function filtrarMusicas(lista: Musica[], busca = '', filtro: FiltroStatus = 'todas', estilo = ''): Musica[] {
  const termo = semAcento(busca.trim());
  return lista
    .filter((m) => m.status !== 'excluida')
    .filter((m) => filtro === 'todas' || m.status === filtro)
    .filter((m) => !estilo || semAcento(m.estilo) === semAcento(estilo))
    .filter(
      (m) =>
        !termo ||
        semAcento(m.titulo).includes(termo) ||
        semAcento(m.estilo).includes(termo) ||
        m.partes.some((p) => semAcento(p.texto).includes(termo)),
    )
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' }));
}

/**
 * Estilos usados nas músicas (sem as excluídas), sem repetir — "gospel" e "Gospel" contam como um só
 * (vale a grafia mais usada) — com a quantidade de músicas, em ordem alfabética.
 */
export function estilosUsados(lista: Musica[]): { estilo: string; quantidade: number }[] {
  const grupos = new Map<string, Map<string, number>>();
  for (const m of lista) {
    const estilo = m.estilo.trim();
    if (m.status === 'excluida' || !estilo) continue;
    const chave = semAcento(estilo);
    const grafias = grupos.get(chave) ?? new Map<string, number>();
    grafias.set(estilo, (grafias.get(estilo) ?? 0) + 1);
    grupos.set(chave, grafias);
  }
  return [...grupos.values()]
    .map((grafias) => {
      const [estilo] = [...grafias.entries()].sort((a, b) => b[1] - a[1])[0];
      return { estilo, quantidade: [...grafias.values()].reduce((s, n) => s + n, 0) };
    })
    .sort((a, b) => a.estilo.localeCompare(b.estilo, 'pt-BR', { sensitivity: 'base' }));
}

/** Primeira linha com texto da letra (para mostrar na lista). */
export function primeiraLinha(m: Pick<Musica, 'partes'>): string {
  for (const p of m.partes) {
    const linha = p.texto.split('\n').find((l) => l.trim());
    if (linha) return linha.trim();
  }
  return '';
}
