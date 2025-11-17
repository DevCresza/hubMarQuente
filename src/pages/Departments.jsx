import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Users, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DepartmentCard from "../components/departments/DepartmentCard";
import DepartmentForm from "../components/departments/DepartmentForm";
import { supabase } from "@/api/supabaseClient";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const FIXED_DEPARTMENTS = [
    { name: "Marketing", color: "#ec4899", description: "Gestão de campanhas, conteúdo e branding" },
    { name: "Comercial", color: "#3b82f6", description: "Vendas, relacionamento com clientes e parcerias" },
    { name: "Desenvolvimento", color: "#10b981", description: "Produtos, coleções e criação" },
    { name: "Manutenção", color: "#f59e0b", description: "Manutenção de equipamentos, instalações e infraestrutura" }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Buscar usuários diretamente do Supabase
      const { data: usersData } = await supabase
        .from('users')
        .select('*');

      const [departmentsData, tasksData] = await Promise.all([
        base44.entities.Department.list("name"),
        base44.entities.Task.list()
      ]);

      // Criar departamentos fixos se não existirem
      const existingNames = departmentsData.map(d => d.name);
      const newDepartments = [];

      for (const fixedDept of FIXED_DEPARTMENTS) {
        if (!existingNames.includes(fixedDept.name)) {
          const created = await base44.entities.Department.create(fixedDept);
          newDepartments.push(created);
        }
      }

      // Recarregar se criou novos departamentos
      if (newDepartments.length > 0) {
        const updatedDepts = await base44.entities.Department.list("name");
        setDepartments(updatedDepts);
      } else {
        setDepartments(departmentsData);
      }

      setUsers(usersData || []);
      setTasks(tasksData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentUsers = (departmentId) => {
    return users.filter(user => user.department_id === departmentId && user.is_active);
  };

  const getDepartmentTasks = (departmentId) => {
    const departmentUserIds = getDepartmentUsers(departmentId).map(u => u.id);
    return tasks.filter(task => departmentUserIds.includes(task.assigned_to));
  };

  const getManagerName = (managerId) => {
    const manager = users.find(u => u.id === managerId);
    return manager ? manager.full_name : null;
  };

  const handleSaveDepartment = async (departmentData) => {
    try {
      if (editingDepartment) {
        await base44.entities.Department.update(editingDepartment.id, departmentData);
      } else {
        await base44.entities.Department.create(departmentData);
      }
      setShowForm(false);
      setEditingDepartment(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar departamento:", error);
      alert("Erro ao salvar departamento. Tente novamente.");
    }
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (confirm("Tem certeza que deseja excluir este departamento?")) {
      try {
        await base44.entities.Department.delete(departmentId);
        loadData();
      } catch (error) {
        console.error("Erro ao excluir departamento:", error);
        alert("Erro ao excluir departamento. Verifique se não há usuários associados.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando departamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Departamentos</h1>
              <p className="text-gray-600">Organize equipes e responsabilidades por departamento</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Departamento
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center p-4 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-semibold text-gray-700">{departments.length}</div>
              <div className="text-sm text-gray-500">Departamentos</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-semibold text-gray-700">{users.filter(u => u.is_active).length}</div>
              <div className="text-sm text-gray-500">Usuários Ativos</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-semibold text-gray-700">{tasks.filter(t => t.status === 'concluido').length}</div>
              <div className="text-sm text-gray-500">Tarefas Concluídas</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map(department => (
            <DepartmentCard
              key={department.id}
              department={department}
              users={getDepartmentUsers(department.id)}
              tasks={getDepartmentTasks(department.id)}
              manager={getManagerName(department.manager_id)}
              onEdit={() => handleEditDepartment(department)}
              onDelete={() => handleDeleteDepartment(department.id)}
              readOnly={false}
            />
          ))}
        </div>

        {showForm && (
          <DepartmentForm
            department={editingDepartment}
            users={users}
            onSave={handleSaveDepartment}
            onCancel={() => {
              setShowForm(false);
              setEditingDepartment(null);
            }}
          />
        )}

        {departments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 shadow-neumorphic-inset flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Carregando departamentos...</p>
          </div>
        )}
      </div>
    </div>
  );
}