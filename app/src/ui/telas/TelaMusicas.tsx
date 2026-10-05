// Tela Músicas: busca, filtros por situação e estilo, e a lista (toque abre o painel de edição).
import { useState } from 'preact/hooks';
import { estilosUsados, filtrarMusicas, primeiraLinha, type FiltroStatus } from '../../dominio/musicas';
import { useEntidade } from '../../dados/ganchos';
import { useEstado } from '../estado';
import { IconeBusca, IconeFechar, IconeMusica, IconePlay } from '../icones';

const FILTROS: { valor: FiltroStatus; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'rascunho', rotulo: 'Rascunhos' },
  { valor: 'concluida', rotulo: 'Concluídas' },
];

export function TelaMusicas() {
  const { abrirPainel, painel } = useEstado();
  const todas = useEntidade('musicas');
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroStatus>('todas');
  const [estilo, setEstilo] = useState('');
  const estilos = estilosUsados(todas);
  const total = filtrarMusicas(todas).length;
  const lista = filtrarMusicas(todas, busca, filtro, estilo);
  const filtrando = !!(busca.trim() || filtro !== 'todas' || estilo);

  return (
    <>
      <header class="cabecalho">
        <h1>Músicas</h1>
        <span class="sub">{total === 1 ? '1 música' : `${total} músicas`}</span>
      </header>
      <div class="conteudo">
        {total > 0 && (
          <div class="filtros">
            <label class="busca">
              <IconeBusca />
              <input
                class="campo"
                type="search"
                placeholder="Buscar título, estilo ou letra"
                value={busca}
                onInput={(e) => setBusca(e.currentTarget.value)}
              />
              {busca && (
                <button class="botao-icone" aria-label="Limpar busca" onClick={() => setBusca('')}>
                  <IconeFechar />
                </button>
              )}
            </label>
            <div class="segmentado pequeno" role="radiogroup" aria-label="Situação">
              {FILTROS.map((f) => (
                <button key={f.valor} role="radio" aria-checked={filtro === f.valor} onClick={() => setFiltro(f.valor)}>
                  {f.rotulo}
                </button>
              ))}
            </div>
            {estilos.length > 1 && (
              <div class="chips chips-rolagem" aria-label="Estilo">
                <button class="chip" aria-pressed={!estilo} onClick={() => setEstilo('')}>
                  Todos os estilos
                </button>
                {estilos.map((e) => (
                  <button key={e.estilo} class="chip" aria-pressed={estilo === e.estilo} onClick={() => setEstilo(estilo === e.estilo ? '' : e.estilo)}>
                    {e.estilo} <small>{e.quantidade}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {total === 0 ? (
          <div class="vazio grande">
            <IconeMusica />
            <strong>Nenhuma música ainda</strong>
            Toque no + para cadastrar a primeira composição.
          </div>
        ) : lista.length === 0 ? (
          <div class="vazio">
            <IconeBusca />
            <strong>Nada encontrado</strong>
            {filtrando && 'Tente outra busca ou outro filtro.'}
          </div>
        ) : (
          <ul class="lista-itens lista-musicas">
            {lista.map((m) => {
              const linha = primeiraLinha(m);
              return (
                <li key={m.id}>
                  <button
                    class="linha-item"
                    aria-current={painel?.tipo === 'musica' && painel.id === m.id ? 'true' : undefined}
                    onClick={() => abrirPainel({ tipo: 'musica', id: m.id })}
                  >
                    <span class="musica-icone">
                      <IconeMusica />
                    </span>
                    <span class="linha-item-texto">
                      <strong>{m.titulo}</strong>
                      <small>{[m.estilo, linha && `“${linha}”`].filter(Boolean).join(' · ') || 'Sem letra ainda'}</small>
                    </span>
                    <span class="musica-marcas">
                      {m.link && (
                        <span class="marca-link" title="Tem link do YouTube">
                          <IconePlay />
                        </span>
                      )}
                      {m.status === 'rascunho' && <span class="etiqueta">Rascunho</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
