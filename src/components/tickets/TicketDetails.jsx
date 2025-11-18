
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, CheckCircle, User, Calendar } from "lucide-react";

export default function TicketDetails({ ticket, users, departments, currentUser, onBack, onEdit, onStatusChange, onUpdate }) {
  const department = departments.find(d => d.id === ticket.department);
  const assignedUser = users.find(u => u.id === ticket.assigned_to);
  const creator = users.find(u => u.id === ticket.created_by);

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={onEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <Button
                  onClick={() => onStatusChange(ticket.id, 'resolved')}
                  className="bg-green-500 hover:bg-green-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolver
                </Button>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-800 mb-3">{ticket.title}</h1>
            <div className="flex gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </span>
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                {getPriorityLabel(ticket.priority)}
              </span>
              <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 shadow-neumorphic-inset">
                {getTypeLabel(ticket.type)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500 font-semibold">Departamento</p>
              </div>
              <p className="text-gray-800 font-semibold">{department?.name || 'Não atribuído'}</p>
            </div>

            {assignedUser && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Responsável</p>
                </div>
                <p className="text-gray-800 font-semibold">{assignedUser.full_name}</p>
              </div>
            )}

            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500 font-semibold">Criado por</p>
              </div>
              <p className="text-gray-800 font-semibold">{creator?.full_name || 'Desconhecido'}</p>
            </div>

            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500 font-semibold">Data de Abertura</p>
              </div>
              <p className="text-gray-800 font-semibold">
                {new Date(ticket.created_date).toLocaleDateString('pt-BR')}
              </p>
            </div>

            {ticket.resolved_date && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Resolvido em</p>
                </div>
                <p className="text-gray-800 font-semibold">
                  {new Date(ticket.resolved_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
              <h3 className="font-semibold text-gray-800 mb-2">Tags</h3>
              <div className="flex gap-2 flex-wrap">
                {ticket.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 rounded-lg text-sm font-semibold bg-purple-100 text-purple-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
