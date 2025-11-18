import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2, Users } from "lucide-react";

export default function ProjectForm({ project, users, departments, currentUser, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    department_id: project?.department_id || "",
    status: project?.status || "planning",
    priority: project?.priority || "medium",
    start_date: project?.start_date || "",
    due_date: project?.due_date || "",
    owner_id: project?.owner_id || currentUser?.id || "",
    team_members: project?.team_members || [],
    external_guests: project?.external_guests || [],
    color: project?.color || "#3b82f6",
    email_notifications: project?.email_notifications !== false,
    tags: project?.tags || []
  });

  const [tagInput, setTagInput] = useState("");
  const [guestInput, setGuestInput] = useState({ email: "", name: "", company: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      start_date: formData.start_date || null,
      due_date: formData.due_date || null,
      department_id: formData.department_id || null
    };
    
    onSave(dataToSave);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({...formData, tags: [...formData.tags, tagInput.trim()]});
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({...formData, tags: formData.tags.filter(tag => tag !== tagToRemove)});
  };

  const handleAddGuest = () => {
    if (guestInput.email && guestInput.name) {
      const newGuest = {
        ...guestInput,
        access_token: Math.random().toString(36).substring(2, 15),
        invited_date: new Date().toISOString()
      };
      setFormData({...formData, external_guests: [...formData.external_guests, newGuest]});
      setGuestInput({ email: "", name: "", company: "" });
    }
  };

  const handleRemoveGuest = (emailToRemove) => {
    setFormData({...formData, external_guests: formData.external_guests.filter(g => g.email !== emailToRemove)});
  };

  const projectColors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
  ];

  const handleTeamMemberToggle = (userId) => {
    const isSelected = formData.team_members.includes(userId);
    if (isSelected) {
      setFormData({...formData, team_members: formData.team_members.filter(id => id !== userId)});
    } else {
      setFormData({...formData, team_members: [...formData.team_members, userId]});
    }
  };

  const activeUsers = users.filter(u => u.is_active && u.id !== currentUser?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {project ? "Editar Projeto" : "Novo Projeto"}
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
                  <Label className="text-sm text-gray-700 mb-2 block font-semibold">Nome do Projeto *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Lançamento Campanha de Verão"
                    className="bg-gray-50 border-gray-200"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm text-gray-700 mb-2 block font-semibold">Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrição detalhada do projeto..."
                    className="bg-gray-50 border-gray-200 h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block font-semibold">Departamento *</Label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                      required
                    >
                      <option value="">Selecione</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block font-semibold">Status</Label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                    >
                      <option value="planning">Planejamento</option>
                      <option value="in_progress">Em Progresso</option>
                      <option value="on_hold">Em Espera</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block font-semibold">Prioridade *</Label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                      required
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="critical">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block font-semibold">Data de Início</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block font-semibold">Data de Término</Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Equipe do Projeto */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Membros da Equipe Interna</h3>
                <span className="text-xs text-gray-500">({formData.team_members.length} selecionados)</span>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto border border-gray-200">
                {activeUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeUsers.map(user => (
                      <label 
                        key={user.id} 
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white rounded-lg transition-colors border border-transparent hover:border-blue-200"
                      >
                        <input
                          type="checkbox"
                          checked={formData.team_members.includes(user.id)}
                          onChange={() => handleTeamMemberToggle(user.id)}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{user.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.position || user.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum usuário disponível</p>
                )}
              </div>
            </div>

            {/* Convidados Externos */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Convidados Externos (Terceiros)</h3>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    value={guestInput.name}
                    onChange={(e) => setGuestInput({...guestInput, name: e.target.value})}
                    placeholder="Nome"
                    className="bg-gray-50 border-gray-200"
                  />
                  <Input
                    type="email"
                    value={guestInput.email}
                    onChange={(e) => setGuestInput({...guestInput, email: e.target.value})}
                    placeholder="Email"
                    className="bg-gray-50 border-gray-200"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={guestInput.company}
                      onChange={(e) => setGuestInput({...guestInput, company: e.target.value})}
                      placeholder="Empresa"
                      className="bg-gray-50 border-gray-200"
                    />
                    <Button
                      type="button"
                      onClick={handleAddGuest}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4"
                      disabled={!guestInput.name || !guestInput.email}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.external_guests.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.external_guests.map((guest, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{guest.name}</p>
                          <p className="text-xs text-gray-600">{guest.email} {guest.company && `• ${guest.company}`}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveGuest(guest.email)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Configurações */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Configurações</h3>
              
              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <input
                    type="checkbox"
                    checked={formData.email_notifications}
                    onChange={(e) => setFormData({...formData, email_notifications: e.target.checked})}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700 font-medium">Enviar notificações por email para mudanças no projeto</span>
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block font-semibold">Tags</Label>
                  <div className="flex gap-2 mb-2">
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
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                    >
                      Add
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

                {/* Color Picker */}
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block font-semibold">Cor do Projeto</Label>
                  <div className="flex gap-3 flex-wrap">
                    {projectColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({...formData, color})}
                        className={`
                          w-10 h-10 rounded-xl transition-all duration-200 border-2
                          ${formData.color === color
                            ? 'border-gray-800 scale-110'
                            : 'border-transparent hover:scale-105'}
                        `}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
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
            {project ? "Salvar Alterações" : "Criar Projeto"}
          </Button>
        </div>
      </div>
    </div>
  );
}