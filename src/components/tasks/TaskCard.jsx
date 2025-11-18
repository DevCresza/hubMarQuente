
import React from "react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  User, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  nao_iniciado: { label: "Não Iniciado", color: "bg-gray-100 text-gray-700", icon: Circle },
  em_progresso: { label: "Em Progresso", color: "bg-blue-100 text-blue-700", icon: Clock },
  concluido: { label: "Concluído", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: Circle }
};

const priorityConfig = {
  baixa: { label: "Baixa", color: "bg-gray-100 text-gray-600" },
  media: { label: "Média", color: "bg-yellow-100 text-yellow-700" },
  alta: { label: "Alta", color: "bg-orange-100 text-orange-700" },
  urgente: { label: "Urgente", color: "bg-red-100 text-red-700" }
};

export default function TaskCard({ task, user, currentUser, onView, onEdit, onDelete, onStatusChange }) {
  const status = statusConfig[task.status] || statusConfig.nao_iniciado;
  const priority = priorityConfig[task.priority] || priorityConfig.media;
  const StatusIcon = status.icon;

  const getDueDateStatus = () => {
    if (!task.due_date || task.status === "concluido") return null;
    
    const dueDate = new Date(task.due_date);
    if (isPast(dueDate) && !isToday(dueDate)) {
      return { label: "Atrasada", color: "text-red-600", icon: AlertCircle };
    }
    if (isToday(dueDate)) {
      return { label: "Hoje", color: "text-orange-600", icon: AlertCircle };
    }
    if (isTomorrow(dueDate)) {
      return { label: "Amanhã", color: "text-yellow-600", icon: Clock };
    }
    return null;
  };

  const dueDateStatus = getDueDateStatus();
  const canEdit = currentUser?.id === task.assigned_to || currentUser?.role === 'admin';

  // Menu de mudança de status
  const statusOptions = [
    { value: "nao_iniciado", label: "Não Iniciado", icon: Circle, color: "text-gray-500" },
    { value: "em_progresso", label: "Em Progresso", icon: Clock, color: "text-blue-500" },
    { value: "concluido", label: "Concluído", icon: CheckCircle2, color: "text-green-500" }
  ];

  // Determinar ações rápidas disponíveis
  const getQuickActions = () => {
    const actions = [];
    
    // Check if the current user has permission to change status
    // For simplicity, assuming `canEdit` also grants permission to change status via quick actions.
    // A more granular permission might be needed in a real application.
    if (!canEdit) { 
      return actions;
    }

    if (task.status === 'nao_iniciado') {
      actions.push({
        label: 'Iniciar',
        action: () => onStatusChange('em_progresso'),
        icon: Clock,
        color: 'bg-blue-500 hover:bg-blue-600'
      });
    }
    
    if (task.status === 'em_progresso') {
      actions.push({
        label: 'Concluir',
        action: () => onStatusChange('concluido'),
        icon: CheckCircle2,
        color: 'bg-green-500 hover:bg-green-600'
      });
    }
    
    if (task.status === 'concluido') {
      actions.push({
        label: 'Reabrir',
        action: () => onStatusChange('em_progresso'),
        icon: Clock,
        color: 'bg-blue-500 hover:bg-blue-600'
      });
    }
    
    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <div 
      className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 hover:shadow-neumorphic-pressed transition-all duration-300 cursor-pointer"
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Status Icon com Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="mt-1 cursor-pointer hover:scale-110 transition-transform">
                <StatusIcon className={`w-5 h-5 ${
                  status.color.includes('gray') ? 'text-gray-400' : 
                  status.color.includes('blue') ? 'text-blue-500' : 
                  'text-green-500'
                }`} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="shadow-neumorphic bg-gray-100 border-none">
              {statusOptions.map(opt => {
                const OptionIcon = opt.icon;
                return (
                  <DropdownMenuItem 
                    key={opt.value}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onStatusChange(opt.value);
                    }}
                  >
                    <OptionIcon className={`w-4 h-4 mr-2 ${opt.color}`} />
                    {opt.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>

        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100 ml-2"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="shadow-neumorphic bg-gray-100 border-none">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={status.color}>{status.label}</Badge>
        <Badge className={priority.color}>{priority.label}</Badge>
        {task.tags && task.tags.map((tag, index) => (
          <Badge key={index} variant="outline" className="bg-white/50">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Info */}
      <div className="space-y-3">
        {/* Responsável */}
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 font-medium">{user.full_name}</span>
            {currentUser?.id === task.assigned_to && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Sua tarefa
              </Badge>
            )}
          </div>
        )}

        {/* Data de Vencimento */}
        {task.due_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">
              {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            {dueDateStatus && (
              <div className="flex items-center gap-1 ml-auto">
                <dueDateStatus.icon className={`w-4 h-4 ${dueDateStatus.color}`} />
                <span className={`text-xs font-semibold ${dueDateStatus.color}`}>
                  {dueDateStatus.label}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Dependências - Info sutil */}
        {task.dependencies && task.dependencies.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <span className="text-blue-700 font-medium">
              Depende de {task.dependencies.length} tarefa{task.dependencies.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Tempo Estimado */}
        {task.estimated_hours && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{task.estimated_hours}h estimadas</span>
            {task.actual_hours && (
              <span className="text-gray-500 ml-auto">
                {task.actual_hours}h gastas
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
        {quickActions.map((action, index) => {
          const ActionIcon = action.icon;
          return (
            <Button 
              key={index}
              size="sm" 
              className={`flex-1 ${action.color} text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed`}
              onClick={(e) => {
                e.stopPropagation();
                action.action();
              }}
            >
              <ActionIcon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          );
        })}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 shadow-neumorphic-soft hover:shadow-neumorphic-pressed text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          Detalhes
        </Button>
      </div>
    </div>
  );
}
