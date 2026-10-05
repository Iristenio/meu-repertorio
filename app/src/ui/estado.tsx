// Estado global da interface: painel lateral aberto, aviso "Desfazer" e diálogos de escolha.
import { createContext, type ComponentChildren } from 'preact';
import { useCallback, useContext, useMemo, useRef, useState } from 'preact/hooks';

/** ► Novo formulário/painel: acrescente um tipo aqui e trate em App.tsx (título e conteúdo). */
export type Painel = { tipo: 'musica'; id?: string };

/** Chamada antes de fechar/trocar o painel: devolve false para cancelar (ex.: "sair sem salvar?"). */
export type ProtecaoSaida = () => Promise<boolean>;

export interface Aviso {
  texto: string;
  desfazer?: () => void | Promise<void>;
}

export interface OpcaoDialogo<T extends string> {
  valor: T;
  rotulo: string;
  estilo?: 'primario' | 'perigo';
}

interface Dialogo {
  titulo: string;
  mensagem?: string;
  opcoes: OpcaoDialogo<string>[];
  responder: (valor: string | null) => void;
}

interface EstadoUI {
  painel: Painel | null;
  abrirPainel: (p: Painel) => void;
  /** Fecha o painel — antes, consulta a proteção de saída do formulário (se houver). */
  fecharPainel: () => void;
  /** Fecha sem consultar a proteção (ex.: logo depois de salvar). */
  fecharSemPerguntar: () => void;
  /** O formulário aberto registra aqui sua proteção de saída (null = nenhuma). */
  protegerSaida: (fn: ProtecaoSaida | null) => void;
  aviso: Aviso | null;
  avisar: (a: Aviso) => void;
  fecharAviso: () => void;
  dialogo: Dialogo | null;
  /** Pergunta com botões; devolve a opção escolhida ou null (cancelou). */
  perguntar: <T extends string>(titulo: string, opcoes: OpcaoDialogo<T>[], mensagem?: string) => Promise<T | null>;
}

const Contexto = createContext<EstadoUI | null>(null);

export function ProvedorEstado({ children }: { children: ComponentChildren }) {
  const [painel, setPainel] = useState<Painel | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);
  const timer = useRef<number>();

  const protecao = useRef<ProtecaoSaida | null>(null);
  const protegerSaida = useCallback((fn: ProtecaoSaida | null) => {
    protecao.current = fn;
  }, []);
  const trocarPainel = useCallback(async (p: Painel | null) => {
    if (protecao.current && !(await protecao.current())) return;
    protecao.current = null;
    setPainel(p);
  }, []);
  const fecharPainel = useCallback(() => void trocarPainel(null), []);
  const abrirPainel = useCallback((p: Painel) => void trocarPainel(p), []);
  const fecharSemPerguntar = useCallback(() => {
    protecao.current = null;
    setPainel(null);
  }, []);
  const fecharAviso = useCallback(() => setAviso(null), []);
  const avisar = useCallback((a: Aviso) => {
    clearTimeout(timer.current);
    setAviso(a);
    timer.current = window.setTimeout(() => setAviso(null), a.desfazer ? 6000 : 3500);
  }, []);

  const perguntar = useCallback(
    <T extends string>(titulo: string, opcoes: OpcaoDialogo<T>[], mensagem?: string) =>
      new Promise<T | null>((ok) => {
        setDialogo({
          titulo,
          mensagem,
          opcoes,
          responder: (v) => {
            setDialogo(null);
            ok(v as T | null);
          },
        });
      }),
    [],
  );

  const valor = useMemo(
    () => ({ painel, abrirPainel, fecharPainel, fecharSemPerguntar, protegerSaida, aviso, avisar, fecharAviso, dialogo, perguntar }),
    [painel, aviso, dialogo],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstado(): EstadoUI {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useEstado fora do ProvedorEstado');
  return ctx;
}
