
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { Plus, CheckCircle, Clock, AlertCircle, Filter, Calendar as CalendarIcon, LayoutList, LayoutGrid, Circle, CheckCircle2, User, Eye } from "lucide-react"; // Added new icons
import { Button } from "@/components/ui/button";
import TaskCard from "../components/tasks/TaskCard";
import TaskForm from "../components/tasks/TaskForm";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskStats from "../components/tasks/TaskStats";
import TaskDetails from "../components/tasks/TaskDetails";
import TaskCompletionCelebration from "../components/tasks/TaskCompletionCelebration";
import { format } from "date-fns"; // Added date-fns format

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [collections, setCollections] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    assigned_to: "all",
    view: "minhas"
  });
  const [viewMode, setViewMode] = useState("kanban"); // "list", "grouped", "kanban" - Default is now kanban
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTask, setCelebrationTask] = useState(null);

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário atual:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);

    // Buscar usuários diretamente do Supabase
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('full_name');

    const [tasksData, departmentsData, collectionsData] = await Promise.all([
      base44.entities.Task.list("-created_date"),
      base44.entities.Department.list("name"),
      base44.entities.Collection.list("name")
    ]);

    setTasks(tasksData);
    setUsers(usersData || []);
    setDepartments(departmentsData);
    setCollections(collectionsData);
    setLoading(false);
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await base44.entities.Task.update(editingTask.id, taskData);
    } else {
      await base44.entities.Task.create(taskData);
    }
    setShowForm(false);
    setEditingTask(null);
    loadData();
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      await base44.entities.Task.delete(taskId);
      loadData();
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error("Tarefa não encontrada:", taskId);
        return;
      }

      console.log("Alterando status de", task.status, "para", newStatus);

      const updatedTask = {
        ...task,
        status: newStatus
      };

      if (newStatus === "concluido") {
        updatedTask.completed_date = new Date().toISOString().split('T')[0];
      } else if (newStatus !== "concluido" && task.completed_date) {
        updatedTask.completed_date = null;
      }
      
      await base44.entities.Task.update(taskId, updatedTask);
      console.log("Tarefa atualizada com sucesso");
      
      await loadData();
      
      if (selectedTask && selectedTask.id === taskId) {
        const updatedTasks = await base44.entities.Task.list("-created_date");
        const updated = updatedTasks.find(t => t.id === taskId);
        if (updated) {
          setSelectedTask(updated);
        }
      }

      // Mostrar celebração se foi concluída
      if (newStatus === "concluido") {
        setCelebrationTask(task);
        setShowCelebration(true);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status da tarefa: " + (error.message || "Tente novamente."));
    }
  };

  // Calcular estatísticas para gamificação
  const getCompletionStats = () => {
    const myTasks = tasks.filter(t => t.assigned_to === currentUser?.id);
    const completedTasks = myTasks.filter(t => t.status === 'concluido');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedToday = completedTasks.filter(t => {
      if (!t.completed_date) return false;
      const taskDate = new Date(t.completed_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    }).length;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    
    const completedThisWeek = completedTasks.filter(t => {
      if (!t.completed_date) return false;
      const taskDate = new Date(t.completed_date);
      return taskDate >= weekAgo;
    }).length;

    // Calcular streak (sequência de dias)
    let streak = 0;
    const sortedCompleted = completedTasks
      .filter(t => t.completed_date)
      .sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date)); // Sort descending
    
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    // Check for streak up to a reasonable number of past days (e.g., 365)
    for (let i = 0; i < 365; i++) { // Check up to a year back for a streak
      const hasTaskOnDay = sortedCompleted.some(t => {
        const taskDate = new Date(t.completed_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === checkDate.getTime();
      });
      
      if (hasTaskOnDay) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1); // Move to the previous day
      } else {
        // If there's no task on checkDate, and it's not today (i > 0 means we've passed today),
        // then the streak is broken. If it's today (i=0) and no task, streak is 0.
        // We only break if we've successfully added at least one day to the streak before this gap.
        if (streak > 0 || i > 0) { // If streak started or we've moved past today without a task
          break;
        } else { // i=0 and no task today, means streak is 0, just move checkDate
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }

    return {
      completedToday,
      completedThisWeek,
      totalCompleted: completedTasks.length,
      streak
    };
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (filters.view === "minhas" && task.assigned_to !== currentUser?.id) return false;
      // Removido filtro "atribuidas" por created_by pois a coluna não existe na tabela tasks

      const searchMatch =
        task.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase());

      const statusMatch = filters.status === "all" || task.status === filters.status;
      const priorityMatch = filters.priority === "all" || task.priority === filters.priority;
      const assignedMatch = filters.assigned_to === "all" || task.assigned_to === filters.assigned_to;

      return searchMatch && statusMatch && priorityMatch && assignedMatch;
    });
  };

  const filteredTasks = getFilteredTasks();

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(t => t.status === status);
  };

  const statusGroups = [
    { id: "nao_iniciado", label: "Não Iniciadas", color: "gray", bgColor: "bg-gray-100" },
    { id: "em_progresso", label: "Em Progresso", color: "blue", bgColor: "bg-blue-50" },
    { id: "concluido", label: "Concluídas", color: "green", bgColor: "bg-green-50" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  if (selectedTask) {
    return (
      <TaskDetails
        task={selectedTask}
        users={users}
        departments={departments}
        collections={collections}
        currentUser={currentUser}
        allTasks={tasks}
        onBack={() => setSelectedTask(null)}
        onEdit={() => handleEditTask(selectedTask)}
        onDelete={() => {
          handleDeleteTask(selectedTask.id);
          setSelectedTask(null);
        }}
        onStatusChange={handleStatusChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Simples e Clean */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">Gestão de Tarefas</h1>
            <p className="text-gray-600">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'tarefa' : 'tarefas'}
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* View Mode Toggle */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl shadow-neumorphic-inset">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Lista"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grouped")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grouped"
                    ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Agrupado"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "kanban"
                    ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Kanban"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Filtros - Versão Compacta */}
        <TaskFilters 
          filters={filters}
          setFilters={setFilters}
          users={users}
          currentUser={currentUser}
          taskCount={filteredTasks.length}
        />

        {/* View: Lista Simples */}
        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                user={users.find(u => u.id === task.assigned_to)}
                currentUser={currentUser}
                onView={() => handleViewTask(task)}
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
              />
            ))}
          </div>
        )}

        {/* View: Agrupado por Status */}
        {viewMode === "grouped" && (
          <div className="space-y-6">
            {statusGroups.map(group => {
              const groupTasks = getTasksByStatus(group.id);
              
              return (
                <div key={group.id} className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{group.label}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${group.bgColor} text-${group.color}-700`}>
                      {groupTasks.length}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        user={users.find(u => u.id === task.assigned_to)}
                        currentUser={currentUser}
                        onView={() => handleViewTask(task)}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                        onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                      />
                    ))}
                  </div>
                  
                  {groupTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma tarefa {group.label.toLowerCase()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* View: Kanban - Layout Horizontal Simplificado */}
        {viewMode === "kanban" && (
          <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
            <div className="space-y-8">
              {statusGroups.map(group => {
                const groupTasks = getTasksByStatus(group.id);
                
                return (
                  <div key={group.id}>
                    {/* Header da Coluna */}
                    <div 
                      className="flex items-center gap-3 mb-4"
                      onDoubleClick={() => {
                        if (group.id === 'nao_iniciado') {
                          setShowForm(true);
                        }
                      }}
                      style={{ cursor: group.id === 'nao_iniciado' ? 'pointer' : 'default' }}
                      title={group.id === 'nao_iniciado' ? 'Duplo clique para criar nova tarefa' : ''}
                    >
                      <div className={`w-3 h-3 rounded-full bg-${group.color}-500`}></div>
                      <h3 className="font-semibold text-gray-800 text-lg">{group.label}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${group.bgColor} text-${group.color}-700`}>
                        {groupTasks.length}
                      </span>
                      {group.id === 'nao_iniciado' && (
                        <span className="text-xs text-gray-500 ml-2">
                          (duplo clique para criar tarefa)
                        </span>
                      )}
                    </div>
                    
                    {/* Tasks em Lista Horizontal */}
                    <div className="space-y-3">
                      {groupTasks.map(task => {
                        const assignedUser = users.find(u => u.id === task.assigned_to);
                        const isOverdue = task.due_date && task.status !== 'concluido' && new Date(task.due_date) < new Date();
                        
                        return (
                          <div 
                            key={task.id}
                            className="bg-gray-100 rounded-xl shadow-neumorphic-inset p-4 hover:shadow-neumorphic transition-all duration-200 cursor-pointer"
                            onClick={() => handleViewTask(task)}
                          >
                            <div className="flex items-center gap-4">
                              {/* Status Icon */}
                              <div className={`w-10 h-10 rounded-xl ${group.bgColor} flex items-center justify-center flex-shrink-0`}>
                                {group.id === 'nao_iniciado' && <Circle className={`w-5 h-5 text-${group.color}-600`} />}
                                {group.id === 'em_progresso' && <Clock className={`w-5 h-5 text-${group.color}-600`} />}
                                {group.id === 'concluido' && <CheckCircle2 className={`w-5 h-5 text-${group.color}-600`} />}
                              </div>

                              {/* Task Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-800 truncate mb-1">{task.title}</h4>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  {assignedUser && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      <span className="truncate">{assignedUser.full_name}</span>
                                    </div>
                                  )}
                                  {task.due_date && (
                                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                                      <CalendarIcon className="w-3 h-3" />
                                      <span>{format(new Date(task.due_date), "dd/MM")}</span>
                                    </div>
                                  )}
                                  {task.priority === 'urgente' && (
                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                                      Urgente
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quick Actions */}
                              <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                {group.id === 'nao_iniciado' && (
                                  <Button
                                    size="sm"
                                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(task.id, 'em_progresso');
                                    }}
                                  >
                                    <Clock className="w-4 h-4 mr-1" />
                                    Iniciar
                                  </Button>
                                )}
                                
                                {group.id === 'em_progresso' && (
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white shadow-neumorphic-soft"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(task.id, 'concluido');
                                    }}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Concluir
                                  </Button>
                                )}
                                
                                {group.id === 'concluido' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="shadow-neumorphic-soft bg-gray-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(task.id, 'em_progresso');
                                    }}
                                  >
                                    <Clock className="w-4 h-4 mr-1" />
                                    Reabrir
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="shadow-neumorphic-soft bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewTask(task);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {groupTasks.length === 0 && (
                        <div 
                          className="text-center py-8 text-gray-400 text-sm bg-gray-100 rounded-xl shadow-neumorphic-inset"
                          onDoubleClick={() => {
                            if (group.id === 'nao_iniciado') {
                              setShowForm(true);
                            }
                          }}
                          style={{ cursor: group.id === 'nao_iniciado' ? 'pointer' : 'default' }}
                        >
                          Nenhuma tarefa {group.label.toLowerCase()}
                          {group.id === 'nao_iniciado' && (
                            <div className="mt-2 text-xs text-gray-500">
                              Duplo clique para criar uma nova tarefa
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 shadow-neumorphic-inset flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status !== 'all' || filters.priority !== 'all'
                ? "Tente ajustar os filtros de busca"
                : "Comece criando sua primeira tarefa"
              }
            </p>
            {(!filters.search && filters.status === 'all' && filters.priority === 'all') && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Tarefa
              </Button>
            )}
          </div>
        )}

        {showForm && (
          <TaskForm
            task={editingTask}
            users={users}
            departments={departments}
            collections={collections}
            currentUser={currentUser}
            allTasks={tasks}
            onSave={handleSaveTask}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        )}

        {/* Celebration Modal */}
        {showCelebration && celebrationTask && (
          <TaskCompletionCelebration
            task={celebrationTask}
            stats={getCompletionStats()}
            onClose={() => {
              setShowCelebration(false);
              setCelebrationTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
