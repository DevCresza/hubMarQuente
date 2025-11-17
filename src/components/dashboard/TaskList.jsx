import React from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import TaskItem from "./TaskItem";
import { ArrowLeft, User, Calendar } from "lucide-react";

export default function TaskList({ category, categoryKey, tasks, onBack, onTaskUpdate }) {
  const [users, setUsers] = React.useState([]);
  const [localTasks, setLocalTasks] = React.useState(tasks);
  const [filter, setFilter] = React.useState({ responsible: 'all', status: 'all' });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Buscar usuários diretamente do Supabase
      const { data: usersData } = await supabase
        .from('users')
        .select('*');

      setUsers(usersData || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = (taskId, newStatus) => {
    onTaskUpdate(taskId, newStatus);
  };
  
  const handleAssignmentUpdate = async (taskId, userId) => {
    const task = localTasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      await base44.entities.Task.update(taskId, { 
        ...task,
        assigned_to: userId 
      });
      const updatedTasks = localTasks.map(t => t.id === taskId ? {...t, assigned_to: userId} : t);
      setLocalTasks(updatedTasks);
    } catch (error) {
      console.error("Erro ao atualizar responsável:", error);
    }
  };
  
  const handleDateUpdate = async (taskId, newDate) => {
    const task = localTasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      await base44.entities.Task.update(taskId, { 
        ...task,
        due_date: newDate 
      });
      const updatedTasks = localTasks.map(t => t.id === taskId ? {...t, due_date: newDate} : t);
      setLocalTasks(updatedTasks);
    } catch (error) {
      console.error("Erro ao atualizar data:", error);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      nao_iniciado: 0,
      em_progresso: 0,
      concluido: 0
    };
    localTasks.forEach(task => {
      counts[task.status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const progress = localTasks.length ? Math.round((statusCounts.concluido / localTasks.length) * 100) : 0;

  const filteredTasks = localTasks.filter(task => {
    const responsibleMatch = filter.responsible === 'all' || task.assigned_to === filter.responsible;
    const statusMatch = filter.status === 'all' || task.status === filter.status;
    return responsibleMatch && statusMatch;
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="p-3 rounded-2xl shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-4xl">{category.icon}</div>
          <div>
            <h2 className="text-3xl font-semibold text-gray-800">{category.name}</h2>
            <p className="text-gray-600">{localTasks.length} tarefas • {progress}% concluído</p>
          </div>
        </div>

        {/* Filters */}
        {!loading && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filter.responsible}
                onChange={(e) => setFilter({...filter, responsible: e.target.value})}
                className="w-full pl-10 px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none appearance-none font-medium"
                style={{ backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '0.65em auto, 100%', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m2 6 6 6 6-6\'/%3e%3c/svg%3e")' }}
              >
                <option value="all">Todos os responsáveis</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
                <option value="">Não atribuído</option>
              </select>
            </div>
            <div className="relative">
               <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
                className="w-full pl-10 px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none appearance-none font-medium"
                style={{ backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '0.65em auto, 100%', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m2 6 6 6 6-6\'/%3e%3c/svg%3e")' }}
              >
                <option value="all">Todos os status</option>
                <option value="nao_iniciado">Não Iniciado</option>
                <option value="em_progresso">Em Progresso</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full h-4 bg-gray-100 rounded-full shadow-neumorphic-inset">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="text-center p-4 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
            <div className="text-2xl font-semibold text-gray-700">{statusCounts.nao_iniciado}</div>
            <div className="text-sm text-gray-500">Não Iniciadas</div>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
            <div className="text-2xl font-semibold text-blue-600">{statusCounts.em_progresso}</div>
            <div className="text-sm text-gray-500">Em Progresso</div>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
            <div className="text-2xl font-semibold text-green-600">{statusCounts.concluido}</div>
            <div className="text-sm text-gray-500">Concluídas</div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, index) => (
            <TaskItem 
              key={task.id}
              task={task}
              index={index}
              users={users}
              onStatusUpdate={handleTaskUpdate}
              onAssignmentUpdate={handleAssignmentUpdate}
              onDateUpdate={handleDateUpdate}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {filter.responsible !== 'all' || filter.status !== 'all' 
                ? 'Nenhuma tarefa encontrada para os filtros selecionados.' 
                : 'Nenhuma tarefa nesta categoria ainda.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}