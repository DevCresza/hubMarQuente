import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";

const eventTypeColors = {
    lancamento_colecao: "#3b82f6",
    pre_venda: "#8b5cf6",
    campanha_marketing: "#f59e0b",
    shooting: "#ec4899",
    evento: "#10b981",
    social_media: "#06b6d4",
    influencer: "#f97316",
    outro: "#6b7280",
    launch: "#3b82f6",
    photoshoot: "#ec4899",
    meeting: "#6b7280",
    event: "#10b981"
  };

  const getEventColor = (event) => event.color || eventTypeColors[event.type] || "#3b82f6";

export default function CalendarView({ events, currentDate, viewMode, onEventClick, onDateDoubleClick }) {
  const [selectedDayEvents, setSelectedDayEvents] = useState(null); // { date, events }

  // Mini month component used by quarter, semester and year views
  const renderMiniMonth = (monthDate) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = calStart;

    while (day <= calEnd) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const inMonth = isSameMonth(day, monthStart);
        const dayEvents = inMonth ? events.filter(event =>
          isSameDay(new Date(event.start_date), cloneDay)
        ) : [];
        const hasEvents = dayEvents.length > 0;
        const today = isToday(day);

        // Get the dominant color for this day (first event's color)
        const dominantColor = hasEvents ? getEventColor(dayEvents[0]) : null;
        // If multiple events, show a gradient hint
        const multipleEvents = dayEvents.length > 1;

        days.push(
          <div
            key={day.toString()}
            onClick={() => {
              if (hasEvents) {
                setSelectedDayEvents({ date: cloneDay, events: dayEvents });
              }
            }}
            className={`
              relative w-7 h-7 flex items-center justify-center text-xs rounded-md transition-all duration-200
              ${!inMonth ? 'text-gray-300' : 'text-gray-700'}
              ${today ? 'font-bold ring-1 ring-blue-400' : ''}
              ${hasEvents ? 'cursor-pointer hover:scale-110 font-semibold' : ''}
            `}
            style={hasEvents ? {
              backgroundColor: dominantColor,
              color: '#fff',
              boxShadow: multipleEvents ? `0 0 0 2px ${dominantColor}40, inset 0 0 0 1px rgba(255,255,255,0.3)` : undefined
            } : undefined}
            title={hasEvents ? `${dayEvents.length} evento(s)` : ''}
          >
            {format(day, 'd')}
            {multipleEvents && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full text-[8px] font-bold flex items-center justify-center shadow-sm"
                style={{ color: dominantColor }}
              >
                {dayEvents.length}
              </span>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-0.5">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="bg-gray-100 rounded-xl shadow-neumorphic p-3">
        <h3 className="text-sm font-bold text-gray-800 mb-2 text-center capitalize">
          {format(monthDate, 'MMMM', { locale: ptBR })}
        </h3>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="w-7 h-5 flex items-center justify-center text-[10px] font-semibold text-gray-400">
              {d}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  // Events popup for compact views
  const renderEventsPopup = () => {
    if (!selectedDayEvents) return null;

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDayEvents(null)}>
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">
              {format(selectedDayEvents.date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            <button onClick={() => setSelectedDayEvents(null)} className="p-1 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="space-y-2">
            {selectedDayEvents.events.map(event => (
              <div
                key={event.id}
                onClick={() => { setSelectedDayEvents(null); onEventClick(event); }}
                className="p-3 rounded-xl cursor-pointer hover:opacity-80 transition-all duration-200"
                style={{ backgroundColor: getEventColor(event) }}
              >
                <div className="text-white font-semibold text-sm">{event.title}</div>
                <div className="text-white/80 text-xs mt-1">
                  {format(new Date(event.start_date), 'HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMultiMonthView = (months, gridCols) => {
    return (
      <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
        <div className={`grid ${gridCols} gap-4`}>
          {months.map((monthDate, i) => (
            <div key={i}>
              {renderMiniMonth(monthDate)}
            </div>
          ))}
        </div>
        {renderEventsPopup()}
      </div>
    );
  };

  const renderQuarterView = () => {
    const year = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const quarterStart = Math.floor(currentMonth / 3) * 3;
    const months = [0, 1, 2].map(i => new Date(year, quarterStart + i, 1));

    return renderMultiMonthView(months, 'grid-cols-1 md:grid-cols-3');
  };

  const renderSemesterView = () => {
    const year = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const semesterStart = currentMonth < 6 ? 0 : 6;
    const months = [0, 1, 2, 3, 4, 5].map(i => new Date(year, semesterStart + i, 1));

    return renderMultiMonthView(months, 'grid-cols-2 md:grid-cols-3');
  };

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

    return renderMultiMonthView(months, 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4');
  };

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
                  style={{ backgroundColor: getEventColor(event) }}
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
                style={{ backgroundColor: getEventColor(event) }}
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
                    style={{ backgroundColor: getEventColor(event) }}
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
  if (viewMode === 'quarter') return renderQuarterView();
  if (viewMode === 'semester') return renderSemesterView();
  if (viewMode === 'year') return renderYearView();
  return renderMonthView();
}
