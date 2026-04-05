# AcadeMe Frontend

Frontend React da plataforma AcadeMe. Esta aplicacao concentra a experiencia de descoberta de projetos, gestao de portfolio academico, convites de equipe e validação docente.

## Visao Geral

- `Home`: vitrine publica de alunos e projetos validados.
- `Profile`: painel do aluno com edicao de perfil, convites e gerenciamento dos projetos.
- `ProfileProf`: painel do docente com convites de validacao e projetos chancelados.
- `ProjectView`: visualizacao detalhada do projeto, equipe, anexos e validacoes.
- `Upload`: criacao e edicao de projetos, equipe, docentes convidados, posters e arquivos.

## Estrutura

```text
src/
|-- assets/         # Logos, imagens e ilustracoes
|-- components/     # Componentes reutilizaveis de interface
|-- pages/          # Paginas principais da aplicacao
|-- types/          # Tipos compartilhados do frontend
|-- utils/          # Funcoes auxiliares reutilizaveis
|-- App.tsx         # Rotas principais
|-- index.tsx       # Bootstrap da aplicacao
```

## Ponto de Integracao

O frontend usa `REACT_APP_API_URL` para se conectar com a API. Quando a variavel nao esta definida, o fallback local continua sendo:

```env
http://localhost:3001
```

## Padroes de Manutencao

- Os modelos compartilhados ficam em `src/types/models.ts`.
- Regras reutilizadas de projeto ficam em `src/utils/project.ts`.
- Menus de convites devem reutilizar `src/components/InviteMenu.tsx`.
- Ao adicionar novas respostas da API, prefira atualizar os tipos compartilhados antes de espalhar `any` pelas paginas.

## Scripts

```bash
npm start
npm run build
npx tsc --noEmit
```

