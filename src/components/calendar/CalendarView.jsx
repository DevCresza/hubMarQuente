import React from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarView({ events, currentDate, viewMode, onEventClick, onDateDoubleClick }) {
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = new Date(day);
        const dayEvents = events.filter(event => 
          isSameDay(new Date(event.start_date), cloneDay)
        );

        days.push(
          <div
            key={day}
            className={`
              min-h-[100px] p-2 border border-gray-200
              ${!isSameMonth(day, monthStart) ? 'bg-gray-50' : 'bg-gray-100'}
              ${isToday(day) ? 'bg-blue-50' : ''}
              hover:bg-gray-200 transition-colors duration-200 cursor-pointer
            `}
            onDoubleClick={() => onDateDoubleClick && onDateDoubleClick(cloneDay)}
          >
            <div className={`
              text-sm font-semibold mb-1
              ${!isSameMonth(day, monthStart) ? 'text-gray-400' : 'text-gray-700'}
              ${isToday(day) ? 'text-blue-600' : ''}
            `}>
              {formattedDate}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                  className="text-xs p-1 rounded cursor-pointer truncate shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
                  style={{ backgroundColor: event.color || '#3b82f6' }}
                >
                  <span className="text-white font-medium">{event.title}</span>
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{dayEvents.length - 3} mais
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7 gap-0">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="bg-gray-100 rounded-2xl shadow-neumorphic overflow-hidden">
        <div className="grid grid-cols-7 gap-0 bg-gray-100 border-b border-gray-200">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-3 text-center font-semibold text-gray-700 text-sm">
              {day}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = events.filter(event => 
        isSameDay(new Date(event.start_date), day)
      );

      days.push(
        <div 
          key={day} 
          className="flex-1 min-w-0 border-r border-gray-200 last:border-r-0 cursor-pointer"
          onDoubleClick={() => onDateDoubleClick && onDateDoubleClick(day)}
        >
          <div className={`
            p-3 text-center border-b border-gray-200 font-semibold
            ${isToday(day) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}
          `}>
            <div className="text-xs">{format(day, 'EEE', { locale: ptBR })}</div>
            <div className="text-lg">{format(day, 'd')}</div>
          </div>
          <div className="p-2 space-y-2 min-h-[400px]">
            {dayEvents.map(event => (
              <div
                key={event.id}
                onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                className="p-2 rounded-lg cursor-pointer shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
                style={{ backgroundColor: event.color || '#3b82f6' }}
              >
                <div className="text-white font-semibold text-sm">{event.title}</div>
                <div className="text-white text-xs opacity-90">
                  {format(new Date(event.start_date), 'HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 rounded-2xl shadow-neumorphic overflow-hidden">
        <div className="flex">
          {days}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = events.filter(event => 
      isSameDay(new Date(event.start_date), currentDate)
    );

    return (
      <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          <p className="text-gray-600">{dayEvents.length} eventos</p>
        </div>

        <div className="space-y-4">
          {dayEvents.length > 0 ? (
            dayEvents.map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="p-4 rounded-xl cursor-pointer shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: event.color || '#3b82f6' }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(event.start_date), 'HH:mm')} - 
                      {event.end_date && ` ${format(new Date(event.end_date), 'HH:mm')}`}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum evento agendado para este dia</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (viewMode === 'week') return renderWeekView();
  if (viewMode === 'day') return renderDayView();
  return renderMonthView();
}