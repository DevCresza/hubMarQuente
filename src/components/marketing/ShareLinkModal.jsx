
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Link2, Copy, Check, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ShareLinkModal({ assets, onClose, currentUser }) {
  const [formData, setFormData] = useState({
    title: "",
    password: "",
    description: "",
    expires_at: ""
  });
  const [usePassword, setUsePassword] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({...formData, password});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const shareLink = await base44.entities.MarketingShareLink.create({
        title: formData.title,
        password: usePassword ? formData.password : null,
        description: formData.description,
        asset_ids: assets.map(a => a.id),
        created_by: currentUser?.id,
        expires_at: formData.expires_at || null
      });

      const link = `${window.location.origin}/SharedAssets?id=${shareLink.id}`;
      setGeneratedLink({ 
        url: link, 
        password: usePassword ? formData.password : null,
        hasPassword: usePassword
      });
    } catch (error) {
      console.error("Erro ao criar link:", error);
      alert("Erro ao criar link compartilhável");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (generatedLink) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Link Criado com Sucesso!</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Link de Compartilhamento</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedLink.url}
                  readOnly
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800 text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(generatedLink.url)}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {generatedLink.hasPassword && (
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Senha de Acesso</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedLink.password}
                    readOnly
                    className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800 font-mono text-lg"
                  />
                  <Button
                    onClick={() => copyToClipboard(generatedLink.password)}
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-4 shadow-neumorphic-inset">
              <p className="text-sm text-gray-700">
                <strong>Instruções:</strong> {generatedLink.hasPassword 
                  ? "Compartilhe o link e a senha separadamente com as pessoas autorizadas. Elas precisarão inserir a senha para acessar os arquivos."
                  : "Compartilhe este link com quem você deseja. Qualquer pessoa com o link poderá acessar os arquivos."}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={onClose} className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft">
              Fechar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Criar Link Compartilhável</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-700 mb-2 block font-semibold">Título do Link *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Fotos Campanha Verão 2024"
              className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
              required
            />
          </div>

          <div className="bg-gray-100 rounded-xl p-4 shadow-neumorphic-inset">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={usePassword}
                onChange={(e) => setUsePassword(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Proteger com senha</span>
              </div>
            </label>
          </div>

          {usePassword && (
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Senha de Acesso *</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Senha de 4+ caracteres"
                  className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                  required={usePassword}
                  minLength={4}
                />
                <Button
                  type="button"
                  onClick={generateRandomPassword}
                  variant="outline"
                  className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
                >
                  Gerar
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label className="text-gray-700 mb-2 block font-semibold">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Instruções ou observações para quem acessar..."
              className="bg-gray-100 shadow-neumorphic-inset border-none h-20 text-gray-800"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block font-semibold">Data de Expiração (opcional)</Label>
            <Input
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
              className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
            />
          </div>

          <div className="bg-blue-50 rounded-xl p-3 shadow-neumorphic-inset">
            <p className="text-sm text-gray-700">
              <strong>{assets.length}</strong> arquivo{assets.length !== 1 ? 's' : ''} selecionado{assets.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 shadow-neumorphic hover:shadow-neumorphic-pressed bg-gray-100"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Link"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
