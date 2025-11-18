import React from "react";
import { CheckCircle, Clock, Circle, Calendar, User } from "lucide-react";

export default function ProjectList({ tasks, users, onStatusChange, onEditTask }) {
  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-blue-100 text-blue-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700"
    };
    return colors[priority] || colors.medium;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'done': return CheckCircle;
      case 'in_progress': return Clock;
      default: return Circle;
    }
  };

  return (
    <div className="space-y-3">
      {tasks.length > 0 ? (
        tasks.map(task => {
          const StatusIcon = getStatusIcon(task.status);
          const assignedUser = users.find(u => u.id === task.assigned_to);

          return (
            <div 
              key={task.id}
              className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 cursor-pointer"
              onClick={() => onEditTask(task)}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextStatus =
                      task.status === 'todo' ? 'in_progress' :
                      task.status === 'in_progress' ? 'done' : 'todo';
                    onStatusChange(task.id, nextStatus);
                  }}
                  className="mt-1"
                >
                  <StatusIcon
                    className={`w-5 h-5 ${
                      task.status === 'done' ? 'text-green-500' :
                      task.status === 'in_progress' ? 'text-blue-500' : 'text-gray-400'
                    }`}
                  />
                </button>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex gap-3 items-center flex-wrap">
                    {task.priority && (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    )}
                    
                    {assignedUser && (
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">{assignedUser.full_name}</span>
                      </div>
                    )}
                    
                    {task.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}

                    {task.estimated_hours && (
                      <span className="text-xs text-gray-500">
                        {task.estimated_hours}h estimadas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma tarefa criada para este projeto</p>
        </div>
      )}
    </div>
  );
}