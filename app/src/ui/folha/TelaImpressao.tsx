// Tela cheia de pré-visualização de folhas A4 com o botão "Gerar PDF / Imprimir".
// Usada pela folha da música e pelas capas. As folhas aparecem duas vezes: reduzidas na tela e
// em tamanho real numa área que só aparece na impressão (ver folha.css).
import type { ComponentChildren, JSX } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { IconeFechar } from '../icones';

/** A4 em px de tela (96 por polegada). */
const LARGURA_A4 = (210 / 25.4) * 96;
const ALTURA_A4 = (297 / 25.4) * 96;

/** Nome do arquivo PDF (o navegador usa o título da página). */
export function nomeArquivo(titulo: string): string {
  return titulo.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Folha';
}

interface Props {
  titulo: string;
  /** Nome do arquivo PDF sugerido. */
  arquivo: string;
  /** Folhas prontas (null = ainda montando). */
  folhas: JSX.Element[] | null;
  aoFechar: () => void;
  /** Controles extras na barra (ex.: Comprimir). */
  extras?: ComponentChildren;
  /** Conteúdo escondido usado para medir (ex.: medidor da letra). */
  escondido?: ComponentChildren;
}

export function TelaImpressao({ titulo, arquivo, folhas, aoFechar, extras, escondido }: Props) {
  const area = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.4);

  // Folha do tamanho da tela (no máximo o tamanho real)
  useLayoutEffect(() => {
    const ajustar = () => {
      const largura = area.current?.clientWidth ?? 400;
      setEscala(Math.min(1, (largura - 32) / LARGURA_A4));
    };
    ajustar();
    const obs = new ResizeObserver(ajustar);
    if (area.current) obs.observe(area.current);
    return () => obs.disconnect();
  }, []);

  // Esc fecha só esta tela (e não o painel que estiver por trás)
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      aoFechar();
    };
    window.addEventListener('keydown', aoTeclar, true);
    return () => window.removeEventListener('keydown', aoTeclar, true);
  }, [aoFechar]);

  function imprimir() {
    const tituloApp = document.title;
    document.title = nomeArquivo(arquivo);
    window.addEventListener('afterprint', () => (document.title = tituloApp), { once: true });
    window.print();
  }

  const total = folhas?.length ?? 0;

  return createPortal(
    <>
      <div class="folha-tela" role="dialog" aria-modal="true" aria-label={titulo}>
        <div class="folha-barra">
          <button class="botao-icone" onClick={aoFechar} aria-label="Voltar">
            <IconeFechar />
          </button>
          <div class="folha-info">
            <strong>{titulo}</strong>
            <small>{folhas ? (total === 1 ? '1 folha A4' : `${total} folhas A4`) : 'Montando…'}</small>
          </div>
          {extras}
          <button class="botao primario" disabled={!folhas} onClick={imprimir}>
            Gerar PDF / Imprimir
          </button>
        </div>

        <div class="folha-area" ref={area}>
          {folhas?.map((folha, i) => (
            <div key={i} class="folha-miniatura" style={{ width: `${LARGURA_A4 * escala}px`, height: `${ALTURA_A4 * escala}px` }}>
              <div style={{ transform: `scale(${escala})`, transformOrigin: 'top left' }}>{folha}</div>
            </div>
          ))}
          <p class="folha-dica">
            Toque em <strong>Gerar PDF / Imprimir</strong> e escolha <strong>Salvar como PDF</strong> (ou a impressora).
            Papel <strong>A4</strong>, retrato, sem margens; se aparecer, ligue <strong>Gráficos de plano de fundo</strong>.
          </p>
        </div>
        {escondido}
      </div>

      {/* Só aparece na impressão */}
      {folhas && <div class="fl-impressao">{folhas}</div>}
    </>,
    document.body,
  );
}
