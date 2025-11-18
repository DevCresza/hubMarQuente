import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, ExternalLink, Download, Image as ImageIcon, Video, Calendar, User, Tag, Share2 } from "lucide-react";

export default function AssetDetails({ asset, collections, brands, users, currentUser, onBack, onEdit, onUpdate }) {
  const collection = collections.find(c => c.id === asset.collection_id);
  const brand = brands.find(b => b.id === asset.brand_id);
  const creator = users.find(u => u.id === asset.created_by);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video':
      case 'reel':
        return Video;
      default:
        return ImageIcon;
    }
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={onEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              {asset.file_url && (
                <Button
                  onClick={() => window.open(asset.file_url, '_blank')}
                  className="bg-purple-500 hover:bg-purple-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Arquivo
                </Button>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center shadow-neumorphic-soft flex-shrink-0">
              <TypeIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">{asset.name}</h1>
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(asset.status)}`}>
                  {asset.status}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                  {asset.type}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700">
                  {asset.category}
                </span>
              </div>
            </div>
          </div>

          {/* Preview */}
          {(asset.file_url || asset.thumbnail_url) && (
            <div className="bg-gray-100 rounded-2xl shadow-neumorphic-inset p-4 mb-6">
              <div className="max-w-2xl mx-auto">
                {asset.type === 'video' || asset.type === 'reel' ? (
                  <video 
                    src={asset.file_url} 
                    controls 
                    className="w-full rounded-xl shadow-neumorphic-soft"
                    poster={asset.thumbnail_url}
                  />
                ) : (
                  <img
                    src={asset.thumbnail_url || asset.file_url}
                    alt={asset.name}
                    className="w-full rounded-xl shadow-neumorphic-soft"
                  />
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {asset.description && (
            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
              <p className="text-gray-600">{asset.description}</p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {collection && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Coleção</p>
                </div>
                <p className="text-gray-800 font-semibold">{collection.name}</p>
              </div>
            )}

            {brand && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Marca</p>
                </div>
                <p className="text-gray-800 font-semibold">{brand.name}</p>
              </div>
            )}

            {creator && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Criado por</p>
                </div>
                <p className="text-gray-800 font-semibold">{creator.full_name}</p>
              </div>
            )}

            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500 font-semibold">Data de Criação</p>
              </div>
              <p className="text-gray-800 font-semibold">
                {new Date(asset.created_date).toLocaleDateString('pt-BR')}
              </p>
            </div>

            {asset.file_size && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Tamanho do Arquivo</p>
                </div>
                <p className="text-gray-800 font-semibold">{asset.file_size} MB</p>
              </div>
            )}

            {asset.dimensions && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Dimensões</p>
                </div>
                <p className="text-gray-800 font-semibold">
                  {asset.dimensions.width} x {asset.dimensions.height}
                </p>
              </div>
            )}
          </div>

          {/* Channels */}
          {asset.channel && asset.channel.length > 0 && (
            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-800">Canais de Publicação</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                {asset.channel.map(channel => (
                  <span key={channel} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 shadow-neumorphic-soft capitalize">
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {asset.tags && asset.tags.length > 0 && (
            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-800">Tags</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                {asset.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 shadow-neumorphic-inset">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}