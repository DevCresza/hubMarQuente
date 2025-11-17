
import React, { useState } from "react";
import { Circle, Clock, CheckCircle2, User, Calendar, AlertCircle, Eye, MoreVertical, ArrowRight, MoveRight } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TaskItem({ task, users, allTasks = [], sections = [], onUpdate, onDelete, onView }) {
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const assignedUser = users.find(u => u.id === task.assigned_to);
  
  const isOverdue = task.due_date && task.status !== 'concluido' && new Date(task.due_date) < new Date();
  
  // The 'isBlocked' calculation and its associated badge have been removed as per the outline.

  const statusOptions = [
    { value: "nao_iniciado", label: "A Fazer", icon: Circle, color: "text-gray-500" },
    { value: "em_progresso", label: "Em Andamento", icon: Clock, color: "text-blue-500" },
    { value: "concluido", label: "Concluído", icon: CheckCircle2, color: "text-green-500" }
  ];

  const currentStatus = statusOptions.find(s => s.value === task.status) || statusOptions[0];
  const StatusIcon = currentStatus.icon;

  const handleStatusClick = (e) => {
    e.stopPropagation();
    const currentIndex = statusOptions.findIndex(s => s.value === task.status);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    const nextStatus = statusOptions[nextIndex];
    
    onUpdate({ status: nextStatus.value });
  };

  return (
    <div 
      className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onView && onView(task)}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon - Clicável */}
        <button
          onClick={handleStatusClick}
          className="mt-0.5 hover:scale-110 transition-transform"
          title={`Mudar para ${statusOptions[(statusOptions.findIndex(s => s.value === task.status) + 1) % statusOptions.length].label}`}
        >
          <StatusIcon className={`w-5 h-5 ${currentStatus.color}`} />
        </button>

        <div className="flex-1 min-w-0">
          {/* Title and Badges */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-gray-800 flex-1">{task.title}</h4>
            <div className="flex gap-1 items-center">
              {isOverdue && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Atrasada
                </Badge>
              )}
              
              {/* Botão de Ver Detalhes - SEMPRE VISÍVEL */}
              {onView && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onView(task); }}
                  className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
                  title="Ver detalhes"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              
              {/* Botão de Mover para outra seção - SEMPRE VISÍVEL */}
              {sections && sections.length > 1 && (
                <DropdownMenu open={showSectionMenu} onOpenChange={setShowSectionMenu}>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-purple-50 hover:text-purple-600"
                      title="Mover para outra seção"
                    >
                      <MoveRight className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="shadow-neumorphic bg-gray-100 border-none">
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                      Mover para:
                    </div>
                    {sections
                      .filter(s => s.id !== task.section_id)
                      .map(section => (
                        <DropdownMenuItem 
                          key={section.id}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            onUpdate({ section_id: section.id });
                            setShowSectionMenu(false);
                          }}
                          className="cursor-pointer"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          {section.name}
                        </DropdownMenuItem>
                      ))
                    }
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Menu de ações */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="shadow-neumorphic bg-gray-100 border-none">
                  {onView && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(task); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{task.description}</p>
          )}

          {/* Info Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
              {assignedUser && (
                <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-lg">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {assignedUser.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-blue-700">{assignedUser.full_name}</span>
                </div>
              )}
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                    {format(new Date(task.due_date), 'dd/MM/yyyy')}
                  </span>
                </div>
              )}
              {task.estimated_hours && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{task.estimated_hours}h</span>
                </div>
              )}
              {task.dependencies && task.dependencies.length > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  {task.dependencies.length} dependência{task.dependencies.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
