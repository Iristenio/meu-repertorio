# Meu Repertório — Plano em etapas

Cada etapa termina com algo **usável no aparelho**. Primeiro o app funcionando offline; o Google depois.

## Etapa 1 — Cadastrar músicas e a letra em partes ✔ (concluída em 05/10/2026)
- Entidade **Música** (substitui o "Item" de exemplo), com regras e testes: numeração automática dos
  versos, validação do link do YouTube, busca por título/trecho da letra.
- Tela **Músicas** (lista, busca, filtro Rascunho/Concluída) e painel **Editar música** com os botões
  "+ Verso", "+ Refrão"… e, em cada parte, subir/descer/duplicar/remover (com Desfazer).
- Ajustes: **compositor padrão**.
- Visual do app com as cores do template (dourado, azul-marinho, creme) e ícone novo.
- ✅ Usável: o Paulo já cadastra e organiza as letras no celular e no PC.

## Etapa 2 — A folha A4 em PDF ✔ (concluída em 05/10/2026)
- Tela **Folha**: pré-visualização no visual do template (título cursivo, faixas das partes, caixa
  "Ouça a música" com QR Code, violão e ondas redesenhados).
- QR Code gerado no aparelho; fontes guardadas no app (offline).
- Quebra para a 2ª folha quando não couber; botão **Comprimir**.
- Botão **Gerar PDF / Imprimir** (abre a impressão → "Salvar como PDF"; nome do arquivo = título).
- ✅ Usável: gerar e imprimir a folha de cada música.

## Etapa 3 — Capas por estilo ✔ (concluída em 05/10/2026)
- Menu **Capas**: lista dos estilos usados; capa A4 com estilo + compositor; gerar PDF.
- ✅ Usável: capas para separar a pasta impressa por estilo.

## Etapa 4 — Publicar e instalar ✔ (publicado em 05/10/2026: https://iristenio.github.io/meu-repertorio/)
- Repositório no GitHub + GitHub Pages; instalar no celular e no PC.

## Extras feitos no caminho
- **Colar letra inteira**: divide a letra colada em partes pelas marcações ([Verso 1], [Chorus]…) ou linhas em branco.
- **Duas colunas** de letra nas folhas sem QR Code (folhas de continuação e músicas sem link).

## Etapa 5 — Planilha do Google (conta pessoal) ✔ (sincronizando em 05/10/2026)
- Backend (Apps Script) com a aba MUSICAS; autorização feita pelo usuário; código `APP1:` em Ajustes.
- ✅ Usável: as músicas aparecem em todos os aparelhos e ficam com cópia na planilha.

## Ao final — Verificar os outros apps (pedido do Iristenio)
- Conferir a **Agenda** e outros apps feitos a partir da base: se ainda usam o banco `'app'` e a chave de
  tema `'tema'` (compartilhados entre todos os apps em iristenio.github.io).
- Antes de trocar o nome do banco num app já publicado: garantir que está tudo sincronizado com a planilha
  (ou migrar os dados), senão o aparelho "esquece" o que está guardado nele.
