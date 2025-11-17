# 🧪 Guia de Teste: Criação de Usuário pela Interface

## ✅ Testes Automatizados Aprovados

Os testes automatizados confirmam que a função `createUser` está funcionando corretamente:
- ✅ Cria usuário no Auth
- ✅ Cria registro na tabela users
- ✅ Permite login imediatamente
- ✅ Faz rollback automático se houver erro

## 📝 Como Testar Manualmente pela Interface

### 1. Iniciar o servidor
```bash
npm run dev
```

### 2. Fazer login como admin
- URL: http://localhost:5173/login
- Email: **admin@teste.com**
- Senha: **teste123**

### 3. Navegar para Gestão de Usuários
- Clicar no menu "Usuários" ou ir para `/users`

### 4. Criar Novo Usuário
- Clicar no botão "Novo Usuário"
- Preencher o formulário:
  - **Nome Completo**: Teste Manual Interface
  - **Email**: teste.manual@teste.com
  - **Senha**: teste12
  - **Confirmar Senha**: teste12
  - **Cargo**: Testador Manual
  - **Role**: membro
  - **Ativo**: sim

### 5. Observar os Logs no Console do Navegador

Abra o DevTools (F12) e vá para a aba Console. Você deve ver:

```
🔵 INÍCIO createUser - Email: teste.manual@teste.com
🔵 Dados recebidos: {
  "email": "teste.manual@teste.com",
  "password": "teste12",
  "full_name": "Teste Manual Interface",
  "role": "membro",
  "position": "Testador Manual",
  ...
}
🔵 PASSO 1: Criando usuário no Auth...
✅ PASSO 1 OK - Usuário criado no Auth: [UUID]
🔵 PASSO 2: Inserindo na tabela users...
✅ PASSO 2 OK - Registro criado na tabela users: [UUID]
✅ SUCESSO TOTAL - Usuário completo: teste.manual@teste.com
```

### 6. Verificar que o Usuário Foi Criado

**Opção A: Pela Interface**
- Voltar para lista de usuários
- Procurar por "Teste Manual Interface"
- Deve aparecer na lista com role "membro"

**Opção B: Fazer Login com o Novo Usuário**
- Fazer logout
- Fazer login com:
  - Email: teste.manual@teste.com
  - Senha: teste12
- Deve funcionar!

## ⚠️ Se NÃO Funcionar

Se o usuário NÃO for criado na tabela users (mas for criado no Auth), verifique:

### 1. Logs de Erro no Console
Procure por mensagens com ❌ no console do navegador.

### 2. Permissões RLS (Row Level Security)
Pode ser que as políticas RLS estejam bloqueando a inserção. Execute:

```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Se necessário, desabilitar temporariamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### 3. Service Key Configurada
Verifique se o `.env` tem a `VITE_SUPABASE_SERVICE_KEY` configurada:

```env
VITE_SUPABASE_SERVICE_KEY=eyJhbGci...
```

### 4. Reiniciar o Servidor
Às vezes mudanças no `.env` exigem reiniciar:
```bash
# Parar (Ctrl+C)
npm run dev
```

## 🔍 Verificação no Banco de Dados

```sql
-- Ver usuário no Auth
SELECT id, email, created_at
FROM auth.users
WHERE email = 'teste.manual@teste.com';

-- Ver usuário na tabela users
SELECT id, email, full_name, role, is_active
FROM users
WHERE email = 'teste.manual@teste.com';

-- Os IDs devem ser IGUAIS!
```

## 📊 Status Atual

✅ **Função createUser**: Testada e funcionando
✅ **Testes Automatizados**: 2/2 passando (100%)
⏳ **Teste Manual Interface**: Aguardando execução

## 🎯 Próximos Passos

1. Executar teste manual pela interface
2. Se funcionar: ✅ TUDO OK!
3. Se não funcionar: Enviar screenshots dos logs de erro

## 📝 Notas Importantes

- A função já tem **rollback automático**: se falhar criar na tabela users, deleta do Auth
- Os logs detalhados facilitam o debug
- A senha precisa ter no mínimo 6 caracteres
- O email precisa ser válido e único
