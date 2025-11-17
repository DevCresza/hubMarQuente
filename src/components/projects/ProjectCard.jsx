
import React from "react";
import { FolderKanban, Users, Calendar, MoreVertical, Eye, Edit, Lock, Globe, Building2, AlertCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectCard({ project, owner, teamMembers, department, tasks = [], currentUser, onView, onEdit }) {
  const getStatusColor = (status) => {
    const colors = {
      ativo: "bg-green-100 text-green-700",
      em_espera: "bg-yellow-100 text-yellow-700",
      concluido: "bg-blue-100 text-blue-700",
      arquivado: "bg-gray-100 text-gray-600"
    };
    return colors[status] || colors.ativo;
  };

  const getStatusLabel = (status) => {
    const labels = {
      ativo: "Ativo",
      em_espera: "Em Espera",
      concluido: "Concluído",
      arquivado: "Arquivado"
    };
    return labels[status] || status;
  };

  const getTaskStats = () => {
    if (!Array.isArray(tasks)) {
      return { overdue: 0, external: 0, total: 0, stalled: false, recentActivity: true };
    }

    const overdue = tasks.filter(t => {
      if (!t.due_date || t.status === 'concluido') return false;
      return new Date(t.due_date) < new Date();
    }).length;

    // Removed the 'blocked' task calculation
    // const blocked = tasks.filter(t => {
    //   if (!t.dependencies || t.dependencies.length === 0) return false;
    //   const depTasks = tasks.filter(dt => t.dependencies.includes(dt.id));
    //   return depTasks.some(dt => dt.status !== 'concluido');
    // }).length;

    const external = tasks.filter(t => t.is_external).length;

    // Verificar se o projeto está parado (sem atividades nos últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = tasks.some(t => {
      const taskDate = t.updated_date ? new Date(t.updated_date) : new Date(t.created_date);
      return taskDate > sevenDaysAgo;
    });

    const stalled = !recentActivity && tasks.length > 0 && project.status === 'ativo';

    return { overdue, external, total: tasks.length, stalled, recentActivity };
  };

  const stats = getTaskStats();
  const canEdit = currentUser?.id === project.owner_id || currentUser?.role === 'admin';
  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <div 
      className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 hover:shadow-neumorphic-pressed transition-all duration-300 cursor-pointer relative"
      onClick={onView}
    >
      {/* Alerta de Projeto Parado - Visível apenas para gestores/admins */}
      {stats.stalled && isManagerOrAdmin && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-red-500 rounded-full p-2 shadow-lg animate-pulse" title="Projeto sem atividade há mais de 7 dias">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-neumorphic-soft flex-shrink-0"
            style={{ backgroundColor: project.color || '#3b82f6' }}
          >
            <FolderKanban className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-800 truncate">{project.name}</h3>
              {project.privacy === 'privado' ? (
                <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
              ) : (
                <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" />
              )}
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
            )}
          </div>
        </div>
        
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100 flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="shadow-neumorphic bg-gray-100 border-none">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(project.status)}`}>
          {getStatusLabel(project.status)}
        </span>
        {department && (
          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {department.name}
          </span>
        )}
        {project.tags?.map(tag => (
          <span key={tag} className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 shadow-neumorphic-inset">
            #{tag}
          </span>
        ))}
      </div>

      {/* Alertas de Problemas - Apenas overdue, external e stalled */}
      {(stats.overdue > 0 || stats.external > 0 || stats.stalled) && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {stats.stalled && isManagerOrAdmin && (
            <div className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              Parado há +7 dias
            </div>
          )}
          {stats.overdue > 0 && (
            <div className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {stats.overdue} atrasada{stats.overdue > 1 ? 's' : ''}
            </div>
          )}
          {/* Removed blocked tasks alert */}
          {stats.external > 0 && (
            <div className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {stats.external} terceiro{stats.external > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {(project.start_date || project.due_date) && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {project.start_date && project.due_date ? (
              <span>
                {new Date(project.start_date).toLocaleDateString('pt-BR')} - {new Date(project.due_date).toLocaleDateString('pt-BR')}
              </span>
            ) : project.due_date ? (
              <span>Até {new Date(project.due_date).toLocaleDateString('pt-BR')}</span>
            ) : (
              <span>Desde {new Date(project.start_date).toLocaleDateString('pt-BR')}</span>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-semibold">
              {owner && owner.full_name}
            </span>
          </div>
          <div className="flex -space-x-2">
            {teamMembers && teamMembers.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center shadow-neumorphic-soft border-2 border-gray-100"
                title={member.full_name}
              >
                <span className="text-white text-xs font-semibold">
                  {member.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
            ))}
            {teamMembers && teamMembers.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shadow-neumorphic-inset border-2 border-gray-100">
                <span className="text-gray-600 text-xs font-semibold">
                  +{teamMembers.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
