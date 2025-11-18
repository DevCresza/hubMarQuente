import React from "react";
import { Circle, Clock, CheckCircle, Edit } from "lucide-react";

export default function ProjectBoard({ tasks, users, onStatusChange, onEditTask }) {
  const columns = [
    { id: "todo", title: "Não Iniciado", icon: Circle, color: "text-gray-400" },
    { id: "in_progress", title: "Em Progresso", icon: Clock, color: "text-blue-500" },
    { id: "done", title: "Concluído", icon: CheckCircle, color: "text-green-500" }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(column => {
        const ColumnIcon = column.icon;
        const columnTasks = getTasksByStatus(column.id);

        return (
          <div key={column.id} className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <ColumnIcon className={`w-5 h-5 ${column.color}`} />
              <h3 className="font-semibold text-gray-800">{column.title}</h3>
              <span className="ml-auto text-sm text-gray-500 font-medium">{columnTasks.length}</span>
            </div>

            <div className="space-y-3">
              {columnTasks.map(task => {
                const assignedUser = users.find(u => u.id === task.assigned_to);

                return (
                  <div 
                    key={task.id}
                    className="bg-gray-100 rounded-xl p-4 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 cursor-pointer"
                    onClick={() => onEditTask(task)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 flex-1">{task.title}</h4>
                      <button className="text-gray-400 hover:text-gray-600 ml-2">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      {assignedUser && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {assignedUser.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">{assignedUser.full_name?.split(' ')[0]}</span>
                        </div>
                      )}

                      {task.priority && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>

                    {task.due_date && (
                      <div className="mt-2 text-xs text-gray-500">
                        Vence: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                );
              })}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Nenhuma tarefa
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}