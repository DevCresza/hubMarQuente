

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CheckSquare, 
  User,
  LogOut,
  Shirt,
  FolderKanban,
  AlertCircle,
  Calendar as CalendarIcon,
  Image
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    permission: "can_view_dashboard"
  },
  {
    title: "Projetos",
    url: createPageUrl("Projects"),
    icon: FolderKanban,
    permission: "can_view_projects"
  },
  {
    title: "Tarefas",
    url: createPageUrl("Tasks"),
    icon: CheckSquare,
    permission: "can_view_tasks"
  },
  {
    title: "Abertura de Tickets",
    url: createPageUrl("Tickets"),
    icon: AlertCircle,
    permission: "can_view_tickets"
  },
  {
    title: "Calendário",
    url: createPageUrl("LaunchCalendar"),
    icon: CalendarIcon,
    permission: "can_view_calendar"
  },
  {
    title: "Coleções",
    url: createPageUrl("Collections"),
    icon: Shirt,
    permission: "can_view_collections"
  },
  {
    title: "Marketing",
    url: createPageUrl("MarketingDirectory"),
    icon: Image,
    permission: "can_view_marketing"
  },
  {
    title: "UGCs",
    url: createPageUrl("UGC"),
    icon: Users,
    permission: "can_view_ugc"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Usuário não autenticado");
    }
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para verificar se o usuário tem permissão
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Admin tem todas as permissões
    // Check if currentUser.permissions exists and is an object
    if (!currentUser.permissions || typeof currentUser.permissions !== 'object') {
      return true; // If no specific permissions object, allow access (legacy or default behavior)
    }
    // Check for explicit 'false' permission; otherwise, assume true
    return currentUser.permissions[permission] !== false;
  };

  // Filtrar itens de navegação baseado nas permissões
  const visibleNavigationItems = navigationItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  // Se for a página SharedAssets, renderizar sem layout
  if (currentPageName === "SharedAssets") {
    return (
      <div className="min-h-screen bg-gray-100">
        <style jsx>{`
          .shadow-neumorphic {
            box-shadow: 8px 8px 15px rgba(0, 0, 0, 0.1), 
                       -8px -8px 15px rgba(255, 255, 255, 0.9);
          }
          .shadow-neumorphic-inset {
            box-shadow: inset 6px 6px 10px rgba(0, 0, 0, 0.1),
                       inset -6px -6px 10px rgba(255, 255, 255, 0.9);
          }
          .shadow-neumorphic-soft {
            box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1),
                       -4px -4px 8px rgba(255, 255, 255, 0.9);
          }
          .shadow-neumorphic-pressed {
            box-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.1),
                       inset -4px -4px 8px rgba(255, 255, 255, 0.9);
          }
        `}</style>
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-100 text-gray-800">
        <style jsx>{`
          .shadow-neumorphic {
            box-shadow: 8px 8px 15px rgba(0, 0, 0, 0.1), 
                       -8px -8px 15px rgba(255, 255, 255, 0.9);
          }
          .shadow-neumorphic-inset {
            box-shadow: inset 6px 6px 10px rgba(0, 0, 0, 0.1),
                       inset -6px -6px 10px rgba(255, 255, 255, 0.9);
          }
          .shadow-neumorphic-soft {
            box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1),
                       -4px -4px 8px rgba(255, 255, 255, 0.9);
          }
          .shadow-neumorphic-pressed {
            box-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.1),
                       inset -4px -4px 8px rgba(255, 255, 255, 0.9);
          }
        `}</style>

        <Sidebar className="border-r border-gray-200 bg-gray-100 shadow-neumorphic">
          <SidebarHeader className="p-6">
            <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200 shadow-neumorphic">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-neumorphic-soft">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-gray-800">Mar Quente 3.0</h2>
                  <p className="text-xs text-gray-500">Sistema de Gestão</p>
                </div>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-2 mb-2">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {visibleNavigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.url} 
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200
                            ${location.pathname === item.url 
                              ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600 font-bold' 
                              : 'hover:shadow-neumorphic-soft text-gray-700'}
                          `}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-semibold">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Admin Panel - Visível apenas para admins */}
            {currentUser?.role === 'admin' && (
              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-2 mb-2">
                  Administração
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={createPageUrl("AdminPanel")} 
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200
                            ${location.pathname === createPageUrl("AdminPanel")
                              ? 'shadow-neumorphic-pressed bg-gray-100 text-purple-600 font-bold' 
                              : 'hover:shadow-neumorphic-soft text-gray-700'}
                          `}
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          <span className="font-semibold">Painel Admin</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="p-6">
            {currentUser && (
              <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200 shadow-neumorphic">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shadow-neumorphic-inset">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {currentUser.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser.role === 'admin' ? 'Administrador' : 
                       currentUser.role === 'manager' ? 'Gerente' : 
                       currentUser.position || currentUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:shadow-neumorphic-pressed shadow-neumorphic-soft transition-all duration-200 text-gray-600 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-gray-100 border-b border-gray-200 px-6 py-4 md:hidden shadow-neumorphic">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-200 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold text-gray-800">Mar Quente 3.0</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

