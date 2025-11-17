# 🧪 INSTRUÇÕES PARA TESTAR O CADASTRO DE USUÁRIOS

## 🔧 Melhorias Implementadas

1. **Logs Detalhados**: Todo o fluxo de criação agora tem logs no console
2. **Mensagens de Erro Visíveis**: Erros aparecem em vermelho no formulário
3. **Formulário Não Fecha em Erro**: Se houver erro, o formulário permanece aberto
4. **Validação Aprimorada**: Todos os campos são validados antes do envio

## 📋 PASSO A PASSO PARA TESTAR

### 1. Iniciar o Servidor
```bash
npm run dev
```

### 2. Abrir o Console do Navegador
- Pressione **F12** ou **Ctrl+Shift+I**
- Vá para a aba **Console**
- **IMPORTANTE**: Mantenha o console aberto durante todo o teste

### 3. Fazer Login
- URL: http://localhost:5173/login
- Email: **admin@teste.com**
- Senha: **teste123**

### 4. Ir para Gestão de Usuários
- Clicar em "Usuários" no menu
- Ou acessar: http://localhost:5173/users

### 5. Criar Novo Usuário
- Clicar no botão **"Novo Usuário"**
- Preencher o formulário:

```
Nome Completo: Teste Debug
Email: teste.debug@teste.com
Senha: teste12
Confirmar Senha: teste12
Cargo: Testador
Role: membro
Status: Ativo
```

### 6. Observar os Logs no Console

Você DEVE ver esta sequência de logs:

```
📝 UserForm - handleSubmit chamado
✅ Validação passou, iniciando salvamento...
🔵 Users.jsx - handleSaveUser chamado com: {email: "teste.debug@teste.com", ...}
🆕 Criando novo usuário...
🔵 INÍCIO createUser - Email: teste.debug@teste.com
🔵 Dados recebidos: {...}
🔵 PASSO 1: Criando usuário no Auth...
✅ PASSO 1 OK - Usuário criado no Auth: [UUID]
🔵 PASSO 2: Inserindo na tabela users...
✅ PASSO 2 OK - Registro criado na tabela users: [UUID]
✅ SUCESSO TOTAL - Usuário completo: teste.debug@teste.com
✅ Usuário criado com sucesso: {...}
🔄 Recarregando lista de usuários...
✅ Processo concluído com sucesso
✅ onSave concluído com sucesso
```

## ✅ RESULTADO ESPERADO

### Se tudo estiver funcionando:
1. O formulário fecha
2. O novo usuário aparece na lista
3. Você pode fazer login com o novo usuário

### Se houver erro:
1. O formulário **NÃO** fecha
2. Aparece uma mensagem de erro **VERMELHA** no topo do formulário
3. Os logs mostram onde falhou (❌)

## 🔍 CENÁRIOS DE ERRO COMUNS

### Erro 1: "Service key não configurada"
**Solução**: Verificar se o `.env` tem `VITE_SUPABASE_SERVICE_KEY`

### Erro 2: "Email já existe"
**Solução**: Usar um email diferente ou deletar o usuário existente

### Erro 3: Formulário fecha mas usuário não aparece
**O que fazer**:
1. Copiar TODOS os logs do console
2. Verificar se há alguma mensagem de erro em vermelho
3. Verificar no Supabase se o usuário foi criado no Auth mas não na tabela users

## 📸 O QUE ENVIAR SE NÃO FUNCIONAR

1. **Screenshot do erro no formulário** (se houver)
2. **TODOS os logs do console** (copiar e colar)
3. **Descrição**: O que aconteceu? O formulário fechou? Usuário apareceu?

## 🎯 TESTE RÁPIDO - LINHA DE COMANDO

Se preferir testar via linha de comando:

```bash
yarn vitest run tests/test-user-creation-ui.test.js
```

Este teste valida que a função `createUser` está funcionando corretamente.

**Resultado esperado**: ✅ 2/2 testes passando

---

## 🚀 Próximos Passos Após Teste

Depois de testar, me informe:
- ✅ **Funcionou**: "Funcionou! Usuário foi criado com sucesso"
- ❌ **Não funcionou**: Envie os logs e screenshots do erro
