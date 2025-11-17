
import React from "react";
import { Search, Filter, Users as UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UGCFilters({ filters, setFilters, brands, ugcCount }) {
  const tiers = [
    { value: "all", label: "Todos os tiers" },
    { value: "nano", label: "Nano (1K-10K)" },
    { value: "micro", label: "Micro (10K-100K)" },
    { value: "macro", label: "Macro (100K-1M)" },
    { value: "mega", label: "Mega (1M+)" },
    { value: "celebrity", label: "Celebrity (5M+)" },
  ];
  const statuses = [
    { value: "all", label: "Todos os status" },
    { value: "ativo", label: "Ativos" },
    { value: "inativo", label: "Inativos" },
    { value: "favorito", label: "Favoritos" },
    { value: "blacklist", label: "Blacklist" },
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({...prev, [key]: value}));
  };
  
  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-700">Filtros</h3>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <UsersIcon className="w-4 h-4" />
          <span className="font-medium">{ugcCount} resultados</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou @"
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            className="pl-10 bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
          />
        </div>
        <select 
          value={filters.tier}
          onChange={e => handleFilterChange('tier', e.target.value)}
          className="px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700 font-medium"
        >
          {tiers.map(tier => (
            <option key={tier.value} value={tier.value}>{tier.label}</option>
          ))}
        </select>
        <select 
          value={filters.status}
          onChange={e => handleFilterChange('status', e.target.value)}
          className="px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700 font-medium"
        >
          {statuses.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <select 
          value={filters.brand}
          onChange={e => handleFilterChange('brand', e.target.value)}
          className="px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-lg text-gray-700 font-medium"
        >
          <option value="all">Todas as marcas</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
