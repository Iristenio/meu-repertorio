// Entidades do app.
// Datas: "AAAA-MM-DD" (data), "HH:mm" (hora) e ISO completo (carimbos de data-hora).
//
// ► Para criar uma entidade nova, siga o roteiro em ARQUITETURA.md ("Adicionar uma entidade").

export type Id = string;

/** Campos que TODA entidade sincronizada precisa ter. */
export interface Registro {
  id: Id;
  criado_em: string;
  atualizado_em: string;
}

/* ---------------- Música ---------------- */

/** Tipos de parte da letra. "outro" = nome livre (campo `nome`). */
export type TipoParte = 'introducao' | 'verso' | 'pre_refrao' | 'refrao' | 'ponte' | 'refrao_final' | 'final' | 'outro';

export interface Parte {
  id: Id;
  tipo: TipoParte;
  /** Só para o tipo "outro". */
  nome: string;
  /** Linhas da letra, separadas por quebra de linha. */
  texto: string;
}

export type StatusMusica = 'rascunho' | 'concluida' | 'excluida';

export interface Musica extends Registro {
  titulo: string;
  compositor: string;
  estilo: string;
  /** Link do YouTube (vira o QR Code da folha); vazio = sem QR. */
  link: string;
  partes: Parte[];
  /** "Comprimir": letra e espaços menores na folha impressa. */
  compacta: boolean;
  data: string | null; // AAAA-MM-DD — data de composição
  observacoes: string;
  status: StatusMusica;
}

/** Nomes das entidades sincronizadas (cada uma vira uma loja local e uma aba na planilha). */
export const ENTIDADES = ['musicas'] as const;
export type Entidade = (typeof ENTIDADES)[number];

/* ---------------- Infraestrutura ---------------- */

export interface ItemFila {
  id: Id;
  entidade: Entidade;
  registro_id: Id;
  operacao: 'criar' | 'alterar' | 'excluir';
  payload: Registro;
  tentativas: number;
  ultimo_erro: string | null;
  criado_em: string;
}

/** Aparência: seguir o sistema do aparelho ou fixar claro/escuro. */
export type Tema = 'sistema' | 'claro' | 'escuro';

/** Preferências do usuário (valem por aparelho). */
export interface Config {
  tema: Tema;
  /** Nome que vem preenchido em músicas novas e sai nas capas. */
  compositor_padrao: string;
}

export const CONFIG_PADRAO: Config = {
  tema: 'sistema',
  compositor_padrao: 'Paulo Gonçalves',
};
