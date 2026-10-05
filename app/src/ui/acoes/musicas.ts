// Ações da interface sobre músicas: gravam localmente e devolvem a função "Desfazer".
import type { Musica } from '../../dominio/tipos';
import { limparMusica } from '../../dominio/musicas';
import { gravar, salvar } from '../../dados/repositorio';

type Desfazer = () => Promise<void>;

function desfazerCom(anterior: Musica | undefined, atual: Musica): Desfazer {
  return async () => {
    await salvar('musicas', anterior ?? { ...atual, status: 'excluida' });
  };
}

export async function salvarMusica(musica: Musica): Promise<Desfazer> {
  const final = limparMusica(musica);
  const anterior = await salvar('musicas', final);
  return desfazerCom(anterior, final);
}

/** Exclusão lógica (a música continua salva com status "excluida"). */
export async function excluirMusica(musica: Musica): Promise<Desfazer> {
  const atual: Musica = { ...musica, status: 'excluida' };
  const [anterior] = await gravar([{ entidade: 'musicas', registro: atual, operacao: 'excluir' }]);
  return desfazerCom(anterior as Musica | undefined, atual);
}
