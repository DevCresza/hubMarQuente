import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { Plus, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TicketCard from "../components/tickets/TicketCard";
import TicketForm from "../components/tickets/TicketForm";
import TicketDetails from "../components/tickets/TicketDetails";
import TicketFilters from "../components/tickets/TicketFilters";
import TicketStats from "../components/tickets/TicketStats";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    department: "all",
    type: "all",
    view: "meus"
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);

    // Buscar usuários diretamente do Supabase
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('full_name');

    const [ticketsData, departmentsData] = await Promise.all([
      base44.entities.Ticket.list("-created_date"),
      base44.entities.Department.list("name")
    ]);

    setTickets(ticketsData);
    setUsers(usersData || []);
    setDepartments(departmentsData);
    setLoading(false);
  };

  const handleSaveTicket = async (ticketData) => {
    try {
      // Campos permitidos na tabela tickets
      const allowedFields = [
        'title', 'description', 'type', 'priority', 'status',
        'department', 'assigned_to', 'tags'
      ];

      // Filtrar apenas campos permitidos
      const cleanTicketData = {};
      Object.keys(ticketData).forEach(key => {
        if (allowedFields.includes(key) && ticketData[key] !== undefined && ticketData[key] !== "") {
          cleanTicketData[key] = ticketData[key];
        }
      });

      if (editingTicket) {
        await base44.entities.Ticket.update(editingTicket.id, cleanTicketData);
      } else {
        // Adicionar created_by apenas na criação
        cleanTicketData.created_by = currentUser?.id;
        await base44.entities.Ticket.create(cleanTicketData);
      }

      setShowForm(false);
      setEditingTicket(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar ticket:", error);
      alert("Erro ao salvar ticket: " + (error.message || "Tente novamente"));
    }
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(null); // Fechar a visualização de detalhes primeiro
    setEditingTicket(ticket);
    setShowForm(true);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === "resolved" || newStatus === "closed") {
        updateData.resolved_date = new Date().toISOString();
      }

      // Filtrar apenas campos permitidos
      const allowedFields = ['status', 'resolved_date'];
      const cleanUpdateData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          cleanUpdateData[key] = updateData[key];
        }
      });

      await base44.entities.Ticket.update(ticketId, cleanUpdateData);
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status do ticket");
    }
  };

  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      const searchMatch =
        ticket.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(filters.search.toLowerCase());

      const statusMatch = filters.status === "all" || ticket.status === filters.status;
      const priorityMatch = filters.priority === "all" || ticket.priority === filters.priority;
      const departmentMatch = filters.department === "all" || ticket.department === filters.department;
      const typeMatch = filters.type === "all" || ticket.type === filters.type;

      const viewMatch =
        filters.view === "todos" ||
        (filters.view === "meus" && ticket.created_by === currentUser?.id) ||
        (filters.view === "atribuidos" && ticket.assigned_to === currentUser?.id) ||
        (filters.view === "departamento" && ticket.department === currentUser?.department_id);

      return searchMatch && statusMatch && priorityMatch && departmentMatch && typeMatch && viewMatch;
    });
  };

  const filteredTickets = getFilteredTickets();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando chamados...</p>
        </div>
      </div>
    );
  }

  if (selectedTicket) {
    return (
      <TicketDetails
        ticket={selectedTicket}
        users={users}
        departments={departments}
        currentUser={currentUser}
        onBack={() => setSelectedTicket(null)}
        onEdit={() => handleEditTicket(selectedTicket)}
        onStatusChange={handleStatusChange}
        onUpdate={loadData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Abertura de Tickets - Marketing</h1>
              <p className="text-gray-600">
                Abra tickets para solicitações ao setor de Marketing
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Ticket
            </Button>
          </div>

          <TicketStats tickets={filteredTickets} currentUser={currentUser} />
        </div>

        <TicketFilters 
          filters={filters}
          setFilters={setFilters}
          departments={departments}
          ticketCount={filteredTickets.length}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              department={departments.find(d => d.id === ticket.department)}
              assignedUser={users.find(u => u.id === ticket.assigned_to)}
              currentUser={currentUser}
              onView={() => handleViewTicket(ticket)}
              onStatusChange={(newStatus) => handleStatusChange(ticket.id, newStatus)}
            />
          ))}
        </div>

        {filteredTickets.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 shadow-neumorphic-inset flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum chamado encontrado</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status !== 'all'
                ? "Tente ajustar os filtros de busca"
                : "Comece abrindo seu primeiro chamado"
              }
            </p>
          </div>
        )}

        {showForm && (
          <TicketForm
            ticket={editingTicket}
            users={users}
            departments={departments}
            currentUser={currentUser}
            onSave={handleSaveTicket}
            onCancel={() => {
              setShowForm(false);
              setEditingTicket(null);
            }}
          />
        )}
      </div>
    </div>
  );
}