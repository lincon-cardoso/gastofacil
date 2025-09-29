# 🚀 Configuração de Ambiente - GastoFácil

Este projeto usa uma configuração inteligente de variáveis de ambiente que funciona tanto para desenvolvimento local quanto para produção no Railway.

## 📁 Estrutura de Arquivos

```
├── .env              # Configurações de PRODUÇÃO (commitado)
├── .env.local        # Configurações de DESENVOLVIMENTO (ignorado pelo Git)
└── .env.backup       # Backup do arquivo anterior
```

## 🔧 Como Funciona

### 🏠 **Desenvolvimento Local**

- O Next.js carrega automaticamente o `.env.local`
- As configurações do `.env.local` **sobrescrevem** as do `.env`
- Usa `localhost:3000` para todas as URLs
- Sessão única **desabilitada**
- CSP **menos rigoroso**

### 🌐 **Produção (Railway)**

- Usa apenas o arquivo `.env` (produção)
- URLs apontam para `gastofacil.devlincon.com.br`
- Sessão única **ativa**
- CSP **rigoroso**
- Upstash Redis **ativo**

## 🚀 Deploy para Railway

1. **Commit** o arquivo `.env` com configurações de produção
2. **NÃO** commite o `.env.local` (já está no .gitignore)
3. O Railway automaticamente usa o `.env` commitado

## 🔄 Alternar Entre Ambientes

### Para desenvolvimento local:

```bash
# O .env.local já está configurado - só rodar:
npm run dev
```

### Para testar como produção localmente:

```bash
# Renomeie temporariamente o .env.local:
mv .env.local .env.local.disabled
npm run dev
# Depois restaure:
mv .env.local.disabled .env.local
```

## 📋 Variáveis de Ambiente

### Principais:

- `APP_ENV`: Controla a lógica customizada do middleware
- `NODE_ENV`: Usado pelo Next.js
- `DISABLE_SINGLE_SESSION`: true/false para controle de sessão única
- `SECURITY_CSP_STRICT`: true/false para CSP rigoroso

### URLs:

- **Local**: `http://localhost:3000`
- **Produção**: `https://gastofacil.devlincon.com.br`

## ⚠️ Segurança

- ✅ `.env` é commitado com configurações de produção
- ✅ `.env.local` é ignorado pelo Git (desenvolvimento)
- ✅ Credenciais nunca vazam entre ambientes
- ✅ Railway usa automaticamente as configurações corretas

## 🔧 Troubleshooting

Se houver problemas:

1. **Verifique** se o `.env.local` existe para desenvolvimento
2. **Confirme** se as URLs estão corretas no ambiente
3. **Monitore** os logs do middleware para debug
4. **Use** `DISABLE_SINGLE_SESSION=true` se houver problemas de sessão
