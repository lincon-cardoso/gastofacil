# gastofacil

Projeto Next.js criado com TypeScript, ESLint, App Router, estrutura em src/ e suporte a Sass.

---

## Visão Geral

O **gastofacil** é uma aplicação web desenvolvida com o framework Next.js, projetada para facilitar o gerenciamento de finanças pessoais. Utilizando tecnologias modernas como TypeScript e Sass, o projeto oferece uma interface amigável e responsiva, com foco em boas práticas de desenvolvimento e escalabilidade.

---

## Funcionalidades Principais

- **Gerenciamento de Finanças**: Controle de despesas e receitas.
- **Interface Responsiva**: Design adaptado para diferentes dispositivos.
- **Autenticação**: Sistema de login e registro de usuários.
- **Relatórios Visuais**: Gráficos e relatórios para análise financeira.
- **Plano de Assinatura**: Diferentes planos para atender às necessidades dos usuários.

---

## Estrutura do Projeto

A estrutura do projeto segue o padrão recomendado pelo Next.js, com algumas customizações para organização e escalabilidade:

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
```

---

## Configuração e Instalação

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm (gerenciador de pacotes)

### Passos para rodar o projeto localmente

1. Clone o repositório:

```bash
git clone https://github.com/lincon-cardoso/gastofacil.git
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

4. Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## Dependências Principais

- **Next.js**: Framework React para aplicações web modernas.
- **TypeScript**: Superset do JavaScript para tipagem estática.
- **Sass**: Pré-processador CSS para estilos mais organizados.
- **ESLint**: Ferramenta de linting para manter a qualidade do código.
- **Prettier**: Formatação automática de código.

---

## Padrões e Tecnologias

- **Estrutura Modular**: Código organizado em pastas específicas para facilitar a manutenção.
- **App Router**: Utilização do novo sistema de roteamento do Next.js.
- **Sass**: Estilização com suporte a variáveis, mixins e aninhamento.
- **ESLint e Prettier**: Configurados para garantir consistência no código.

---

## Scripts Disponíveis

- `npm run dev` — inicia o servidor de desenvolvimento
- `npm run build` — gera a build de produção
- `npm run start` — inicia o servidor em produção
- `npm run lint` — executa o linter
- `npm run test` — executa os testes com cobertura
- `npm run test:watch` — executa os testes em modo de observação
- `npm run format` — formata o código com Prettier

---

## Exemplos de Uso

### Adicionando uma Nova Página

1. Crie uma nova pasta dentro de `src/app` com o nome da página.
2. Adicione um arquivo `page.tsx` com o conteúdo da página.

Exemplo:

```tsx
export default function NovaPagina() {
  return <h1>Bem-vindo à nova página!</h1>;
}
```

### Criando um Componente Reutilizável

1. Adicione o componente na pasta `src/components`.
2. Importe e utilize o componente onde necessário.

Exemplo:

```tsx
import MeuComponente from "@/components/MeuComponente";

export default function Pagina() {
  return <MeuComponente />;
}
```

---

## Contribuição

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

## Contato

Para dúvidas ou sugestões, entre em contato com o mantenedor do projeto através do GitHub: [lincon-cardoso](https://github.com/lincon-cardoso).
