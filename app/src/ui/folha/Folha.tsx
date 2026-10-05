// Folha A4 (retrato) no visual do template: cabeçalho, letra em partes, QR Code e desenhos.
// As medidas ficam em milímetros (folha.css) para a impressão sair no tamanho certo.
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { Musica, Parte } from '../../dominio/tipos';
import { limparMusica, rotulosDasPartes } from '../../dominio/musicas';
import { paginar, type BlocoMedido, type Trecho } from '../../dominio/paginacao';
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

interface PropsPagina {
  conteudo: ConteudoFolha;
  trechos: Trecho[];
  numero: number;
  total: number;
}

export function PaginaFolha({ conteudo, trechos, numero, total }: PropsPagina) {
  const { musica, partes, rotulos } = conteudo;
  const continuacao = numero > 1;
  return (
    <article class={`fl-pagina${musica.compacta ? ' fl-compacta' : ''}${continuacao ? ' fl-continuacao' : ''}`}>
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
        <div class="fl-letra">
          {trechos.map((t) => (
            <section key={`${t.parte}-${t.de}`} class="fl-parte">
              <h2 class="fl-rotulo">{rotulos[t.parte]}</h2>
              {partes[t.parte].texto
                .split('\n')
                .slice(t.de, t.ate)
                .map((linha, i) => (
                  <div key={i} class="fl-linha">
                    {linha.trim() ? linha : ' '}
                  </div>
                ))}
            </section>
          ))}
        </div>
        <div class="fl-separador" />
        <aside class="fl-lateral">{!continuacao && musica.link && <CartaoQr link={musica.link} />}</aside>
      </div>

      {total > 1 && (
        <span class="fl-numero">
          {numero} / {total}
        </span>
      )}
    </article>
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

/**
 * Mede a letra numa folha "de rascunho" escondida e divide as partes pelas folhas.
 * Devolve `medidor` (para renderizar escondido) e as páginas (null enquanto mede).
 */
export function usePaginas(conteudo: ConteudoFolha) {
  const ref = useRef<HTMLDivElement>(null);
  const [paginas, setPaginas] = useState<Trecho[][] | null>(null);
  const todas: Trecho[] = conteudo.partes.map((p, parte) => ({ parte, de: 0, ate: p.texto.split('\n').length }));
  const chave = JSON.stringify([conteudo.musica.titulo, conteudo.musica.compositor, conteudo.musica.link, conteudo.musica.compacta, conteudo.partes]);

  useLayoutEffect(() => {
    let ativo = true;
    setPaginas(null);
    (async () => {
      await carregarFontes();
      const raiz = ref.current;
      if (!ativo || !raiz) return;
      const [primeira, segunda] = raiz.querySelectorAll('.fl-pagina');
      const secoes = [...primeira.querySelectorAll('.fl-parte')];
      const blocos: BlocoMedido[] = secoes.map((s) => {
        const rotulo = s.querySelector('.fl-rotulo')!;
        return {
          cabecalho: altura(rotulo) + margem(rotulo, 'top') + margem(rotulo, 'bottom'),
          linhas: [...s.querySelectorAll('.fl-linha')].map(altura),
        };
      });
      const espacoEntre = secoes[1] ? margem(secoes[1], 'top') : 0;
      setPaginas(
        paginar(blocos, {
          primeira: (primeira.querySelector('.fl-letra') as HTMLElement).clientHeight,
          demais: (segunda.querySelector('.fl-letra') as HTMLElement).clientHeight,
          espacoEntre,
        }),
      );
    })();
    return () => {
      ativo = false;
    };
  }, [chave]);

  const medidor = (
    <div class="fl-medidor" ref={ref} aria-hidden="true">
      <PaginaFolha conteudo={conteudo} trechos={todas} numero={1} total={1} />
      <PaginaFolha conteudo={conteudo} trechos={[]} numero={2} total={2} />
    </div>
  );
  return { medidor, paginas };
}
