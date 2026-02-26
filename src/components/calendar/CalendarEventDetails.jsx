import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Users, Building2, Palette, Tag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarEventDetails({ event, collections, users, departments, brands = [], currentUser, onBack, onEdit, onUpdate }) {
  const collection = collections.find(c => c.id === event.collection);
  const department = departments.find(d => d.id === event.department);
  const brand = brands.find(b => b.id === event.brand_id);

  const getEventTypeLabel = (type) => {
    const types = {
      lancamento_colecao: "Lançamento de Coleção",
      pre_venda: "Pré-venda",
      campanha_marketing: "Campanha de Marketing",
      shooting: "Sessão de Fotos",
      evento: "Evento",
      social_media: "Social Media",
      influencer: "Ação com Influencer",
      outro: "Outro",
      // Compatibilidade com valores antigos
      launch: "Lançamento",
      photoshoot: "Sessão de Fotos",
      meeting: "Reunião",
      event: "Evento"
    };
    return types[type] || type;
  };

  const getEventTypeColor = (type) => {
    const colors = {
      lancamento_colecao: "#3b82f6",
      pre_venda: "#8b5cf6",
      campanha_marketing: "#f59e0b",
      shooting: "#ec4899",
      evento: "#10b981",
      social_media: "#06b6d4",
      influencer: "#f97316",
      outro: "#6b7280",
      launch: "#3b82f6",
      photoshoot: "#ec4899",
      meeting: "#6b7280",
      event: "#10b981"
    };
    return colors[type] || "#3b82f6";
  };

  const getStatusColor = (status) => {
    const colors = {
      planejado: "bg-gray-100 text-gray-700",
      confirmado: "bg-blue-100 text-blue-700",
      em_andamento: "bg-yellow-100 text-yellow-700",
      concluido: "bg-green-100 text-green-700",
      cancelado: "bg-red-100 text-red-700",
      // Compatibilidade com valores antigos
      scheduled: "bg-gray-100 text-gray-700",
      confirmed: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status) => {
    const labels = {
      planejado: "Planejado",
      confirmado: "Confirmado",
      em_andamento: "Em Andamento",
      concluido: "Concluído",
      cancelado: "Cancelado",
      // Compatibilidade com valores antigos
      scheduled: "Agendado",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado"
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={onEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>

          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-neumorphic-soft flex-shrink-0"
              style={{ backgroundColor: event.color || getEventTypeColor(event.type) }}
            >
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">{event.title}</h1>
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(event.status)}`}>
                  {getStatusLabel(event.status)}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700">
                  {getEventTypeLabel(event.type)}
                </span>
                {brand && (
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-700">
                    {brand.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500 font-semibold">Data de Início</p>
              </div>
              <p className="text-gray-800 font-semibold">
                {format(new Date(event.start_date), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>

            {event.end_date && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Data de Término</p>
                </div>
                <p className="text-gray-800 font-semibold">
                  {format(new Date(event.end_date), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}

            {event.location && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Local</p>
                </div>
                <p className="text-gray-800 font-semibold">{event.location}</p>
              </div>
            )}

            {department && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Departamento</p>
                </div>
                <p className="text-gray-800 font-semibold">{department.name}</p>
              </div>
            )}

            {collection && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-semibold">Coleção</p>
                </div>
                <p className="text-gray-800 font-semibold">{collection.name}</p>
              </div>
            )}
          </div>

          {(brand || event.color) && (
            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-800">Marca / Cor</h3>
              </div>
              <div className="flex items-center gap-3">
                {event.color && (
                  <div
                    className="w-8 h-8 rounded-full shadow-neumorphic-soft"
                    style={{ backgroundColor: event.color }}
                  />
                )}
                {brand && <span className="text-gray-700 font-medium">{brand.name}</span>}
              </div>
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-800">Tags</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                {event.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-200 rounded-lg text-sm font-semibold text-gray-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.description && (
            <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}