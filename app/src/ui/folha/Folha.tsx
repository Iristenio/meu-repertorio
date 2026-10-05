// Folha A4 (retrato) no visual do template: cabeçalho, letra em partes, QR Code e desenhos.
// As medidas ficam em milímetros (folha.css) para a impressão sair no tamanho certo.
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { Musica, Parte } from '../../dominio/tipos';
import { limparMusica, rotulosDasPartes } from '../../dominio/musicas';
import { agruparEmFolhas, paginar, type BlocoMedido, type Coluna, type Trecho } from '../../dominio/paginacao';
import { caminhoQr } from './qr';
import { Celular, Nota, NotaDupla, Ondas, Violao } from './Desenhos';

/** Música pronta para a folha: sem espaços sobrando e sem partes vazias (com os rótulos já numerados). */
export interface ConteudoFolha {
  musica: Musica;
  partes: Parte[];
  rotulos: string[];
}

export function prepararFolha(m: Musica): ConteudoFolha {
  const musica = limparMusica(m);
  const partes = musica.partes.filter((p) => p.texto.trim());
  return { musica, partes, rotulos: rotulosDasPartes(partes) };
}

/** Título longo fica menor (e pode quebrar em duas linhas). Em pt. */
export function tamanhoTitulo(titulo: string, continuacao: boolean): number {
  const maximo = continuacao ? 24 : 44;
  const minimo = continuacao ? 16 : 26;
  const letras = Math.max(titulo.length, 1);
  return Math.round(Math.max(minimo, Math.min(maximo, (maximo * 16) / letras)));
}

/** A 1ª folha tem o QR ao lado da letra (1 coluna); as outras, e as de músicas sem link, têm 2 colunas. */
export const temDuasColunas = (musica: Musica, numero: number) => numero > 1 || !musica.link;

/** Até onde (mm a partir do topo da folha) a coluna da direita pode ir sem encostar no violão. */
const LIMITE_COLUNA_DIREITA_MM = 205;

interface PropsPagina {
  conteudo: ConteudoFolha;
  /** Trechos da letra de cada coluna (1 ou 2 colunas). */
  colunas: Trecho[][];
  numero: number;
  total: number;
}

export function PaginaFolha({ conteudo, colunas, numero, total }: PropsPagina) {
  const { musica } = conteudo;
  const continuacao = numero > 1;
  const duas = temDuasColunas(musica, numero);
  const classes = ['fl-pagina', musica.compacta && 'fl-compacta', continuacao && 'fl-continuacao', duas && 'fl-duas-colunas'];
  return (
    <article class={classes.filter(Boolean).join(' ')}>
      <Ondas class="fl-ondas" />
      <Violao class="fl-violao" />
      <Nota class="fl-nota" />

      <header class="fl-cabecalho">
        <div class="fl-sobretitulo">
          <span>Letra de música</span>
          <i />
        </div>
        <h1 class="fl-titulo" style={{ fontSize: `${tamanhoTitulo(musica.titulo, continuacao)}pt` }}>
          {musica.titulo}
          {continuacao && <small> (continuação)</small>}
        </h1>
        {!continuacao && musica.compositor && (
          <p class="fl-compositor">
            <b>Compositor:</b> {musica.compositor}
          </p>
        )}
        <hr class="fl-divisor" />
      </header>

      <div class="fl-corpo">
        <Letra conteudo={conteudo} trechos={colunas[0] ?? []} />
        <div class="fl-separador" />
        {duas ? (
          <Letra conteudo={conteudo} trechos={colunas[1] ?? []} />
        ) : (
          <aside class="fl-lateral">{musica.link && <CartaoQr link={musica.link} />}</aside>
        )}
      </div>

      {total > 1 && (
        <span class="fl-numero">
          {numero} / {total}
        </span>
      )}
    </article>
  );
}

function Letra({ conteudo, trechos }: { conteudo: ConteudoFolha; trechos: Trecho[] }) {
  const { partes, rotulos } = conteudo;
  return (
    <div class="fl-letra">
      {trechos.map((t) => (
        <section key={`${t.parte}-${t.de}`} class="fl-parte">
          <h2 class="fl-rotulo">{rotulos[t.parte]}</h2>
          {partes[t.parte].texto
            .split('\n')
            .slice(t.de, t.ate)
            .map((linha, i) => (
              <div key={i} class="fl-linha">
                {linha.trim() ? linha : '\u00a0'}
              </div>
            ))}
        </section>
      ))}
    </div>
  );
}

function CartaoQr({ link }: { link: string }) {
  const { tamanho, d } = caminhoQr(link);
  return (
    <div class="fl-qr">
      <div class="fl-qr-topo">
        <NotaDupla />
        Ouça a música
      </div>
      <div class="fl-qr-corpo">
        <div class="fl-qr-moldura">
          <span class="fl-canto c1" />
          <span class="fl-canto c2" />
          <span class="fl-canto c3" />
          <span class="fl-canto c4" />
          {/* Margem de 2 quadradinhos em branco em volta (o leitor precisa dela) */}
          <svg class="fl-qr-codigo" viewBox={`-2 -2 ${tamanho + 4} ${tamanho + 4}`} shape-rendering="crispEdges" role="img" aria-label="QR Code da música">
            <rect x="-2" y="-2" width={tamanho + 4} height={tamanho + 4} fill="#ffffff" />
            <path d={d} fill="#101e29" />
          </svg>
        </div>
        <div class="fl-qr-aviso">
          <Celular />
          <span>Escaneie o QR Code para ouvir a música.</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Medição e paginação ---------------- */

const FONTES = ['400 40px "Kaushan Script"', '500 12px Montserrat', '600 12px Montserrat', '700 12px Montserrat', '400 12px Lato'];

async function carregarFontes() {
  try {
    await Promise.all(FONTES.map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  } catch {
    // sem fontes: mede com as do sistema mesmo
  }
}

const altura = (el: Element) => el.getBoundingClientRect().height;
const margem = (el: Element, lado: 'top' | 'bottom') => parseFloat(getComputedStyle(el)[lado === 'top' ? 'marginTop' : 'marginBottom']) || 0;

const MM = 96 / 25.4;

/** Medidas das partes dentro da 1ª coluna de uma folha de rascunho. */
function medirFolha(pagina: Element) {
  const letra = pagina.querySelector('.fl-letra') as HTMLElement;
  const secoes = [...letra.querySelectorAll('.fl-parte')];
  const blocos: BlocoMedido[] = secoes.map((s) => {
    const rotulo = s.querySelector('.fl-rotulo')!;
    return {
      cabecalho: altura(rotulo) + margem(rotulo, 'top') + margem(rotulo, 'bottom'),
      linhas: [...s.querySelectorAll('.fl-linha')].map(altura),
    };
  });
  const topoLetra = letra.getBoundingClientRect().top - pagina.getBoundingClientRect().top;
  return {
    blocos,
    capacidade: letra.clientHeight,
    /** Coluna da direita: do topo da letra até antes do violão (no máximo a altura da coluna). */
    capacidadeDireita: Math.min(letra.clientHeight, LIMITE_COLUNA_DIREITA_MM * MM - topoLetra),
    espacoEntre: secoes[1] ? margem(secoes[1], 'top') : 0,
  };
}

/**
 * Mede a letra em folhas "de rascunho" escondidas e distribui as partes pelas colunas das folhas.
 * Devolve `medidor` (para renderizar escondido) e as folhas, cada uma com suas colunas (null enquanto mede).
 */
export function usePaginas(conteudo: ConteudoFolha) {
  const ref = useRef<HTMLDivElement>(null);
  const [folhas, setFolhas] = useState<Trecho[][][] | null>(null);
  const todas: Trecho[] = conteudo.partes.map((p, parte) => ({ parte, de: 0, ate: p.texto.split('\n').length }));
  const { musica } = conteudo;
  const chave = JSON.stringify([musica.titulo, musica.compositor, musica.link, musica.compacta, conteudo.partes]);

  useLayoutEffect(() => {
    let ativo = true;
    setFolhas(null);
    (async () => {
      await carregarFontes();
      const raiz = ref.current;
      if (!ativo || !raiz) return;
      const [primeira, outras] = [...raiz.querySelectorAll('.fl-pagina')].map(medirFolha);
      const duasNaPrimeira = temDuasColunas(musica, 1);
      const colunasNaFolha = (f: number) => (temDuasColunas(musica, f + 1) ? 2 : 1);
      // Coluna nº i → (folha, posição) → capacidade e medidas na largura dela
      const coluna = (i: number): Coluna => {
        const naPrimeira = duasNaPrimeira ? i < 2 : i < 1;
        const m = naPrimeira ? primeira : outras;
        const posicao = duasNaPrimeira ? i % 2 : naPrimeira ? 0 : (i - 1) % 2;
        return { capacidade: posicao === 0 ? m.capacidade : m.capacidadeDireita, blocos: m.blocos };
      };
      const colunas = paginar(conteudo.partes.length, coluna, primeira.espacoEntre || outras.espacoEntre);
      setFolhas(agruparEmFolhas(colunas, colunasNaFolha));
    })();
    return () => {
      ativo = false;
    };
  }, [chave]);

  const medidor = (
    <div class="fl-medidor" ref={ref} aria-hidden="true">
      <PaginaFolha conteudo={conteudo} colunas={[todas]} numero={1} total={1} />
      <PaginaFolha conteudo={conteudo} colunas={[todas]} numero={2} total={2} />
    </div>
  );
  return { medidor, folhas };
}
