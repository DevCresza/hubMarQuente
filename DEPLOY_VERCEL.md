# 🚀 Deploy na Vercel - Mar Quente HUB

Guia completo para fazer deploy do Mar Quente HUB na Vercel.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Repositório no GitHub (já configurado em `DevCresza/hubMarQuente`)
- Projeto Supabase configurado
- Node.js 18+ instalado localmente

## 🔧 Passo 1: Preparar Variáveis de Ambiente

Você precisará das seguintes variáveis do seu projeto Supabase:

1. **VITE_SUPABASE_URL**: URL do projeto Supabase
   - Exemplo: `https://fpyrvmdosljoefmmsnys.supabase.co`
   - Encontre em: Supabase Dashboard → Settings → API → Project URL

2. **VITE_SUPABASE_ANON_KEY**: Chave pública (anon key)
   - Encontre em: Supabase Dashboard → Settings → API → anon/public key

3. **VITE_SUPABASE_SERVICE_KEY**: Chave de serviço (service role key)
   - ⚠️ **NUNCA exponha esta chave publicamente**
   - Encontre em: Supabase Dashboard → Settings → API → service_role key

## 🌐 Passo 2: Deploy via Vercel Dashboard

### Opção A: Deploy Automático (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Escolha o repositório `DevCresza/hubMarQuente`
5. Configure o projeto:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Adicione as variáveis de ambiente:
   ```
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   VITE_SUPABASE_SERVICE_KEY=sua_chave_service_aqui
   ```

7. Clique em **"Deploy"**

### Opção B: Deploy via CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
vercel

# 4. Seguir as instruções no terminal
# - Link to existing project? No
# - What's your project's name? mar-quente-hub
# - In which directory is your code located? ./
# - Want to override the settings? No

# 5. Adicionar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_SUPABASE_SERVICE_KEY

# 6. Deploy para produção
vercel --prod
```

## 🔐 Passo 3: Configurar Variáveis de Ambiente Secretas

Para maior segurança, use Vercel Secrets:

```bash
# Criar secrets
vercel secrets add supabase-url "sua_url_aqui"
vercel secrets add supabase-anon-key "sua_chave_anon_aqui"
vercel secrets add supabase-service-key "sua_chave_service_aqui"
```

Depois atualize o `vercel.json`:

```json
{
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_SUPABASE_SERVICE_KEY": "@supabase-service-key"
  }
}
```

## ✅ Passo 4: Verificar Deploy

1. Acesse a URL fornecida pela Vercel (ex: `https://mar-quente-hub.vercel.app`)
2. Teste o login com usuário admin:
   - Email: `admin@teste.com`
   - Senha: `teste123`
3. Verifique se todas as funcionalidades estão funcionando:
   - Dashboard carrega
   - Projetos aparecem
   - Tarefas funcionam
   - Usuários são listados

## 🔄 Passo 5: Configurar Deploy Automático

O deploy automático já está configurado no `vercel.json`:

```json
{
  "github": {
    "enabled": true,
    "autoAlias": true,
    "silent": false,
    "autoJobCancelation": true
  }
}
```

**Isso significa que**:
- Cada push na branch `main` gera um novo deploy automaticamente
- Pull requests geram preview deploys
- Commits antigos cancelam builds em andamento

## 📊 Passo 6: Monitorar Performance

A Vercel fornece várias ferramentas de monitoramento:

1. **Analytics**: Acesse o dashboard da Vercel → Analytics
2. **Logs**: Vercel Dashboard → Deployments → [Seu Deploy] → Logs
3. **Real-time Logs**:
   ```bash
   vercel logs https://mar-quente-hub.vercel.app
   ```

## 🛠️ Comandos Úteis

```bash
# Ver todos os deploys
vercel ls

# Ver logs em tempo real
vercel logs --follow

# Fazer rollback para deploy anterior
vercel rollback

# Ver informações do projeto
vercel inspect

# Remover projeto
vercel remove mar-quente-hub
```

## 🌍 Domínio Customizado (Opcional)

Para usar um domínio personalizado:

1. Acesse Vercel Dashboard → Settings → Domains
2. Clique em **"Add Domain"**
3. Digite seu domínio (ex: `hub.marquente.com.br`)
4. Configure os DNS conforme instruções:
   ```
   Tipo: CNAME
   Nome: hub (ou @)
   Valor: cname.vercel-dns.com
   ```
5. Aguarde propagação DNS (até 48h)

## 🔒 Segurança

### Headers de Segurança (Já Configurados)

O `vercel.json` já inclui headers de segurança:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### HTTPS

- ✅ Habilitado automaticamente pela Vercel
- ✅ Certificado SSL gratuito via Let's Encrypt
- ✅ Renovação automática

## ⚡ Otimizações de Performance

### Cache de Assets (Já Configurado)

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Região (Brasil)

O projeto está configurado para a região `gru1` (São Paulo):

```json
{
  "regions": ["gru1"]
}
```

## 🐛 Troubleshooting

### Build falha com erro de memória

Adicione no `vercel.json`:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist",
        "maxLambdaSize": "50mb"
      }
    }
  ]
}
```

### Variáveis de ambiente não carregam

1. Verifique se as variáveis começam com `VITE_`
2. Re-deploy após adicionar variáveis
3. Limpe o cache: `vercel --force`

### 404 em rotas do React

Verifique se as rotas estão configuradas no `vercel.json`:

```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Supabase não conecta

1. Verifique se as variáveis de ambiente estão corretas
2. Teste as credenciais localmente
3. Verifique logs: `vercel logs`
4. Confirme que a URL do Supabase permite requisições do domínio Vercel

## 📚 Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Deploy com Vite](https://vercel.com/guides/deploying-vite-with-vercel)
- [Supabase + Vercel](https://supabase.com/docs/guides/hosting/vercel)

## 🎉 Deploy Completo!

Seu Mar Quente HUB está agora disponível na Vercel com:

- ✅ Deploy automático no push
- ✅ HTTPS habilitado
- ✅ Headers de segurança
- ✅ Cache otimizado
- ✅ Região Brasil (baixa latência)
- ✅ Preview deploys para PRs
- ✅ Monitoramento em tempo real

**URL do Projeto**: Será algo como `https://mar-quente-hub.vercel.app` ou `https://mar-quente-hub-[hash].vercel.app`

---

**Documentação criada em**: $(date)
**Versão**: 1.0.0
**Projeto**: Mar Quente HUB
