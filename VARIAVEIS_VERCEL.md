# 🔐 Configurar Variáveis de Ambiente na Vercel

## ❌ Erro Atual:
```
VITE_SUPABASE_SERVICE_KEY não configurada
Service key não configurada. Configure VITE_SUPABASE_SERVICE_KEY no arquivo .env
```

## ✅ Solução: Adicionar 3 Variáveis na Vercel

### Passo 1: Acessar Settings do Projeto

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto **mar-quente-hub**
3. Vá em **Settings** (no menu superior)
4. Clique em **Environment Variables** (menu lateral esquerdo)

### Passo 2: Obter Credenciais do Supabase

1. Acesse: https://app.supabase.com/project/fpyrvmdosljoefmmsnys/settings/api
2. Você verá 3 informações importantes:

   **Project URL**:
   ```
   https://fpyrvmdosljoefmmsnys.supabase.co
   ```

   **anon/public key** (clique em "Reveal" para ver):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

   **service_role key** (clique em "Reveal" para ver):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

### Passo 3: Adicionar Variáveis na Vercel

Adicione as 3 variáveis **EXATAMENTE com estes nomes**:

#### Variável 1: VITE_SUPABASE_URL
```
Key: VITE_SUPABASE_URL
Value: https://fpyrvmdosljoefmmsnys.supabase.co
Environment: Production, Preview, Development (marcar todos)
```

#### Variável 2: VITE_SUPABASE_ANON_KEY
```
Key: VITE_SUPABASE_ANON_KEY
Value: [Cole a chave anon/public do Supabase]
Environment: Production, Preview, Development (marcar todos)
```

#### Variável 3: VITE_SUPABASE_SERVICE_KEY
```
Key: VITE_SUPABASE_SERVICE_KEY
Value: [Cole a chave service_role do Supabase]
Environment: Production, Preview, Development (marcar todos)
```

⚠️ **IMPORTANTE**:
- O nome DEVE ser `VITE_SUPABASE_SERVICE_KEY` (não `SERVICE_ROLE_KEY`)
- Marque os 3 ambientes (Production, Preview, Development)
- Não adicione aspas ou espaços extras

### Passo 4: Redeploy

Após adicionar as variáveis:

1. Vá em **Deployments** (menu superior)
2. Clique nos 3 pontinhos `...` do último deploy
3. Clique em **Redeploy**
4. Confirme com **Redeploy**

Ou use a CLI:
```bash
vercel --prod --force
```

### Passo 5: Verificar

Após o redeploy:

1. Acesse seu site na Vercel
2. Abra o Console do navegador (F12)
3. Tente criar um usuário
4. Não deve mais aparecer o erro de `SERVICE_KEY não configurada`

## 🎯 Checklist Final

- [ ] Acessei Vercel → Settings → Environment Variables
- [ ] Adicionei `VITE_SUPABASE_URL` com URL do Supabase
- [ ] Adicionei `VITE_SUPABASE_ANON_KEY` com chave anon
- [ ] Adicionei `VITE_SUPABASE_SERVICE_KEY` com chave service_role
- [ ] Marquei os 3 ambientes para cada variável
- [ ] Fiz Redeploy do projeto
- [ ] Testei e funcionou ✅

## 📸 Exemplo Visual

```
┌─────────────────────────────────────────────────────┐
│ Environment Variables                                │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Key: VITE_SUPABASE_URL                              │
│ Value: https://fpyrvmdosljoefmmsnys.supabase.co    │
│ ☑ Production  ☑ Preview  ☑ Development             │
│ [Save]                                              │
│                                                      │
│ Key: VITE_SUPABASE_ANON_KEY                         │
│ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     │
│ ☑ Production  ☑ Preview  ☑ Development             │
│ [Save]                                              │
│                                                      │
│ Key: VITE_SUPABASE_SERVICE_KEY                      │
│ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     │
│ ☑ Production  ☑ Preview  ☑ Development             │
│ [Save]                                              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 🆘 Se Ainda Não Funcionar

1. Verifique se os nomes estão **exatamente** como acima
2. Verifique se marcou os 3 ambientes
3. Aguarde 1-2 minutos após redeploy
4. Limpe cache do navegador (Ctrl+Shift+R)
5. Verifique os logs: Vercel → Deployments → [Seu Deploy] → Logs

---

**Correção aplicada**: Padronizado nome da variável de `VITE_SUPABASE_SERVICE_ROLE_KEY` para `VITE_SUPABASE_SERVICE_KEY` em `.env.example`
