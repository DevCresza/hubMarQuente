/**
 * TESTES AUTOMATIZADOS DE API - MAR QUENTE HUB
 *
 * Este arquivo contém testes automatizados para todos os endpoints da API
 * usando fetch nativo do Node.js
 *
 * Como executar: node tests/api-tests.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuração
const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzU2MzMsImV4cCI6MjA3ODU1MTYzM30.ZhbzonRvHk6T0CqThNwnxnuR8j9Mm4LnXucYggLHtUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cores para console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Estatísticas
let stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0
};

// Helper para logging
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, message = '') {
  stats.total++;
  if (passed) {
    stats.passed++;
    log(`✅ ${name}`, 'green');
  } else {
    stats.failed++;
    log(`❌ ${name}`, 'red');
    if (message) log(`   ${message}`, 'yellow');
  }
}

// Helper para autenticação
async function authenticate() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@teste.com',
    password: 'teste123'
  });

  if (error) {
    log('❌ ERRO NA AUTENTICAÇÃO: ' + error.message, 'red');
    return null;
  }

  log('✅ Autenticação bem-sucedida', 'green');
  return data.session;
}

// ====================================
// TESTES DE AUTENTICAÇÃO
// ====================================
async function testAuthentication() {
  log('\n📝 TESTES DE AUTENTICAÇÃO', 'blue');
  log('='.repeat(50), 'blue');

  // Teste 1: Login com credenciais corretas
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@teste.com',
    password: 'teste123'
  });
  logTest('Login com credenciais corretas', !loginError && loginData.session);

  // Teste 2: Login com credenciais incorretas
  const { error: wrongLoginError } = await supabase.auth.signInWithPassword({
    email: 'admin@teste.com',
    password: 'senhaerrada'
  });
  logTest('Login com senha incorreta deve falhar', wrongLoginError !== null);

  // Teste 3: Verificar sessão após login
  const { data: sessionData } = await supabase.auth.getSession();
  logTest('Sessão existe após login', sessionData.session !== null);

  // Teste 4: Logout
  await supabase.auth.signOut();
  const { data: afterLogout } = await supabase.auth.getSession();
  logTest('Logout limpa sessão', afterLogout.session === null);

  // Reautenticar para próximos testes
  await authenticate();
}

// ====================================
// TESTES DE USERS
// ====================================
async function testUsers() {
  log('\n👥 TESTES DE USERS', 'blue');
  log('='.repeat(50), 'blue');

  // Teste 1: Listar todos os usuários
  const { data: allUsers, error: listError } = await supabase
    .from('users')
    .select('*');
  logTest('Listar todos os usuários', !listError && allUsers.length > 0);

  // Teste 2: Buscar usuário específico por email
  const { data: specificUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@teste.com')
    .single();
  logTest('Buscar usuário por email', !findError && specificUser !== null);

  // Teste 3: Contar usuários
  const { count, error: countError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  logTest('Contar total de usuários', !countError && count >= 1);

  // Teste 4: Filtrar por role
  const { data: admins, error: roleError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'admin');
  logTest('Filtrar usuários por role', !roleError);
}

// ====================================
// TESTES DE PROJECTS
// ====================================
async function testProjects() {
  log('\n📊 TESTES DE PROJECTS', 'blue');
  log('='.repeat(50), 'blue');

  let createdProjectId = null;

  // Teste 1: Listar todos os projetos
  const { data: allProjects, error: listError } = await supabase
    .from('projects')
    .select('*');
  logTest('Listar todos os projetos', !listError);

  // Teste 2: Criar novo projeto
  const { data: newProject, error: createError } = await supabase
    .from('projects')
    .insert({
      name: 'Projeto de Teste API',
      description: 'Criado automaticamente via testes',
      status: 'planning',
      owner_id: '75157fa7-5927-492a-b4af-3405e7c3a1dc'
    })
    .select()
    .single();

  if (!createError && newProject) {
    createdProjectId = newProject.id;
    logTest('Criar novo projeto', true);
  } else {
    logTest('Criar novo projeto', false, createError?.message);
  }

  // Teste 3: Buscar projeto criado
  if (createdProjectId) {
    const { data: foundProject, error: findError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', createdProjectId)
      .single();
    logTest('Buscar projeto por ID', !findError && foundProject !== null);
  }

  // Teste 4: Atualizar projeto
  if (createdProjectId) {
    const { error: updateError } = await supabase
      .from('projects')
      .update({ name: 'Projeto de Teste API - ATUALIZADO' })
      .eq('id', createdProjectId);
    logTest('Atualizar projeto', !updateError);
  }

  // Teste 5: Filtrar por status
  const { data: activeProjects, error: filterError } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active');
  logTest('Filtrar projetos por status', !filterError);

  // Teste 6: Filtrar por owner
  const { data: myProjects, error: ownerError } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', '75157fa7-5927-492a-b4af-3405e7c3a1dc');
  logTest('Filtrar projetos por owner', !ownerError && myProjects.length > 0);

  // Teste 7: Buscar com relacionamentos (JOIN)
  const { data: projectsWithOwner, error: joinError } = await supabase
    .from('projects')
    .select('*, users!projects_owner_id_fkey(full_name, email)')
    .limit(5);
  logTest('JOIN Projects com Users', !joinError);

  // Teste 8: Deletar projeto
  if (createdProjectId) {
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', createdProjectId);
    logTest('Deletar projeto', !deleteError);
  }
}

// ====================================
// TESTES DE TASKS
// ====================================
async function testTasks() {
  log('\n✅ TESTES DE TASKS', 'blue');
  log('='.repeat(50), 'blue');

  let createdTaskId = null;

  // Teste 1: Listar todas as tarefas
  const { data: allTasks, error: listError } = await supabase
    .from('tasks')
    .select('*');
  logTest('Listar todas as tarefas', !listError);

  // Buscar um projeto para vincular
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .limit(1)
    .single();

  // Teste 2: Criar nova tarefa
  if (projects) {
    const { data: newTask, error: createError } = await supabase
      .from('tasks')
      .insert({
        title: 'Tarefa de Teste API',
        description: 'Criada automaticamente via testes',
        status: 'pending',
        priority: 'medium',
        assigned_to: '75157fa7-5927-492a-b4af-3405e7c3a1dc',
        project: projects.id,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select()
      .single();

    if (!createError && newTask) {
      createdTaskId = newTask.id;
      logTest('Criar nova tarefa', true);
    } else {
      logTest('Criar nova tarefa', false, createError?.message);
    }
  }

  // Teste 3: Atualizar status da tarefa
  if (createdTaskId) {
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: 'in_progress' })
      .eq('id', createdTaskId);
    logTest('Atualizar status da tarefa', !updateError);
  }

  // Teste 4: Filtrar por status
  const { data: pendingTasks, error: filterError } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pending');
  logTest('Filtrar tarefas por status', !filterError);

  // Teste 5: Filtrar por prioridade
  const { data: highPriorityTasks, error: priorityError } = await supabase
    .from('tasks')
    .select('*')
    .eq('priority', 'high');
  logTest('Filtrar tarefas por prioridade', !priorityError);

  // Teste 6: Filtrar por responsável
  const { data: myTasks, error: assignedError } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', '75157fa7-5927-492a-b4af-3405e7c3a1dc');
  logTest('Filtrar tarefas por responsável', !assignedError && myTasks.length > 0);

  // Teste 7: Buscar tarefas atrasadas
  const today = new Date().toISOString().split('T')[0];
  const { data: overdueTasks, error: overdueError } = await supabase
    .from('tasks')
    .select('*')
    .lt('due_date', today)
    .neq('status', 'completed');
  logTest('Buscar tarefas atrasadas', !overdueError);

  // Teste 8: JOIN Tasks com Projects
  const { data: tasksWithProject, error: joinError } = await supabase
    .from('tasks')
    .select('*, projects!tasks_project_fkey(name)')
    .limit(5);
  logTest('JOIN Tasks com Projects', !joinError);

  // Teste 9: Deletar tarefa
  if (createdTaskId) {
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', createdTaskId);
    logTest('Deletar tarefa', !deleteError);
  }
}

// ====================================
// TESTES DE DEPARTMENTS
// ====================================
async function testDepartments() {
  log('\n🏢 TESTES DE DEPARTMENTS', 'blue');
  log('='.repeat(50), 'blue');

  let createdDeptId = null;

  // Teste 1: Listar todos os departamentos
  const { data: allDepts, error: listError } = await supabase
    .from('departments')
    .select('*');
  logTest('Listar todos os departamentos', !listError && allDepts.length > 0);

  // Teste 2: Criar novo departamento
  const { data: newDept, error: createError } = await supabase
    .from('departments')
    .insert({
      name: 'Departamento Teste API',
      description: 'Criado automaticamente',
      color: '#FF5733',
      icon: 'test'
    })
    .select()
    .single();

  if (!createError && newDept) {
    createdDeptId = newDept.id;
    logTest('Criar novo departamento', true);
  } else {
    logTest('Criar novo departamento', false, createError?.message);
  }

  // Teste 3: Atualizar departamento
  if (createdDeptId) {
    const { error: updateError } = await supabase
      .from('departments')
      .update({ description: 'Descrição atualizada via API' })
      .eq('id', createdDeptId);
    logTest('Atualizar departamento', !updateError);
  }

  // Teste 4: Contar projetos por departamento
  const { data: deptProjects, error: countError } = await supabase
    .from('departments')
    .select('id, name, projects(count)');
  logTest('Contar projetos por departamento', !countError);

  // Teste 5: Deletar departamento
  if (createdDeptId) {
    const { error: deleteError } = await supabase
      .from('departments')
      .delete()
      .eq('id', createdDeptId);
    logTest('Deletar departamento', !deleteError);
  }
}

// ====================================
// TESTES DE COLLECTIONS
// ====================================
async function testCollections() {
  log('\n👗 TESTES DE COLLECTIONS', 'blue');
  log('='.repeat(50), 'blue');

  let createdCollectionId = null;

  // Teste 1: Listar todas as coleções
  const { data: allCollections, error: listError } = await supabase
    .from('collections')
    .select('*');
  logTest('Listar todas as coleções', !listError);

  // Buscar um estilista
  const { data: stylists } = await supabase
    .from('stylists')
    .select('id')
    .limit(1)
    .single();

  // Teste 2: Criar nova coleção
  if (stylists) {
    const { data: newCollection, error: createError } = await supabase
      .from('collections')
      .insert({
        name: 'Coleção Teste API',
        description: 'Criada automaticamente',
        season: 'summer',
        year: 2025,
        status: 'planning',
        stylist: stylists.id,
        piece_count: 0
      })
      .select()
      .single();

    if (!createError && newCollection) {
      createdCollectionId = newCollection.id;
      logTest('Criar nova coleção', true);
    } else {
      logTest('Criar nova coleção', false, createError?.message);
    }
  }

  // Teste 3: Filtrar por temporada
  const { data: summerCollections, error: seasonError } = await supabase
    .from('collections')
    .select('*')
    .eq('season', 'summer');
  logTest('Filtrar coleções por temporada', !seasonError);

  // Teste 4: Filtrar por status
  const { data: activeCollections, error: statusError } = await supabase
    .from('collections')
    .select('*')
    .eq('status', 'active');
  logTest('Filtrar coleções por status', !statusError);

  // Teste 5: JOIN Collections com Stylists
  const { data: collectionsWithStylist, error: joinError } = await supabase
    .from('collections')
    .select('*, stylists!collections_stylist_fkey(name)');
  logTest('JOIN Collections com Stylists', !joinError);

  // Teste 6: Deletar coleção
  if (createdCollectionId) {
    const { error: deleteError } = await supabase
      .from('collections')
      .delete()
      .eq('id', createdCollectionId);
    logTest('Deletar coleção', !deleteError);
  }
}

// ====================================
// TESTES DE TICKETS
// ====================================
async function testTickets() {
  log('\n🎫 TESTES DE TICKETS', 'blue');
  log('='.repeat(50), 'blue');

  let createdTicketId = null;

  // Teste 1: Listar todos os tickets
  const { data: allTickets, error: listError } = await supabase
    .from('tickets')
    .select('*');
  logTest('Listar todos os tickets', !listError);

  // Teste 2: Criar novo ticket
  const { data: newTicket, error: createError } = await supabase
    .from('tickets')
    .insert({
      title: 'Ticket de Teste API',
      description: 'Criado automaticamente via testes',
      type: 'task',
      priority: 'medium',
      status: 'open',
      created_by: '75157fa7-5927-492a-b4af-3405e7c3a1dc'
    })
    .select()
    .single();

  if (!createError && newTicket) {
    createdTicketId = newTicket.id;
    logTest('Criar novo ticket', true);
  } else {
    logTest('Criar novo ticket', false, createError?.message);
  }

  // Teste 3: Atualizar status do ticket
  if (createdTicketId) {
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'in_progress' })
      .eq('id', createdTicketId);
    logTest('Atualizar status do ticket', !updateError);
  }

  // Teste 4: Filtrar por tipo
  const { data: bugTickets, error: typeError } = await supabase
    .from('tickets')
    .select('*')
    .eq('type', 'bug');
  logTest('Filtrar tickets por tipo', !typeError);

  // Teste 5: Filtrar por prioridade
  const { data: highPriorityTickets, error: priorityError } = await supabase
    .from('tickets')
    .select('*')
    .eq('priority', 'high');
  logTest('Filtrar tickets por prioridade', !priorityError);

  // Teste 6: Deletar ticket
  if (createdTicketId) {
    const { error: deleteError } = await supabase
      .from('tickets')
      .delete()
      .eq('id', createdTicketId);
    logTest('Deletar ticket', !deleteError);
  }
}

// ====================================
// TESTES DE CAMPANHAS
// ====================================
async function testCampaigns() {
  log('\n📢 TESTES DE CAMPAIGNS', 'blue');
  log('='.repeat(50), 'blue');

  // Teste 1: Listar todas as campanhas
  const { data: allCampaigns, error: listError } = await supabase
    .from('campaigns')
    .select('*');
  logTest('Listar todas as campanhas', !listError);

  // Teste 2: Filtrar por status
  const { data: activeCampaigns, error: statusError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active');
  logTest('Filtrar campanhas por status', !statusError);
}

// ====================================
// TESTES DE UGC
// ====================================
async function testUGC() {
  log('\n📸 TESTES DE UGC', 'blue');
  log('='.repeat(50), 'blue');

  // Teste 1: Listar todo UGC
  const { data: allUGC, error: listError } = await supabase
    .from('ugc')
    .select('*');
  logTest('Listar todo UGC', !listError);

  // Teste 2: Filtrar UGC aprovado
  const { data: approvedUGC, error: approvedError } = await supabase
    .from('ugc')
    .select('*')
    .eq('approved', true);
  logTest('Filtrar UGC aprovado', !approvedError);

  // Teste 3: Filtrar UGC featured
  const { data: featuredUGC, error: featuredError } = await supabase
    .from('ugc')
    .select('*')
    .eq('featured', true);
  logTest('Filtrar UGC featured', !featuredError);
}

// ====================================
// TESTES DE LAUNCH CALENDAR
// ====================================
async function testLaunchCalendar() {
  log('\n📅 TESTES DE LAUNCH CALENDAR', 'blue');
  log('='.repeat(50), 'blue');

  // Teste 1: Listar todos os eventos
  const { data: allEvents, error: listError } = await supabase
    .from('launch_calendar')
    .select('*');
  logTest('Listar todos os eventos', !listError);

  // Teste 2: Filtrar eventos futuros
  const today = new Date().toISOString().split('T')[0];
  const { data: futureEvents, error: futureError } = await supabase
    .from('launch_calendar')
    .select('*')
    .gte('start_date', today);
  logTest('Filtrar eventos futuros', !futureError);

  // Teste 3: Filtrar por tipo
  const { data: launchEvents, error: typeError } = await supabase
    .from('launch_calendar')
    .select('*')
    .eq('type', 'launch');
  logTest('Filtrar eventos por tipo', !typeError);
}

// ====================================
// TESTES DE SHARED LINKS
// ====================================
async function testShareLinks() {
  log('\n🔗 TESTES DE SHARE LINKS', 'blue');
  log('='.repeat(50), 'blue');

  // Teste 1: Listar todos os links
  const { data: allLinks, error: listError } = await supabase
    .from('share_links')
    .select('*');
  logTest('Listar todos os share links', !listError);

  // Teste 2: Filtrar links ativos (não expirados)
  const { data: activeLinks, error: activeError } = await supabase
    .from('share_links')
    .select('*')
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
  logTest('Filtrar links ativos', !activeError);
}

// ====================================
// FUNÇÃO PRINCIPAL
// ====================================
async function runAllTests() {
  log('\n' + '='.repeat(50), 'blue');
  log('🧪 INICIANDO TESTES AUTOMATIZADOS DE API', 'blue');
  log('='.repeat(50), 'blue');
  log(`Ambiente: ${SUPABASE_URL}`, 'yellow');
  log(`Data: ${new Date().toLocaleString('pt-BR')}`, 'yellow');

  // Autenticar primeiro
  const session = await authenticate();
  if (!session) {
    log('\n❌ Falha na autenticação. Abortando testes.', 'red');
    return;
  }

  // Executar todos os testes
  await testAuthentication();
  await testUsers();
  await testProjects();
  await testTasks();
  await testDepartments();
  await testCollections();
  await testTickets();
  await testCampaigns();
  await testUGC();
  await testLaunchCalendar();
  await testShareLinks();

  // Relatório final
  log('\n' + '='.repeat(50), 'blue');
  log('📊 RELATÓRIO FINAL', 'blue');
  log('='.repeat(50), 'blue');
  log(`Total de Testes: ${stats.total}`, 'yellow');
  log(`✅ Aprovados: ${stats.passed}`, 'green');
  log(`❌ Falhados: ${stats.failed}`, 'red');
  log(`Taxa de Sucesso: ${((stats.passed / stats.total) * 100).toFixed(2)}%`, 'yellow');

  if (stats.failed === 0) {
    log('\n🎉 TODOS OS TESTES PASSARAM! 🎉', 'green');
  } else {
    log(`\n⚠️  ${stats.failed} teste(s) falharam. Verifique os logs acima.`, 'yellow');
  }

  log('\n' + '='.repeat(50), 'blue');
}

// Executar testes
runAllTests().catch(error => {
  log(`\n💥 ERRO FATAL: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
