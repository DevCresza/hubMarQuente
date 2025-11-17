import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FolderKanban,
  Calendar,
  ArrowRight,
  Award,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Buscar usuários diretamente do Supabase
      const { data: usersData } = await supabase
        .from('users')
        .select('*');

      const [tasksData, projectsData] = await Promise.all([
        base44.entities.Task.list("-updated_date"),
        base44.entities.Project.list("-updated_date")
      ]);

      setTasks(tasksData || []);
      setProjects(projectsData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const myTasks = tasks.filter(t => t.assigned_to === currentUser?.id);
    const myProjects = projects.filter(p =>
      p.owner === currentUser?.id || p.team_members?.includes(currentUser?.id)
    );
    const completedTasks = myTasks.filter(t => t.status === 'done');
    const urgentTasks = myTasks.filter(t => (t.priority === 'critical' || t.priority === 'high') && t.status !== 'done');
    const overdueTasks = myTasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      return new Date(t.due_date) < new Date();
    });

    return {
      myTasks: myTasks.length,
      myTasksInProgress: myTasks.filter(t => t.status === 'in_progress').length,
      myProjects: myProjects.length,
      activeProjects: projects.filter(p => p.status === 'in_progress' || p.status === 'active').length,
      completedTasks: completedTasks.length,
      taskCompletionRate: myTasks.length ? Math.round((completedTasks.length / myTasks.length) * 100) : 0,
      urgentTasks: urgentTasks.length,
      overdueTasks: overdueTasks.length
    };
  };

  const stats = getStats();

  const getRecentTasks = () => {
    return tasks
      .filter(t => t.assigned_to === currentUser?.id && t.status !== 'done')
      .slice(0, 5);
  };

  const getActiveProjects = () => {
    return projects
      .filter(p => (p.status === 'in_progress' || p.status === 'active') && (p.owner === currentUser?.id || p.team_members?.includes(currentUser?.id)))
      .slice(0, 4);
  };

  const getUrgentTasks = () => {
    return tasks
      .filter(t =>
        (t.priority === 'critical' || t.priority === 'high') &&
        t.status !== 'done' &&
        t.assigned_to === currentUser?.id
      )
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">
            Olá, {currentUser?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-600">
            Aqui está o resumo das suas tarefas e projetos
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-neumorphic-soft">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{stats.myTasks}</p>
                <p className="text-xs text-gray-500">Minhas Tarefas</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{stats.myTasksInProgress} em progresso</span>
              <Link to={createPageUrl("Tasks")}>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Ver todas <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shadow-neumorphic-soft">
                <FolderKanban className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{stats.myProjects}</p>
                <p className="text-xs text-gray-500">Meus Projetos</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{stats.activeProjects} ativos</span>
              <Link to={createPageUrl("Projects")}>
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                  Ver todos <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shadow-neumorphic-soft">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{stats.urgentTasks}</p>
                <p className="text-xs text-gray-500">Tarefas Urgentes</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{stats.overdueTasks} atrasadas</span>
              {stats.urgentTasks > 0 && (
                <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700">
                  Atenção!
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shadow-neumorphic-soft">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{stats.taskCompletionRate}%</p>
                <p className="text-xs text-gray-500">Taxa de Conclusão</p>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full shadow-neumorphic-inset">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                style={{ width: `${stats.taskCompletionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Minhas Tarefas */}
          <div className="lg:col-span-2 bg-gray-100 rounded-3xl shadow-neumorphic p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Minhas Tarefas</h2>
              <Link to={createPageUrl("Tasks")}>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Ver todas
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {getRecentTasks().length > 0 ? (
                getRecentTasks().map(task => {
                  const assignedUser = users.find(u => u.id === task.assigned_to);
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                  const project = projects.find(p => p.id === task.project_id);
                  
                  return (
                    <div 
                      key={task.id}
                      className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset hover:shadow-neumorphic-pressed transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800 truncate">{task.title}</h3>
                            {task.priority === 'critical' && (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 flex-shrink-0">
                                Crítico
                              </span>
                            )}
                            {isOverdue && (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700 flex-shrink-0">
                                Atrasada
                              </span>
                            )}
                          </div>
                          {project && (
                            <p className="text-xs text-gray-500 mb-2">Projeto: {project.name}</p>
                          )}
                          {task.description && (
                            <p className="text-sm text-gray-600 line-clamp-1 mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.due_date).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {task.status === 'in_progress' ? (
                            <Clock className="w-5 h-5 text-blue-500" />
                          ) : task.status === 'done' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">Nenhuma tarefa pendente!</p>
                  <p className="text-sm text-gray-400">Você está em dia com suas atividades</p>
                </div>
              )}
            </div>
          </div>

          {/* Tarefas Urgentes */}
          <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-800">Prioridades</h2>
            </div>

            <div className="space-y-3">
              {getUrgentTasks().length > 0 ? (
                getUrgentTasks().map(task => (
                  <div 
                    key={task.id}
                    className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset border-l-4 border-orange-500"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{task.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                        task.priority === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {task.priority === 'critical' ? 'Crítico' : 'Alta'}
                      </span>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p className="text-gray-500 text-sm">Nenhuma tarefa urgente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projetos Ativos */}
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">Meus Projetos Ativos</h2>
            </div>
            <Link to={createPageUrl("Projects")}>
              <Button variant="ghost" size="sm" className="text-blue-600">
                Ver todos
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getActiveProjects().length > 0 ? (
              getActiveProjects().map(project => {
                const owner = users.find(u => u.id === project.owner);
                const projectTasks = tasks.filter(t => t.project === project.id);
                const completedTasks = projectTasks.filter(t => t.status === 'done');
                const progress = projectTasks.length 
                  ? Math.round((completedTasks.length / projectTasks.length) * 100)
                  : 0;

                return (
                  <Link key={project.id} to={createPageUrl("Projects")}>
                    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-5 hover:shadow-neumorphic-pressed transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: project.color || '#3b82f6' }}
                        ></div>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                          {projectTasks.length} tarefas
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{project.name}</h3>
                      
                      {owner && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center shadow-neumorphic-soft">
                            <span className="text-white text-xs font-semibold">
                              {owner.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">{owner.full_name}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Progresso</span>
                          <span className="font-semibold text-gray-700">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full shadow-neumorphic-inset">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: project.color || '#3b82f6'
                            }}
                          ></div>
                        </div>
                      </div>

                      {project.due_date && (
                        <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          Entrega: {new Date(project.due_date).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-4 text-center py-8">
                <FolderKanban className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">Você não tem projetos ativos no momento</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}