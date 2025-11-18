import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, AlertCircle } from "lucide-react";

export default function TicketForm({ ticket, users, departments, currentUser, onSave, onCancel }) {
  const marketingDept = departments.find(d => d.name === "Marketing");

  const [formData, setFormData] = useState({
    title: ticket?.title || "",
    description: ticket?.description || "",
    type: ticket?.type || "request",
    priority: ticket?.priority || "medium",
    status: ticket?.status || "open",
    department: ticket?.department || marketingDept?.id || "",
    assigned_to: ticket?.assigned_to || "",
    tags: ticket?.tags || []
  });

  // Atualizar formData quando ticket mudar (para modo de edição)
  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || "",
        description: ticket.description || "",
        type: ticket.type || "request",
        priority: ticket.priority || "medium",
        status: ticket.status || "open",
        department: ticket.department || marketingDept?.id || "",
        assigned_to: ticket.assigned_to || "",
        tags: ticket.tags || []
      });
    } else {
      // Reset para novo ticket
      setFormData({
        title: "",
        description: "",
        type: "request",
        priority: "medium",
        status: "open",
        department: marketingDept?.id || "",
        assigned_to: "",
        tags: []
      });
    }
  }, [ticket, marketingDept?.id]);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    onSave(formData);
  };

  const departmentUsers = users.filter(u =>
    u.department_id === formData.department && u.is_active
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {ticket ? "Editar Ticket" : "Novo Ticket - Marketing"}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Descreva brevemente sua solicitação"
                className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                required
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Descrição *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva detalhadamente o que você precisa..."
                className="bg-gray-100 shadow-neumorphic-inset border-none h-32 text-gray-800"
                required
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Tipo *</Label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                required
              >
                <option value="request">Solicitação</option>
                <option value="task">Tarefa</option>
                <option value="bug">Problema/Bug</option>
                <option value="question">Pergunta</option>
              </select>
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Atribuir a (Marketing)</Label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
              >
                <option value="">Selecione um usuário do Marketing</option>
                {departmentUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Prioridade *</Label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                required
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100 font-bold h-10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 font-bold h-10"
          >
            {ticket ? "Salvar" : "Criar"}
          </Button>
        </div>
      </div>
    </div>
  );
}