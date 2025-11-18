
import React from "react";
import { X, Calendar, User, Clock, AlertCircle, CheckCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TaskDetailsModal({ task, users, allTasks = [], onClose, onEdit, onDelete }) {
  const assignedUser = users.find(u => u.id === task.assigned_to);
  const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date();

  const priorityConfig = {
    low: { label: "Baixa", color: "bg-gray-100 text-gray-700" },
    medium: { label: "Média", color: "bg-blue-100 text-blue-700" },
    high: { label: "Alta", color: "bg-orange-100 text-orange-700" },
    critical: { label: "Urgente", color: "bg-red-100 text-red-700" }
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-start justify-between flex-shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{task.title}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge className={priority.color}>{priority.label}</Badge>
              {isOverdue && (
                <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Atrasada
                </Badge>
              )}
              {task.is_external && (
                <Badge className="bg-purple-100 text-purple-700">Terceirizado</Badge>
              )}
              {task.tags && task.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-white/50">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Alerta de Atraso */}
            {isOverdue && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-orange-800 mb-1">Tarefa Atrasada</h3>
                    <p className="text-sm text-orange-700">
                      Esta tarefa passou do prazo de entrega em {format(new Date(task.due_date), 'dd/MM/yyyy')}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Descrição */}
            {task.description && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Descrição</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Informações Principais */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Informações</h3>
              <div className="space-y-3">
                {/* Responsável */}
                {assignedUser && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Responsável</p>
                      <p className="text-sm font-semibold text-gray-800">{assignedUser.full_name}</p>
                    </div>
                  </div>
                )}

                {/* Datas */}
                {(task.start_date || task.due_date) && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Prazo</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {task.start_date && format(new Date(task.start_date), 'dd/MM/yyyy')}
                        {task.start_date && task.due_date && ' → '}
                        {task.due_date && format(new Date(task.due_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Horas Estimadas */}
                {task.estimated_hours && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Horas Estimadas</p>
                      <p className="text-sm font-semibold text-gray-800">{task.estimated_hours}h</p>
                    </div>
                  </div>
                )}

                {/* Terceirizado */}
                {task.is_external && (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Executado por Terceiros</p>
                      {task.external_contact && (
                        <p className="text-sm font-semibold text-gray-800 whitespace-pre-wrap">{task.external_contact}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 shadow-sm hover:shadow-md bg-white font-semibold"
          >
            Fechar
          </Button>
          {onEdit && (
            <Button
              onClick={onEdit}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg font-semibold"
            >
              Editar Tarefa
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              variant="outline"
              className="shadow-sm hover:shadow-md bg-white text-red-600 border-red-300 font-semibold"
            >
              Excluir
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
