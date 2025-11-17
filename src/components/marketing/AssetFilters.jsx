import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AssetFilters({ filters, setFilters, collections, brands, assetCount }) {
  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Filtros</h3>
        <span className="text-sm text-gray-500">({assetCount} assets)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Buscar assets..."
              className="pl-10 bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
            />
          </div>
        </div>

        <div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todos os Tipos</option>
            <option value="foto">Foto</option>
            <option value="video">Vídeo</option>
            <option value="reel">Reel</option>
            <option value="story">Story</option>
            <option value="post">Post</option>
          </select>
        </div>

        <div>
          <select
            value={filters.collection}
            onChange={(e) => setFilters({...filters, collection: e.target.value})}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todas Coleções</option>
            {collections.map(collection => (
              <option key={collection.id} value={collection.id}>{collection.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.brand}
            onChange={(e) => setFilters({...filters, brand: e.target.value})}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todas Marcas</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todos Status</option>
            <option value="rascunho">Rascunho</option>
            <option value="em_revisao">Em Revisão</option>
            <option value="aprovado">Aprovado</option>
            <option value="publicado">Publicado</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </div>

        <div>
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="w-full px-4 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium text-sm"
          >
            <option value="all">Todas Categorias</option>
            <option value="campanha">Campanha</option>
            <option value="produto">Produto</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="evento">Evento</option>
            <option value="editorial">Editorial</option>
            <option value="ugc">UGC</option>
          </select>
        </div>
      </div>
    </div>
  );
}