
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  LayoutList, 
  LayoutGrid, 
  BarChart3,
  Calendar,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Mail,
  UserPlus,
  Pencil,
  Check,
  X,
  Trash2
} from "lucide-react";
import TaskQuickAdd from "./TaskQuickAdd";
import TaskItem from "./TaskItem";
import ProjectBoardView from "./ProjectBoardView";
import ProjectTimelineView from "./ProjectTimelineView";
import ProjectAnalytics from "./ProjectAnalytics";
import TaskDetailsModal from "./TaskDetailsModal";
import TaskForm from "../tasks/TaskForm";

export default function ProjectDetails({ project, users, departments, currentUser, onBack, onEdit }) {
  const [tasks, setTasks] = useState([]);
  // Seções padrão em memória (não persistidas no banco de dados)
  const [sections] = useState([
    { id: "section-1", name: "A Fazer", order: 0, collapsed: false },
    { id: "section-2", name: "Em Andamento", order: 1, collapsed: false },
    { id: "section-3", name: "Concluído", order: 2, collapsed: false }
  ]);
  const [viewMode, setViewMode] = useState(project.default_view || "list");
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [project.id]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await base44.entities.Task.list();
      const projectTasks = allTasks.filter(t => t.project === project.id);
      setTasks(projectTasks);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData, sectionId) => {
    try {
      // Campos permitidos na tabela tasks
      const allowedFields = [
        'title', 'description', 'status', 'priority', 'assigned_to',
        'department', 'project', 'due_date', 'completed_date',
        'tags', 'estimated_hours', 'actual_hours'
      ];

      // Garantir que project está definido
      const dataWithProject = {
        ...taskData,
        project: project.id
      };

      // Filtrar apenas campos permitidos
      const cleanTaskData = {};
      Object.keys(dataWithProject).forEach(key => {
        if (allowedFields.includes(key) && dataWithProject[key] !== undefined && dataWithProject[key] !== "") {
          cleanTaskData[key] = dataWithProject[key];
        }
      });

      // Remover estimated_hours se não for um número válido
      if (cleanTaskData.estimated_hours !== undefined && isNaN(cleanTaskData.estimated_hours)) {
        delete cleanTaskData.estimated_hours;
      }

      await base44.entities.Task.create(cleanTaskData);
      await loadTasks();
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      alert("Erro ao criar tarefa: " + (error.message || "Tente novamente"));
    }
  };

  const handleUpdateTask = async (taskId, initialUpdates) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updates = { ...initialUpdates };

      // Manage completed_date based on status
      if (updates.status === 'done' && !updates.completed_date) {
        updates.completed_date = new Date().toISOString().split('T')[0];
      } else if (updates.status && updates.status !== 'done' && task.status === 'done') {
        updates.completed_date = null;
      }

      // Filtrar apenas campos que existem na tabela tasks
      const allowedFields = [
        'title', 'description', 'status', 'priority', 'assigned_to',
        'department', 'project', 'due_date', 'completed_date',
        'tags', 'estimated_hours', 'actual_hours'
      ];

      const cleanUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key) && updates[key] !== undefined) {
          cleanUpdates[key] = updates[key];
        }
      });

      await base44.entities.Task.update(taskId, cleanUpdates);

      await loadTasks();
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await base44.entities.Task.update(editingTask.id, taskData);
      } else {
        await base44.entities.Task.create({
          ...taskData,
          project: project.id
        });
      }
      
      setShowTaskForm(false);
      setEditingTask(null);
      await loadTasks();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    
    try {
      await base44.entities.Task.delete(taskId);
      await loadTasks();
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    }
  };

  // Seções agora são fixas e não podem ser adicionadas/editadas/removidas
  // pois não há suporte no banco de dados para persistir esta informação

  const handleAddSection = () => {
    alert("As seções são fixas nesta versão. Use: A Fazer, Em Andamento, Concluído");
  };

  const handleRenameSection = () => {
    alert("As seções não podem ser renomeadas nesta versão.");
    setEditingSectionId(null);
    setEditingSectionName("");
  };

  const handleDeleteSection = () => {
    alert("As seções padrão não podem ser removidas.");
  };

  const toggleSection = (sectionId) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const getTasksBySection = (sectionId) => {
    // Seções são apenas visuais, agrupamos por status
    const statusMap = {
      "section-1": ["todo"],
      "section-2": ["in_progress"],
      "section-3": ["done"]
    };
    const statuses = statusMap[sectionId] || [];
    return tasks.filter(t => statuses.includes(t.status));
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
  };

  const handleEditTaskFromModal = (task) => {
    setSelectedTask(null);
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTaskFromModal = async (task) => {
    setSelectedTask(null);
    await handleDeleteTask(task.id);
  };

  const owner = users.find(u => u.id === project.owner_id);
  const teamMembers = users.filter(u => project.team_members?.includes(u.id));
  const department = departments.find(d => d.id === project.department_id);

  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.id === project.owner_id;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <Button 
                onClick={onBack}
                variant="ghost"
                size="icon"
                className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-neumorphic-soft"
                style={{ backgroundColor: project.color || '#3b82f6' }}
              >
                <LayoutList className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-800">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Modes */}
              <div className="flex bg-gray-100 rounded-xl shadow-neumorphic-inset p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list" 
                      ? "shadow-neumorphic-pressed bg-gray-100 text-blue-600" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  title="Lista"
                >
                  <LayoutList className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("board")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "board" 
                      ? "shadow-neumorphic-pressed bg-gray-100 text-blue-600" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  title="Quadro"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "timeline" 
                      ? "shadow-neumorphic-pressed bg-gray-100 text-blue-600" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  title="Timeline"
                >
                  <Calendar className="w-5 h-5" />
                </button>
                {isManagerOrAdmin && (
                  <button
                    onClick={() => setViewMode("analytics")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "analytics" 
                        ? "shadow-neumorphic-pressed bg-gray-100 text-blue-600" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    title="Análises"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {onEdit && (
                <Button 
                  onClick={onEdit}
                  variant="outline"
                  className="shadow-neumorphic hover:shadow-neumorphic-pressed bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              )}
            </div>
          </div>

          {/* Project Info */}
          <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
            {department && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{department.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">{owner?.full_name}</span>
              {teamMembers.length > 0 && (
                <span className="text-gray-500">+ {teamMembers.length} {teamMembers.length === 1 ? 'membro' : 'membros'}</span>
              )}
            </div>
            
            {project.external_guests && project.external_guests.length > 0 && (
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span className="text-gray-500">{project.external_guests.length} convidado{project.external_guests.length > 1 ? 's' : ''} externo{project.external_guests.length > 1 ? 's' : ''}</span>
              </div>
            )}
            
            {project.start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.start_date).toLocaleDateString('pt-BR')}</span>
                {project.due_date && (
                  <span className="text-gray-500">→ {new Date(project.due_date).toLocaleDateString('pt-BR')}</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="font-medium">{tasks.length}</span>
              <span className="text-gray-500">{tasks.length === 1 ? 'tarefa' : 'tarefas'}</span>
            </div>

            {project.email_notifications && (
              <div className="flex items-center gap-2 text-blue-600">
                <Mail className="w-4 h-4" />
                <span className="text-xs">Notificações ativas</span>
              </div>
            )}
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === "analytics" && isManagerOrAdmin ? (
          <ProjectAnalytics 
            project={project}
            tasks={tasks}
            users={users}
          />
        ) : viewMode === "list" ? (
          <div className="space-y-6">
            {sections.map((section) => {
              const sectionTasks = getTasksBySection(section.id);
              const isCollapsed = collapsedSections.has(section.id);

              return (
                <div key={section.id} className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 flex-1">
                      <button 
                        onClick={() => toggleSection(section.id)}
                        className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      {editingSectionId === section.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingSectionName}
                            onChange={(e) => setEditingSectionName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleRenameSection(section.id, editingSectionName);
                              }
                            }}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRenameSection(section.id, editingSectionName)}
                            className="h-8 w-8"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingSectionId(null);
                              setEditingSectionName("");
                            }}
                            className="h-8 w-8"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold text-gray-800">{section.name}</h3>
                          <span className="text-sm text-gray-500">({sectionTasks.length})</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingSectionId(section.id);
                              setEditingSectionName(section.name);
                            }}
                            className="h-7 w-7 ml-2"
                          >
                            <Pencil className="w-3 h-3 text-gray-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteSection(section.id)}
                            className="h-7 w-7"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tasks */}
                  {!isCollapsed && (
                    <div className="space-y-2">
                      {/* TaskQuickAdd no TOPO com project_id */}
                      <TaskQuickAdd 
                        sectionId={section.id}
                        projectId={project.id}
                        users={users}
                        allTasks={tasks}
                        currentUser={currentUser}
                        onAdd={(taskData) => handleAddTask(taskData, section.id)}
                      />

                      {/* Lista de tarefas */}
                      {sectionTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          users={users}
                          allTasks={tasks}
                          sections={sections}
                          onUpdate={(updates) => handleUpdateTask(task.id, updates)}
                          onDelete={() => handleDeleteTask(task.id)}
                          onView={handleViewTask}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Section Button */}
            <Button
              onClick={handleAddSection}
              variant="outline"
              className="w-full shadow-neumorphic hover:shadow-neumorphic-pressed bg-gray-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Seção
            </Button>
          </div>
        ) : viewMode === "board" ? (
          <ProjectBoardView
            sections={sections}
            tasks={tasks}
            users={users}
            allTasks={tasks}
            currentUser={currentUser}
            projectId={project.id}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onViewTask={handleViewTask}
          />
        ) : (
          <ProjectTimelineView
            project={project}
            tasks={tasks}
            users={users}
          />
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          users={users}
          allTasks={tasks}
          onClose={() => setSelectedTask(null)}
          onEdit={() => handleEditTaskFromModal(selectedTask)}
          onDelete={() => handleDeleteTaskFromModal(selectedTask)}
        />
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          users={users}
          departments={departments}
          collections={[]}
          currentUser={currentUser}
          allTasks={tasks}
          onSave={handleSaveTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
