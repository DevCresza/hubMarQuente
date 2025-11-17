
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Department } from "@/api/entities";
import { Task } from "@/api/entities";
import { Plus, Search, Filter, Users as UsersIcon, UserX, UserCheck, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserFormComplete from "../components/users/UserFormComplete";
import UserCard from "../components/users/UserCard";
import UserStats from "../components/users/UserStats";
import UserTable from "../components/users/UserTable";
import UserFilters from "../components/users/UserFilters";
import { supabase } from "@/api/supabaseClient";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "all",
    status: "active",
    role: "all"
  });
  const [viewMode, setViewMode] = useState("grid");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário atual:", error);
    }
  };

  const loadData = async () => {
    try {
      console.log('🔄 loadData - Carregando usuários...');
      setLoading(true);
      setError(null);

      // Buscar usuários diretamente do Supabase
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_date', { ascending: false });

      if (usersError) {
        console.error('❌ Erro ao buscar usuários:', usersError);
        throw usersError;
      }

      console.log(`✅ ${usersData?.length || 0} usuários carregados:`, usersData);

      const [departmentsData, tasksData] = await Promise.all([
        Department.list("name"),
        Task.list()
      ]);

      setUsers(usersData || []);
      setDepartments(departmentsData);
      setTasks(tasksData);

      console.log('✅ loadData concluído');
    } catch (error) {
      setError("Erro ao carregar dados. Tente novamente.");
      console.error("❌ Erro no loadData:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      console.log('🔵 Users.jsx - handleSaveUser chamado com:', userData);
      setError(null); // Limpar erros anteriores

      if (editingUser) {
        // Atualizar usuário existente (não atualiza senha)
        console.log('🔄 Atualizando usuário:', editingUser.id);
        const { password, confirmPassword, ...updateData } = userData;
        await User.update(editingUser.id, updateData);
        console.log('✅ Usuário atualizado com sucesso');
      } else {
        // Criar novo usuário com login no Auth
        console.log('🆕 Criando novo usuário...');
        const result = await User.create(userData);
        console.log('✅ Usuário criado com sucesso:', result);
      }

      // Só fechar o form e recarregar se tudo deu certo
      console.log('🔄 Recarregando lista de usuários...');
      await loadData();

      setShowForm(false);
      setEditingUser(null);
      console.log('✅ Processo concluído com sucesso');

    } catch (error) {
      console.error("❌ Erro ao salvar usuário:", error);
      const errorMessage = error.message || "Erro ao salvar usuário. Tente novamente.";
      setError(errorMessage);

      // NÃO fechar o formulário se houver erro
      // Mantém o formulário aberto para o usuário tentar novamente
      console.error('❌ Formulário mantido aberto devido ao erro');

      // Mostrar erro por 10 segundos
      setTimeout(() => setError(null), 10000);

      // Re-lançar o erro para que o formulário saiba que falhou
      throw error;
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await User.update(userId, { is_active: !currentStatus });
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setError("Erro ao atualizar status do usuário.");
    }
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : "Sem departamento";
  };

  const getUserTasks = (userId) => {
    return tasks.filter(task => task.assigned_to === userId);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.position?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesDepartment = filters.department === "all" || user.department_id === filters.department;
    
    const matchesStatus = 
      filters.status === "all" ||
      (filters.status === "active" && user.is_active) ||
      (filters.status === "inactive" && !user.is_active);
    
    const matchesRole = filters.role === "all" || user.role === filters.role;

    return matchesSearch && matchesDepartment && matchesStatus && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Gestão de Usuários</h1>
              <p className="text-gray-600">
                Gerencie a equipe, atribuições e permissões do sistema
              </p>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <div className="flex bg-gray-100 rounded-2xl shadow-neumorphic-inset p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                    viewMode === "grid" 
                      ? "shadow-neumorphic-pressed bg-gray-100 text-blue-600" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                    viewMode === "table" 
                      ? "shadow-neumorphic-pressed bg-gray-100 text-blue-600" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Tabela
                </button>
              </div>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>
          </div>

          {/* Stats */}
          <UserStats 
            users={users} 
            departments={departments} 
            tasks={tasks} 
            currentUser={currentUser}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gray-100 rounded-2xl shadow-neumorphic-inset p-4 mb-6 flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Filters */}
        <UserFilters 
          filters={filters}
          setFilters={setFilters}
          departments={departments}
          userCount={filteredUsers.length}
        />

        {/* Content */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                department={getDepartmentName(user.department_id)}
                tasks={getUserTasks(user.id)}
                onEdit={() => handleEditUser(user)}
                onToggleStatus={() => handleToggleUserStatus(user.id, user.is_active)}
                canEdit={currentUser?.role === 'admin'}
              />
            ))}
          </div>
        ) : (
          <UserTable 
            users={filteredUsers}
            departments={departments}
            tasks={tasks}
            onEdit={handleEditUser}
            onToggleStatus={handleToggleUserStatus}
            canEdit={currentUser?.role === 'admin'}
          />
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 shadow-neumorphic-inset flex items-center justify-center">
              <UsersIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.department !== 'all' || filters.status !== 'active'
                ? "Tente ajustar os filtros de busca"
                : "Comece adicionando o primeiro usuário ao sistema"
              }
            </p>
            {(!filters.search && filters.department === 'all' && filters.status === 'active') && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Usuário
              </Button>
            )}
          </div>
        )}

        {/* User Form Modal */}
        {showForm && (
          <UserFormComplete
            user={editingUser}
            departments={departments}
            users={users}
            onSave={handleSaveUser}
            onCancel={() => {
              setShowForm(false);
              setEditingUser(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
