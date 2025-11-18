
import React from "react";
import { AlertCircle, Clock, CheckCircle, User, Calendar, MoreVertical, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function TicketCard({ ticket, department, assignedUser, currentUser, onView, onStatusChange }) {
  const getStatusColor = (status) => {
    const colors = {
      open: "bg-blue-100 text-blue-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-gray-100 text-gray-700"
    };
    return colors[status] || colors.open;
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: "Aberto",
      in_progress: "Em Atendimento",
      resolved: "Resolvido",
      closed: "Fechado"
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-blue-100 text-blue-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700"
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      critical: "Crítica"
    };
    return labels[priority] || priority;
  };

  const getTypeLabel = (type) => {
    const labels = {
      request: "Solicitação",
      task: "Tarefa",
      bug: "Problema/Bug",
      question: "Pergunta"
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'open':
        return AlertCircle;
      case 'in_progress':
        return Clock;
      case 'resolved':
      case 'closed':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const StatusIcon = getStatusIcon(ticket.status);

  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 hover:shadow-neumorphic-pressed transition-all duration-300 cursor-pointer" onClick={onView}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-neumorphic-soft flex-shrink-0 ${
            ticket.priority === 'critical' ? 'bg-red-500' :
            ticket.priority === 'high' ? 'bg-orange-500' :
            ticket.priority === 'medium' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}>
            <StatusIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{ticket.title}</h3>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100 flex-shrink-0"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="shadow-neumorphic bg-gray-100 border-none">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {ticket.status !== 'resolved' && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('in_progress'); }}>
                <Clock className="w-4 h-4 mr-2" />
                Colocar em Atendimento
              </DropdownMenuItem>
            )}
            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('resolved'); }}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como Resolvido
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>
      )}

      {/* Status e Tipo */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(ticket.status)}`}>
          {getStatusLabel(ticket.status)}
        </span>
        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
          {getPriorityLabel(ticket.priority)}
        </span>
        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 shadow-neumorphic-inset">
          {getTypeLabel(ticket.type)}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {department?.name || 'Sem departamento'}
            {assignedUser && ` • ${assignedUser.full_name}`}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Criado em: {new Date(ticket.created_date).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}
