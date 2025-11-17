import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle,
  Clock,
  Circle,
  MoreHorizontal,
  User,
  Calendar,
  Tag,
  Paperclip,
  Trash2,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

export default function TaskItem({ task, index, users, onStatusUpdate, onAssignmentUpdate, onDateUpdate }) {
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const assignedUser = users.find(u => u.id === task.assigned_to);

  const statusConfig = {
    nao_iniciado: {
      label: "Não Iniciado",
      icon: <Circle className="w-4 h-4 text-gray-400" />,
      color: "text-gray-500"
    },
    em_progresso: {
      label: "Em Progresso",
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      color: "text-blue-500"
    },
    concluido: {
      label: "Concluído",
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      color: "text-green-500"
    }
  };

  const priorityConfig = {
    baixa: { label: "Baixa", color: "bg-blue-100 text-blue-700" },
    media: { label: "Média", color: "bg-yellow-100 text-yellow-700" },
    alta: { label: "Alta", color: "bg-orange-100 text-orange-700" },
    critica: { label: "Crítica", color: "bg-red-100 text-red-700" }
  };

  const currentStatus = statusConfig[task.status] || statusConfig.nao_iniciado;
  const currentPriority = priorityConfig[task.priority] || priorityConfig.media;
  
  const handleDateSelect = (date) => {
    onDateUpdate(task.id, date.toISOString().split('T')[0]);
    setDatePickerOpen(false);
  };

  const handleStatusChange = (newStatus) => {
    onStatusUpdate(task.id, newStatus);
  };
  
  return (
    <div className={`
      bg-gray-100 rounded-2xl p-5 shadow-neumorphic
      transition-all duration-300
      ${task.status === "concluido" ? "opacity-60" : "hover:shadow-neumorphic-pressed"}
    `}>
      <div className="flex items-start justify-between">
        {/* Title and Status */}
        <div className="flex items-start gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="mt-1">{currentStatus.icon}</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-100 shadow-neumorphic border-none">
              <DropdownMenuItem onClick={() => handleStatusChange("nao_iniciado")}>
                <Circle className="w-4 h-4 mr-2 text-gray-400" /> Não Iniciado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("em_progresso")}>
                <Clock className="w-4 h-4 mr-2 text-blue-500" /> Em Progresso
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("concluido")}>
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Concluído
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex-1">
            <p className={`font-medium text-gray-800 ${task.status === "concluido" ? "line-through" : ""}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            )}
          </div>
        </div>
        
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full hover:bg-gray-200">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-100 shadow-neumorphic border-none">
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" /> Editar Tarefa
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">
              <Trash2 className="w-4 h-4 mr-2" /> Excluir Tarefa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pl-8">
        {/* Priority */}
        <div className={`px-2 py-1 rounded-md text-xs font-medium ${currentPriority.color}`}>
          {currentPriority.label}
        </div>

        {/* Assigned User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              <User className="w-3.5 h-3.5" />
              {assignedUser ? assignedUser.full_name : "Não atribuído"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-100 shadow-neumorphic border-none max-h-60 overflow-y-auto">
            {users.map(user => (
              <DropdownMenuItem key={user.id} onClick={() => onAssignmentUpdate(task.id, user.id)}>
                {user.full_name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => onAssignmentUpdate(task.id, null)}>
              Não atribuído
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Due Date */}
        <Popover open={isDatePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              <Calendar className="w-3.5 h-3.5" />
              {task.due_date ? 
                `Vence ${formatDistanceToNow(new Date(task.due_date), { addSuffix: true, locale: ptBR })}`
                : "Sem prazo"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-100 shadow-neumorphic border-none">
            <CalendarPicker
              mode="single"
              selected={task.due_date ? new Date(task.due_date) : null}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}