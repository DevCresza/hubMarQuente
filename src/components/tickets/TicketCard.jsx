
import React from "react";
import { AlertCircle, Clock, CheckCircle, User, Calendar, MoreVertical, Eye, MessageSquare } from "lucide-react";
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
      aberto: "bg-blue-100 text-blue-700",
      em_atendimento: "bg-yellow-100 text-yellow-700",
      aguardando_resposta: "bg-orange-100 text-orange-700",
      resolvido: "bg-green-100 text-green-700",
      fechado: "bg-gray-100 text-gray-700",
      cancelado: "bg-red-100 text-red-700"
    };
    return colors[status] || colors.aberto;
  };

  const getStatusLabel = (status) => {
    const labels = {
      aberto: "Aberto",
      em_atendimento: "Em Atendimento",
      aguardando_resposta: "Aguardando Resposta",
      resolvido: "Resolvido",
      fechado: "Fechado",
      cancelado: "Cancelado"
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      baixa: "bg-blue-100 text-blue-700",
      media: "bg-yellow-100 text-yellow-700",
      alta: "bg-orange-100 text-orange-700",
      urgente: "bg-red-100 text-red-700"
    };
    return colors[priority] || colors.media;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      baixa: "Baixa",
      media: "Média",
      alta: "Alta",
      urgente: "Urgente"
    };
    return labels[priority] || priority;
  };

  const getTypeLabel = (type) => {
    const labels = {
      suporte_tecnico: "Suporte Técnico",
      solicitacao: "Solicitação",
      problema: "Problema",
      melhoria: "Melhoria",
      duvida: "Dúvida",
      manutencao: "Manutenção"
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'aberto':
        return AlertCircle;
      case 'em_atendimento':
        return Clock;
      case 'resolvido':
      case 'fechado':
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
            ticket.priority === 'urgente' ? 'bg-red-500' :
            ticket.priority === 'alta' ? 'bg-orange-500' :
            ticket.priority === 'media' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}>
            <StatusIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-500">{ticket.ticket_number}</span>
              {ticket.sla_breach && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                  SLA Violado
                </span>
              )}
            </div>
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
            {ticket.status !== 'resolvido' && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('em_atendimento'); }}>
                <Clock className="w-4 h-4 mr-2" />
                Colocar em Atendimento
              </DropdownMenuItem>
            )}
            {ticket.status !== 'resolvido' && ticket.status !== 'fechado' && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('resolvido'); }}>
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
        
        {ticket.due_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Prazo: {new Date(ticket.due_date).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        {ticket.comments && ticket.comments.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span>{ticket.comments.length} comentário{ticket.comments.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
