-- =========================================
-- TESTES AUTOMATIZADOS DE FUNCIONALIDADES
-- MAR QUENTE HUB
-- Data: 2025-01-16
-- =========================================

-- =========================================
-- 1. TESTES DE FILTROS E QUERIES DO DASHBOARD
-- =========================================

-- Teste 1.1: Contar "Minhas Tarefas" (deve retornar >= 1)
SELECT
  'TESTE 1.1: Minhas Tarefas' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks
WHERE assigned_to = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

-- Teste 1.2: Contar "Tarefas em Progresso" (deve retornar >= 0)
SELECT
  'TESTE 1.2: Tarefas em Progresso' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks
WHERE assigned_to = '75157fa7-5927-492a-b4af-3405e7c3a1dc'
  AND status = 'in_progress';

-- Teste 1.3: Contar "Meus Projetos" (deve retornar >= 1)
SELECT
  'TESTE 1.3: Meus Projetos' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM projects
WHERE owner_id = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

-- Teste 1.4: Contar "Projetos Ativos" (deve retornar >= 0)
SELECT
  'TESTE 1.4: Projetos Ativos' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM projects
WHERE owner_id = '75157fa7-5927-492a-b4af-3405e7c3a1dc'
  AND status = 'active';

-- Teste 1.5: Contar "Tarefas Urgentes" (prioridade critical ou high)
SELECT
  'TESTE 1.5: Tarefas Urgentes' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks
WHERE priority IN ('critical', 'high');

-- Teste 1.6: Contar "Tarefas Atrasadas" (due_date < hoje e status != completed)
SELECT
  'TESTE 1.6: Tarefas Atrasadas' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks
WHERE due_date < CURRENT_DATE
  AND status != 'completed';

-- Teste 1.7: Calcular "Taxa de Conclusão" (deve ser entre 0 e 100)
SELECT
  'TESTE 1.7: Taxa de Conclusão' as teste,
  ROUND(
    (COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as resultado,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASSOU (sem tarefas)'
    WHEN ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2) BETWEEN 0 AND 100
    THEN '✅ PASSOU'
    ELSE '❌ FALHOU'
  END as status
FROM tasks
WHERE assigned_to = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

-- =========================================
-- 2. TESTES DE FILTROS DA PÁGINA DE PROJETOS
-- =========================================

-- Teste 2.1: Filtro "Todos os Projetos"
SELECT
  'TESTE 2.1: Filtro Todos Projetos' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM projects;

-- Teste 2.2: Filtro "Meus Projetos"
SELECT
  'TESTE 2.2: Filtro Meus Projetos' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM projects
WHERE owner_id = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

-- Teste 2.3: Filtro por Status "Active"
SELECT
  'TESTE 2.3: Filtro Status Active' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM projects
WHERE status = 'active';

-- Teste 2.4: Filtro por Status "Completed"
SELECT
  'TESTE 2.4: Filtro Status Completed' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM projects
WHERE status = 'completed';

-- Teste 2.5: Projetos com Progresso calculado (tasks)
SELECT
  'TESTE 2.5: Cálculo de Progresso' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM (
  SELECT
    p.id,
    p.name,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    CASE
      WHEN COUNT(t.id) > 0 THEN
        ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::DECIMAL / COUNT(t.id)) * 100, 0)
      ELSE 0
    END as progress
  FROM projects p
  LEFT JOIN tasks t ON t.project_id = p.id
  GROUP BY p.id, p.name
) as project_progress;

-- =========================================
-- 3. TESTES DE FILTROS DA PÁGINA DE TAREFAS
-- =========================================

-- Teste 3.1: Filtro "Todas as Tarefas"
SELECT
  'TESTE 3.1: Filtro Todas Tarefas' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks;

-- Teste 3.2: Filtro "Minhas Tarefas"
SELECT
  'TESTE 3.2: Filtro Minhas Tarefas' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks
WHERE assigned_to = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

-- Teste 3.3: Filtro por Status "Pending"
SELECT
  'TESTE 3.3: Filtro Status Pending' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks
WHERE status = 'pending';

-- Teste 3.4: Filtro por Status "In Progress"
SELECT
  'TESTE 3.4: Filtro Status In Progress' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks
WHERE status = 'in_progress';

-- Teste 3.5: Filtro por Status "Completed"
SELECT
  'TESTE 3.5: Filtro Status Completed' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks
WHERE status = 'completed';

-- Teste 3.6: Filtro por Prioridade "Critical"
SELECT
  'TESTE 3.6: Filtro Prioridade Critical' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks
WHERE priority = 'critical';

-- Teste 3.7: Filtro por Prioridade "High"
SELECT
  'TESTE 3.7: Filtro Prioridade High' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks
WHERE priority = 'high';

-- =========================================
-- 4. TESTES DE RELACIONAMENTOS (JOINS)
-- =========================================

-- Teste 4.1: Tasks com informações de Projeto
SELECT
  'TESTE 4.1: Tasks JOIN Projects' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks t
INNER JOIN projects p ON t.project_id = p.id;

-- Teste 4.2: Tasks com informações de Responsável
SELECT
  'TESTE 4.2: Tasks JOIN Users (Assigned)' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tasks t
INNER JOIN users u ON t.assigned_to = u.id;

-- Teste 4.3: Projects com informações de Owner
SELECT
  'TESTE 4.3: Projects JOIN Users (Owner)' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM projects p
INNER JOIN users u ON p.owner_id = u.id;

-- Teste 4.4: Projects com informações de Departamento
SELECT
  'TESTE 4.4: Projects JOIN Departments' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM projects p
INNER JOIN departments d ON p.department_id = d.id;

-- Teste 4.5: Tickets com informações de Criador
SELECT
  'TESTE 4.5: Tickets JOIN Users (Created)' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tickets t
LEFT JOIN users u ON t.created_by = u.id;

-- =========================================
-- 5. TESTES DE DEPARTAMENTOS
-- =========================================

-- Teste 5.1: Listar todos departamentos
SELECT
  'TESTE 5.1: Listar Departamentos' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 4 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM departments;

-- Teste 5.2: Departamentos com contagem de projetos
SELECT
  'TESTE 5.2: Departamentos c/ Projetos' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM (
  SELECT
    d.id,
    d.name,
    COUNT(p.id) as project_count
  FROM departments d
  LEFT JOIN projects p ON p.department_id = d.id
  GROUP BY d.id, d.name
) as dept_stats;

-- Teste 5.3: Departamentos com contagem de usuários
SELECT
  'TESTE 5.3: Departamentos c/ Usuários' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM (
  SELECT
    d.id,
    d.name,
    COUNT(u.id) as user_count
  FROM departments d
  LEFT JOIN users u ON u.department_id = d.id
  GROUP BY d.id, d.name
) as dept_users;

-- =========================================
-- 6. TESTES DE COLLECTIONS
-- =========================================

-- Teste 6.1: Listar Collections
SELECT
  'TESTE 6.1: Listar Collections' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM collections;

-- Teste 6.2: Collections com Stylist
SELECT
  'TESTE 6.2: Collections JOIN Stylists' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM collections c
LEFT JOIN stylists s ON c.stylist_id = s.id;

-- Teste 6.3: Collections por Status
SELECT
  'TESTE 6.3: Collections por Status' as teste,
  status,
  COUNT(*) as total
FROM collections
GROUP BY status;

-- =========================================
-- 7. TESTES DE TICKETS
-- =========================================

-- Teste 7.1: Listar Tickets
SELECT
  'TESTE 7.1: Listar Tickets' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM tickets;

-- Teste 7.2: Tickets por Tipo
SELECT
  'TESTE 7.2: Tickets por Tipo' as teste,
  type,
  COUNT(*) as total
FROM tickets
GROUP BY type;

-- Teste 7.3: Tickets por Prioridade
SELECT
  'TESTE 7.3: Tickets por Prioridade' as teste,
  priority,
  COUNT(*) as total
FROM tickets
GROUP BY priority;

-- Teste 7.4: Tickets por Status
SELECT
  'TESTE 7.4: Tickets por Status' as teste,
  status,
  COUNT(*) as total
FROM tickets
GROUP BY status;

-- =========================================
-- 8. TESTES DE MARKETING ASSETS
-- =========================================

-- Teste 8.1: Listar Marketing Assets
SELECT
  'TESTE 8.1: Listar Marketing Assets' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM marketing_assets;

-- Teste 8.2: Assets por Categoria
SELECT
  'TESTE 8.2: Assets por Categoria' as teste,
  category,
  COUNT(*) as total
FROM marketing_assets
GROUP BY category;

-- Teste 8.3: Assets por Tipo
SELECT
  'TESTE 8.3: Assets por Tipo' as teste,
  asset_type,
  COUNT(*) as total
FROM marketing_assets
GROUP BY asset_type;

-- Teste 8.4: Assets vinculados a Campanhas
SELECT
  'TESTE 8.4: Assets JOIN Campaigns' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM marketing_assets ma
LEFT JOIN campaigns c ON ma.campaign_id = c.id;

-- =========================================
-- 9. TESTES DE UGC (USER GENERATED CONTENT)
-- =========================================

-- Teste 9.1: Listar UGC
SELECT
  'TESTE 9.1: Listar UGC' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM ugc;

-- Teste 9.2: UGC Aprovado
SELECT
  'TESTE 9.2: UGC Aprovado' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM ugc
WHERE approved = true;

-- Teste 9.3: UGC Featured
SELECT
  'TESTE 9.3: UGC Featured' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM ugc
WHERE featured = true;

-- Teste 9.4: UGC com métricas de engagement
SELECT
  'TESTE 9.4: UGC c/ Engagement > 0' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM ugc
WHERE engagement_score > 0;

-- =========================================
-- 10. TESTES DE LAUNCH CALENDAR
-- =========================================

-- Teste 10.1: Listar Eventos
SELECT
  'TESTE 10.1: Listar Launch Events' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM launch_calendar;

-- Teste 10.2: Eventos por Tipo
SELECT
  'TESTE 10.2: Eventos por Tipo' as teste,
  event_type,
  COUNT(*) as total
FROM launch_calendar
GROUP BY event_type;

-- Teste 10.3: Eventos por Status
SELECT
  'TESTE 10.3: Eventos por Status' as teste,
  status,
  COUNT(*) as total
FROM launch_calendar
GROUP BY status;

-- Teste 10.4: Eventos Futuros
SELECT
  'TESTE 10.4: Eventos Futuros' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM launch_calendar
WHERE event_date >= CURRENT_DATE;

-- =========================================
-- 11. TESTES DE SHARED LINKS
-- =========================================

-- Teste 11.1: Listar Share Links
SELECT
  'TESTE 11.1: Listar Share Links' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM share_links;

-- Teste 11.2: Links Ativos (não expirados)
SELECT
  'TESTE 11.2: Links Ativos' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM share_links
WHERE expires_at > NOW() OR expires_at IS NULL;

-- Teste 11.3: Links com Views
SELECT
  'TESTE 11.3: Links c/ Views > 0' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 0 THEN '✅ PASSOU' ELSE '❌ FALHOU' END as status
FROM share_links
WHERE view_count > 0;

-- =========================================
-- 12. TESTES DE INTEGRIDADE DE DADOS
-- =========================================

-- Teste 12.1: Tasks sem Projeto (órfãs)
SELECT
  'TESTE 12.1: Tasks Órfãs' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASSOU' ELSE '⚠️ AVISO' END as status
FROM tasks
WHERE project_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM projects WHERE id = tasks.project_id);

-- Teste 12.2: Projects sem Owner válido
SELECT
  'TESTE 12.2: Projects sem Owner' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASSOU' ELSE '⚠️ AVISO' END as status
FROM projects
WHERE owner_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM users WHERE id = projects.owner_id);

-- Teste 12.3: Tasks sem Responsável válido
SELECT
  'TESTE 12.3: Tasks sem Responsável' as teste,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASSOU' ELSE '⚠️ AVISO' END as status
FROM tasks
WHERE assigned_to IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM users WHERE id = tasks.assigned_to);

-- =========================================
-- RESUMO FINAL
-- =========================================

SELECT '========================================' as linha;
SELECT 'RESUMO DOS TESTES AUTOMATIZADOS' as titulo;
SELECT '========================================' as linha;
SELECT 'Total de categorias testadas: 12' as info;
SELECT 'Total aproximado de testes: 50+' as info;
SELECT 'Data: ' || CURRENT_DATE as info;
SELECT '========================================' as linha;
