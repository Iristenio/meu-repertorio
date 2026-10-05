// Tela Capas: um cartão por estilo usado nas músicas; tocar abre a capa A4 para gerar o PDF.
import { useState } from 'preact/hooks';
import { estilosUsados } from '../../dominio/musicas';
import { useConfig, useEntidade } from '../../dados/ganchos';
import { PaginaCapa } from '../folha/Capa';
import { TelaImpressao } from '../folha/TelaImpressao';
import { IconeCapa } from '../icones';

export function TelaCapas() {
  const estilos = estilosUsados(useEntidade('musicas'));
  const { compositor_padrao } = useConfig();
  const [aberto, setAberto] = useState<string | null>(null);

  return (
    <>
      <header class="cabecalho">
        <h1>Capas</h1>
        <span class="sub">uma por estilo</span>
      </header>
      <div class="conteudo">
        {estilos.length === 0 ? (
          <div class="vazio grande">
            <IconeCapa />
            <strong>Nenhum estilo ainda</strong>
            Preencha o campo <em>Estilo</em> nas músicas (ex.: Gospel, Sertanejo) e as capas aparecem aqui.
          </div>
        ) : (
          <>
            <p class="dica capas-dica">
              Toque num estilo para ver a capa e gerar o PDF. O compositor vem de <strong>Ajustes</strong>.
            </p>
            <ul class="capas">
              {estilos.map((e) => (
                <li key={e.estilo}>
                  <button class="capa-cartao" onClick={() => setAberto(e.estilo)}>
                    <span class="capa-miniatura" aria-hidden="true">
                      {/* Letra proporcional à largura da miniatura (cqw), menor para nomes longos */}
                      <span style={{ fontSize: `${Math.min(19, 150 / Math.max(e.estilo.length, 1))}cqw` }}>{e.estilo}</span>
                    </span>
                    <strong>{e.estilo}</strong>
                    <small>{e.quantidade === 1 ? '1 música' : `${e.quantidade} músicas`}</small>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {aberto && (
        <TelaImpressao
          titulo={`Capa · ${aberto}`}
          arquivo={`Capa - ${aberto}`}
          aoFechar={() => setAberto(null)}
          folhas={[<PaginaCapa key="capa" estilo={aberto} compositor={compositor_padrao} />]}
        />
      )}
    </>
  );
}
