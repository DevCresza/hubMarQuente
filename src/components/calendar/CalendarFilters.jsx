import React from "react";
import { Filter } from "lucide-react";

export default function CalendarFilters({ filters, setFilters, collections, departments }) {
  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-gray-500 font-semibold mb-2 block">Tipo de Evento</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todos os Tipos</option>
            <option value="lancamento_colecao">Lançamento de Coleção</option>
            <option value="pre_venda">Pré-venda</option>
            <option value="campanha_marketing">Campanha de Marketing</option>
            <option value="shooting">Sessão de Fotos</option>
            <option value="evento">Evento</option>
            <option value="social_media">Social Media</option>
            <option value="influencer">Ação com Influencer</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-semibold mb-2 block">Coleção</label>
          <select
            value={filters.collection}
            onChange={(e) => setFilters({...filters, collection: e.target.value})}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todas as Coleções</option>
            {collections.map(collection => (
              <option key={collection.id} value={collection.id}>{collection.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-semibold mb-2 block">Departamento</label>
          <select
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todos os Departamentos</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-semibold mb-2 block">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="planejado">Planejado</option>
            <option value="confirmado">Confirmado</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>
    </div>
  );
}