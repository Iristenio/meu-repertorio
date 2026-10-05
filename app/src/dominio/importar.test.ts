import { describe, expect, it } from 'vitest';
import { ajustarMaiusculas, importarLetra } from './importar';

const resumo = (texto: string) => importarLetra(texto).partes.map((p) => (p.tipo === 'outro' ? `outro:${p.nome}` : p.tipo));

describe('colar letra inteira', () => {
  it('título na 1ª linha e marcações em português, com números e observações', () => {
    const r = importarLetra(
      [
        'MEU TÍTULO DE TESTE',
        '',
        '[VERSO 1]',
        'linha a',
        'linha b',
        '',
        '[PRÉ-REFRÃO 2 / CHAMADA]',
        'linha c',
        '',
        'linha d',
        '',
        '',
        '[REFRÃO]',
        'linha e',
        '[REFRÃO FINAL — MAIS FORTE]',
        'linha f',
        '[FINAL / CHICLETE]',
        'linha g',
        '[PONTE / QUEBRA]',
        'linha h',
      ].join('\n'),
    );
    expect(r.titulo).toBe('Meu título de teste');
    expect(r.partes.map((p) => p.tipo)).toEqual(['verso', 'pre_refrao', 'refrao', 'refrao_final', 'final', 'ponte']);
    expect(r.partes[0].texto).toBe('linha a\nlinha b');
    expect(r.partes[1].texto).toBe('linha c\n\nlinha d'); // mantém a separação de estrofes
    expect(r.observacoes).toEqual(['PRÉ-REFRÃO 2 / CHAMADA', 'REFRÃO FINAL — MAIS FORTE', 'FINAL / CHICLETE', 'PONTE / QUEBRA']);
  });

  it('marcações em inglês (Suno) e marcações sem letra são ignoradas', () => {
    expect(resumo('[Intro]\n[Verse 1]\na\n[Pre-Chorus]\nb\n[Chorus]\nc\n[Guitar Solo]\n[Bridge]\nd\n[Final Chorus]\ne\n[Outro]\nf')).toEqual([
      'verso',
      'pre_refrao',
      'refrao',
      'ponte',
      'refrao_final',
      'final',
    ]);
  });

  it('marcação desconhecida vira "Outro" com o nome escrito', () => {
    expect(resumo('[Falado]\na\n(Rap)\nb')).toEqual(['outro:Falado', 'outro:Rap']);
  });

  it('marcações soltas na linha ("Refrão:")', () => {
    expect(resumo('Verso 1:\na\nb\n\nRefrão:\nc\n\nPonte\nd')).toEqual(['verso', 'refrao', 'ponte']);
  });

  it('sem marcações: separa nas linhas em branco e blocos repetidos viram refrão', () => {
    const r = importarLetra('a\nb\n\nrefrão x\nrefrão y\n\n\nc\n\nrefrão x\nrefrão y');
    expect(r.titulo).toBe('');
    expect(r.partes.map((p) => p.tipo)).toEqual(['verso', 'refrao', 'verso', 'refrao']);
    expect(r.partes[1].texto).toBe('refrão x\nrefrão y');
  });

  it('texto antes da 1ª marcação com várias linhas vira um verso (não título)', () => {
    const r = importarLetra('linha 1\nlinha 2\n[Refrão]\nx');
    expect(r.titulo).toBe('');
    expect(r.partes.map((p) => p.tipo)).toEqual(['verso', 'refrao']);
  });

  it('maiúsculas', () => {
    expect(ajustarMaiusculas('NÃO SEI')).toBe('Não sei');
    expect(ajustarMaiusculas('Já Está Certo')).toBe('Já Está Certo');
  });
});
