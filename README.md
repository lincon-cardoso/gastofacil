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

## � Estrutura do Projeto

```
src/                 # Código-fonte principal (App Router)
  app/              # Páginas e layouts do Next.js 15
    (protect)/      # Rotas protegidas
    api/            # API Routes
    login/          # Página de login
    register/       # Página de registro
    planos/         # Página de planos
    contato/        # Página de contato
    sobre/          # Página sobre
  components/       # Componentes reutilizáveis
    Header/         # Cabeçalho da aplicação
    footer/         # Rodapé
    main/           # Componentes da página principal
    orcamento/      # Componentes de orçamento
  hooks/           # Hooks customizados
  schemas/         # Schemas de validação
  styles/          # Arquivos Sass globais e específicos
  types/           # Definições de tipos TypeScript
  utils/           # Funções utilitárias
prisma/             # Schema e configurações do banco
  migrations/       # Migrações do banco de dados
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
- Middleware customizado em [`middleware.ts`](middleware.ts)
- Otimizações de build automáticas
- Suporte a robots.txt

---

## 🛡️ Segurança e Qualidade

- **Middleware** para proteção de rotas
- **TypeScript** para segurança de tipos
- **ESLint** para qualidade de código
- **Testes automatizados** com cobertura
- **Variáveis de ambiente** seguras
- **Rotas protegidas** com autenticação

---

## 🚦 Funcionalidades Implementadas

Com base na estrutura do projeto, as seguintes funcionalidades estão disponíveis:

- **Sistema de Autenticação**: Login e registro de usuários
- **Dashboard Protegido**: Área restrita para usuários autenticados
- **Gerenciamento de Orçamentos**: Controle de orçamentos pessoais
- **Sistema de Cartões**: Gestão de cartões de crédito/débito
- **Categorização**: Organização por categorias
- **Metas Financeiras**: Definição e acompanhamento de metas
- **Transações**: Registro e controle de transações
- **API Completa**: Endpoints para todas as funcionalidades
- **Interface Responsiva**: Design adaptado para todos os dispositivos

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
