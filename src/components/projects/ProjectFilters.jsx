import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProjectFilters({ filters, setFilters, projectCount }) {
  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Filtros</h3>
        <span className="text-sm text-gray-500">({projectCount} projetos)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Buscar projetos..."
              className="pl-10 bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
            />
          </div>
        </div>

        <div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="planejamento">Planejamento</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="pausado">Pausado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
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
            value={filters.view}
            onChange={(e) => setFilters({...filters, view: e.target.value})}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="meus">Meus Projetos</option>
            <option value="participando">Participando</option>
            <option value="todos">Todos os Projetos</option>
          </select>
        </div>
      </div>
    </div>
  );
}