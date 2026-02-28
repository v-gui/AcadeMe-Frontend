# 🎓 AcadeMe Inc.

> **Transformando sua trajetória acadêmica em um portfólio de impacto.** O **AcadeMe** é uma plataforma full-stack desenvolvida para estudantes que desejam centralizar, organizar e dar visibilidade aos seus projetos e conquistas universitárias. O objetivo é conectar o potencial acadêmico diretamente com o mercado de trabalho através de uma vitrine profissional e intuitiva.

---

## 🚀 Funcionalidades

### 🔐 Autenticação e Segurança
- **SignUp Inteligente:** Cadastro com validação de senha em tempo real (mínimo de 6 caracteres, letras maiúsculas e números) e mensagens de erro integradas na interface.
- **Login Fluido:** Acesso persistente via `localStorage` com feedback visual de carregamento nos botões.
- **Experiência sem Pop-ups:** Substituição de `alerts` nativos por notificações elegantes via **React Toastify**.

### 🔍 Descoberta e Vitrine
- **Header "Freeze":** Barra de navegação fixa no topo com efeito *glassmorphism* (backdrop-blur).
- **Busca Estilo LinkedIn:** Barra de pesquisa global com dropdown de resultados instantâneos, permitindo filtrar talentos por nome ou curso.
- **Showcase de Talentos:** Vitrine pública centralizada exibindo cards de estudantes e seus cursos.

### 📂 Gestão de Portfólio
- **Dashboard Privado:** Edição de biografia e gerenciamento de áreas de interesse (competências).
- **CRUD de Projetos:** Criação, visualização, edição e exclusão de trabalhos.
- **Upload Completo:** Suporte para capas de projeto, galerias de pôsteres, anexos de arquivos e referências bibliográficas.
- **Draft System:** Persistência automática de rascunhos no navegador para evitar perda de progresso durante o upload.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React.js** (com Hooks e Functional Components)
- **TypeScript** (Tipagem forte para maior segurança no desenvolvimento)
- **Tailwind CSS** (Estilização moderna e responsiva)
- **React Router DOM v6** (Gerenciamento de rotas e navegação)
- **React Toastify** (Sistema de notificações de UX)

### Backend & Banco de Dados
- **Node.js** (Ambiente de execução)
- **Express** (Framework para API REST)
- **MongoDB** (Banco de dados NoSQL para escalabilidade)

---

## 📂 Estrutura do Projeto (Frontend)

```text
src/
├── assets/             # Logos, ícones SVG e ilustrações
├── components/         # Componentes reutilizáveis (Button, TextBar, Navbar, Cards)
├── pages/              # Páginas principais (Home, Login, SignUp, Profile, Upload)
├── index.tsx           # Configuração global (ToastContainer e Rotas)
└── index.css           # Configurações globais do Tailwind e fontes
