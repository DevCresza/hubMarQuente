
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { Plus, Search, LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectForm from "../components/projects/ProjectForm";
import ProjectDetails from "../components/projects/ProjectDetails";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    view: "meus",
    department: "all",
    issues: "all" // novo filtro para problemas
  });
  const [viewMode, setViewMode] = useState("grid");
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Buscar usuários diretamente do Supabase
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('full_name');

      const [currentUserData, projectsData, departmentsData, tasksData] = await Promise.all([
        base44.auth.me(),
        base44.entities.Project.list("-created_date"),
        base44.entities.Department.list("name"),
        base44.entities.Task.list()
      ]);

      setCurrentUser(currentUserData);
      setProjects(projectsData || []);
      setUsers(usersData || []);
      setDepartments(departmentsData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await base44.entities.Project.update(editingProject.id, projectData);
      } else {
        await base44.entities.Project.create({
          ...projectData,
          owner_id: currentUser?.id,
          sections: [
            { id: "section-1", name: "A fazer", order: 1, collapsed: false },
            { id: "section-2", name: "Em andamento", order: 2, collapsed: false },
            { id: "section-3", name: "Concluído", order: 3, collapsed: false }
          ]
        });
      }
      setShowForm(false);
      setEditingProject(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
  };

  const getFilteredProjects = () => {
    return projects.filter(project => {
      const searchMatch =
        project.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description?.toLowerCase().includes(filters.search.toLowerCase());

      const statusMatch = filters.status === "all" || project.status === filters.status;

      const departmentMatch = filters.department === "all" || project.department_id === filters.department;

      const viewMatch =
        filters.view === "todos" ||
        (filters.view === "meus" && project.owner_id === currentUser?.id) ||
        (filters.view === "participando" && project.team_members?.includes(currentUser?.id));

      // Novo filtro de problemas
      let issuesMatch = true;
      if (filters.issues !== "all") {
        const projectTasks = tasks.filter(t => t.project_id === project.id);

        if (filters.issues === "atrasadas") {
          const hasOverdue = projectTasks.some(t =>
            t.due_date && t.status !== 'concluido' && new Date(t.due_date) < new Date()
          );
          issuesMatch = hasOverdue;
        } else if (filters.issues === "bloqueadas") {
          const hasBlocked = projectTasks.some(t => {
            if (!t.dependencies || t.dependencies.length === 0) return false;
            // Check if any of the dependencies are not yet completed
            return t.dependencies.some(depId => {
              const dependentTask = projectTasks.find(dt => dt.id === depId);
              return dependentTask && dependentTask.status !== 'concluido';
            });
          });
          issuesMatch = hasBlocked;
        } else if (filters.issues === "parados") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const recentActivity = projectTasks.some(t => {
            const taskDate = t.updated_date ? new Date(t.updated_date) : new Date(t.created_date);
            return taskDate > sevenDaysAgo;
          });
          // A project is considered 'parado' if it's active, has tasks, and no task has been active in the last 7 days
          issuesMatch = !recentActivity && projectTasks.length > 0 && project.status === 'ativo';
        }
      }

      return searchMatch && statusMatch && viewMatch && departmentMatch && issuesMatch;
    });
  };

  const filteredProjects = getFilteredProjects();

  const getProjectTasks = (projectId) => {
    return tasks.filter(t => t.project_id === projectId);
  };

  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <ProjectDetails
        project={selectedProject}
        users={users}
        departments={departments}
        currentUser={currentUser}
        onBack={() => {
          setSelectedProject(null);
          loadData();
        }}
        onEdit={() => handleEditProject(selectedProject)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Projetos</h1>
              <p className="text-gray-600">
                Gerencie seus projetos e organize o trabalho da equipe
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Projeto
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-100 rounded-xl p-4 shadow-neumorphic-inset text-center">
              <div className="text-2xl font-bold text-blue-600">{projects.filter(p => p.owner_id === currentUser?.id).length}</div>
              <div className="text-sm text-gray-600">Meus Projetos</div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 shadow-neumorphic-inset text-center">
              <div className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'ativo').length}</div>
              <div className="text-sm text-gray-600">Ativos</div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 shadow-neumorphic-inset text-center">
              <div className="text-2xl font-bold text-yellow-600">{projects.filter(p => p.status === 'em_espera').length}</div>
              <div className="text-sm text-gray-600">Em Espera</div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 shadow-neumorphic-inset text-center">
              <div className="text-2xl font-bold text-gray-600">{projects.filter(p => p.status === 'concluido').length}</div>
              <div className="text-sm text-gray-600">Concluídos</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder="Buscar projetos..."
                  className="pl-10 bg-gray-100 shadow-neumorphic-inset border-none"
                />
              </div>
            </div>

            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="em_espera">Em Espera</option>
                <option value="concluido">Concluído</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>

            <div>
              <select
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
              >
                <option value="all">Todos os Departamentos</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filters.view}
                onChange={(e) => setFilters({...filters, view: e.target.value})}
                className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
              >
                <option value="meus">Meus Projetos</option>
                <option value="participando">Participando</option>
                <option value="todos">Todos</option>
              </select>
            </div>

            {/* Filtro de Problemas - Visível apenas para gestores/admins */}
            {isManagerOrAdmin && (
              <div>
                <select
                  value={filters.issues}
                  onChange={(e) => setFilters({...filters, issues: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                >
                  <option value="all">Todos Projetos</option>
                  <option value="atrasadas">Com Tarefas Atrasadas</option>
                  <option value="bloqueadas">Com Tarefas Bloqueadas</option>
                  <option value="parados">Parados (+7 dias)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Projects Grid or List */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              owner={users.find(u => u.id === project.owner_id)}
              teamMembers={users.filter(u => project.team_members?.includes(u.id))}
              department={departments.find(d => d.id === project.department_id)}
              tasks={getProjectTasks(project.id)}
              currentUser={currentUser}
              viewMode={viewMode}
              onView={() => handleViewProject(project)}
              onEdit={() => handleEditProject(project)}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 shadow-neumorphic-inset flex items-center justify-center">
              <LayoutGrid className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum projeto encontrado</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status !== 'all' || filters.department !== 'all' || filters.issues !== 'all'
                ? "Tente ajustar os filtros de busca"
                : "Comece criando seu primeiro projeto"
              }
            </p>
            {!filters.search && filters.status === 'all' && filters.department === 'all' && filters.issues === 'all' && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Projeto
              </Button>
            )}
          </div>
        )}

        {showForm && (
          <ProjectForm
            project={editingProject}
            users={users}
            departments={departments}
            currentUser={currentUser}
            onSave={handleSaveProject}
            onCancel={() => {
              setShowForm(false);
              setEditingProject(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
