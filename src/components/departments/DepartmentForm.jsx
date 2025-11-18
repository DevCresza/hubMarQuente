
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

const predefinedColors = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
];

export default function DepartmentForm({ department, users, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: department?.name || "",
    description: department?.description || "",
    color: department?.color || "#3b82f6",
    manager_id: department?.manager_id || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Converter string vazia em null para campos UUID
    const dataToSave = {
      ...formData,
      manager_id: formData.manager_id || null
    };

    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {department ? "Editar Departamento" : "Novo Departamento"}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-700 mb-2 block font-semibold">Nome do Departamento</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Tecnologia, Marketing, Vendas..."
              className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
              required
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block font-semibold">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição das responsabilidades do departamento..."
              className="bg-gray-100 shadow-neumorphic-inset border-none h-20 text-gray-800"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block font-semibold">Gerente</Label>
            <select
              value={formData.manager_id}
              onChange={(e) => setFormData({...formData, manager_id: e.target.value})}
              className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
            >
              <option value="">Selecione um gerente</option>
              {users.filter(u => u.is_active).map(user => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block font-semibold">Cor do Departamento</Label>
            <div className="grid grid-cols-4 gap-3">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({...formData, color})}
                  className={`
                    w-12 h-12 rounded-xl transition-all duration-200
                    ${formData.color === color
                      ? 'shadow-neumorphic-pressed scale-95'
                      : 'shadow-neumorphic hover:shadow-neumorphic-pressed'}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
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
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 font-bold"
            >
              {department ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
