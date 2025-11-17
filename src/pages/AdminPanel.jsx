import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FolderKanban, 
  CheckSquare,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AdminOverview from "../components/admin/AdminOverview";
import AdminProjects from "../components/admin/AdminProjects";
import AdminTasks from "../components/admin/AdminTasks";
import AdminUsers from "../components/admin/AdminUsers";

export default function AdminPanel() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      // Redirecionar se não for admin
      if (user.role !== 'admin') {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      window.location.href = createPageUrl("Dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
    { id: "projects", label: "Projetos", icon: FolderKanban },
    { id: "tasks", label: "Tarefas", icon: CheckSquare },
    { id: "users", label: "Usuários", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Painel Administrativo</h1>
              <p className="text-gray-600">
                Visão completa de projetos, tarefas, usuários e performance da equipe
              </p>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl("Users")}>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft">
                  <Users className="w-4 h-4 mr-2" />
                  Gerenciar Usuários
                </Button>
              </Link>
              <Link to={createPageUrl("Departments")}>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white shadow-neumorphic-soft">
                  <Building2 className="w-4 h-4 mr-2" />
                  Gerenciar Departamentos
                </Button>
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-2 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === "overview" && <AdminOverview currentUser={currentUser} />}
        {activeTab === "projects" && <AdminProjects currentUser={currentUser} />}
        {activeTab === "tasks" && <AdminTasks currentUser={currentUser} />}
        {activeTab === "users" && <AdminUsers currentUser={currentUser} />}
      </div>
    </div>
  );
}