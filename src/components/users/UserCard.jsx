
import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  Edit, 
  CheckCircle, 
  Clock, 
  Circle, 
  MoreVertical,
  UserCheck,
  UserX,
  Briefcase,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function UserCard({ user, department, tasks, onEdit, onToggleStatus, canEdit }) {
  const getTaskStatusCounts = () => {
    const counts = { concluido: 0, em_progresso: 0, nao_iniciado: 0 };
    tasks.forEach(task => counts[task.status]++);
    return counts;
  };

  const statusCounts = getTaskStatusCounts();
  const completionRate = tasks.length ? Math.round((statusCounts.concluido / tasks.length) * 100) : 0;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? "bg-green-100 text-green-700" 
      : "bg-red-100 text-red-700";
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Gerente';
      default: return 'Usuário';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return "bg-purple-100 text-purple-700";
      case 'manager': return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className={`
      bg-gray-100 rounded-2xl shadow-neumorphic p-6 transition-all duration-300
      ${!user.is_active ? 'opacity-60' : 'hover:shadow-neumorphic-pressed'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-neumorphic-soft">
            <span className="text-white font-semibold text-sm">
              {getInitials(user.full_name)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{user.full_name}</h3>
            <p className="text-sm text-gray-600">{user.position || "Sem cargo"}</p>
          </div>
        </div>
        
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="shadow-neumorphic bg-gray-100 border-none">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onToggleStatus}
                className={user.is_active ? "text-red-600" : "text-green-600"}
              >
                {user.is_active ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Desativar
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Status e Função */}
      <div className="flex gap-2 mb-4">
        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(user.is_active)}`}>
          {user.is_active ? 'Ativo' : 'Inativo'}
        </span>
        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getRoleColor(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>
      </div>

      {/* Departamento */}
      <div className="mb-4 p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-4 h-4 text-gray-500" />
          <p className="text-xs text-gray-500">Departamento</p>
        </div>
        <p className="text-sm font-semibold text-gray-700">{department}</p>
      </div>

      {/* Informações de Contato */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{user.phone}</span>
          </div>
        )}
      </div>

      {/* Estatísticas de Tarefas */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Tarefas</span>
          <span className="text-sm text-gray-600">{tasks.length}</span>
        </div>
        
        {tasks.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Progresso</span>
              <span className="text-xs font-semibold text-gray-600">{completionRate}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full shadow-neumorphic-inset mb-3">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="font-medium text-gray-600">{statusCounts.concluido}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className="font-medium text-gray-600">{statusCounts.em_progresso}</span>
              </div>
              <div className="flex items-center gap-1">
                <Circle className="w-3 h-3 text-gray-400" />
                <span className="font-medium text-gray-600">{statusCounts.nao_iniciado}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-3">
            <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-500">Nenhuma tarefa atribuída</p>
          </div>
        )}
      </div>
    </div>
  );
}
