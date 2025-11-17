import React, { useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TaskFilters({ filters, setFilters, users, currentUser, taskCount }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="mb-6">
      {/* View Tabs - Destaque */}
      <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-xl shadow-neumorphic w-fit">
        <button
          onClick={() => setFilters({...filters, view: "minhas"})}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            filters.view === "minhas" 
              ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Minhas Tarefas
        </button>
        <button
          onClick={() => setFilters({...filters, view: "atribuidas"})}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            filters.view === "atribuidas" 
              ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Atribuídas por Mim
        </button>
        <button
          onClick={() => setFilters({...filters, view: "todas"})}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            filters.view === "todas" 
              ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Todas
        </button>
      </div>

      {/* Busca Rápida */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar tarefas..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="pl-10 bg-gray-100 shadow-neumorphic-inset border-none"
          />
        </div>

        {/* Botão de Filtros Avançados */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            showAdvanced || filters.status !== 'all' || filters.priority !== 'all' || filters.assigned_to !== 'all'
              ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600'
              : 'shadow-neumorphic-soft bg-gray-100 text-gray-600 hover:text-gray-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {(filters.status !== 'all' || filters.priority !== 'all' || filters.assigned_to !== 'all') && (
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filtros Avançados - Colapsável */}
      {showAdvanced && (
        <div className="mt-4 p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700 text-sm"
              >
                <option value="all">Todos</option>
                <option value="nao_iniciado">Não Iniciado</option>
                <option value="em_progresso">Em Progresso</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Prioridade</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700 text-sm"
              >
                <option value="all">Todas</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Responsável</label>
              <select
                value={filters.assigned_to}
                onChange={(e) => setFilters({...filters, assigned_to: e.target.value})}
                className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700 text-sm"
              >
                <option value="all">Todos</option>
                {users.filter(u => u.is_active).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} {user.id === currentUser?.id && "(Você)"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.assigned_to !== 'all') && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setFilters({ search: "", status: "all", priority: "all", assigned_to: "all", view: filters.view })}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}