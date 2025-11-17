
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Image, Upload, Plus } from "lucide-react";

export default function AssetForm({ asset, collections, brands, users, currentUser, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: asset?.title || "",
    description: asset?.description || "",
    type: asset?.type || "foto",
    collection_id: asset?.collection_id || "",
    brand_id: asset?.brand_id || "",
    cover_url: asset?.cover_url || "",
    file_links: asset?.file_links || [],
    category: asset?.category || "campanha",
    channel: asset?.channel || [],
    status: asset?.status || "rascunho",
    tags: asset?.tags || []
  });

  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [linkInput, setLinkInput] = useState({ name: "", url: "", type: "drive" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_url: file_url });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload da capa");
    } finally {
      setUploading(false);
    }
  };

  const handleAddLink = () => {
    if (linkInput.name.trim() && linkInput.url.trim()) {
      const newLink = {
        name: linkInput.name.trim(),
        url: linkInput.url.trim(),
        type: linkInput.type
      };
      setFormData({
        ...formData,
        file_links: [...formData.file_links, newLink]
      });
      setLinkInput({ name: "", url: "", type: "drive" });
    }
  };

  const handleRemoveLink = (index) => {
    setFormData({
      ...formData,
      file_links: formData.file_links.filter((_, i) => i !== index)
    });
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

  const handleChannelToggle = (channel) => {
    const isSelected = formData.channel.includes(channel);
    if (isSelected) {
      setFormData({ ...formData, channel: formData.channel.filter(c => c !== channel) });
    } else {
      setFormData({ ...formData, channel: [...formData.channel, channel] });
    }
  };

  const handleLinkKeyDown = (e) => {
    // Prevenir submit do formulário ao pressionar Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      if (linkInput.name.trim() && linkInput.url.trim()) {
        handleAddLink();
      }
    }
  };

  const channels = ["instagram", "tiktok", "facebook", "youtube", "site", "email", "whatsapp"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {asset ? "Editar Asset" : "Novo Asset"}
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
          <form id="asset-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nome do asset"
                className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                required
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do asset..."
                className="bg-gray-100 shadow-neumorphic-inset border-none h-20 text-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Tipo</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                >
                  <option value="foto">Foto</option>
                  <option value="video">Vídeo</option>
                  <option value="reel">Reel</option>
                  <option value="story">Story</option>
                  <option value="post">Post</option>
                  <option value="banner">Banner</option>
                  <option value="lookbook">Lookbook</option>
                  <option value="catalog">Catálogo</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Categoria</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                >
                  <option value="campanha">Campanha</option>
                  <option value="produto">Produto</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="evento">Evento</option>
                  <option value="editorial">Editorial</option>
                  <option value="ugc">UGC</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Coleção</Label>
                <select
                  value={formData.collection_id}
                  onChange={(e) => setFormData({ ...formData, collection_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                >
                  <option value="">Selecione uma coleção</option>
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.id}>{collection.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Marca</Label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                >
                  <option value="">Selecione uma marca</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Status</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
              >
                <option value="rascunho">Rascunho</option>
                <option value="em_revisao">Em Revisão</option>
                <option value="aprovado">Aprovado</option>
                <option value="publicado">Publicado</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Capa para Visualização</Label>
              <Input
                type="file"
                onChange={handleCoverUpload}
                className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                disabled={uploading}
                accept="image/*"
              />
              {uploading && <span className="text-sm text-gray-500 mt-1">Enviando...</span>}
              {formData.cover_url && (
                <div className="mt-2">
                  <img src={formData.cover_url} alt="Capa" className="w-32 h-32 object-cover rounded-lg shadow-neumorphic" />
                  <p className="text-xs text-green-600 mt-1">✓ Capa enviada com sucesso</p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Links dos Arquivos</Label>
              <div className="space-y-2 mb-3">
                <Input
                  value={linkInput.name}
                  onChange={(e) => setLinkInput({ ...linkInput, name: e.target.value })}
                  onKeyDown={handleLinkKeyDown}
                  placeholder="Nome do arquivo/pasta"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
                <div className="flex gap-2">
                  <Input
                    value={linkInput.url}
                    onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })}
                    onKeyDown={handleLinkKeyDown}
                    placeholder="Cole o link aqui (Drive, Dropbox, etc)"
                    className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800 flex-1"
                  />
                  <select
                    value={linkInput.type}
                    onChange={(e) => setLinkInput({ ...linkInput, type: e.target.value })}
                    className="px-3 py-2 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700"
                  >
                    <option value="drive">Drive</option>
                    <option value="dropbox">Dropbox</option>
                    <option value="wetransfer">WeTransfer</option>
                    <option value="outro">Outro</option>
                  </select>
                  <Button
                    type="button"
                    onClick={handleAddLink}
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {formData.file_links.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {formData.file_links.length} link{formData.file_links.length !== 1 ? 's' : ''} adicionado{formData.file_links.length !== 1 ? 's' : ''}
                  </p>
                  {formData.file_links.map((link, index) => (
                    <div key={index} className="p-3 bg-gray-100 rounded-lg shadow-neumorphic-inset flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-700">{link.name}</p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block"
                        >
                          {link.url}
                        </a>
                        <span className="text-xs text-gray-500 capitalize">{link.type}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Canais de Publicação</Label>
              <div className="bg-gray-100 shadow-neumorphic-inset rounded-xl p-4">
                <div className="grid grid-cols-3 gap-2">
                  {channels.map(channel => (
                    <label key={channel} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channel.includes(channel)}
                        onChange={() => handleChannelToggle(channel)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-700 font-medium capitalize">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Tags</Label>
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
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </form>
        </div>

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
            form="asset-form"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 font-bold"
            disabled={uploading}
          >
            {asset ? "Salvar" : "Criar Asset"}
          </Button>
        </div>
      </div>
    </div>
  );
}
