// Tela cheia com a pré-visualização da folha A4 e os botões Comprimir e Gerar PDF / Imprimir.
// As folhas aparecem duas vezes: reduzidas na tela e em tamanho real numa área que só aparece na impressão.
import { createPortal } from 'preact/compat';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { Musica } from '../../dominio/tipos';
import { PaginaFolha, prepararFolha, usePaginas } from './Folha';
import { IconeFechar } from '../icones';

/** A4 em px de tela (96 por polegada). */
const LARGURA_A4 = (210 / 25.4) * 96;
const ALTURA_A4 = (297 / 25.4) * 96;

/** Nome do arquivo PDF (o navegador usa o título da página). */
export function nomeArquivo(titulo: string): string {
  return titulo.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Letra';
}

interface Props {
  musica: Musica;
  aoFechar: () => void;
  aoComprimir: (compacta: boolean) => void;
}

export function VisualizarFolha({ musica, aoFechar, aoComprimir }: Props) {
  const conteudo = prepararFolha(musica);
  const { medidor, paginas } = usePaginas(conteudo);
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

  // Esc fecha só esta tela (e não o painel da música por trás)
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
    document.title = nomeArquivo(musica.titulo);
    window.addEventListener('afterprint', () => (document.title = tituloApp), { once: true });
    window.print();
  }

  const total = paginas?.length ?? 0;

  return createPortal(
    <>
      <div class="folha-tela" role="dialog" aria-modal="true" aria-label="Folha A4">
        <div class="folha-barra">
          <button class="botao-icone" onClick={aoFechar} aria-label="Voltar">
            <IconeFechar />
          </button>
          <div class="folha-info">
            <strong>Folha A4</strong>
            <small>{paginas ? (total === 1 ? '1 folha' : `${total} folhas`) : 'Montando…'}</small>
          </div>
          <label class="interruptor folha-comprimir" title="Letra e espaços menores, para caber em menos folhas">
            <input type="checkbox" checked={musica.compacta} onChange={(e) => aoComprimir(e.currentTarget.checked)} />
            Comprimir
          </label>
          <button class="botao primario" disabled={!paginas} onClick={imprimir}>
            Gerar PDF / Imprimir
          </button>
        </div>

        <div class="folha-area" ref={area}>
          {paginas?.map((trechos, i) => (
            <div key={i} class="folha-miniatura" style={{ width: `${LARGURA_A4 * escala}px`, height: `${ALTURA_A4 * escala}px` }}>
              <div style={{ transform: `scale(${escala})`, transformOrigin: 'top left' }}>
                <PaginaFolha conteudo={conteudo} trechos={trechos} numero={i + 1} total={total} />
              </div>
            </div>
          ))}
          <p class="folha-dica">
            Toque em <strong>Gerar PDF / Imprimir</strong> e escolha <strong>Salvar como PDF</strong> (ou a impressora).
            Papel <strong>A4</strong>, retrato, sem margens; se aparecer, ligue <strong>Gráficos de plano de fundo</strong>.
          </p>
        </div>
        {medidor}
      </div>

      {/* Só aparece na impressão (ver folha.css) */}
      {paginas && (
        <div class="fl-impressao">
          {paginas.map((trechos, i) => (
            <PaginaFolha key={i} conteudo={conteudo} trechos={trechos} numero={i + 1} total={total} />
          ))}
        </div>
      )}
    </>,
    document.body,
  );
}
