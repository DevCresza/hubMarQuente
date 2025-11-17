
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2, Calendar, Clock, User, Tag, Link2 } from "lucide-react";

export default function TaskForm({ task, users, departments, collections, currentUser, allTasks = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    assigned_to: task?.assigned_to || currentUser?.id || "",
    priority: task?.priority || "media",
    start_date: task?.start_date || "",
    due_date: task?.due_date || "",
    estimated_hours: task?.estimated_hours || "",
    tags: task?.tags || [],
    dependencies: task?.dependencies || [],
    is_external: task?.is_external || false,
    external_contact: task?.external_contact || ""
  });

  const [tagInput, setTagInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleToggleDependency = (taskId) => {
    const isSelected = formData.dependencies.includes(taskId);
    if (isSelected) {
      setFormData({ ...formData, dependencies: formData.dependencies.filter(id => id !== taskId) });
    } else {
      setFormData({ ...formData, dependencies: [...formData.dependencies, taskId] });
    }
  };

  const activeUsers = users.filter(u => u.is_active);
  const availableTasks = allTasks.filter(t => t.id !== task?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {task ? "Editar Tarefa" : "Nova Tarefa"}
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

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Informações Básicas */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Informações Básicas</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block font-semibold">Título *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título da tarefa"
                    className="bg-gray-50 border-gray-200"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm text-gray-700 mb-2 block font-semibold">Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição detalhada da tarefa..."
                    className="bg-gray-50 border-gray-200 h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block font-semibold">Responsável *</Label>
                    <select
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                      required
                    >
                      <option value="">Selecione</option>
                      {activeUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} {user.id === currentUser?.id && "(Você)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block font-semibold">Prioridade</Label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Datas e Tempo */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Datas e Tempo</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block font-semibold">Data de Início</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block font-semibold">Data de Término</Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-700 mb-2 block font-semibold">Horas Estimadas</Label>
                  <Input
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                    placeholder="Ex: 8"
                    className="bg-gray-50 border-gray-200"
                    step="0.5"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Terceirizado */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={formData.is_external}
                  onChange={(e) => setFormData({ ...formData, is_external: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Tarefa Executada por Terceiros</h3>
              </div>
              
              {formData.is_external && (
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block font-semibold">Empresa / Nome / Email Contato</Label>
                  <Textarea
                    value={formData.external_contact}
                    onChange={(e) => setFormData({ ...formData, external_contact: e.target.value })}
                    placeholder="Digite as informações de contato do terceiro&#10;Ex: Empresa XYZ - João Silva - joao@empresa.com - (11) 99999-9999"
                    className="bg-gray-50 border-gray-200 h-20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Informe o nome da empresa, pessoa de contato e meios de comunicação
                  </p>
                </div>
              )}
            </div>

            {/* Dependências */}
            {availableTasks.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Link2 className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Dependências</h3>
                  {formData.dependencies.length > 0 && (
                    <span className="text-xs text-gray-500">({formData.dependencies.length} selecionadas)</span>
                  )}
                </div>
                
                <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-xl p-3 border border-gray-200">
                  {availableTasks.map(t => (
                    <label 
                      key={t.id}
                      className="flex items-center gap-3 p-2 cursor-pointer hover:bg-white rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.dependencies.includes(t.id)}
                        onChange={() => handleToggleDependency(t.id)}
                        className="w-4 h-4 rounded text-orange-600"
                      />
                      <span className="text-sm text-gray-700 flex-1">{t.title}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Esta tarefa só pode ser iniciada após a conclusão das tarefas selecionadas
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Tags</h3>
              </div>
              
              <div className="flex gap-2 mb-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Adicionar tag..."
                  className="bg-gray-50 border-gray-200"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-green-500 hover:bg-green-600 text-white px-6"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0 bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 shadow-sm hover:shadow-md bg-white font-semibold"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg font-semibold"
          >
            {task ? "Salvar Alterações" : "Criar Tarefa"}
          </Button>
        </div>
      </div>
    </div>
  );
}
