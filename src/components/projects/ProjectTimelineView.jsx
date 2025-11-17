import React, { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, User, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function ProjectTimelineView({ project, tasks = [], users }) {
  const tasksWithDates = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(t => t && t.start_date && t.due_date);
  }, [tasks]);

  // Determinar o range de datas baseado nas datas do projeto OU das tarefas
  const dateRange = useMemo(() => {
    const today = new Date();
    
    // Se o projeto tem datas definidas, usar essas
    if (project.start_date && project.due_date) {
      return {
        start: startOfWeek(new Date(project.start_date), { weekStartsOn: 0 }),
        end: endOfWeek(new Date(project.due_date), { weekStartsOn: 0 })
      };
    }

    // Caso contrário, usar as datas das tarefas
    if (tasksWithDates.length === 0) {
      return {
        start: startOfMonth(today),
        end: endOfMonth(addMonths(today, 2))
      };
    }

    try {
      const allDates = tasksWithDates.flatMap(t => {
        try {
          const startDate = new Date(t.start_date);
          const endDate = new Date(t.due_date);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return [];
          }
          
          return [startDate, endDate];
        } catch (e) {
          return [];
        }
      }).filter(d => d instanceof Date && !isNaN(d.getTime()));

      if (allDates.length === 0) {
        return {
          start: startOfMonth(today),
          end: endOfMonth(addMonths(today, 2))
        };
      }

      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

      return {
        start: startOfWeek(startOfMonth(subMonths(minDate, 1)), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(addMonths(maxDate, 1)), { weekStartsOn: 0 })
      };
    } catch (error) {
      console.error("Erro ao calcular intervalo de datas:", error);
      return {
        start: startOfMonth(today),
        end: endOfMonth(addMonths(today, 2))
      };
    }
  }, [tasksWithDates, project.start_date, project.due_date]);

  const days = useMemo(() => {
    try {
      return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    } catch (error) {
      console.error("Erro ao gerar dias:", error);
      return [];
    }
  }, [dateRange]);

  const totalDays = days.length || 1;

  // Agrupar tarefas por seção
  const tasksBySection = useMemo(() => {
    const sections = project.sections || [];
    const grouped = {};
    
    sections.forEach(section => {
      grouped[section.id] = tasksWithDates.filter(t => t.section_id === section.id);
    });
    
    // Tarefas sem seção
    grouped['no_section'] = tasksWithDates.filter(t => !t.section_id);
    
    return grouped;
  }, [tasksWithDates, project.sections]);

  const getTaskPosition = (task) => {
    try {
      const taskStart = new Date(task.start_date);
      const taskEnd = new Date(task.due_date);
      
      if (isNaN(taskStart.getTime()) || isNaN(taskEnd.getTime())) {
        return { left: '0%', width: '0%' };
      }
      
      const startOffset = differenceInDays(taskStart, dateRange.start);
      const duration = differenceInDays(taskEnd, taskStart) + 1;

      return {
        left: `${Math.max(0, (startOffset / totalDays) * 100)}%`,
        width: `${Math.max(1, Math.min(100, (duration / totalDays) * 100))}%`
      };
    } catch (e) {
      console.error("Erro ao calcular posição da tarefa:", e);
      return { left: '0%', width: '0%' };
    }
  };

  const getTaskColor = (status) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-500 border-green-600';
      case 'em_progresso':
        return 'bg-blue-500 border-blue-600';
      default:
        return 'bg-gray-400 border-gray-500';
    }
  };

  const getProjectDuration = () => {
    if (project.start_date && project.due_date) {
      const start = new Date(project.start_date);
      const end = new Date(project.due_date);
      const days = differenceInDays(end, start) + 1;
      return { start, end, days };
    }
    return null;
  };

  const projectDuration = getProjectDuration();

  if (!Array.isArray(tasks) || tasksWithDates.length === 0) {
    return (
      <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-12 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma tarefa com datas</h3>
        <p className="text-gray-600">
          Adicione datas de início e término às tarefas para visualizar a timeline
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">Timeline do Projeto</h3>
            <p className="text-sm text-gray-600">
              {format(dateRange.start, 'dd MMM yyyy', { locale: ptBR })} - {format(dateRange.end, 'dd MMM yyyy', { locale: ptBR })}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Total de Tarefas</p>
              <p className="text-2xl font-bold text-gray-800">{tasksWithDates.length}</p>
            </div>
            {projectDuration && (
              <div className="text-right border-l border-gray-300 pl-4">
                <p className="text-xs text-gray-500">Duração do Projeto</p>
                <p className="text-2xl font-bold text-blue-600">{projectDuration.days} dias</p>
              </div>
            )}
          </div>
        </div>

        {/* Barra de progresso do projeto */}
        {projectDuration && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Período do Projeto</span>
              <span className="text-xs text-gray-600">
                {format(projectDuration.start, 'dd/MM/yyyy')} → {format(projectDuration.end, 'dd/MM/yyyy')}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                style={{ 
                  width: `${Math.min(100, Math.max(0, (differenceInDays(new Date(), projectDuration.start) / projectDuration.days) * 100))}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Timeline Header - Months and Weeks */}
          <div className="mb-4">
            {/* Months */}
            <div className="flex border-b-2 border-gray-300 pb-2 mb-2">
              {(() => {
                const months = [];
                let currentMonth = startOfMonth(dateRange.start);
                
                while (currentMonth <= dateRange.end) {
                  const monthDays = eachDayOfInterval({
                    start: currentMonth,
                    end: endOfMonth(currentMonth)
                  }).filter(day => day >= dateRange.start && day <= dateRange.end);
                  
                  if (monthDays.length > 0) {
                    months.push({
                      date: currentMonth,
                      days: monthDays.length,
                      percentage: (monthDays.length / totalDays) * 100
                    });
                  }
                  
                  currentMonth = addMonths(currentMonth, 1);
                }
                
                return months.map((month, index) => (
                  <div 
                    key={index}
                    style={{ width: `${month.percentage}%` }}
                    className="text-center border-r border-gray-300 last:border-r-0"
                  >
                    <div className="text-sm font-bold text-gray-800 uppercase">
                      {format(month.date, 'MMMM yyyy', { locale: ptBR })}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Days Grid */}
            <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex">
                {days.map((day, index) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <div
                      key={index}
                      className={`flex-1 border-r border-gray-300 last:border-r-0 flex flex-col items-center justify-center text-xs ${
                        isWeekend ? 'bg-gray-300' : 'bg-gray-100'
                      } ${isCurrentDay ? 'bg-blue-400 text-white font-bold' : 'text-gray-600'}`}
                      style={{ minWidth: '20px' }}
                      title={format(day, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                    >
                      <span className="text-[8px]">{format(day, 'EEE', { locale: ptBR }).toUpperCase()}</span>
                      <span className="font-bold">{format(day, 'd')}</span>
                    </div>
                  );
                })}
              </div>
              {/* Indicador de hoje */}
              {(() => {
                const today = new Date();
                if (today >= dateRange.start && today <= dateRange.end) {
                  const todayOffset = differenceInDays(today, dateRange.start);
                  const position = (todayOffset / totalDays) * 100;
                  return (
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{ left: `${position}%` }}
                    >
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                        Hoje
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Tasks by Section */}
          <div className="space-y-6">
            {project.sections?.map(section => {
              const sectionTasks = tasksBySection[section.id] || [];
              if (sectionTasks.length === 0) return null;

              return (
                <div key={section.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
                    <h4 className="font-bold text-gray-800 uppercase text-sm tracking-wide">
                      {section.name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      ({sectionTasks.length} {sectionTasks.length === 1 ? 'tarefa' : 'tarefas'})
                    </span>
                  </div>

                  <div className="space-y-3">
                    {sectionTasks.map((task) => {
                      const position = getTaskPosition(task);
                      const assignedUser = users.find(u => u.id === task.assigned_to);
                      const isOverdue = task.due_date && task.status !== 'concluido' && new Date(task.due_date) < new Date();
                      const duration = differenceInDays(new Date(task.due_date), new Date(task.start_date)) + 1;

                      return (
                        <div key={task.id} className="relative group">
                          {/* Task Info */}
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-48 flex-shrink-0">
                              <div className="flex items-center gap-2 mb-1">
                                {task.status === 'concluido' ? (
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : task.status === 'em_progresso' ? (
                                  <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex-shrink-0" />
                                )}
                                <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600 ml-6">
                                {assignedUser && (
                                  <span className="flex items-center gap-1 truncate">
                                    <User className="w-3 h-3" />
                                    {assignedUser.full_name}
                                  </span>
                                )}
                                {task.estimated_hours && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {task.estimated_hours}h
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Timeline Bar */}
                          <div className="relative h-12 bg-gray-100 rounded-lg shadow-neumorphic-inset">
                            <div
                              className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-lg shadow-lg transition-all group-hover:h-10 border-2 ${
                                getTaskColor(task.status)
                              } ${isOverdue ? 'animate-pulse border-red-500' : ''} flex items-center px-3 cursor-pointer overflow-hidden`}
                              style={position}
                              title={`${task.title}\n${format(new Date(task.start_date), 'dd/MM/yyyy')} - ${format(new Date(task.due_date), 'dd/MM/yyyy')}\nDuração: ${duration} ${duration === 1 ? 'dia' : 'dias'}`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-white text-xs font-bold truncate flex-1">
                                  {task.title}
                                </span>
                                <span className="text-white text-xs font-semibold ml-2 whitespace-nowrap">
                                  {duration}d
                                </span>
                              </div>
                              {/* Indicador de progresso se em progresso */}
                              {task.status === 'em_progresso' && task.estimated_hours && task.actual_hours && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30">
                                  <div 
                                    className="h-full bg-white"
                                    style={{ width: `${Math.min(100, (task.actual_hours / task.estimated_hours) * 100)}%` }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Badges de alerta */}
                            {isOverdue && (
                              <div className="absolute -top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                                <AlertCircle className="w-3 h-3" />
                                Atrasada
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Tarefas sem seção */}
            {tasksBySection['no_section']?.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <h4 className="font-bold text-gray-800 uppercase text-sm tracking-wide">
                    Outras Tarefas
                  </h4>
                  <span className="text-xs text-gray-500">
                    ({tasksBySection['no_section'].length})
                  </span>
                </div>

                <div className="space-y-3">
                  {tasksBySection['no_section'].map((task) => {
                    const position = getTaskPosition(task);
                    const assignedUser = users.find(u => u.id === task.assigned_to);
                    const isOverdue = task.due_date && task.status !== 'concluido' && new Date(task.due_date) < new Date();
                    const duration = differenceInDays(new Date(task.due_date), new Date(task.start_date)) + 1;

                    return (
                      <div key={task.id} className="relative group">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-48 flex-shrink-0">
                            <div className="flex items-center gap-2 mb-1">
                              {task.status === 'concluido' ? (
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : task.status === 'em_progresso' ? (
                                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex-shrink-0" />
                              )}
                              <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 ml-6">
                              {assignedUser && (
                                <span className="flex items-center gap-1 truncate">
                                  <User className="w-3 h-3" />
                                  {assignedUser.full_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="relative h-12 bg-gray-100 rounded-lg shadow-neumorphic-inset">
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-lg shadow-lg transition-all group-hover:h-10 border-2 ${
                              getTaskColor(task.status)
                            } ${isOverdue ? 'animate-pulse border-red-500' : ''} flex items-center px-3 cursor-pointer overflow-hidden`}
                            style={position}
                            title={`${task.title}\n${format(new Date(task.start_date), 'dd/MM/yyyy')} - ${format(new Date(task.due_date), 'dd/MM/yyyy')}\nDuração: ${duration} ${duration === 1 ? 'dia' : 'dias'}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-white text-xs font-bold truncate flex-1">
                                {task.title}
                              </span>
                              <span className="text-white text-xs font-semibold ml-2 whitespace-nowrap">
                                {duration}d
                              </span>
                            </div>
                          </div>

                          {isOverdue && (
                            <div className="absolute -top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                              <AlertCircle className="w-3 h-3" />
                              Atrasada
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-8 pt-4 border-t border-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 rounded bg-gray-400 border-2 border-gray-500"></div>
              <span className="text-xs text-gray-700 font-medium">Não Iniciado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 rounded bg-blue-500 border-2 border-blue-600"></div>
              <span className="text-xs text-gray-700 font-medium">Em Progresso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 rounded bg-green-500 border-2 border-green-600"></div>
              <span className="text-xs text-gray-700 font-medium">Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-6 bg-red-500"></div>
              <span className="text-xs text-gray-700 font-medium">Hoje</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}