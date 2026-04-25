# AcadeMe Frontend

## Papel Do Frontend

O frontend concentra a experiencia do usuario. Ele renderiza home, perfis, projeto, upload, convites e a camada visual das validacoes.

O frontend nao deve decidir regra de negocio critica. Ele apenas reflete o que o backend autoriza.

## Stack

- React
- React Router
- TypeScript
- React Toastify

## Estrutura

```text
src/
|-- assets/         # Logos, imagens e ilustracoes
|-- components/     # Componentes reutilizaveis de interface
|-- hooks/          # Logicas compartilhadas entre paginas
|-- pages/          # Paginas principais da aplicacao
|-- types/          # Tipos compartilhados do frontend
|-- utils/          # Funcoes auxiliares reutilizaveis
|-- App.tsx         # Definicao das rotas
|-- index.tsx       # Bootstrap da aplicacao
```

## Paginas Principais

### Home

Responsabilidades:

- carregar vitrine de talentos
- carregar vitrine de trabalhos validados
- exibir busca global
- abrir menu de convites para usuario logado

Dados usados:

- `GET /students-active`
- `GET /projects-endorsed`
- `GET /search`

### Profile

Responsabilidades:

- carregar perfil do aluno logado
- editar bio, interesses e imagem
- listar projetos do aluno
- responder convites do aluno

### ProfileProf

Responsabilidades:

- carregar perfil do professor logado
- editar bio, expertise e imagem
- listar projetos validados pelo docente
- responder convites docentes

### ProjectView

Responsabilidades:

- renderizar detalhes completos do projeto
- permitir aceite ou recusa de convite
- permitir validacao e edicao do comentario
- permitir saida de aluno e professor
- exibir posters, arquivos e referencias

Essa pagina e o principal ponto de encontro entre equipe, convite e validacao.

### Upload

Responsabilidades:

- criar projeto
- editar projeto existente
- gerenciar membros da equipe
- convidar professores
- publicar posters, arquivos e referencias

## Arquivos Importantes Para Manutencao

### `src/types/models.ts`

Centraliza os formatos de dados consumidos pelas paginas e componentes. Sempre que o backend mudar payloads, esta deve ser a primeira revisao no frontend.

### `src/utils/project.ts`

Concentra regras auxiliares compartilhadas:

- saber se o projeto tem validacao
- montar query de visitante
- contar membros aceitos
- descobrir administrador do projeto
- validar se um projeto pode ser excluido

### `src/hooks/useInviteMenu.ts`

Centraliza:

- carregamento de convites
- resposta a convites
- adaptacao do payload para aluno e professor
- estado do dropdown de convites

### `src/components/InviteMenu.tsx`

Componente unico do menu de notificacoes. Alteracoes de visual ou comportamento de convites devem passar por ele para manter consistencia entre as paginas.

## Integracao Com O Backend

O frontend usa `REACT_APP_API_URL`.

Quando a variavel nao esta definida:

```env
http://localhost:3001
```

## Fluxos Principais

### 1. Login

1. usuario preenche formulario
2. frontend chama `POST /login`
3. usuario e salvo em `localStorage`
4. roteamento muda conforme `role`

### 2. Busca Global

1. o texto digitado passa por debounce
2. a busca chama `GET /search`
3. o dropdown mostra alunos, professores e projetos

### 3. Convite De Professor

1. o menu de convites ou a `ProjectView` chama `PUT /projects/:projectId/respond-professor-invite`
2. o aceite ja registra a validacao automaticamente
3. o comentario pode ser adicionado ou alterado depois

### 4. Trabalhos De Excelencia

1. a home chama `GET /projects-endorsed`
2. o backend devolve 3 projetos validados em ordem aleatoria
3. a home aplica `slice(0, 3)` como protecao adicional no frontend

## Convencoes De Manutencao

- atualize tipos antes de alterar varias paginas
- prefira utilitarios compartilhados a repetir regra em mais de um componente
- se um fluxo envolver convite e validacao, revise `useInviteMenu`, `ProjectView` e `Home`
- se alterar visibilidade de projeto, revise os efeitos da busca global e da navegacao

## Scripts

```bash
npm start
npm run build
```

## Validacao

No estado atual, o build do frontend compila com sucesso:

```bash
npm run build
```
