import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, AlertCircle, Upload } from "lucide-react";

export default function TicketForm({ ticket, users, departments, currentUser, onSave, onCancel }) {
  const marketingDept = departments.find(d => d.name === "Marketing");
  
  const [formData, setFormData] = useState({
    title: ticket?.title || "",
    description: ticket?.description || "",
    type: ticket?.type || "solicitacao_geral",
    priority: "media", // Sempre média por padrão
    department_id: ticket?.department_id || marketingDept?.id || "",
    assigned_to: ticket?.assigned_to || "",
    due_date: ticket?.due_date || "",
    attachments: ticket?.attachments || []
  });

  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    onSave(formData);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const fileUrls = results.map(r => r.file_url);
      setFormData({ ...formData, attachments: [...formData.attachments, ...fileUrls] });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload dos arquivos");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index)
    });
  };

  const departmentUsers = users.filter(u => 
    u.department_id === formData.department_id && u.is_active
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
                <option value="criacao_conteudo">Criação de Conteúdo</option>
                <option value="revisao_material">Revisão de Material</option>
                <option value="design">Design</option>
                <option value="campanha">Campanha</option>
                <option value="social_media">Social Media</option>
                <option value="solicitacao_geral">Solicitação Geral</option>
                <option value="urgente">Urgente</option>
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
              <Label className="text-gray-700 mb-2 block font-semibold">Data do Prazo</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Anexos</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                  disabled={uploading}
                />
                {uploading && (
                  <span className="text-sm text-gray-500">Enviando...</span>
                )}
              </div>
              {formData.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.attachments.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg shadow-neumorphic-inset">
                      <span className="text-sm text-gray-600 truncate flex-1">Anexo {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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