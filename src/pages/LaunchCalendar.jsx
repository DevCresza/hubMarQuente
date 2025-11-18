
import React, { useState, useEffect } from "react";
import { LaunchCalendar as LaunchCalendarEntity } from "@/api/entities";
import { Collection } from "@/api/entities";
import { User } from "@/api/entities";
import { Department } from "@/api/entities";
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarView from "../components/calendar/CalendarView";
import CalendarEventForm from "../components/calendar/CalendarEventForm";
import CalendarEventDetails from "../components/calendar/CalendarEventDetails";
import CalendarFilters from "../components/calendar/CalendarFilters";
import { supabase } from "@/api/supabaseClient";

export default function LaunchCalendarPage() {
  const [events, setEvents] = useState([]);
  const [collections, setCollections] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const [filters, setFilters] = useState({
    type: "all",
    collection: "all",
    department: "all",
    status: "all"
  });
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialDate, setInitialDate] = useState(null); // New state for initial date on form

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Buscar usuários diretamente do Supabase
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('full_name');

      const [eventsData, collectionsData, departmentsData] = await Promise.all([
        LaunchCalendarEntity.list("start_date"),
        Collection.list("name"),
        Department.list("name")
      ]);

      setEvents(eventsData);
      setCollections(collectionsData);
      setUsers(usersData || []);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setLoading(false);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      // Campos permitidos na tabela launch_calendar
      const allowedFields = [
        'title', 'description', 'type', 'start_date', 'end_date',
        'collection', 'department', 'attendees', 'location', 'status'
      ];

      // Filtrar apenas campos permitidos
      const cleanEventData = {};
      Object.keys(eventData).forEach(key => {
        if (allowedFields.includes(key) && eventData[key] !== undefined) {
          cleanEventData[key] = eventData[key];
        }
      });

      if (editingEvent) {
        await LaunchCalendarEntity.update(editingEvent.id, cleanEventData);
      } else {
        await LaunchCalendarEntity.create(cleanEventData);
      }

      setShowForm(false);
      setEditingEvent(null);
      setInitialDate(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Erro ao salvar evento: " + (error.message || "Tente novamente"));
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(null); // Fechar visualização antes de editar
    setEditingEvent(event);
    setShowForm(true);
    setInitialDate(null);
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
  };

  const getFilteredEvents = () => {
    return events.filter(event => {
      const typeMatch = filters.type === "all" || event.type === filters.type;
      const collectionMatch = filters.collection === "all" || event.collection_id === filters.collection;
      const departmentMatch = filters.department === "all" || event.department_id === filters.department;
      const statusMatch = filters.status === "all" || event.status === filters.status;

      return typeMatch && collectionMatch && departmentMatch && statusMatch;
    });
  };

  const filteredEvents = getFilteredEvents();

  const handleDateDoubleClick = (date) => {
    setEditingEvent(null);
    setShowForm(true);
    setInitialDate(date); // Set the initial date for the form
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  if (selectedEvent) {
    return (
      <CalendarEventDetails
        event={selectedEvent}
        collections={collections}
        users={users}
        departments={departments}
        currentUser={currentUser}
        onBack={() => setSelectedEvent(null)}
        onEdit={() => handleEditEvent(selectedEvent)}
        onUpdate={loadData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Calendário de Marketing</h1>
              <p className="text-gray-600">
                Planeje lançamentos de coleções e ações de marketing
              </p>
            </div>
            <Button 
              onClick={() => {
                setEditingEvent(null);
                setInitialDate(null); // Clear initial date when clicking "Novo Evento" button
                setShowForm(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </div>

          {/* Calendar Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
              >
                Hoje
              </Button>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (viewMode === "month") newDate.setMonth(newDate.getMonth() - 1);
                    else if (viewMode === "week") newDate.setDate(newDate.getDate() - 7);
                    else newDate.setDate(newDate.getDate() - 1);
                    setCurrentDate(newDate);
                  }}
                  className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (viewMode === "month") newDate.setMonth(newDate.getMonth() + 1);
                    else if (viewMode === "week") newDate.setDate(newDate.getDate() + 7);
                    else newDate.setDate(newDate.getDate() + 1);
                    setCurrentDate(newDate);
                  }}
                  className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-gray-800">
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                {['month', 'week', 'day'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      viewMode === mode 
                        ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {mode === 'month' ? 'Mês' : mode === 'week' ? 'Semana' : 'Dia'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <CalendarFilters 
          filters={filters}
          setFilters={setFilters}
          collections={collections}
          departments={departments}
        />

        <CalendarView
          events={filteredEvents}
          currentDate={currentDate}
          viewMode={viewMode}
          onEventClick={handleViewEvent}
          onDateDoubleClick={handleDateDoubleClick} // Pass the new handler
        />

        {showForm && (
          <CalendarEventForm
            event={editingEvent}
            collections={collections}
            users={users}
            departments={departments}
            currentUser={currentUser}
            initialDate={initialDate} // Pass the initial date to the form
            onSave={handleSaveEvent}
            onCancel={() => {
              setShowForm(false);
              setEditingEvent(null);
              setInitialDate(null); // Clear initial date on cancel
            }}
          />
        )}
      </div>
    </div>
  );
}
