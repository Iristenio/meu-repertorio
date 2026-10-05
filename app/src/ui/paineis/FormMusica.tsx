// Formulário da música (painel lateral): título, situação, letra em partes e detalhes.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Musica, Parte, StatusMusica, TipoParte } from '../../dominio/tipos';
import {
  duplicarParte,
  estilosUsados,
  linkYoutubeValido,
  moverParte,
  normalizarLink,
  novaMusica,
  novaParte,
  podeGerarFolha,
  removerParte,
  rotulosDasPartes,
  TIPOS_PARTE,
  validarMusica,
} from '../../dominio/musicas';
import { importarLetra } from '../../dominio/importar';
import { buscar, lerConfig, novoId } from '../../dados/repositorio';
import { useEntidade } from '../../dados/ganchos';
import { excluirMusica, salvarMusica } from '../acoes/musicas';
import { useEstado } from '../estado';
import { IconeColar, IconeCopiar, IconeDescer, IconeFolha, IconeLixeira, IconeMais, IconePlay, IconeSubir } from '../icones';
import { VisualizarFolha } from '../folha/VisualizarFolha';

const SITUACOES: { valor: Exclude<StatusMusica, 'excluida'>; rotulo: string }[] = [
  { valor: 'rascunho', rotulo: 'Rascunho' },
  { valor: 'concluida', rotulo: 'Concluída' },
];

export function FormMusica({ id }: { id?: string }) {
  const { fecharSemPerguntar, protegerSaida, avisar, perguntar } = useEstado();
  const estilos = estilosUsados(useEntidade('musicas'));
  const [musica, setMusica] = useState<Musica | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [focarParte, setFocarParte] = useState<string | null>(null);
  const [verFolha, setVerFolha] = useState(false);
  const [colando, setColando] = useState(false);
  const [textoColado, setTextoColado] = useState('');
  const titulo = useRef<HTMLInputElement>(null);
  /** Versão gravada (para saber se há alterações não salvas). */
  const base = useRef('');
  const atual = useRef<Musica | null>(null);
  atual.current = musica;
  const novo = !id;

  useEffect(() => {
    (async () => {
      const existente = id ? await buscar('musicas', id) : undefined;
      const m =
        existente ??
        novaMusica({ id: novoId(), compositor: (await lerConfig()).compositor_padrao, partes: [novaParte(novoId(), 'verso')] });
      base.current = existente ? JSON.stringify(existente) : '';
      setMusica(m);
      setErros([]);
      if (!existente) setTimeout(() => titulo.current?.focus(), 50);
    })();
  }, [id]);

  const temAlteracoes = () => {
    const m = atual.current;
    if (!m) return false;
    if (!base.current) return !!(m.titulo.trim() || m.partes.some((p) => p.texto.trim()) || m.link.trim());
    return JSON.stringify(m) !== base.current;
  };

  // "Sair sem salvar?" ao fechar o painel ou abrir outra música
  useEffect(() => {
    protegerSaida(async () => {
      if (!temAlteracoes()) return true;
      const r = await perguntar(
        'Salvar as alterações?',
        [
          { valor: 'salvar', rotulo: 'Salvar', estilo: 'primario' },
          { valor: 'descartar', rotulo: 'Descartar', estilo: 'perigo' },
        ],
        'Você alterou esta música e ainda não salvou.',
      );
      if (r === 'descartar') return true;
      if (r === 'salvar') return gravarAgora();
      return false;
    });
    // Fechar a aba/janela do navegador com alterações: o navegador pergunta
    const antesDeSair = (e: BeforeUnloadEvent) => {
      if (temAlteracoes()) e.preventDefault();
    };
    window.addEventListener('beforeunload', antesDeSair);
    return () => {
      protegerSaida(null);
      window.removeEventListener('beforeunload', antesDeSair);
    };
  }, []);

  // Leva o cursor para a parte recém-adicionada
  useEffect(() => {
    if (!focarParte) return;
    const caixa = document.getElementById(`parte-${focarParte}`) as HTMLTextAreaElement | null;
    caixa?.focus();
    caixa?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setFocarParte(null);
  }, [focarParte]);

  if (!musica) return null;
  const mudar = (parcial: Partial<Musica>) => setMusica((m) => (m ? { ...m, ...parcial } : m));
  const mudarPartes = (fn: (partes: Parte[]) => Parte[]) => setMusica((m) => (m ? { ...m, partes: fn(m.partes) } : m));
  const rotulos = rotulosDasPartes(musica.partes);

  /** Valida e grava; devolve true se gravou. */
  async function gravarAgora(): Promise<boolean> {
    const m = atual.current!;
    const problemas = validarMusica(m);
    setErros(problemas);
    if (problemas.length) {
      document.querySelector('.painel .erros')?.scrollIntoView({ block: 'center' });
      return false;
    }
    const desfazer = await salvarMusica(m);
    avisar({ texto: novo ? 'Música criada' : 'Música salva', desfazer });
    return true;
  }

  async function aoSalvar(e: Event) {
    e.preventDefault();
    if (await gravarAgora()) fecharSemPerguntar();
  }

  async function excluir() {
    const r = await perguntar('Excluir esta música?', [{ valor: 'sim', rotulo: 'Excluir', estilo: 'perigo' }]);
    if (!r) return;
    const desfazer = await excluirMusica(musica!);
    fecharSemPerguntar();
    avisar({ texto: 'Música excluída', desfazer });
  }

  function adicionar(tipo: TipoParte) {
    const parte = novaParte(novoId(), tipo);
    mudarPartes((partes) => [...partes, parte]);
    setFocarParte(parte.id);
  }

  function remover(indice: number) {
    const parte = musica!.partes[indice];
    mudarPartes((partes) => removerParte(partes, indice));
    if (parte.texto.trim())
      avisar({
        texto: `Parte removida: ${rotulos[indice]}`,
        desfazer: async () =>
          mudarPartes((partes) => {
            if (partes.some((p) => p.id === parte.id)) return partes;
            const lista = [...partes];
            lista.splice(Math.min(indice, lista.length), 0, parte);
            return lista;
          }),
      });
  }

  const linkInvalido = musica.link.trim() !== '' && !linkYoutubeValido(musica.link);

  /** "Colar letra inteira": divide o texto colado em partes (ver dominio/importar.ts). */
  async function dividirLetraColada() {
    const r = importarLetra(textoColado);
    if (!r.partes.length) {
      avisar({ texto: 'Não encontrei nenhuma linha de letra no texto colado.' });
      return;
    }
    const m = atual.current!;
    let modo: 'substituir' | 'adicionar' | null = 'substituir';
    if (m.partes.some((p) => p.texto.trim()))
      modo = await perguntar(
        'Esta música já tem letra',
        [
          { valor: 'substituir', rotulo: 'Substituir a letra', estilo: 'perigo' },
          { valor: 'adicionar', rotulo: 'Adicionar no fim', estilo: 'primario' },
        ],
        'O que fazer com as partes que já estão escritas?',
      );
    if (!modo) return;
    const novas = r.partes.map((p) => novaParte(novoId(), p.tipo, p.texto, p.nome));
    const anterior = { partes: m.partes, titulo: m.titulo, observacoes: m.observacoes };
    // Observações das marcações (ex.: "mais forte") não saem na folha: ficam guardadas nas Observações
    const notas = r.observacoes.length ? `Marcações originais: ${r.observacoes.join(' · ')}` : '';
    mudar({
      partes: modo === 'adicionar' ? [...m.partes, ...novas] : novas,
      titulo: m.titulo.trim() ? m.titulo : r.titulo,
      observacoes: notas ? [m.observacoes.trim(), notas].filter(Boolean).join('\n') : m.observacoes,
    });
    setColando(false);
    setTextoColado('');
    avisar({
      texto: `Letra dividida em ${novas.length} partes. Confira os tipos antes de salvar.`,
      desfazer: async () => mudar(anterior),
    });
  }

  function abrirFolha() {
    if (!podeGerarFolha(musica!)) {
      avisar({ texto: 'Para ver a folha, escreva o título e pelo menos uma parte da letra.' });
      return;
    }
    setVerFolha(true);
  }

  return (
    <form class="formulario form-musica" onSubmit={aoSalvar} noValidate>
      <input
        ref={titulo}
        class="campo campo-titulo"
        placeholder="Título da música"
        value={musica.titulo}
        onInput={(e) => mudar({ titulo: e.currentTarget.value })}
        enterKeyHint="next"
      />

      <div class="segmentado" role="radiogroup" aria-label="Situação">
        {SITUACOES.map((s) => (
          <button key={s.valor} type="button" role="radio" aria-checked={musica.status === s.valor} onClick={() => mudar({ status: s.valor })}>
            {s.rotulo}
          </button>
        ))}
      </div>

      <fieldset>
        <legend>Letra</legend>
        {colando ? (
          <div class="colar-caixa">
            <p class="dica">
              Cole aqui a letra <strong>completa</strong>. Se ela tiver marcações como <code>[Verso 1]</code>,{' '}
              <code>[Refrão]</code> ou <code>[Chorus]</code>, o app usa; senão, separa nas linhas em branco. Se a 1ª
              linha for o título, ele também é aproveitado.
            </p>
            <textarea
              class="campo"
              rows={9}
              placeholder="Cole a letra aqui…"
              value={textoColado}
              onInput={(e) => setTextoColado(e.currentTarget.value)}
              autoFocus
            />
            <div class="linha">
              <button type="button" class="botao primario" disabled={!textoColado.trim()} onClick={dividirLetraColada}>
                Dividir em partes
              </button>
              <button type="button" class="botao" onClick={() => (setColando(false), setTextoColado(''))}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button type="button" class="botao botao-colar" onClick={() => setColando(true)}>
            <IconeColar /> Colar letra inteira
          </button>
        )}
        {musica.partes.length === 0 && <p class="dica">Adicione as partes da letra com os botões abaixo.</p>}
        <ol class="partes">
          {musica.partes.map((p, i) => (
            <li key={p.id} class="parte">
              <div class="parte-topo">
                {/* A faixa com o nome da parte é o próprio seletor de tipo */}
                <select
                  class="parte-rotulo"
                  aria-label="Tipo da parte"
                  title="Trocar o tipo desta parte"
                  value={p.tipo}
                  onChange={(e) => {
                    const tipo = e.currentTarget.value as TipoParte;
                    mudarPartes((partes) => partes.map((x) => (x.id === p.id ? { ...x, tipo } : x)));
                  }}
                >
                  {TIPOS_PARTE.map((t) => (
                    <option key={t.tipo} value={t.tipo}>{t.tipo === p.tipo ? rotulos[i] : t.rotulo}</option>
                  ))}
                </select>
                <span class="parte-botoes">
                  <button type="button" class="botao-icone" aria-label="Subir" disabled={i === 0} onClick={() => mudarPartes((ps) => moverParte(ps, i, -1))}>
                    <IconeSubir />
                  </button>
                  <button
                    type="button"
                    class="botao-icone"
                    aria-label="Descer"
                    disabled={i === musica.partes.length - 1}
                    onClick={() => mudarPartes((ps) => moverParte(ps, i, 1))}
                  >
                    <IconeDescer />
                  </button>
                  <button
                    type="button"
                    class="botao-icone"
                    aria-label="Duplicar"
                    title="Duplicar (repetir esta parte logo abaixo)"
                    onClick={() => {
                      const idNovo = novoId();
                      mudarPartes((ps) => duplicarParte(ps, i, idNovo));
                      setFocarParte(idNovo);
                    }}
                  >
                    <IconeCopiar />
                  </button>
                  <button type="button" class="botao-icone perigo" aria-label="Remover" onClick={() => remover(i)}>
                    <IconeLixeira />
                  </button>
                </span>
              </div>
              {p.tipo === 'outro' && (
                <input
                  class="campo parte-nome"
                  placeholder="Nome da parte (ex.: Falado)"
                  aria-label="Nome da parte"
                  value={p.nome}
                  onInput={(e) => {
                    const nome = e.currentTarget.value;
                    mudarPartes((partes) => partes.map((x) => (x.id === p.id ? { ...x, nome } : x)));
                  }}
                />
              )}
              <textarea
                id={`parte-${p.id}`}
                class="campo parte-texto"
                rows={Math.max(3, p.texto.split('\n').length + 1)}
                placeholder="Escreva aqui as linhas desta parte…"
                value={p.texto}
                onInput={(e) => {
                  const texto = e.currentTarget.value;
                  mudarPartes((partes) => partes.map((x) => (x.id === p.id ? { ...x, texto } : x)));
                }}
              />
            </li>
          ))}
        </ol>
        <div class="chips adicionar-partes">
          {TIPOS_PARTE.map((t) => (
            <button key={t.tipo} type="button" class="chip" onClick={() => adicionar(t.tipo)}>
              <IconeMais /> {t.rotulo}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Link do YouTube (vira o QR Code)</legend>
        <div class="linha linha-link">
          <input
            class="campo"
            type="url"
            inputMode="url"
            placeholder="https://youtu.be/…"
            value={musica.link}
            onInput={(e) => mudar({ link: e.currentTarget.value })}
            autoCapitalize="off"
            autoCorrect="off"
            spellcheck={false}
          />
          {linkYoutubeValido(musica.link) && (
            <a class="botao" href={normalizarLink(musica.link)} target="_blank" rel="noopener noreferrer" title="Abrir o link para conferir">
              <IconePlay /> Testar
            </a>
          )}
        </div>
        {linkInvalido && <p class="dica aviso-campo">Este link não parece ser do YouTube.</p>}
      </fieldset>

      <fieldset>
        <legend>Detalhes</legend>
        <label class="rotulo-campo">
          <span>Estilo</span>
          <input
            class="campo"
            list="estilos-usados"
            placeholder="Ex.: Sertanejo, Gospel, MPB"
            value={musica.estilo}
            onInput={(e) => mudar({ estilo: e.currentTarget.value })}
          />
          <datalist id="estilos-usados">
            {estilos.map((e) => (
              <option key={e.estilo} value={e.estilo} />
            ))}
          </datalist>
        </label>
        <label class="rotulo-campo">
          <span>Compositor</span>
          <input class="campo" value={musica.compositor} onInput={(e) => mudar({ compositor: e.currentTarget.value })} />
        </label>
        <label class="rotulo-campo">
          <span>Data de composição (opcional)</span>
          <input type="date" class="campo" value={musica.data ?? ''} onInput={(e) => mudar({ data: e.currentTarget.value || null })} />
        </label>
        <label class="rotulo-campo">
          <span>Observações (não saem na folha)</span>
          <textarea class="campo" rows={3} value={musica.observacoes} onInput={(e) => mudar({ observacoes: e.currentTarget.value })} />
        </label>
      </fieldset>

      {erros.length > 0 && (
        <ul class="erros" role="alert">
          {erros.map((x) => <li key={x}>{x}</li>)}
        </ul>
      )}

      <div class="acoes-form">
        <button type="submit" class="botao primario">{novo ? 'Criar' : 'Salvar'}</button>
        <button type="button" class="botao" onClick={abrirFolha} title="Ver a folha A4 e gerar o PDF">
          <IconeFolha /> Folha A4
        </button>
        {!novo && (
          <button type="button" class="botao perigo" onClick={excluir}>Excluir</button>
        )}
      </div>

      {verFolha && (
        <VisualizarFolha musica={musica} aoFechar={() => setVerFolha(false)} aoComprimir={(compacta) => mudar({ compacta })} />
      )}
    </form>
  );
}
