// Pré-visualização da folha A4 da música, com o botão Comprimir.
import type { Musica } from '../../dominio/tipos';
import { PaginaFolha, prepararFolha, usePaginas } from './Folha';
import { TelaImpressao } from './TelaImpressao';

interface Props {
  musica: Musica;
  aoFechar: () => void;
  aoComprimir: (compacta: boolean) => void;
}

export function VisualizarFolha({ musica, aoFechar, aoComprimir }: Props) {
  const conteudo = prepararFolha(musica);
  const { medidor, folhas } = usePaginas(conteudo);
  const total = folhas?.length ?? 0;

  return (
    <TelaImpressao
      titulo="Folha da música"
      arquivo={musica.titulo}
      aoFechar={aoFechar}
      folhas={folhas?.map((colunas, i) => <PaginaFolha key={i} conteudo={conteudo} colunas={colunas} numero={i + 1} total={total} />) ?? null}
      escondido={medidor}
      extras={
        <label class="interruptor folha-comprimir" title="Letra e espaços menores, para caber em menos folhas">
          <input type="checkbox" checked={musica.compacta} onChange={(e) => aoComprimir(e.currentTarget.checked)} />
          Comprimir
        </label>
      }
    />
  );
}
