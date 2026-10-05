import type { JSX } from 'preact';
import { useTela, type Tela } from './rotas';
import { MenuLateral } from './layout/MenuLateral';
import { PainelLateral } from './layout/PainelLateral';
import { BotaoNovo, type OpcaoNovo } from './layout/BotaoNovo';
import { AvisoAtualizacao } from './layout/AvisoAtualizacao';
import { AvisoDesfazer } from './componentes/AvisoDesfazer';
import { Dialogo } from './componentes/Dialogo';
import { ProvedorEstado, useEstado, type Painel } from './estado';
import { TelaMusicas } from './telas/TelaMusicas';
import { TelaAjustes } from './telas/TelaAjustes';
import { FormMusica } from './paineis/FormMusica';
import { IconeMusica } from './icones';

/** ► Nova tela: acrescente aqui (e em TELAS/MENU, em rotas.ts). */
const TELA: Record<Tela, () => JSX.Element> = {
  musicas: TelaMusicas,
  config: TelaAjustes,
};

/** ► Novo painel: título e conteúdo de cada tipo declarado em estado.tsx. */
function tituloPainel(p: Painel): string {
  switch (p.tipo) {
    case 'musica':
      return p.id ? 'Editar música' : 'Nova música';
  }
}

function ConteudoPainel({ painel }: { painel: Painel }) {
  switch (painel.tipo) {
    case 'musica':
      // key: ao trocar de música, o formulário recomeça do zero
      return <FormMusica key={painel.id ?? 'nova'} id={painel.id} />;
  }
}

function Estrutura() {
  const tela = useTela();
  const { painel, abrirPainel, fecharPainel } = useEstado();
  const Conteudo = TELA[tela];

  /** ► Opções do botão "+" (com uma só, ele cria direto). */
  const opcoesNovo: OpcaoNovo[] = [{ rotulo: 'Nova música', Icone: IconeMusica, acao: () => abrirPainel({ tipo: 'musica' }) }];

  return (
    <div class="estrutura">
      <MenuLateral atual={tela} />
      <main class="principal">
        <Conteudo />
        {tela !== 'config' && <BotaoNovo opcoes={opcoesNovo} />}
      </main>
      {painel && (
        <PainelLateral titulo={tituloPainel(painel)} aoFechar={fecharPainel}>
          <ConteudoPainel painel={painel} />
        </PainelLateral>
      )}
      <AvisoDesfazer />
      <AvisoAtualizacao />
      <Dialogo />
    </div>
  );
}

export function App() {
  return (
    <ProvedorEstado>
      <Estrutura />
    </ProvedorEstado>
  );
}
