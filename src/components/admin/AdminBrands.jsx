
import React, { useState, useEffect } from "react";
import { Brand } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, X, Check, Palette, Tag } from "lucide-react";

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

export default function AdminBrands({ currentUser }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "",
    logo_url: "",
    website: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const brandsData = await Brand.list("name");
      setBrands(brandsData);
    } catch (error) {
      console.error("Erro ao carregar marcas:", error);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "", logo_url: "", website: "" });
    setEditingBrand(null);
    setShowForm(false);
  };

  const handleEdit = (brand) => {
    setFormData({
      name: brand.name || "",
      description: brand.description || "",
      color: brand.color || "",
      logo_url: brand.logo_url || "",
      website: brand.website || "",
    });
    setEditingBrand(brand);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      const dataToSave = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color || null,
        logo_url: formData.logo_url.trim() || null,
        website: formData.website.trim() || null,
      };

      if (editingBrand) {
        await Brand.update(editingBrand.id, dataToSave);
      } else {
        await Brand.create(dataToSave);
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error("Erro ao salvar marca:", error);
      alert("Erro ao salvar marca: " + (error.message || "Tente novamente"));
    }
  };

  const handleDelete = async (brand) => {
    if (!confirm(`Tem certeza que deseja excluir a marca "${brand.name}"?`)) return;

    try {
      await Brand.delete(brand.id);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir marca:", error);
      alert("Erro ao excluir marca: " + (error.message || "Tente novamente"));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
        <p className="text-gray-600">Carregando marcas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Marcas</h2>
          <p className="text-sm text-gray-500">{brands.length} marca{brands.length !== 1 ? 's' : ''} cadastrada{brands.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Marca
        </Button>
      </div>

      {/* Lista de marcas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map(brand => (
          <div
            key={brand.id}
            className="bg-gray-100 rounded-2xl shadow-neumorphic p-5 flex flex-col"
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-neumorphic-soft flex-shrink-0"
                style={{ backgroundColor: brand.color || "#6b7280" }}
              >
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{brand.name}</h3>
                {brand.color && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: brand.color }}
                    />
                    <span className="text-xs text-gray-500">
                      {brandColors.find(c => c.value === brand.color)?.label || brand.color}
                    </span>
                  </div>
                )}
                {!brand.color && (
                  <span className="text-xs text-orange-500 font-medium">Sem cor definida</span>
                )}
              </div>
            </div>

            {brand.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{brand.description}</p>
            )}

            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline truncate block mb-3"
              >
                {brand.website}
              </a>
            )}

            <div className="flex gap-2 mt-auto pt-3 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(brand)}
                className="flex-1 shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100 text-gray-700"
              >
                <Edit className="w-3 h-3 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(brand)}
                className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {brands.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 font-medium">Nenhuma marca cadastrada</p>
            <p className="text-sm text-gray-400 mt-1">Clique em "Nova Marca" para começar</p>
          </div>
        )}
      </div>

      {/* Modal de formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingBrand ? "Editar Marca" : "Nova Marca"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Nome da Marca *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Mar Quente"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da marca..."
                  className="bg-gray-100 shadow-neumorphic-inset border-none h-20 text-gray-800"
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Cor da Marca
                </Label>
                <div className="bg-gray-100 shadow-neumorphic-inset rounded-xl p-4">
                  <div className="flex gap-2 flex-wrap">
                    {brandColors.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: formData.color === color.value ? "" : color.value })}
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
                  <p className="text-xs text-gray-400 mt-2">
                    Esta cor será usada automaticamente no calendário ao selecionar esta marca
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Logo (URL)</Label>
                <Input
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Website</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1 shadow-neumorphic hover:shadow-neumorphic-pressed bg-gray-100 font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed font-bold disabled:opacity-50"
              >
                {editingBrand ? "Salvar" : "Criar Marca"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
