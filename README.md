# GastoFácil

O **GastoFácil** é uma aplicação web moderna desenvolvida com o framework **Next.js**, projetada para facilitar o gerenciamento de finanças pessoais. Com foco em simplicidade, segurança e escalabilidade, o projeto oferece uma interface amigável e responsiva, além de funcionalidades avançadas para controle financeiro.

---

## 🚀 Funcionalidades Principais

- **Gerenciamento de Finanças**: Controle de despesas, receitas e orçamentos.
- **Relatórios Visuais**: Gráficos e relatórios detalhados para análise financeira.
- **Autenticação Segura**: Sistema de login e registro com suporte a sessões únicas.
- **Planos de Assinatura**: Diferentes planos para atender às necessidades dos usuários.
- **Interface Responsiva**: Design adaptado para dispositivos móveis e desktops.
- **Integração Bancária (Beta)**: Sincronização com contas bancárias para maior automação.

---

## 🛠️ Tecnologias Utilizadas

- **Next.js**: Framework React para aplicações web modernas.
- **TypeScript**: Superset do JavaScript para tipagem estática.
- **Sass**: Pré-processador CSS para estilos organizados e reutilizáveis.
- **Prisma**: ORM para interação com o banco de dados.
- **NextAuth**: Gerenciamento de autenticação e sessões.
- **Upstash Redis**: Rate limiting e controle de sessões únicas.
- **ESLint e Prettier**: Garantia de qualidade e formatação do código.

---

## 🔒 Proteções e Boas Práticas

- **CSP (Content Security Policy)**: Configuração rigorosa para evitar ataques XSS.
- **Rate Limiting**: Limitação de requisições para evitar abusos.
- **Sessões Únicas**: Controle de login simultâneo por usuário.
- **Criptografia**: Dados protegidos em trânsito e em repouso.
- **LGPD e GDPR Compliance**: Conformidade com regulamentações de proteção de dados.
- **Middleware de Segurança**: Validação de tokens, cabeçalhos e origens.

---

## 📂 Estrutura do Projeto

A estrutura do projeto segue o padrão recomendado pelo Next.js, com customizações para organização e escalabilidade:

```
public/         # Arquivos públicos, como imagens e ícones
src/            # Código-fonte principal
  app/          # Páginas e layout principal
  components/   # Componentes reutilizáveis
  contexts/     # Contextos do React
  hooks/        # Hooks customizados
  services/     # Serviços e chamadas de API
  styles/       # Estilos globais e específicos
  types/        # Definições de tipos TypeScript
  utils/        # Funções utilitárias
prisma/         # Configurações e seed do banco de dados
```

---

## ⚙️ Configuração e Instalação

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** (gerenciador de pacotes)

### Passos para rodar o projeto localmente

1. Clone o repositório:

```bash
git clone https://github.com/lincon-cardoso/gastofacil.git
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente no arquivo `.env`:

```env
DATABASE_URL= # URL do banco de dados
NEXTAUTH_SECRET= # Chave secreta para autenticação
NEXTAUTH_URL= # URL pública da aplicação
NEXT_PUBLIC_APP_URL= # URL pública para validações de CSRF
UPSTASH_REDIS_REST_URL= # URL do Redis para rate limiting
UPSTASH_REDIS_REST_TOKEN= # Token do Redis
SECURITY_CSP_STRICT=true # (opcional) Ativa CSP rigorosa
```

4. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

5. Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📜 Scripts Disponíveis

- `npm run dev` — Inicia o servidor de desenvolvimento.
- `npm run build` — Gera a build de produção.
- `npm run start` — Inicia o servidor em produção.
- `npm run lint` — Executa o linter.
- `npm run test` — Executa os testes.
- `npm run test:watch` — Executa os testes em modo watch.

---

## 🧪 Testes

O projeto utiliza **Jest** para testes unitários e de integração. Para rodar os testes:

```bash
npm run test
```

---

## 🌐 Deploy

O deploy é realizado automaticamente no **Railway**, utilizando as configurações do arquivo `.env`. Para alternar entre ambientes:

### Desenvolvimento Local

```bash
npm run dev
```

### Produção Local

```bash
mv .env.local .env.local.disabled
npm run dev
mv .env.local.disabled .env.local
```

---

## 📋 Contribuição

1. Faça um fork do repositório.
2. Crie uma branch para sua feature ou correção de bug:

```bash
git checkout -b minha-feature
```

3. Faça commit das suas alterações:

```bash
git commit -m "Descrição da alteração"
```

4. Envie para o repositório remoto:

```bash
git push origin minha-feature
```

5. Abra um Pull Request explicando suas alterações.

---

## 📞 Contato

Para dúvidas ou sugestões, entre em contato com o mantenedor do projeto através do GitHub: [lincon-cardoso](https://github.com/lincon-cardoso).
