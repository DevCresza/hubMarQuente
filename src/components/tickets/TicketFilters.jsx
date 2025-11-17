
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
            <option value="aberto">Aberto</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="aguardando_resposta">Aguardando</option>
            <option value="resolvido">Resolvido</option>
            <option value="fechado">Fechado</option>
          </select>
        </div>

        <div>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todas Prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
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
            <option value="solicitacao">Solicitação</option>
            <option value="problema">Problema</option>
            <option value="suporte_tecnico">Suporte Técnico</option>
            <option value="melhoria">Melhoria</option>
            <option value="duvida">Dúvida</option>
            <option value="manutencao">Manutenção</option>
          </select>
        </div>
      </div>
    </div>
  );
}
