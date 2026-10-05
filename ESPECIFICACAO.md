# Meu Repertório — Especificação

App para o **Paulo Gonçalves** organizar suas composições (criadas com auxílio de IA): guardar a letra de
cada música dividida em partes, o link do YouTube onde ela está publicada e **gerar uma folha em PDF (A4,
retrato)** no visual do template, com QR Code que abre a música. O conjunto das folhas forma a "pasta" de
composições.

Aparelhos: **celular e PC**. Dados no aparelho + cópia na **planilha do Google (conta pessoal)**.

## 1. Visual (a partir do template)

| Elemento | Cor |
|---|---|
| Fundo creme | `#efede1` |
| Azul-marinho (título, faixas das partes, caixa do QR, violão) | `#101e29` |
| Dourado (barrinhas, rótulos, botão do QR, linhas) | `#9c6b1c` |

O **app** usa o dourado como cor principal (botões, destaques). A **folha impressa** reproduz o template.

## 2. O que é guardado

### Música
| Campo | Obrigatório | Observação |
|---|---|---|
| Título | sim | Aparece grande, em letra cursiva |
| Partes da letra | sim (pelo menos 1) | Lista ordenada — ver abaixo |
| Link do YouTube | não | Vira o QR Code. Sem link → folha sem o quadro do QR |
| Situação | sim | **Rascunho** ou **Concluída** |
| Data de composição | não | Só para organizar a lista (não sai na folha) |
| Observações | não | Anotações do Paulo (não saem na folha) |

### Parte da letra
| Campo | Observação |
|---|---|
| Tipo | Verso · Pré-refrão · Refrão · Ponte · Refrão final (e outros — ver pergunta 3) |
| Texto | As linhas da letra, uma por linha |

### Ajustes (valem para todas as músicas)
- **Nome do compositor** que sai na folha (ex.: "Paulo Ricardo Pereira Gonçalves" ou "Paulo Gonçalves").

## 3. Regras

1. Os **versos são numerados sozinhos** na ordem em que aparecem (Verso 1, Verso 2…); se um verso for
   movido ou apagado, a numeração se ajusta. Os outros tipos não levam número.
2. As partes podem ser **adicionadas, reordenadas (subir/descer), duplicadas e removidas** (com "Desfazer").
3. "Duplicar" serve para repetir o refrão: copia o texto da parte.
4. O link precisa ser um endereço do YouTube (`youtube.com` ou `youtu.be`); se não for, o app avisa.
5. Só se gera PDF de música com título e pelo menos uma parte com texto.
6. O **QR Code é gerado no próprio aparelho** (funciona sem internet).
7. Nada é apagado de verdade: excluir manda para "excluídas" e dá para desfazer.
8. O texto "Escaneie o QR Code para ouvir a música." é fixo.

## 4. Telas

1. **Músicas** — lista com busca por título ou trecho da letra; filtro Rascunho / Concluída; mostra
   quantas partes tem e se já tem link. Botão "+" cria uma música nova.
2. **Editar música** (painel lateral; tela cheia no celular) — título, situação, link do YouTube,
   e a lista de partes com botões **+ Verso · + Pré-refrão · + Refrão · + Ponte · + Refrão final**.
   Cada parte tem: tipo, caixa de texto, subir/descer, duplicar, remover.
3. **Folha (pré-visualização)** — mostra a folha A4 exatamente como vai sair, com o botão
   **Gerar PDF / Imprimir**. No PC e no Android abre a janela de impressão, onde se escolhe
   "Salvar como PDF".
4. **Ajustes** — nome do compositor, sincronização com a planilha, tema.

## 5. A folha A4 (retrato)

```
┌─────────────────────────────────────────────┐
│ LETRA DE MÚSICA ────────────    frase       │
│ Título em letra cursiva          cursiva    │
│ Compositor: Paulo Gonçalves                 │
│ ─────────────────────────────               │
│ ▌VERSO 1            │  ┌ OUÇA A MÚSICA ┐    │
│  linhas…            │  │   [QR CODE]   │    │
│ ▌REFRÃO             │  │ Escaneie o QR │    │
│  linhas…            │  └───────────────┘    │
│ ▌VERSO 2            │   frase cursiva       │
│  linhas…            │                  🎸   │
│ ~~~~~~~~ ondas no rodapé ~~~~~~~~~~~~~~~~   │
└─────────────────────────────────────────────┘
```

- **Mantém**: rótulo "LETRA DE MÚSICA", título cursivo, compositor, faixas azul-marinho das partes com
  barrinha dourada, caixa "Ouça a música" com QR, ondas e violão desenhados no rodapé/canto.
- **Remove**: quadro "Informações" (tom, BPM, data, direitos autorais) e a linha "Intérprete".
- Os desenhos (violão, ondas, notas) serão **redesenhados** por mim no mesmo estilo — não ficarão
  idênticos ao template, mas com a mesma cara.
- As letras e fontes ficam **guardadas dentro do app** (funcionam sem internet).

## 6. Perguntas em aberto

1. **Letra comprida** que não cabe numa página: diminuir a letra automaticamente para caber em 1 página,
   ou continuar numa 2ª página?
2. **Frases cursivas** ("Música é sentimento em forma de som" / "A música transforma o que sentimos em
   palavras"): manter fixas, permitir escrever uma frase por música, ou tirar?
3. **Outros tipos de parte** além dos cinco: Introdução, Final/Outro, Solo, ou um tipo com nome livre?
4. **"Pasta" completa**: além da folha de cada música, gerar **um PDF único com todas as concluídas**
   (com capa e índice)? Ou basta uma folha por música?
5. **Nome do compositor**: "Paulo Ricardo Pereira Gonçalves" ou "Paulo Gonçalves" (pode mudar depois
   em Ajustes)?
