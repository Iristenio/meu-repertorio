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
| Estilo | não | Ex.: Sertanejo, Gospel, MPB — escolhe de uma lista dos já usados ou digita um novo |
| Compositor | sim | Já vem preenchido com o nome padrão de Ajustes ("Paulo Gonçalves"); pode mudar numa música |
| Letra compacta | não | Botão "Comprimir": diminui a letra e os espaços para caber em menos folhas |
| Situação | sim | **Rascunho** ou **Concluída** |
| Data de composição | não | Só para organizar a lista (não sai na folha) |
| Observações | não | Anotações do Paulo (não saem na folha) |

### Parte da letra
| Campo | Observação |
|---|---|
| Tipo | Introdução · Verso · Pré-refrão · Refrão · Ponte · Refrão final · Final · **Outro (nome livre)** |
| Nome | Só para o tipo "Outro": o nome que o Paulo digitar (ex.: "Falado") |
| Texto | As linhas da letra, uma por linha |

### Ajustes (valem para todas as músicas)
- **Compositor padrão**: "Paulo Gonçalves" (usado em músicas novas e nas capas).

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
9. **Letra longa**: o tamanho da letra é sempre o mesmo; o que não couber continua numa **2ª folha**
   (com o título repetido em tamanho menor). O botão **Comprimir** reduz letra e espaçamentos para tentar
   caber em uma folha só.
10. **Cada música gera seu próprio PDF** (nome do arquivo = título da música).
11. **Capas por estilo**: para cada estilo usado, o app gera uma capa A4 com o nome do estilo e o
    compositor (sem lista de músicas). Cada capa também é um PDF separado.

## 4. Telas

1. **Músicas** — lista com busca por título ou trecho da letra; filtro Rascunho / Concluída; mostra
   quantas partes tem e se já tem link. Botão "+" cria uma música nova.
2. **Editar música** (painel lateral; tela cheia no celular) — título, situação, link do YouTube,
   e a lista de partes com botões **+ Verso · + Pré-refrão · + Refrão · + Ponte · + Refrão final**.
   Cada parte tem: tipo, caixa de texto, subir/descer, duplicar, remover.
3. **Folha (pré-visualização)** — mostra a folha A4 exatamente como vai sair, com o botão
   **Gerar PDF / Imprimir**. No PC e no Android abre a janela de impressão, onde se escolhe
   "Salvar como PDF".
4. **Capas** (menu próprio) — lista os estilos usados (com quantas músicas cada um tem); tocar num estilo
   mostra a capa e o botão **Gerar PDF / Imprimir**.
5. **Ajustes** — compositor padrão, sincronização com a planilha, tema.

## 5. A folha A4 (retrato)

```
┌─────────────────────────────────────────────┐
│ LETRA DE MÚSICA ────────────                │
│ Título em letra cursiva                     │
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
- **Remove**: quadro "Informações" (tom, BPM, data, direitos autorais), a linha "Intérprete" e as
  frases em letra cursiva.
- Os desenhos (violão, ondas, notas) serão **redesenhados** por mim no mesmo estilo — não ficarão
  idênticos ao template, mas com a mesma cara.
- As letras e fontes ficam **guardadas dentro do app** (funcionam sem internet).

## 6. Decisões tomadas

| Pergunta | Decisão |
|---|---|
| Letra comprida | Mesmo tamanho; continua na 2ª folha; botão "Comprimir" opcional |
| Frases cursivas | Retiradas |
| Tipos de parte | Os cinco + Introdução, Final e Outro (nome livre) |
| Pasta completa | Não — um PDF por música; **capas por estilo** num menu próprio |
| Capa | Só o estilo e o compositor |
| Compositor | "Paulo Gonçalves" (muda em Ajustes) |
| Fontes da folha | Título: **Kaushan Script**; rótulos: **Montserrat**; letra: **Lato** (guardadas no app, offline) |
| Tamanho da letra | Normal 11,5 pt; comprimida 10,5 pt (a letra completa do template cabe em 1 folha comprimida) |
| PDF | Pela janela de impressão do navegador ("Salvar como PDF"); nome do arquivo = título da música |
| Folhas de continuação | Título menor com "(continuação)", sem o QR; número da folha ("2 / 3") no rodapé |
| Duas colunas | Todas as folhas têm a letra em 2 colunas |
| QR Code | Só na **última folha**, no pé da coluna da direita (onde ficava o violão); se a letra encher a folha, o QR vai sozinho para a seguinte |
| Data | Se preenchida, aparece abaixo do compositor: "**Data:** 10/04/2025" |
| Violão | **Retirado das folhas das músicas** (pedido do Paulo: mais limpo e mais espaço); continua nas capas |
| Estilos híbridos | Um estilo só, escrito com barra (ex.: "Pagode/Swingueira"), com capa própria |
