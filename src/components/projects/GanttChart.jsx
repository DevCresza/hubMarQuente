import React, { useMemo } from "react";
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GanttChart({ tasks, milestones, project }) {
  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;

    // Find date range
    const allDates = [];
    
    if (project.start_date) allDates.push(new Date(project.start_date));
    if (project.due_date) allDates.push(new Date(project.due_date));
    
    tasks.forEach(task => {
      if (task.start_date) allDates.push(new Date(task.start_date));
      if (task.due_date) allDates.push(new Date(task.due_date));
    });

    if (allDates.length === 0) return null;

    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    
    const startDate = startOfMonth(minDate);
    const endDate = endOfMonth(maxDate);
    
    const totalDays = differenceInDays(endDate, startDate) + 1;
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return { startDate, endDate, totalDays, days };
  }, [tasks, project, milestones]);

  if (!chartData) {
    return (
      <div className="bg-gray-100 rounded-2xl shadow-neumorphic-inset p-8 text-center">
        <p className="text-gray-500">Adicione datas às tarefas para visualizar o gráfico de Gantt</p>
      </div>
    );
  }

  const { startDate, days, totalDays } = chartData;

  const getTaskPosition = (task) => {
    if (!task.start_date || !task.due_date) return null;
    
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.due_date);
    
    const startOffset = differenceInDays(taskStart, startDate);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;
    
    return { leftPercent, widthPercent };
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: "#9ca3af",
      in_progress: "#3b82f6",
      done: "#10b981",
      blocked: "#ef4444"
    };
    return colors[status] || colors.todo;
  };

  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header - Timeline */}
        <div className="flex mb-4 pb-4 border-b border-gray-200">
          <div className="w-64 flex-shrink-0 font-semibold text-gray-700">Tarefa</div>
          <div className="flex-1 flex">
            {days.filter((_, index) => index % 7 === 0).map((day, index) => (
              <div
                key={index}
                className="flex-1 text-center text-xs text-gray-600 font-medium"
              >
                {format(day, "MMM d", { locale: ptBR })}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {tasks.map((task) => {
            const position = getTaskPosition(task);
            
            return (
              <div key={task.id} className="flex items-center">
                <div className="w-64 flex-shrink-0 pr-4">
                  <div className="text-sm font-medium text-gray-800 truncate">{task.title}</div>
                  <div className="text-xs text-gray-500">
                    {task.estimated_hours && `${task.estimated_hours}h`}
                  </div>
                </div>
                <div className="flex-1 relative h-8">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex">
                    {days.filter((_, index) => index % 7 === 0).map((_, index) => (
                      <div
                        key={index}
                        className="flex-1 border-l border-gray-200 first:border-l-0"
                      />
                    ))}
                  </div>
                  
                  {/* Task bar */}
                  {position && (
                    <div
                      className="absolute top-1 h-6 rounded-lg shadow-neumorphic-soft flex items-center justify-center cursor-pointer hover:shadow-neumorphic-pressed transition-all duration-200"
                      style={{
                        left: `${position.leftPercent}%`,
                        width: `${position.widthPercent}%`,
                        backgroundColor: getStatusColor(task.status),
                        minWidth: '40px'
                      }}
                    >
                      <span className="text-xs text-white font-medium truncate px-2">
                        {task.status === 'done' ? '✓' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Milestones */}
        {milestones && milestones.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-64 flex-shrink-0 font-semibold text-gray-700">Marcos</div>
            </div>
            {milestones.map((milestone, index) => {
              const milestoneDate = new Date(milestone.due_date);
              const offset = differenceInDays(milestoneDate, startDate);
              const leftPercent = (offset / totalDays) * 100;

              return (
                <div key={index} className="flex items-center mb-2">
                  <div className="w-64 flex-shrink-0 pr-4">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {milestone.completed && '✓ '}{milestone.name}
                    </div>
                  </div>
                  <div className="flex-1 relative h-8">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 shadow-neumorphic"
                      style={{
                        left: `${leftPercent}%`,
                        backgroundColor: milestone.completed ? '#10b981' : '#f59e0b'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-6 mt-6 pt-4 border-t border-gray-200 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor('todo') }}></div>
            <span className="text-gray-600">Não Iniciado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor('in_progress') }}></div>
            <span className="text-gray-600">Em Progresso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor('done') }}></div>
            <span className="text-gray-600">Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rotate-45" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-gray-600">Marco</span>
          </div>
        </div>
      </div>
    </div>
  );
}