import React from "react";
import { Image, Video, Eye, Edit, Download, ExternalLink, CheckCircle, Circle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AssetCard({ asset, collection, brand, viewMode, isSelected, onSelect, onView, onEdit, onDelete }) {
  const getTypeIcon = (type) => {
    switch(type) {
      case 'video':
      case 'reel':
        return Video;
      case 'foto':
      default:
        return Image;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      foto: "bg-blue-100 text-blue-700",
      video: "bg-purple-100 text-purple-700",
      reel: "bg-pink-100 text-pink-700",
      story: "bg-orange-100 text-orange-700",
      post: "bg-green-100 text-green-700"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status) => {
    const colors = {
      rascunho: "bg-gray-100 text-gray-700",
      em_revisao: "bg-yellow-100 text-yellow-700",
      aprovado: "bg-green-100 text-green-700",
      publicado: "bg-blue-100 text-blue-700",
      arquivado: "bg-red-100 text-red-700"
    };
    return colors[status] || colors.rascunho;
  };

  const TypeIcon = getTypeIcon(asset.type);

  if (viewMode === "list") {
    return (
      <div className={`bg-gray-100 rounded-2xl shadow-neumorphic p-4 hover:shadow-neumorphic-pressed transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex items-center gap-4">
          {/* Checkbox de Seleção */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="flex-shrink-0"
          >
            {isSelected ? (
              <CheckCircle className="w-6 h-6 text-blue-600" />
            ) : (
              <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500" />
            )}
          </button>

          <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center shadow-neumorphic-inset flex-shrink-0 overflow-hidden">
            {asset.cover_url ? (
              <img src={asset.cover_url} alt={asset.name} className="w-full h-full object-cover" />
            ) : (
              <TypeIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 mb-1 truncate">{asset.name}</h3>
            {asset.description && (
              <p className="text-sm text-gray-600 line-clamp-1">{asset.description}</p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getTypeColor(asset.type)}`}>
                {asset.type}
              </span>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(asset.status)}`}>
                {asset.status}
              </span>
              {collection && (
                <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 shadow-neumorphic-inset">
                  {collection.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onView}
              className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-100 rounded-2xl shadow-neumorphic overflow-hidden hover:shadow-neumorphic-pressed transition-all duration-300 relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Checkbox de Seleção no canto superior esquerdo */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="absolute top-3 left-3 z-10"
      >
        {isSelected ? (
          <CheckCircle className="w-6 h-6 text-blue-600 drop-shadow-lg" />
        ) : (
          <Circle className="w-6 h-6 text-white hover:text-blue-500 drop-shadow-lg" />
        )}
      </button>

      <div 
        className="relative h-48 bg-gray-200 cursor-pointer group"
        onClick={onView}
      >
        {asset.cover_url ? (
          <img
            src={asset.cover_url}
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getTypeColor(asset.type)} shadow-neumorphic-soft`}>
            {asset.type}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 truncate">{asset.name}</h3>
        {asset.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{asset.description}</p>
        )}

        <div className="flex gap-2 mb-3 flex-wrap">
          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(asset.status)}`}>
            {asset.status}
          </span>
          {collection && (
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 shadow-neumorphic-inset">
              {collection.name}
            </span>
          )}
          {brand && (
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700">
              {brand.name}
            </span>
          )}
        </div>

        {asset.tags && asset.tags.length > 0 && (
          <div className="flex gap-1 mb-3 flex-wrap">
            {asset.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 rounded text-xs text-gray-600 bg-gray-100 shadow-neumorphic-inset">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100 font-semibold"
          >
            <Edit className="w-3 h-3 mr-2" />
            Editar
          </Button>
          {asset.file_links && asset.file_links.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(asset.file_links[0].url, '_blank')}
              className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}