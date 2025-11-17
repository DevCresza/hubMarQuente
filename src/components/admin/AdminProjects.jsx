
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { FolderKanban, AlertTriangle, Clock, CheckCircle, Users, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminProjects({ currentUser }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Buscar usuários diretamente do Supabase
    const { data: usersData } = await supabase
      .from('users')
      .select('*');

    const [projectsData, tasksData] = await Promise.all([
      base44.entities.Project.list("-created_date"),
      base44.entities.Task.list()
    ]);

    setProjects(projectsData);
    setTasks(tasksData);
    setUsers(usersData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
        <p className="text-gray-600">Carregando projetos...</p>
      </div>
    );
  }

  const getProjectAnalysis = (project) => {
    const projectTasks = tasks.filter(t => t.project_id === project.id);
    const completed = projectTasks.filter(t => t.status === 'concluido').length;
    const inProgress = projectTasks.filter(t => t.status === 'em_progresso').length;
    const notStarted = projectTasks.filter(t => t.status === 'nao_iniciado').length;
    
    const overdue = projectTasks.filter(t => {
      if (!t.due_date || t.status === 'concluido') return false;
      return new Date(t.due_date) < new Date();
    }).length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = projectTasks.some(t => {
      const taskDate = t.updated_date ? new Date(t.updated_date) : new Date(t.created_date);
      return taskDate > sevenDaysAgo;
    });
    const isStalled = !recentActivity && projectTasks.length > 0 && project.status === 'ativo';

    const completionRate = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0;

    // Análise de tempo
    const tasksWithTime = projectTasks.filter(t => t.estimated_hours && t.actual_hours);
    const totalEstimated = tasksWithTime.reduce((sum, t) => sum + t.estimated_hours, 0);
    const totalActual = tasksWithTime.reduce((sum, t) => sum + t.actual_hours, 0);
    const timeVariance = totalEstimated ? Math.round(((totalActual - totalEstimated) / totalEstimated) * 100) : 0;

    return {
      total: projectTasks.length,
      completed,
      inProgress,
      notStarted,
      overdue,
      isStalled,
      completionRate,
      totalEstimated,
      totalActual,
      timeVariance,
      hasProblems: overdue > 0 || isStalled
    };
  };

  const projectsWithAnalysis = projects.map(p => ({
    ...p,
    analysis: getProjectAnalysis(p)
  })).sort((a, b) => {
    // Priorizar projetos com problemas
    if (a.analysis.hasProblems && !b.analysis.hasProblems) return -1;
    if (!a.analysis.hasProblems && b.analysis.hasProblems) return 1;
    return b.analysis.completionRate - a.analysis.completionRate;
  });

  if (selectedProject) {
    const analysis = selectedProject.analysis;
    const owner = users.find(u => u.id === selectedProject.owner_id);
    const projectTasks = tasks.filter(t => t.project_id === selectedProject.id);

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedProject(null)}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
        >
          ← Voltar para todos os projetos
        </button>

        <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedProject.name}</h2>
              {selectedProject.description && (
                <p className="text-gray-600">{selectedProject.description}</p>
              )}
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              selectedProject.status === 'ativo' ? 'bg-green-100 text-green-700' :
              selectedProject.status === 'em_espera' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {selectedProject.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.completionRate}%</div>
              <div className="text-sm text-gray-600">Conclusão</div>
            </div>
            <div className="p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset text-center">
              <div className="text-2xl font-bold text-green-600">{analysis.completed}</div>
              <div className="text-sm text-gray-600">Concluídas</div>
            </div>
            <div className="p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset text-center">
              <div className="text-2xl font-bold text-orange-600">{analysis.inProgress}</div>
              <div className="text-sm text-gray-600">Em Progresso</div>
            </div>
            <div className="p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset text-center">
              <div className="text-2xl font-bold text-red-600">{analysis.overdue}</div>
              <div className="text-sm text-gray-600">Atrasadas</div>
            </div>
          </div>

          {analysis.totalEstimated > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Tempo Estimado vs Real</span>
                <span className={`text-lg font-bold ${analysis.timeVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {analysis.timeVariance > 0 ? '+' : ''}{analysis.timeVariance}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Estimado: </span>
                  <span className="font-bold">{analysis.totalEstimated}h</span>
                </div>
                <div>
                  <span className="text-gray-600">Real: </span>
                  <span className="font-bold">{analysis.totalActual}h</span>
                </div>
              </div>
            </div>
          )}

          {analysis.hasProblems && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-800">Alertas do Projeto</span>
              </div>
              <ul className="space-y-1 text-sm text-red-700">
                {analysis.isStalled && <li>• Projeto parado há mais de 7 dias sem atividade</li>}
                {analysis.overdue > 0 && <li>• {analysis.overdue} tarefa(s) atrasada(s)</li>}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800">Tarefas do Projeto</h3>
            {projectTasks.map(task => {
              const assignedUser = users.find(u => u.id === task.assigned_to);
              const isOverdue = task.due_date && task.status !== 'concluido' && new Date(task.due_date) < new Date();

              return (
                <div key={task.id} className="p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{task.title}</h4>
                        {isOverdue && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                            Atrasada
                          </span>
                        )}
                      </div>
                      {assignedUser && (
                        <p className="text-sm text-gray-600">
                          Responsável: {assignedUser.full_name}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      task.status === 'concluido' ? 'bg-green-100 text-green-700' :
                      task.status === 'em_progresso' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {task.status === 'concluido' ? 'Concluída' :
                       task.status === 'em_progresso' ? 'Em Progresso' :
                       'Não Iniciada'}
                    </span>
                  </div>
                  
                  <div className="flex gap-4 text-xs text-gray-500">
                    {task.due_date && (
                      <span>Prazo: {format(new Date(task.due_date), 'dd/MM/yyyy')}</span>
                    )}
                    {task.estimated_hours && (
                      <span>Est: {task.estimated_hours}h</span>
                    )}
                    {task.actual_hours && (
                      <span>Real: {task.actual_hours}h</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projectsWithAnalysis.map(project => {
          const owner = users.find(u => u.id === project.owner_id);
          
          return (
            <div 
              key={project.id} 
              className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 hover:shadow-neumorphic-pressed transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-neumorphic-soft"
                    style={{ backgroundColor: project.color || '#3b82f6' }}
                  >
                    <FolderKanban className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{project.name}</h3>
                    {owner && (
                      <p className="text-sm text-gray-600">Owner: {owner.full_name}</p>
                    )}
                  </div>
                </div>
              </div>

              {project.analysis.hasProblems && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-800">Requer Atenção</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.analysis.isStalled && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                        Parado +7 dias
                      </span>
                    )}
                    {project.analysis.overdue > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                        {project.analysis.overdue} atrasada(s)
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                  <div className="text-lg font-bold text-gray-800">{project.analysis.completionRate}%</div>
                  <div className="text-xs text-gray-500">Conclusão</div>
                </div>
                <div className="text-center p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                  <div className="text-lg font-bold text-gray-800">{project.analysis.completed}/{project.analysis.total}</div>
                  <div className="text-xs text-gray-500">Concluídas</div>
                </div>
                <div className="text-center p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                  <div className="text-lg font-bold text-gray-800">{project.analysis.inProgress}</div>
                  <div className="text-xs text-gray-500">Em Andamento</div>
                </div>
              </div>

              {project.analysis.totalEstimated > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Tempo: {project.analysis.totalEstimated}h est. / {project.analysis.totalActual}h real</span>
                    <span className={`font-bold ${project.analysis.timeVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {project.analysis.timeVariance > 0 ? '+' : ''}{project.analysis.timeVariance}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
