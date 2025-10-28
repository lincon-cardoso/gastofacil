# GastoFácil

Uma aplicação web moderna para gerenciamento de finanças pessoais, desenvolvida com **Next.js 15**, **TypeScript** e **Sass**.

---

## 🚀 Tecnologias Utilizadas

- **Next.js 15** com App Router
- **TypeScript** para tipagem estática
- **Sass** para estilização
- **ESLint** para qualidade de código
- **Jest** com Testing Library para testes
- **Prisma** como ORM
- **Turbopack** para desenvolvimento rápido

---

## 📁 Estrutura do Projeto

```
src/                 # Código-fonte principal (App Router)
  app/              # Páginas e layouts do Next.js 15
    (protect)/      # Rotas protegidas por autenticação
      dashboard/    # Dashboard principal
    api/            # API Routes
      auth/         # Autenticação
      budgets/      # CRUD de orçamentos
      cards/        # CRUD de cartões
      categories/   # CRUD de categorias
      checkout/     # Processamento de pagamentos
      dashboard/    # Dados do dashboard
      metas/        # CRUD de metas
      register/     # Registro de usuários
      session/      # Gerenciamento de sessões
      subscription/ # Gestão de assinaturas
      transactions/ # CRUD de transações
    checkout/       # Página de checkout
    contato/        # Página de contato
    login/          # Página de login
    planos/         # Página de planos
    register/       # Página de registro
    sobre/          # Página sobre
  components/       # Componentes reutilizáveis
    Header/         # Cabeçalho da aplicação
    footer/         # Rodapé
    main/           # Componentes da página principal
    orcamento/      # Componentes de orçamento
  config/           # Configurações da aplicação
  contexts/         # Contexts do React
  hooks/           # Hooks customizados
  register/        # Componentes de registro
  schemas/         # Schemas de validação (Zod)
  services/        # Serviços externos
  styles/          # Arquivos Sass globais e específicos
  types/           # Definições de tipos TypeScript
  utils/           # Funções utilitárias
prisma/             # Schema e configurações do banco
  migrations/       # Migrações do banco de dados
  seed.ts          # Dados iniciais
  schema.prisma    # Schema do banco
public/             # Arquivos estáticos
  assets/          # Assets da aplicação
  favicons/        # Ícones de favoritos
  icons/           # Ícones gerais
  images/          # Imagens
.github/            # Configurações do GitHub e Copilot
coverage/           # Relatórios de cobertura de testes
```

---

## ⚙️ Configuração e Desenvolvimento

### Pré-requisitos

- **Node.js** 18+
- **npm**
- **Banco de dados** compatível com Prisma (PostgreSQL, MySQL, SQLite)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/lincon-cardoso/gastofacil.git

# Navegue para o diretório
cd gastofacil

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Configure o banco de dados
npx prisma migrate dev
npx prisma db seed
```

### Scripts Disponíveis

```bash
# Desenvolvimento (com Turbopack)
npm run dev

# Build de produção
npm run build

# Executar em produção
npm run start

# Linting
npm run lint

# Testes
npm run test
npm run test:watch

# Cobertura de testes
npm run test:coverage

# Prisma
npx prisma migrate dev
npx prisma db seed
npx prisma studio
```

---

## 🧪 Testes

O projeto utiliza **Jest** e **Testing Library** com configuração TypeScript:

- Configuração em [`jest.config.ts`](jest.config.ts)
- Setup personalizado em [`jest.setup.ts`](jest.setup.ts)
- Relatórios de cobertura em `/coverage`

```bash
# Executar todos os testes
npm run test

# Modo watch para desenvolvimento
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

---

## 🔧 Configurações

### TypeScript

- Configuração em [`tsconfig.json`](tsconfig.json)
- Aliases de importação com `@/*`
- Tipos do Next.js em [`next-env.d.ts`](next-env.d.ts)

### ESLint

- Configuração moderna em [`eslint.config.mjs`](eslint.config.mjs)
- Integração com TypeScript e Next.js

### Next.js

- Configuração personalizada em [`next.config.ts`](next.config.ts)
- App Router habilitado
- Turbopack para desenvolvimento
- Middleware em [`middleware.ts`](middleware.ts)

### Sass

- Suporte nativo do Next.js
- Organização de estilos em `src/styles/`
- Módulos CSS para componentes

### Banco de Dados

- **Prisma** como ORM
- Schema em [`prisma/schema.prisma`](prisma/schema.prisma)
- Migrações versionadas
- Seed de dados em [`prisma/seed.ts`](prisma/seed.ts)

---

## 🌐 Deploy e SEO

- Configuração de sitemap em [`next-sitemap.config.cjs`](next-sitemap.config.cjs)
- Middleware customizado para proteção de rotas
- Otimizações de build automáticas
- Suporte a robots.txt

---

## 🛡️ Segurança e Qualidade

- **Middleware** para proteção de rotas em [`middleware.ts`](middleware.ts)
- **TypeScript** para segurança de tipos
- **ESLint** para qualidade de código
- **Testes automatizados** com cobertura
- **Variáveis de ambiente** seguras
- **Rotas protegidas** com autenticação
- **Schemas de validação** com Zod

---

## 🚦 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação

- Login e registro de usuários
- Proteção de rotas com middleware
- Gerenciamento de sessões

### 📊 Dashboard e Visualizações

- Dashboard principal com métricas
- Resumos financeiros e relatórios

### 💳 Gestão de Cartões

- CRUD completo de cartões de crédito/débito
- Associação com transações
- Controle de limites

### 🏷️ Sistema de Categorias

- Categorização de gastos e receitas
- CRUD de categorias personalizadas
- Filtros por categoria

### 🎯 Metas Financeiras

- Definição e acompanhamento de metas
- Progresso visual das metas
- Alertas e notificações

### 💰 Gestão de Orçamentos

- Criação de orçamentos mensais
- Controle de gastos por categoria
- Relatórios de performance

### 📝 Controle de Transações

- Registro completo de receitas e despesas
- Histórico detalhado de transações
- Filtros e pesquisas avançadas

### 🛒 Sistema de Pagamentos

- Processamento de checkout
- Gestão de assinaturas
- Múltiplos métodos de pagamento

### 🛠️ API Completa

- Endpoints RESTful para todas as funcionalidades
- Validação de dados com schemas
- Tratamento de erros padronizado

---

## 📋 Variáveis de Ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

```env
# Database
DATABASE_URL="sua_url_do_banco"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu_secret_aqui"

# Outros serviços
# Adicione conforme necessário
```

---

## 🎨 Estilização

- **Sass** com organização modular
- Componentes com estilos isolados
- Design system consistente
- Responsividade mobile-first

---

## 📋 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📞 Contato

Para dúvidas ou sugestões, entre em contato com o mantenedor do projeto através do GitHub: [lincon-cardoso](https://github.com/lincon-cardoso).

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
