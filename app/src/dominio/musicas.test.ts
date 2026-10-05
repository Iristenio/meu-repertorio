import { describe, expect, it } from 'vitest';
import {
  duplicarParte,
  estilosUsados,
  filtrarMusicas,
  limparMusica,
  linkYoutubeValido,
  moverParte,
  normalizarLink,
  novaMusica,
  novaParte,
  podeGerarFolha,
  primeiraLinha,
  removerParte,
  rotulosDasPartes,
  validarMusica,
} from './musicas';
import type { Parte } from './tipos';

let seq = 0;
const m = (campos = {}) => novaMusica({ id: `m${++seq}`, titulo: 'x', ...campos });
const p = (tipo: Parte['tipo'], texto = 'linha', nome = '') => novaParte(`p${++seq}`, tipo, texto, nome);

describe('rótulos das partes', () => {
  it('numera os versos sozinhos e renumera ao mover/remover', () => {
    const partes = [p('verso'), p('pre_refrao'), p('refrao'), p('verso'), p('ponte'), p('refrao_final')];
    expect(rotulosDasPartes(partes)).toEqual(['Verso 1', 'Pré-refrão', 'Refrão', 'Verso 2', 'Ponte', 'Refrão final']);
    expect(rotulosDasPartes(removerParte(partes, 0))).toEqual(['Pré-refrão', 'Refrão', 'Verso 1', 'Ponte', 'Refrão final']);
    expect(rotulosDasPartes(moverParte(partes, 3, -1))[2]).toBe('Verso 2');
  });
  it('tipo "outro" usa o nome digitado', () => {
    expect(rotulosDasPartes([p('introducao'), p('outro', 'x', ' Falado '), p('outro'), p('final')])).toEqual([
      'Introdução',
      'Falado',
      'Outro',
      'Final',
    ]);
  });
});

describe('edição das partes', () => {
  const lista = [p('verso', 'a'), p('refrao', 'b'), p('verso', 'c')];
  it('mover não sai dos limites', () => {
    expect(moverParte(lista, 0, -1)).toBe(lista);
    expect(moverParte(lista, 2, 1)).toBe(lista);
    expect(moverParte(lista, 0, 1).map((x) => x.texto)).toEqual(['b', 'a', 'c']);
  });
  it('duplicar copia o texto logo abaixo, com id novo', () => {
    const nova = duplicarParte(lista, 1, 'novo');
    expect(nova.map((x) => x.texto)).toEqual(['a', 'b', 'b', 'c']);
    expect(nova[2].id).toBe('novo');
    expect(nova[2].tipo).toBe('refrao');
    expect(lista).toHaveLength(3); // não altera a original
  });
});

describe('link do YouTube', () => {
  it('aceita os formatos do YouTube', () => {
    for (const l of [
      'https://www.youtube.com/watch?v=abc',
      'youtube.com/watch?v=abc',
      'https://youtu.be/abc',
      'https://m.youtube.com/watch?v=abc',
      'https://music.youtube.com/watch?v=abc',
      'https://youtube.com/shorts/abc',
    ])
      expect(linkYoutubeValido(l), l).toBe(true);
  });
  it('recusa outros sites', () => {
    for (const l of ['', 'https://vimeo.com/1', 'https://fakeyoutube.com/x', 'texto qualquer', 'https://youtube.com.golpe.net/x'])
      expect(linkYoutubeValido(l), l).toBe(false);
  });
  it('completa o https://', () => {
    expect(normalizarLink(' youtu.be/abc ')).toBe('https://youtu.be/abc');
    expect(normalizarLink('http://youtu.be/abc')).toBe('http://youtu.be/abc');
    expect(normalizarLink('  ')).toBe('');
  });
});

describe('validação', () => {
  it('exige título e link do YouTube (se houver link)', () => {
    expect(validarMusica({ titulo: ' ', link: '', partes: [] })).toHaveLength(1);
    expect(validarMusica({ titulo: 'a', link: 'https://vimeo.com/1', partes: [] })).toHaveLength(1);
    expect(validarMusica({ titulo: 'a', link: '', partes: [] })).toHaveLength(0);
  });
  it('folha só com título e alguma parte com texto', () => {
    expect(podeGerarFolha({ titulo: 'a', partes: [] })).toBe(false);
    expect(podeGerarFolha({ titulo: 'a', partes: [p('verso', '  ')] })).toBe(false);
    expect(podeGerarFolha({ titulo: '', partes: [p('verso')] })).toBe(false);
    expect(podeGerarFolha({ titulo: 'a', partes: [p('verso', '  '), p('refrao', 'la')] })).toBe(true);
  });
  it('limpar tira espaços sobrando, mantendo as quebras internas da letra', () => {
    const limpa = limparMusica(m({ titulo: ' T ', estilo: ' Música   gospel ', link: 'youtu.be/x', partes: [p('verso', '\n\nlinha 1\n\nlinha 2  \n\n')] }));
    expect(limpa.titulo).toBe('T');
    expect(limpa.estilo).toBe('Música gospel');
    expect(limpa.link).toBe('https://youtu.be/x');
    expect(limpa.partes[0].texto).toBe('linha 1\n\nlinha 2');
  });
});

describe('lista e busca', () => {
  const coracao = m({ titulo: 'Coração', estilo: 'Sertanejo', status: 'concluida', partes: [p('verso', 'Eu canto\na saudade')] });
  const amanha = m({ titulo: 'amanhã', estilo: 'Gospel' });
  const apagada = m({ titulo: 'Apagada', status: 'excluida' });
  const todas = [coracao, amanha, apagada];

  it('tira excluídas e ordena pelo título sem diferenciar maiúsculas', () => {
    expect(filtrarMusicas(todas).map((x) => x.titulo)).toEqual(['amanhã', 'Coração']);
  });
  it('busca sem acento no título, estilo e letra', () => {
    expect(filtrarMusicas(todas, 'coracao').map((x) => x.titulo)).toEqual(['Coração']);
    expect(filtrarMusicas(todas, 'SAUDADE').map((x) => x.titulo)).toEqual(['Coração']);
    expect(filtrarMusicas(todas, 'gospel').map((x) => x.titulo)).toEqual(['amanhã']);
    expect(filtrarMusicas(todas, 'apagada')).toHaveLength(0);
  });
  it('filtra por situação e por estilo', () => {
    expect(filtrarMusicas(todas, '', 'rascunho').map((x) => x.titulo)).toEqual(['amanhã']);
    expect(filtrarMusicas(todas, '', 'todas', 'sertanejo').map((x) => x.titulo)).toEqual(['Coração']);
  });
  it('estilos usados agrupam grafias e contam músicas', () => {
    const lista = [m({ estilo: 'Gospel' }), m({ estilo: 'gospel' }), m({ estilo: 'Gospel' }), m({ estilo: 'MPB' }), m({ estilo: '' }), m({ estilo: 'Rock', status: 'excluida' })];
    expect(estilosUsados(lista)).toEqual([
      { estilo: 'Gospel', quantidade: 3 },
      { estilo: 'MPB', quantidade: 1 },
    ]);
  });
  it('primeira linha da letra', () => {
    expect(primeiraLinha({ partes: [p('introducao', '  \n'), p('verso', '\n Eu canto \nmais')] })).toBe('Eu canto');
    expect(primeiraLinha({ partes: [] })).toBe('');
  });
});
