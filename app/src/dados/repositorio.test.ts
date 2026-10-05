import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { abrirBanco, fecharBanco, NOME_BANCO } from './db';
import { gravar, listarTodos, salvar } from './repositorio';
import { novaMusica } from '../dominio/musicas';

beforeEach(async () => {
  await fecharBanco();
  await new Promise<void>((ok) => {
    const req = indexedDB.deleteDatabase(NOME_BANCO);
    req.onsuccess = req.onerror = req.onblocked = () => ok();
  });
});

const fila = async () => (await abrirBanco()).getAll('fila_sync');

describe('repositório local', () => {
  it('grava e coloca na fila como "criar"', async () => {
    await salvar('musicas', novaMusica({ id: 'a', titulo: 'Primeiro' }));
    const itens = await fila();
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({ entidade: 'musicas', registro_id: 'a', operacao: 'criar' });
  });

  it('compacta alterações seguidas e mantém "criar" enquanto não sincronizar', async () => {
    const i = novaMusica({ id: 'a', titulo: 'v1' });
    await salvar('musicas', i);
    await salvar('musicas', { ...i, titulo: 'v2' });
    await gravar([{ entidade: 'musicas', registro: { ...i, titulo: 'v3', status: 'excluida' }, operacao: 'excluir' }]);
    const itens = await fila();
    expect(itens).toHaveLength(1);
    expect(itens[0].operacao).toBe('criar');
    expect((itens[0].payload as unknown as { titulo: string }).titulo).toBe('v3');
  });

  it('preserva criado_em, atualiza atualizado_em e devolve a versão anterior (para Desfazer)', async () => {
    const i = novaMusica({ id: 'a', titulo: 'v1' }, new Date('2026-01-01T10:00:00Z'));
    await salvar('musicas', i);
    const anterior = await salvar('musicas', { ...i, titulo: 'v2', criado_em: 'lixo' });
    expect(anterior?.titulo).toBe('v1');
    const [salvo] = await listarTodos('musicas');
    expect(salvo.criado_em).toBe(i.criado_em);
    expect(salvo.atualizado_em).not.toBe(i.atualizado_em);
  });
});
