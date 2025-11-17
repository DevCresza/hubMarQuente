import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, User } from "lucide-react";

export default function UGCForm({ ugc, brands, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: ugc?.name || "",
    code: ugc?.code || "",
    coupon_prefix: ugc?.coupon_prefix || "",
    email: ugc?.email || "",
    phone: ugc?.phone || "",
    instagram: ugc?.instagram || "",
    tiktok: ugc?.tiktok || "",
    followers_instagram: ugc?.followers_instagram || "",
    followers_tiktok: ugc?.followers_tiktok || "",
    engagement_rate: ugc?.engagement_rate || "",
    location: ugc?.location || "",
    rate_per_post: ugc?.rate_per_post || "",
    rate_per_story: ugc?.rate_per_story || "",
    rate_per_reel: ugc?.rate_per_reel || "",
    niche: ugc?.niche || [],
    preferred_brands: ugc?.preferred_brands || [],
    tier: ugc?.tier || "micro",
    status: ugc?.status || "ativo",
    notes: ugc?.notes || ""
  });

  const [loading, setLoading] = useState(false);

  const generateCode = () => {
    const nameParts = formData.name.trim().split(' ');
    const code = nameParts.map(p => p.substring(0, 3).toUpperCase()).join('');
    setFormData({...formData, code: code + Math.floor(Math.random() * 100)});
  };

  const generateCouponPrefix = () => {
    const firstName = formData.name.trim().split(' ')[0].toUpperCase();
    setFormData({...formData, coupon_prefix: firstName});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        followers_instagram: formData.followers_instagram ? Number(formData.followers_instagram) : null,
        followers_tiktok: formData.followers_tiktok ? Number(formData.followers_tiktok) : null,
        engagement_rate: formData.engagement_rate ? Number(formData.engagement_rate) : null,
        rate_per_post: formData.rate_per_post ? Number(formData.rate_per_post) : null,
        rate_per_story: formData.rate_per_story ? Number(formData.rate_per_story) : null,
        rate_per_reel: formData.rate_per_reel ? Number(formData.rate_per_reel) : null
      };
      await onSave(dataToSave);
    } catch (error) {
      console.error("Erro ao salvar UGC:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNicheToggle = (niche) => {
    const newNiches = formData.niche.includes(niche)
      ? formData.niche.filter(n => n !== niche)
      : [...formData.niche, niche];
    setFormData({ ...formData, niche: newNiches });
  };

  const handleBrandToggle = (brandId) => {
    const newBrands = formData.preferred_brands.includes(brandId)
      ? formData.preferred_brands.filter(b => b !== brandId)
      : [...formData.preferred_brands, brandId];
    setFormData({ ...formData, preferred_brands: newBrands });
  };

  const niches = ["moda", "lifestyle", "fitness", "beleza", "viagem", "familia", "tech", "outros"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {ugc ? "Editar UGC" : "Novo UGC"}
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
          <form id="ugc-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-gray-700 mb-2 block font-semibold">Nome Completo *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome do influenciador"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Código Interno</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="UGC001"
                    className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                  />
                  <Button
                    type="button"
                    onClick={generateCode}
                    variant="outline"
                    className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
                  >
                    Gerar
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Prefixo de Cupom</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.coupon_prefix}
                    onChange={(e) => setFormData({...formData, coupon_prefix: e.target.value.toUpperCase()})}
                    placeholder="MARIA"
                    className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                    maxLength={10}
                  />
                  <Button
                    type="button"
                    onClick={generateCouponPrefix}
                    variant="outline"
                    className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
                  >
                    Gerar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Usado para gerar códigos de cupom (ex: MARIA10, MARIA20)</p>
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Instagram</Label>
                <Input
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  placeholder="@usuario"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Localização</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="São Paulo, SP"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">TikTok</Label>
                <Input
                  value={formData.tiktok}
                  onChange={(e) => setFormData({...formData, tiktok: e.target.value})}
                  placeholder="@username"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>
            </div>

            {/* Seguidores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Seguidores Instagram</Label>
                <Input
                  type="number"
                  value={formData.followers_instagram}
                  onChange={(e) => setFormData({...formData, followers_instagram: e.target.value})}
                  placeholder="50000"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Seguidores TikTok</Label>
                <Input
                  type="number"
                  value={formData.followers_tiktok}
                  onChange={(e) => setFormData({...formData, followers_tiktok: e.target.value})}
                  placeholder="25000"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Engagement Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.engagement_rate}
                  onChange={(e) => setFormData({...formData, engagement_rate: e.target.value})}
                  placeholder="3.5"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Valor por Post (R$)</Label>
                <Input
                  type="number"
                  value={formData.rate_per_post}
                  onChange={(e) => setFormData({...formData, rate_per_post: e.target.value})}
                  placeholder="500"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Valor por Story (R$)</Label>
                <Input
                  type="number"
                  value={formData.rate_per_story}
                  onChange={(e) => setFormData({...formData, rate_per_story: e.target.value})}
                  placeholder="200"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Valor por Reel (R$)</Label>
                <Input
                  type="number"
                  value={formData.rate_per_reel}
                  onChange={(e) => setFormData({...formData, rate_per_reel: e.target.value})}
                  placeholder="800"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                />
              </div>
            </div>

            {/* Tier e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Classificação</Label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({...formData, tier: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-800"
                >
                  <option value="nano">Nano (1K-10K)</option>
                  <option value="micro">Micro (10K-100K)</option>
                  <option value="macro">Macro (100K-1M)</option>
                  <option value="mega">Mega (1M+)</option>
                  <option value="celebrity">Celebrity (5M+)</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-800"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="favorito">Favorito</option>
                  <option value="blacklist">Blacklist</option>
                </select>
              </div>
            </div>

            {/* Nichos */}
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Nichos de Atuação</Label>
              <div className="p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                <div className="flex flex-wrap gap-2">
                  {niches.map(niche => (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => handleNicheToggle(niche)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        formData.niche.includes(niche)
                          ? 'bg-blue-500 text-white shadow-neumorphic-pressed'
                          : 'bg-gray-100 text-gray-700 shadow-neumorphic hover:shadow-neumorphic-pressed'
                      }`}
                    >
                      {niche.charAt(0).toUpperCase() + niche.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Marcas Preferidas */}
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Marcas Preferidas</Label>
              <div className="p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                <div className="flex flex-wrap gap-2">
                  {brands.map(brand => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => handleBrandToggle(brand.id)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        formData.preferred_brands.includes(brand.id)
                          ? 'bg-blue-500 text-white shadow-neumorphic-pressed'
                          : 'bg-gray-100 text-gray-700 shadow-neumorphic hover:shadow-neumorphic-pressed'
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Observações internas sobre o influenciador..."
                className="bg-gray-100 shadow-neumorphic-inset border-none h-24 text-gray-800"
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="ugc-form"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Salvando..." : (ugc ? "Atualizar" : "Criar UGC")}
          </Button>
        </div>
      </div>
    </div>
  );
}