
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Calendar, Check, Palette, Tag, Plus } from "lucide-react";
import { format } from 'date-fns';
import { Brand } from "@/api/entities";

const brandColors = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#10b981", label: "Verde" },
  { value: "#f97316", label: "Laranja" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#84cc16", label: "Lima" },
  { value: "#f59e0b", label: "Âmbar" },
  { value: "#6366f1", label: "Índigo" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#e11d48", label: "Cereja" },
];

export default function CalendarEventForm({ event, collections, users, departments, brands = [], currentUser, onSave, onCancel, onBrandsChange, initialDate }) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    type: event?.type || "lancamento_colecao",
    collection: event?.collection || "",
    start_date: event?.start_date || (initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : ""),
    end_date: event?.end_date || "",
    description: event?.description || "",
    location: event?.location || "",
    attendees: event?.attendees || [],
    department: event?.department || "",
    status: event?.status || "planejado",
    brand_id: event?.brand_id || "",
    color: event?.color || "",
    tags: event?.tags || []
  });

  const [tagInput, setTagInput] = useState("");
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandColor, setNewBrandColor] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setSavingBrand(true);
    try {
      const created = await Brand.create({
        name: newBrandName.trim(),
        color: newBrandColor || null,
      });
      // Notificar o pai para atualizar a lista de brands
      if (onBrandsChange) onBrandsChange();
      // Selecionar a marca recém-criada
      setFormData({ ...formData, brand_id: created.id, color: newBrandColor || formData.color });
      setNewBrandName("");
      setNewBrandColor("");
      setShowNewBrand(false);
    } catch (error) {
      console.error("Erro ao criar marca:", error);
      alert("Erro ao criar marca: " + (error.message || "Tente novamente"));
    }
    setSavingBrand(false);
  };

  // Atualizar formData quando event mudar (para modo de edição)
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        type: event.type || "lancamento_colecao",
        collection: event.collection || "",
        start_date: event.start_date || "",
        end_date: event.end_date || "",
        description: event.description || "",
        location: event.location || "",
        attendees: event.attendees || [],
        department: event.department || "",
        status: event.status || "planejado",
        brand_id: event.brand_id || "",
        color: event.color || "",
        tags: event.tags || []
      });
    } else {
      setFormData({
        title: "",
        type: "lancamento_colecao",
        collection: "",
        start_date: initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : "",
        end_date: "",
        description: "",
        location: "",
        attendees: [],
        department: "",
        status: "planejado",
        brand_id: "",
        color: "",
        tags: []
      });
    }
  }, [event, initialDate]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Campos permitidos na tabela launch_calendar
    const allowedFields = [
      'title', 'description', 'type', 'start_date', 'end_date',
      'collection', 'department', 'attendees', 'location', 'status',
      'brand_id', 'color', 'tags'
    ];

    // Preparar dados para envio
    const dataToSave = {};
    Object.keys(formData).forEach(key => {
      if (allowedFields.includes(key)) {
        // Converter strings vazias para null
        if (formData[key] === "" || (Array.isArray(formData[key]) && formData[key].length === 0)) {
          dataToSave[key] = null;
        } else {
          dataToSave[key] = formData[key];
        }
      }
    });

    // Se end_date não foi fornecido, usar start_date como padrão (campo obrigatório)
    if (!dataToSave.end_date && dataToSave.start_date) {
      dataToSave.end_date = dataToSave.start_date;
    }

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

            <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Coleção</Label>
                <select
                  value={formData.collection}
                  onChange={(e) => setFormData({...formData, collection: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                >
                  <option value="">Selecione uma coleção</option>
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.id}>{collection.name}</option>
                  ))}
                </select>
            </div>

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
                <Label className="text-gray-700 mb-2 block font-semibold">Data de Término *</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                  required
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
              <Label className="text-gray-700 mb-2 block font-semibold">Departamento</Label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
              >
                <option value="">Selecione um departamento</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-gray-700 font-semibold">Marca</Label>
                <button
                  type="button"
                  onClick={() => setShowNewBrand(!showNewBrand)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {showNewBrand ? 'Cancelar' : 'Nova Marca'}
                </button>
              </div>

              {showNewBrand ? (
                <div className="bg-gray-100 shadow-neumorphic-inset rounded-xl p-4 space-y-3">
                  <Input
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Nome da marca"
                    className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateBrand(); } }}
                  />
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">Cor da marca:</p>
                    <div className="flex gap-2 flex-wrap">
                      {brandColors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setNewBrandColor(newBrandColor === color.value ? "" : color.value)}
                          className={`w-7 h-7 rounded-full transition-all duration-200 flex items-center justify-center ${
                            newBrandColor === color.value
                              ? 'ring-2 ring-offset-1 ring-gray-400 scale-110'
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        >
                          {newBrandColor === color.value && <Check className="w-3 h-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleCreateBrand}
                    disabled={!newBrandName.trim() || savingBrand}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft text-sm disabled:opacity-50"
                  >
                    {savingBrand ? 'Criando...' : 'Criar Marca'}
                  </Button>
                </div>
              ) : (
                <>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => {
                      const selectedBrandId = e.target.value;
                      const selectedBrand = brands.find(b => b.id === selectedBrandId);
                      setFormData({
                        ...formData,
                        brand_id: selectedBrandId,
                        color: selectedBrand?.color || formData.color
                      });
                    }}
                    className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                  >
                    <option value="">Selecione uma marca</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}{brand.color ? ` — ${brandColors.find(c => c.value === brand.color)?.label || ''}` : ''}
                      </option>
                    ))}
                  </select>
                  {formData.brand_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      A cor escolhida abaixo será salva como padrão desta marca
                    </p>
                  )}
                </>
              )}
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">
                <Palette className="w-4 h-4 inline mr-1" />
                Cor {formData.brand_id ? 'da Marca' : 'do Evento'}
              </Label>
              <div className="bg-gray-100 shadow-neumorphic-inset rounded-xl p-4">
                <div className="flex gap-2 flex-wrap">
                  {brandColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({...formData, color: formData.color === color.value ? "" : color.value})}
                      className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center ${
                        formData.color === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-400 shadow-neumorphic-pressed scale-110'
                          : 'shadow-neumorphic-soft hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    >
                      {formData.color === color.value && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
                {formData.color && (
                  <p className="text-xs text-gray-500 mt-2">
                    Cor selecionada: {brandColors.find(c => c.value === formData.color)?.label || formData.color}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Digite uma tag..."
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft"
                >
                  Adicionar
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 shadow-neumorphic-inset flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
