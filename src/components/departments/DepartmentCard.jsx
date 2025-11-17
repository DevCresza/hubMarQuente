
import React from "react";
import { Users, CheckCircle, Clock, Circle, Edit, Trash2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DepartmentCard({ department, users, tasks, manager, onEdit, onDelete }) {
  const getTaskStatusCounts = () => {
    const counts = { concluido: 0, em_progresso: 0, nao_iniciado: 0 };
    tasks.forEach(task => counts[task.status]++);
    return counts;
  };

  const statusCounts = getTaskStatusCounts();
  const completionRate = tasks.length ? Math.round((statusCounts.concluido / tasks.length) * 100) : 0;

  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full shadow-neumorphic-soft"
              style={{ backgroundColor: department.color }}
            ></div>
            <h3 className="font-semibold text-gray-800">{department.name}</h3>
          </div>
          {department.description && (
            <p className="text-sm text-gray-600">{department.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Manager */}
      {manager && (
        <div className="mb-4 p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-xs text-gray-500">Gerente</p>
              <p className="text-sm font-semibold text-gray-700">{manager}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
          <Users className="w-6 h-6 mx-auto mb-1 text-blue-500" />
          <div className="text-lg font-semibold text-gray-700">{users.length}</div>
          <div className="text-xs text-gray-500">Usuários</div>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
          <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-500" />
          <div className="text-lg font-semibold text-gray-700">{tasks.length}</div>
          <div className="text-xs text-gray-500">Tarefas</div>
        </div>
      </div>

      {/* Progress */}
      {tasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Progresso</span>
            <span className="text-sm font-semibold text-gray-600">{completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full shadow-neumorphic-inset">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${completionRate}%`,
                backgroundColor: department.color 
              }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="font-semibold text-gray-600">{statusCounts.concluido}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="font-semibold text-gray-600">{statusCounts.em_progresso}</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle className="w-3 h-3 text-gray-400" />
              <span className="font-semibold text-gray-600">{statusCounts.nao_iniciado}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
