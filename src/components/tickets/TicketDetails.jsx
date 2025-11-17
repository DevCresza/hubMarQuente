
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit, Clock, CheckCircle, User, Calendar, MessageSquare, Paperclip, Send } from "lucide-react";

export default function TicketDetails({ ticket, users, departments, currentUser, onBack, onEdit, onStatusChange, onUpdate }) {
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const department = departments.find(d => d.id === ticket.department_id);
  const assignedUser = users.find(u => u.id === ticket.assigned_to);
  const creator = users.find(u => u.id === ticket.created_by);
  const resolver = users.find(u => u.id === ticket.resolved_by);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const updatedComments = [
        ...(ticket.comments || []),
        {
          user_id: currentUser?.id,
          comment: newComment,
          timestamp: new Date().toISOString(),
          is_internal: isInternal
        }
      ];

      await base44.entities.Ticket.update(ticket.id, { comments: updatedComments });
      setNewComment("");
      setIsInternal(false);
      onUpdate();
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    } finally {
      setSubmitting(false);
    }
  };

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

  const getPriorityColor = (priority) => {
    const colors = {
      baixa: "bg-blue-100 text-blue-700",
      media: "bg-yellow-100 text-yellow-700",
      alta: "bg-orange-100 text-orange-700",
      urgente: "bg-red-100 text-red-700"
    };
    return colors[priority] || colors.media;
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
              {ticket.status !== 'resolvido' && ticket.status !== 'fechado' && (
                <Button
                  onClick={() => onStatusChange(ticket.id, 'resolvido')}
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
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-500">{ticket.ticket_number}</span>
              {ticket.sla_breach && (
                <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                  SLA Violado
                </span>
              )}
            </div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-3">{ticket.title}</h1>
            <div className="flex gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
              <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 shadow-neumorphic-inset">
                {ticket.type}
              </span>
              {ticket.category && (
                <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-purple-100 text-purple-700">
                  {ticket.category}
                </span>
              )}
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

            {ticket.due_date && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Prazo</p>
                </div>
                <p className="text-gray-800 font-semibold">
                  {new Date(ticket.due_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {ticket.resolved_date && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Resolvido em</p>
                </div>
                <p className="text-gray-800 font-semibold">
                  {new Date(ticket.resolved_date).toLocaleDateString('pt-BR')}
                </p>
                {resolver && (
                  <p className="text-xs text-gray-500 mt-1">por {resolver.full_name}</p>
                )}
              </div>
            )}
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-800">Anexos</h3>
              </div>
              <div className="space-y-2">
                {ticket.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-100 rounded-xl shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
                  >
                    <span className="text-sm font-semibold text-blue-600">Anexo {index + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Resolution */}
          {ticket.resolution && (
            <div className="bg-green-50 rounded-2xl p-4 shadow-neumorphic-inset mb-6 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Solução</h3>
              </div>
              <p className="text-green-700 whitespace-pre-wrap">{ticket.resolution}</p>
            </div>
          )}

          {/* Comments */}
          <div className="bg-gray-100 rounded-2xl p-6 shadow-neumorphic-inset">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-800">Comentários</h3>
            </div>

            <div className="space-y-4 mb-4">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, index) => {
                  const commentUser = users.find(u => u.id === comment.user_id);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl ${
                        comment.is_internal
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-gray-100 shadow-neumorphic-soft'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">
                            {commentUser?.full_name || 'Usuário Desconhecido'}
                          </span>
                          {comment.is_internal && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-200 text-yellow-800">
                              Interno
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap">{comment.comment}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum comentário ainda</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar comentário..."
                className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-600 font-medium">Comentário interno</span>
                </label>
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Enviando...' : 'Comentar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
