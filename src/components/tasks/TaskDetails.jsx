
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  User,
  Edit,
  Trash2,
  Clock,
  Tag,
  CheckCircle,
  Briefcase,
  Shirt,
  AlertCircle, // Added new import
  Link2 // Added new import
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  todo: { label: "Não Iniciado", color: "bg-gray-100 text-gray-700" },
  in_progress: { label: "Em Progresso", color: "bg-blue-100 text-blue-700" },
  done: { label: "Concluído", color: "bg-green-100 text-green-700" },
  blocked: { label: "Bloqueado", color: "bg-red-100 text-red-700" }
};

const priorityConfig = {
  low: { label: "Baixa", color: "bg-gray-100 text-gray-600" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-700" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-700" },
  critical: { label: "Urgente", color: "bg-red-100 text-red-700" }
};

export default function TaskDetails({ task, users, departments, collections, currentUser, allTasks = [], onBack, onEdit, onDelete, onStatusChange }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const assignedUser = users.find(u => u.id === task.assigned_to);
  const department = departments.find(d => d.id === task.department_id);

  // Verificar se está atrasada
  const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date();

  const canEdit = currentUser?.id === task.assigned_to || currentUser?.role === 'admin';

  // Opções de mudança de status
  const statusTransitions = {
    todo: [
      { status: 'in_progress', label: 'Iniciar Tarefa', icon: Clock, color: 'bg-blue-500' },
    ],
    in_progress: [
      { status: 'done', label: 'Concluir Tarefa', icon: CheckCircle, color: 'bg-green-500' },
      { status: 'todo', label: 'Voltar para Não Iniciado', icon: ArrowLeft, color: 'bg-gray-500' },
    ],
    done: [
      { status: 'in_progress', label: 'Reabrir Tarefa', icon: Clock, color: 'bg-blue-500' },
    ]
  };

  const availableTransitions = statusTransitions[task.status] || [];

  const handleStatusChange = (taskId, newStatus) => {
    onStatusChange(taskId, newStatus);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">{task.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge className={status.color}>{status.label}</Badge>
                <Badge className={priority.color}>{priority.label}</Badge>
                {isOverdue && (
                  <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3" />
                    Atrasada
                  </Badge>
                )}
                {task.tags && task.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-white/50">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-3">
                <Button onClick={onEdit} className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={onDelete}
                  variant="outline"
                  className="shadow-neumorphic hover:shadow-neumorphic-pressed bg-gray-100 text-red-600 border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alerta de Atraso */}
            {isOverdue && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-6 shadow-neumorphic-inset">
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1 animate-pulse" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-orange-800 mb-2">Tarefa Atrasada</h3>
                    <p className="text-orange-700">
                      Esta tarefa passou do prazo de entrega em {format(new Date(task.due_date), 'dd/MM/yyyy')}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Descrição */}
            {task.description && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Descrição</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Quick Status Change */}
            {canEdit && task.status !== "done" && availableTransitions.length > 0 && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Mudar Status da Tarefa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableTransitions.map((transition, index) => {
                    const TransitionIcon = transition.icon;
                    return (
                      <Button
                        key={index}
                        onClick={() => handleStatusChange(task.id, transition.status)}
                        className={`${transition.color} hover:opacity-90 text-white shadow-neumorphic-soft h-auto py-4`}
                      >
                        <TransitionIcon className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="font-semibold">{transition.label}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Responsável */}
            <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Responsável</h3>
              {assignedUser && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-neumorphic-soft">
                    <span className="text-white font-semibold">
                      {assignedUser.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{assignedUser.full_name}</p>
                    <p className="text-sm text-gray-500">{assignedUser.position || assignedUser.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Datas */}
            <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Prazos</h3>
              <div className="space-y-3">
                {task.due_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Vencimento</p>
                      <p className="font-semibold text-gray-700">
                        {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}

                {task.completed_date && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Concluída em</p>
                      <p className="font-semibold text-gray-700">
                        {format(new Date(task.completed_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tempo */}
            {(task.estimated_hours || task.actual_hours) && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tempo</h3>
                <div className="space-y-3">
                  {task.estimated_hours && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estimado</span>
                      <span className="font-semibold text-gray-700">{task.estimated_hours}h</span>
                    </div>
                  )}
                  {task.actual_hours && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Real</span>
                      <span className="font-semibold text-gray-700">{task.actual_hours}h</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Relacionamentos */}
            {department && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Departamento</h3>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Departamento</p>
                    <p className="font-semibold text-gray-700">{department.name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
