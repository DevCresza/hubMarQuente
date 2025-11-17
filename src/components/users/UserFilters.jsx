import React from "react";
import { Search, Filter, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UserFilters({ filters, setFilters, departments, userCount }) {
  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-700">Filtros</h3>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{userCount} usuários</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar usuários..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="pl-10 bg-gray-100 shadow-neumorphic-inset border-none"
          />
        </div>

        {/* Department */}
        <select
          value={filters.department}
          onChange={(e) => setFilters({...filters, department: e.target.value})}
          className="px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700"
        >
          <option value="all">Todos os departamentos</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>

        {/* Role */}
        <select
          value={filters.role}
          onChange={(e) => setFilters({...filters, role: e.target.value})}
          className="px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700"
        >
          <option value="all">Todos os papéis</option>
          <option value="admin">Administradores</option>
          <option value="manager">Gerentes</option>
          <option value="user">Usuários</option>
        </select>
      </div>

      {/* Clear Filters */}
      {(filters.search || filters.department !== 'all' || filters.status !== 'active' || filters.role !== 'all') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setFilters({ search: "", department: "all", status: "active", role: "all" })}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
}