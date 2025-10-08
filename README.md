# Lista de Tarefas (modo localStorage)

Este repositório foi convertido para funcionar como uma aplicação frontend apenas. Todos
os dados (tarefas e configurações) são armazenados no browser via localStorage.

## Sumário rápido
- Abra `index.html` no seu navegador ou sirva a pasta com um servidor estático.
- A aplicação salva dados nas chaves de localStorage:
	- `todo_tasks_v1` — array com as tarefas
	- `todo_settings_v1` — objeto com configurações (cor/imagem de fundo, etc.)

## Funcionalidades
- Adicionar tarefa: título, descrição, data de vencimento e nível de urgência (baixa, média, alta).
- Editar tarefa: modo de edição permite selecionar e atualizar uma tarefa existente.
- Excluir tarefa: botão de exclusão em cada item.
- Visualizar descrição: botão "Ver descrição" abre um modal com o texto completo.
- Organização por urgência: colunas separadas para Alta, Média e Baixa urgência.
- Ordenação por prazo: tarefas são ordenadas por: atrasadas → próximas (até 2 dias) → normais.
- Opções de fundo: escolha entre cores predefinidas ou faça upload de uma imagem como fundo.
	- A cor/imagem selecionada é salva em `todo_settings_v1`.
- Dropdown de cores robusto: a lista de cores é ported para o <body> quando aberta para
	evitar problemas de sobreposição com modais.

## Como executar
- Modo simples: abra `index.html` diretamente no navegador.
- Modo servido: execute um servidor estático (ex.: `python -m http.server 8000`) e acesse
	`http://localhost:8000`.

## Notas de desenvolvimento
- O projeto atualmente roda em modo localStorage por padrão. Para mudar isto:
	- editar `script.js` e definir `USE_LOCAL_STORAGE = false`, e restaurar um servidor backend
		compatível (se desejar persistência via banco).
- Arquitetura atual (após refactor):
	- `taskApi.js` — classe `TaskAPI` que abstrai operações de armazenamento (localStorage ou API REST).
	- `script.js` — lógica da UI, manipulação do DOM e renderização (usa `TaskAPI`).
	- `index.html`, `style.css` — marcação e estilos.

## Observações sobre testes e limpeza
- Testes e scripts de depuração (Puppeteer, imagens de debug, banco SQLite) foram removidos do diretório
	para manter o repositório limpo. Se precisar recuperá-los, eu posso gerar um patch ou restaurar a partir de um backup.

## Boas práticas e próximas etapas (opcionais)
- Posso:
	- adicionar lint (ESLint + Prettier) e testes unitários para `TaskAPI` (Jest),
	- criar um branch remoto e empurrar as mudanças (recomendado quando o remoto tiver a branch principal em uso),
	- melhorar acessibilidade (atalhos de teclado, ARIA para modais e seletores de cor).

Se quiser que eu atualize o README com mais detalhes (exemplos de payload em localStorage,
instruções de restauração do backend, ou fluxos de deploy), diga o que prefere e eu adapto.
# To-Do List (localStorage-only)

This repository has been converted to a frontend-only app that stores tasks and
settings in browser localStorage. It no longer uses a server or SQLite database.

Quick start
1. Open `index.html` in your browser (or serve the folder with any static server).
2. Use the UI to add/edit/delete tasks. Data is saved to the following localStorage keys:
	- `todo_tasks_v1` (array of tasks)
	- `todo_settings_v1` (object of settings)

Notes
- The app intentionally runs in localStorage mode for simple testing and offline use.
- If you want to restore server/db mode later, edit `script.js` and set `USE_LOCAL_STORAGE = false` and re-add server files.

Files of interest
- `index.html`, `style.css`, `script.js` — main frontend
- `package.json` — trimmed to reflect frontend-only usage

Cleanup performed (2025-10-08): debug/test files and the SQLite DB were removed from the project directory. See `archive_unused.txt` for details.

If you want these files preserved instead of deleted, I can restore them from a provided backup or move related files into an `archive/` folder.
