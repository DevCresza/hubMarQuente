import React from "react";
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Circle, CheckCircle, Clock } from "lucide-react";

export default function ProjectTimeline({ tasks, milestones, project, users }) {
  // Calcular datas do timeline
  const getTimelineRange = () => {
    const allDates = [];
    
    if (project.start_date) allDates.push(new Date(project.start_date));
    if (project.due_date) allDates.push(new Date(project.due_date));
    
    tasks.forEach(task => {
      if (task.start_date) allDates.push(new Date(task.start_date));
      if (task.due_date) allDates.push(new Date(task.due_date));
    });

    milestones?.forEach(milestone => {
      if (milestone.due_date) allDates.push(new Date(milestone.due_date));
    });

    if (allDates.length === 0) {
      const today = new Date();
      return {
        start: startOfMonth(today),
        end: endOfMonth(addDays(today, 90))
      };
    }

    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    
    return {
      start: startOfMonth(minDate),
      end: endOfMonth(addDays(maxDate, 30))
    };
  };

  const timelineRange = getTimelineRange();
  const totalDays = differenceInDays(timelineRange.end, timelineRange.start);
  const today = new Date();

  // Calcular posição no timeline
  const getTaskPosition = (task) => {
    if (!task.start_date || !task.due_date) return null;

    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.due_date);
    
    const startOffset = differenceInDays(taskStart, timelineRange.start);
    const duration = differenceInDays(taskEnd, taskStart) + 1;

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const getMilestonePosition = (milestone) => {
    if (!milestone.due_date) return null;

    const milestoneDate = new Date(milestone.due_date);
    const offset = differenceInDays(milestoneDate, timelineRange.start);

    return {
      left: `${(offset / totalDays) * 100}%`
    };
  };

  const getTodayPosition = () => {
    const offset = differenceInDays(today, timelineRange.start);
    return `${(offset / totalDays) * 100}%`;
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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'done':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      default:
        return Circle;
    }
  };

  // Gerar marcadores de meses
  const generateMonthMarkers = () => {
    const months = [];
    let currentDate = new Date(timelineRange.start);
    
    while (currentDate <= timelineRange.end) {
      const monthStart = startOfMonth(currentDate);
      const offset = differenceInDays(monthStart, timelineRange.start);
      
      months.push({
        date: monthStart,
        label: format(monthStart, 'MMM yyyy', { locale: ptBR }),
        position: `${(offset / totalDays) * 100}%`
      });
      
      currentDate = addDays(endOfMonth(currentDate), 1);
    }
    
    return months;
  };

  const monthMarkers = generateMonthMarkers();

  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic-inset p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Timeline do Projeto</h3>
      </div>

      {/* Cabeçalho do Timeline */}
      <div className="relative mb-4 pb-4 border-b border-gray-200">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          {monthMarkers.map((month, index) => (
            <div 
              key={index}
              className="absolute"
              style={{ left: month.position }}
            >
              <div className="font-semibold">{month.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="relative">
        {/* Linha do Hoje */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
          style={{ left: getTodayPosition() }}
        >
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Hoje
            </div>
          </div>
        </div>

        {/* Linhas verticais de grade */}
        {monthMarkers.map((month, index) => (
          <div
            key={index}
            className="absolute top-0 bottom-0 w-px bg-gray-200"
            style={{ left: month.position }}
          />
        ))}

        {/* Marcos do Projeto */}
        {milestones && milestones.length > 0 && (
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-700 mb-3">Marcos</div>
            <div className="relative h-12 bg-gray-100 rounded-lg shadow-neumorphic-inset">
              {milestones.map((milestone, index) => {
                const position = getMilestonePosition(milestone);
                if (!position) return null;

                return (
                  <div
                    key={index}
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                    style={{ left: position.left }}
                  >
                    <div className="relative group">
                      <div className={`w-4 h-4 rotate-45 ${
                        milestone.completed ? 'bg-green-500' : 'bg-yellow-500'
                      } shadow-neumorphic-soft cursor-pointer`}></div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                        <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                          <div className="font-semibold">{milestone.name}</div>
                          <div className="text-gray-300">
                            {format(new Date(milestone.due_date), 'dd/MM/yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tarefas */}
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const position = getTaskPosition(task);
            if (!position) return null;

            const StatusIcon = getStatusIcon(task.status);
            const assignedUser = users.find(u => u.id === task.assigned_to);

            return (
              <div key={task.id} className="relative">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <StatusIcon 
                      className="w-4 h-4" 
                      style={{ color: getStatusColor(task.status) }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {task.title}
                    </div>
                  </div>
                  {assignedUser && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                        {assignedUser.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative h-8 bg-gray-100 rounded-lg shadow-neumorphic-inset">
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 h-6 rounded-lg shadow-neumorphic-soft cursor-pointer group transition-all duration-200 hover:h-7"
                    style={{
                      left: position.left,
                      width: position.width,
                      backgroundColor: getStatusColor(task.status)
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                      <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                        <div className="font-semibold mb-1">{task.title}</div>
                        <div className="text-gray-300">
                          {format(new Date(task.start_date), 'dd/MM/yyyy')} → {format(new Date(task.due_date), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-gray-300 mt-1">
                          Duração: {differenceInDays(new Date(task.due_date), new Date(task.start_date)) + 1} dias
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma tarefa com datas definidas</p>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Não Iniciado</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Em Progresso</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rotate-45 bg-yellow-500"></div>
            <span className="text-gray-600">Marco</span>
          </div>
        </div>
      </div>
    </div>
  );
}