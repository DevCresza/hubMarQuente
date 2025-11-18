
import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TicketFilters({ filters, setFilters, departments, ticketCount }) {
  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Filtros</h3>
        <span className="text-sm text-gray-500">({ticketCount} chamados)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Buscar chamados..."
              className="pl-10 bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
            />
          </div>
        </div>

        <div>
          <select
            value={filters.view}
            onChange={(e) => setFilters({ ...filters, view: e.target.value })}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="meus">Meus Chamados</option>
            <option value="atribuidos">Atribuídos a Mim</option>
            <option value="departamento">Meu Departamento</option>
            <option value="todos">Todos</option>
          </select>
        </div>

        <div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todos Status</option>
            <option value="open">Aberto</option>
            <option value="in_progress">Em Atendimento</option>
            <option value="resolved">Resolvido</option>
            <option value="closed">Fechado</option>
          </select>
        </div>

        <div>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todas Prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>

        <div>
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todos Departamentos</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todos Tipos</option>
            <option value="request">Solicitação</option>
            <option value="task">Tarefa</option>
            <option value="bug">Problema/Bug</option>
            <option value="question">Pergunta</option>
          </select>
        </div>
      </div>
    </div>
  );
}
