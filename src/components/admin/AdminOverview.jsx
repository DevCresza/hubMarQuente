
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import {
  Users,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap
} from "lucide-react";

export default function AdminOverview({ currentUser }) {
  const [data, setData] = useState({
    users: [],
    projects: [],
    tasks: [],
    departments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Buscar usuários diretamente do Supabase
    const { data: usersData } = await supabase
      .from('users')
      .select('*');

    const [projects, tasks, departments] = await Promise.all([
      base44.entities.Project.list(),
      base44.entities.Task.list(),
      base44.entities.Department.list()
    ]);

    setData({
      users: usersData || [],
      projects,
      tasks,
      departments
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
        <p className="text-gray-600">Carregando análises...</p>
      </div>
    );
  }

  // Cálculos de métricas
  const activeUsers = data.users.filter(u => u.is_active).length;
  const activeProjects = data.projects.filter(p => p.status === 'ativo').length;
  const completedTasks = data.tasks.filter(t => t.status === 'concluido').length;
  const totalTasks = data.tasks.length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tarefas com problemas - REMOVIDO blocked
  const overdueTasks = data.tasks.filter(t => {
    if (!t.due_date || t.status === 'concluido') return false;
    return new Date(t.due_date) < new Date();
  }).length;

  // Projetos parados
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const stalledProjects = data.projects.filter(p => {
    if (p.status !== 'ativo') return false;
    const projectTasks = data.tasks.filter(t => t.project_id === p.id);
    if (projectTasks.length === 0) return false;

    const recentActivity = projectTasks.some(t => {
      const taskDate = t.updated_date ? new Date(t.updated_date) : new Date(t.created_date);
      return taskDate > sevenDaysAgo;
    });

    return !recentActivity;
  }).length;

  // Análise de tempo
  const tasksWithEstimates = data.tasks.filter(t => t.estimated_hours && t.actual_hours);
  const totalEstimated = tasksWithEstimates.reduce((sum, t) => sum + t.estimated_hours, 0);
  const totalActual = tasksWithEstimates.reduce((sum, t) => sum + t.actual_hours, 0);
  const timeVariance = totalEstimated ? Math.round(((totalActual - totalEstimated) / totalEstimated) * 100) : 0;

  // Análise detalhada de projetos - REMOVIDO blocked da análise de problemas
  const projectsWithIssues = data.projects.filter(p => {
    const projectTasks = data.tasks.filter(t => t.project_id === p.id);
    const hasOverdue = projectTasks.some(t =>
      t.due_date && t.status !== 'concluido' && new Date(t.due_date) < new Date()
    );

    const recentActivity = projectTasks.some(t => {
      const taskDate = t.updated_date ? new Date(t.updated_date) : new Date(t.created_date);
      return taskDate > sevenDaysAgo;
    });
    const isStalled = !recentActivity && projectTasks.length > 0 && p.status === 'ativo';

    return hasOverdue || isStalled;
  });

  const projectAnalysis = data.projects
    .filter(p => p.status === 'ativo')
    .map(project => {
      const projectTasks = data.tasks.filter(t => t.project_id === project.id);
      const completed = projectTasks.filter(t => t.status === 'concluido').length;
      const overdue = projectTasks.filter(t =>
        t.due_date && t.status !== 'concluido' && new Date(t.due_date) < new Date()
      ).length;

      const recentActivity = projectTasks.some(t => {
        const taskDate = t.updated_date ? new Date(t.updated_date) : new Date(t.created_date);
        return taskDate > sevenDaysAgo;
      });
      const isStalled = !recentActivity && projectTasks.length > 0;

      const completionRate = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0;
      const owner = data.users.find(u => u.id === project.owner_id);

      return {
        ...project,
        owner: owner?.full_name || 'Sem proprietário',
        totalTasks: projectTasks.length,
        completed,
        completionRate,
        overdue,
        isStalled,
        hasIssues: overdue > 0 || isStalled
      };
    })
    .sort((a, b) => {
      // Priorizar projetos com problemas
      if (a.hasIssues && !b.hasIssues) return -1;
      if (!a.hasIssues && b.hasIssues) return 1;
      return b.totalTasks - a.totalTasks;
    });

  const stats = [
    {
      icon: Users,
      title: "Usuários Ativos",
      value: activeUsers,
      subtitle: `${data.users.length} total`,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: FolderKanban,
      title: "Projetos Ativos",
      value: activeProjects,
      subtitle: `${data.projects.length} total`,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      alert: stalledProjects > 0 ? `${stalledProjects} parados` : null
    },
    {
      icon: CheckSquare,
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      subtitle: `${completedTasks}/${totalTasks} tarefas`,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: AlertTriangle,
      title: "Tarefas Atrasadas",
      value: overdueTasks,
      subtitle: overdueTasks > 0 ? "Requerem atenção" : "Tudo em dia!",
      color: "text-red-500",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center shadow-neumorphic-soft mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-sm font-semibold text-gray-700 mb-1">{stat.title}</div>
            <div className="text-xs text-gray-500">{stat.subtitle}</div>
            {stat.alert && (
              <div className="mt-2 text-xs text-red-600 font-semibold">{stat.alert}</div>
            )}
          </div>
        ))}
      </div>

      {/* Análise de Tempo */}
      {tasksWithEstimates.length > 0 && (
        <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Análise de Tempo: Estimado vs Real</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-100 rounded-xl shadow-neumorphic-inset">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalEstimated}h</div>
              <div className="text-sm text-gray-600">Tempo Estimado</div>
            </div>

            <div className="text-center p-6 bg-gray-100 rounded-xl shadow-neumorphic-inset">
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalActual}h</div>
              <div className="text-sm text-gray-600">Tempo Real</div>
            </div>

            <div className="text-center p-6 bg-gray-100 rounded-xl shadow-neumorphic-inset">
              <div className={`text-3xl font-bold mb-2 flex items-center justify-center gap-2 ${
                timeVariance > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {timeVariance > 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {timeVariance > 0 ? '+' : ''}{timeVariance}%
              </div>
              <div className="text-sm text-gray-600">Variação</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              {timeVariance > 0
                ? `⚠️ A equipe está levando ${Math.abs(timeVariance)}% a mais de tempo que o estimado. Considere revisar as estimativas ou identificar gargalos.`
                : timeVariance < 0
                  ? `✓ A equipe está ${Math.abs(timeVariance)}% mais rápida que o estimado. Excelente performance!`
                  : '✓ As estimativas estão alinhadas com o tempo real de execução.'}
            </p>
          </div>
        </div>
      )}

      {/* Status dos Projetos Ativos */}
      <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
        <div className="flex items-center gap-3 mb-6">
          <FolderKanban className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Status dos Projetos Ativos</h2>
        </div>

        {projectAnalysis.length > 0 ? (
          <div className="space-y-4">
            {projectAnalysis.slice(0, 10).map((project, index) => (
              <div key={project.id} className="p-5 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color || '#3b82f6' }}
                      ></div>
                      <h3 className="font-semibold text-gray-800">{project.name}</h3>
                      {project.hasIssues && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Responsável: {project.owner}</p>

                    {/* Problemas do projeto - REMOVIDO blocked */}
                    {project.hasIssues && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.isStalled && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                            Parado +7 dias
                          </span>
                        )}
                        {project.overdue > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                            {project.overdue} atrasada(s)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-800">{project.completionRate}%</div>
                    <div className="text-xs text-gray-500">{project.completed}/{project.totalTasks}</div>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="w-full h-2 bg-gray-100 rounded-full shadow-neumorphic-inset">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${project.completionRate}%`,
                      backgroundColor: project.hasIssues ? '#ef4444' : (project.color || '#3b82f6')
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderKanban className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Nenhum projeto ativo no momento</p>
          </div>
        )}
      </div>

      {/* Resumo de Problemas - REMOVIDO blocked */}
      {projectsWithIssues.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-neumorphic p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-800">Atenção Necessária</h2>
          </div>
          <p className="text-red-700 mb-4">
            <span className="font-bold">{projectsWithIssues.length}</span> {projectsWithIssues.length === 1 ? 'projeto requer' : 'projetos requerem'} atenção imediata.
            Verifique tarefas atrasadas ou projetos sem atividade recente.
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-red-800">{overdueTasks} tarefas atrasadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              <span className="text-red-800">{stalledProjects} projetos parados</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
