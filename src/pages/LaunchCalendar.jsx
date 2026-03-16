
import React, { useState, useEffect } from "react";
import { LaunchCalendar as LaunchCalendarEntity } from "@/api/entities";
import { Collection } from "@/api/entities";
import { User } from "@/api/entities";
import { Department } from "@/api/entities";
import { Brand } from "@/api/entities";
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock } from "lucide-react";
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
  const [brands, setBrands] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    collection: "all",
    department: "all",
    status: "all"
  });
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialDate, setInitialDate] = useState(null);
  const [eventsLocked, setEventsLocked] = useState(false);

  useEffect(() => {
    loadData();
    loadCurrentUser();
    loadSettings();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'calendar_events_locked')
        .single();
      if (data) {
        setEventsLocked(data.value === 'true');
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const toggleEventsLocked = async () => {
    const newValue = !eventsLocked;
    try {
      await supabase
        .from('settings')
        .update({ value: String(newValue), updated_date: new Date().toISOString() })
        .eq('key', 'calendar_events_locked');
      setEventsLocked(newValue);
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
      alert("Erro ao atualizar configuração");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('full_name');

      const [eventsData, collectionsData, departmentsData, brandsData] = await Promise.all([
        LaunchCalendarEntity.list("start_date"),
        Collection.list("name"),
        Department.list("name"),
        Brand.list("name")
      ]);

      setEvents(eventsData);
      setCollections(collectionsData);
      setUsers(usersData || []);
      setDepartments(departmentsData);
      setBrands(brandsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setLoading(false);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      const allowedFields = [
        'title', 'description', 'type', 'start_date', 'end_date',
        'collection', 'department', 'departments', 'attendees', 'location', 'status',
        'category', 'brand_id', 'color', 'tags'
      ];

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

      if (cleanEventData.brand_id && cleanEventData.color) {
        try {
          await Brand.update(cleanEventData.brand_id, { color: cleanEventData.color });
          setBrands(prev => prev.map(b =>
            b.id === cleanEventData.brand_id ? { ...b, color: cleanEventData.color } : b
          ));
        } catch (brandError) {
          console.error("Erro ao salvar cor da marca:", brandError);
        }
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

  const handleDeleteEvent = async (eventId) => {
    try {
      await LaunchCalendarEntity.delete(eventId);
      setSelectedEvent(null);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      alert("Erro ao excluir evento: " + (error.message || "Tente novamente"));
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(null);
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
      const categoryMatch = filters.category === "all" || event.category === filters.category;
      const collectionMatch = filters.collection === "all" || event.collection === filters.collection;
      const departmentMatch = filters.department === "all" ||
        (event.departments && event.departments.includes(filters.department)) ||
        event.department === filters.department;
      const statusMatch = filters.status === "all" || event.status === filters.status;

      return typeMatch && categoryMatch && collectionMatch && departmentMatch && statusMatch;
    });
  };

  const filteredEvents = getFilteredEvents();

  const canCreateEvents = currentUser?.role === 'admin' || !eventsLocked;
  const isAdmin = currentUser?.role === 'admin';

  const handleDateDoubleClick = (date) => {
    if (!canCreateEvents) return;
    setEditingEvent(null);
    setShowForm(true);
    setInitialDate(date);
  };

  // Navigation logic per view mode
  const navigateBack = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "year") newDate.setFullYear(newDate.getFullYear() - 1);
    else if (viewMode === "semester") newDate.setMonth(newDate.getMonth() - 6);
    else if (viewMode === "quarter") newDate.setMonth(newDate.getMonth() - 3);
    else if (viewMode === "month") newDate.setMonth(newDate.getMonth() - 1);
    else if (viewMode === "week") newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const navigateForward = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "year") newDate.setFullYear(newDate.getFullYear() + 1);
    else if (viewMode === "semester") newDate.setMonth(newDate.getMonth() + 6);
    else if (viewMode === "quarter") newDate.setMonth(newDate.getMonth() + 3);
    else if (viewMode === "month") newDate.setMonth(newDate.getMonth() + 1);
    else if (viewMode === "week") newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Navigation label per view mode
  const getNavigationLabel = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === "year") return String(year);
    if (viewMode === "semester") {
      const sem = month < 6 ? 1 : 2;
      return `${sem}\u00BA Semestre ${year}`;
    }
    if (viewMode === "quarter") {
      const q = Math.floor(month / 3) + 1;
      return `${q}\u00BA Trimestre ${year}`;
    }
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const viewModes = [
    { id: 'day', label: 'Dia' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'M\u00EAs' },
    { id: 'quarter', label: 'Trimestre' },
    { id: 'semester', label: 'Semestre' },
    { id: 'year', label: 'Ano' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando calend\u00E1rio...</p>
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
        brands={brands}
        currentUser={currentUser}
        onBack={() => setSelectedEvent(null)}
        onEdit={() => handleEditEvent(selectedEvent)}
        onDelete={handleDeleteEvent}
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
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Calend\u00E1rio de Marketing</h1>
              <p className="text-gray-600">
                Planeje lan\u00E7amentos de cole\u00E7\u00F5es e a\u00E7\u00F5es de marketing
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {isAdmin && (
                <Button
                  onClick={toggleEventsLocked}
                  variant="outline"
                  className={`shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 ${
                    eventsLocked
                      ? 'border-red-300 text-red-600 hover:bg-red-50'
                      : 'border-green-300 text-green-600 hover:bg-green-50'
                  }`}
                  title={eventsLocked ? 'Eventos bloqueados - clique para desbloquear' : 'Eventos liberados - clique para bloquear'}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {eventsLocked ? 'Desbloq. Eventos' : 'Bloq. Eventos'}
                </Button>
              )}
              {canCreateEvents ? (
                <Button
                  onClick={() => {
                    setEditingEvent(null);
                    setInitialDate(null);
                    setShowForm(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-semibold">
                  <Lock className="w-4 h-4" />
                  Eventos bloqueados
                </div>
              )}
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                  onClick={navigateBack}
                  className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={navigateForward}
                  className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-gray-800 capitalize">
                {getNavigationLabel()}
              </span>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl shadow-neumorphic-inset flex-wrap">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      viewMode === mode.id
                        ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {mode.label}
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
          onDateDoubleClick={handleDateDoubleClick}
        />

        {showForm && (
          <CalendarEventForm
            event={editingEvent}
            collections={collections}
            users={users}
            departments={departments}
            brands={brands}
            currentUser={currentUser}
            initialDate={initialDate}
            onSave={handleSaveEvent}
            onBrandsChange={async () => {
              const updated = await Brand.list("name");
              setBrands(updated);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingEvent(null);
              setInitialDate(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
