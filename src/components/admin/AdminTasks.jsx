
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { CheckSquare, AlertTriangle, Clock, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export default function AdminTasks({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    user: "all",
    problem: "all"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Buscar usuários diretamente do Supabase
    const { data: usersData } = await supabase
      .from('users')
      .select('*');

    const [tasksData, projectsData] = await Promise.all([
      base44.entities.Task.list("-created_date"),
      base44.entities.Project.list()
    ]);

    setTasks(tasksData);
    setUsers(usersData || []);
    setProjects(projectsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
        <p className="text-gray-600">Carregando tarefas...</p>
      </div>
    );
  }

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const searchMatch =
        task.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase());

      const statusMatch = filters.status === "all" || task.status === filters.status;
      const userMatch = filters.user === "all" || task.assigned_to === filters.user;

      let problemMatch = true;
      if (filters.problem === "overdue") {
        problemMatch = task.due_date && task.status !== 'concluido' && new Date(task.due_date) < new Date();
      } else if (filters.problem === "no_estimate") {
        problemMatch = !task.estimated_hours;
      }

      return searchMatch && statusMatch && userMatch && problemMatch;
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700">Filtros</h3>
          <span className="ml-auto text-sm text-gray-500">{filteredTasks.length} tarefas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar tarefas..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="pl-10 bg-gray-100 shadow-neumorphic-inset border-none"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700"
          >
            <option value="all">Todos os Status</option>
            <option value="nao_iniciado">Não Iniciado</option>
            <option value="em_progresso">Em Progresso</option>
            <option value="concluido">Concluído</option>
          </select>

          <select
            value={filters.user}
            onChange={(e) => setFilters({...filters, user: e.target.value})}
            className="px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700"
          >
            <option value="all">Todos os Usuários</option>
            {users.filter(u => u.is_active).map(user => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
            ))}
          </select>

          <select
            value={filters.problem}
            onChange={(e) => setFilters({...filters, problem: e.target.value})}
            className="px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700"
          >
            <option value="all">Todos os Tipos</option>
            <option value="overdue">Atrasadas</option>
            <option value="no_estimate">Sem Estimativa</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map(task => {
          const assignedUser = users.find(u => u.id === task.assigned_to);
          const project = projects.find(p => p.id === task.project_id);
          const isOverdue = task.due_date && task.status !== 'concluido' && new Date(task.due_date) < new Date();
          const timeVariance = task.estimated_hours && task.actual_hours
            ? Math.round(((task.actual_hours - task.estimated_hours) / task.estimated_hours) * 100)
            : null;

          return (
            <div key={task.id} className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                    {isOverdue && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Atrasada
                      </span>
                    )}
                    {task.dependencies && task.dependencies.length > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                        {task.dependencies.length} dep.
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    {assignedUser && (
                      <span>👤 {assignedUser.full_name}</span>
                    )}
                    {project && (
                      <span>📁 {project.name}</span>
                    )}
                    {task.due_date && (
                      <span>📅 {format(new Date(task.due_date), 'dd/MM/yyyy')}</span>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  task.status === 'concluido' ? 'bg-green-100 text-green-700' :
                  task.status === 'em_progresso' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {task.status === 'concluido' ? 'Concluída' :
                   task.status === 'em_progresso' ? 'Em Progresso' :
                   'Não Iniciada'}
                </span>
              </div>

              {(task.estimated_hours || task.actual_hours) && (
                <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex gap-4 text-sm flex-1">
                    {task.estimated_hours && (
                      <span className="text-gray-700">
                        Estimado: <span className="font-semibold">{task.estimated_hours}h</span>
                      </span>
                    )}
                    {task.actual_hours && (
                      <span className="text-gray-700">
                        Real: <span className="font-semibold">{task.actual_hours}h</span>
                      </span>
                    )}
                  </div>
                  {timeVariance !== null && (
                    <span className={`text-sm font-bold ${timeVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {timeVariance > 0 ? '+' : ''}{timeVariance}%
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma tarefa encontrada</h3>
          <p className="text-gray-600">Ajuste os filtros para ver mais resultados</p>
        </div>
      )}
    </div>
  );
}
