
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Calendar } from "lucide-react";
import { format } from 'date-fns'; // Import format from date-fns

export default function CalendarEventForm({ event, collections, users, departments, currentUser, onSave, onCancel, initialDate }) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    type: event?.type || "lancamento_colecao",
    collection_id: event?.collection_id || "",
    start_date: event?.start_date || (initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : ""),
    end_date: event?.end_date || "",
    description: event?.description || "",
    location: event?.location || "",
    responsible_users: event?.responsible_users || [],
    status: event?.status || "planejado",
    budget: event?.budget || "",
    color: event?.color || "#3b82f6"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preparar dados para envio, convertendo strings vazias para null em campos numéricos
    const dataToSave = {
      ...formData,
      budget: formData.budget === "" ? null : Number(formData.budget),
      collection_id: formData.collection_id || null,
      end_date: formData.end_date || null,
      location: formData.location || null,
      description: formData.description || null
    };
    
    onSave(dataToSave);
  };

  const eventTypes = [
    { value: "lancamento_colecao", label: "Lançamento de Coleção" },
    { value: "pre_venda", label: "Pré-venda" },
    { value: "campanha_marketing", label: "Campanha de Marketing" },
    { value: "shooting", label: "Sessão de Fotos" },
    { value: "evento", label: "Evento" },
    { value: "social_media", label: "Social Media" },
    { value: "influencer", label: "Ação com Influencer" },
    { value: "outro", label: "Outro" }
  ];

  const eventColors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {event ? "Editar Evento" : "Novo Evento"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Título do Evento *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Lançamento Coleção Verão 2024"
                className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Tipo de Evento *</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                  required
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                >
                  <option value="planejado">Planejado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {(formData.type === "lancamento_colecao" || formData.type === "pre_venda" || formData.type === "campanha_marketing") && (
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Coleção</Label>
                <select
                  value={formData.collection_id}
                  onChange={(e) => setFormData({...formData, collection_id: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                >
                  <option value="">Selecione uma coleção</option>
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.id}>{collection.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Data de Início *</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Data de Término</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detalhes do evento..."
                className="bg-gray-100 shadow-neumorphic-inset border-none h-20 text-gray-800"
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Local</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Endereço ou local do evento"
                className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Orçamento (R$)</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Cor do Evento</Label>
              <div className="grid grid-cols-8 gap-3">
                {eventColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({...formData, color})}
                    className={`
                      w-10 h-10 rounded-xl transition-all duration-200
                      ${formData.color === color
                        ? 'shadow-neumorphic-pressed scale-95'
                        : 'shadow-neumorphic hover:shadow-neumorphic-pressed'}
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100 font-bold"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 font-bold"
          >
            {event ? "Salvar" : "Criar Evento"}
          </Button>
        </div>
      </div>
    </div>
  );
}
