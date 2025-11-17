
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react"; // Removed User icon as it's no longer used in the simplified header

export default function UserForm({ user, departments, users, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    department_id: user?.department_id || "",
    position: user?.position || "",
    phone: user?.phone || "",
    role: user?.role || "membro",
    is_active: user?.is_active !== false,
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validar senha apenas para novos usuários
    if (!user) {
      if (!formData.password) {
        newErrors.password = "Senha é obrigatória";
      } else if (formData.password.length < 6) {
        newErrors.password = "Senha deve ter no mínimo 6 caracteres";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "As senhas não conferem";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('📝 UserForm - handleSubmit chamado');
    setSubmitError(null); // Limpar erros anteriores

    if (!validateForm()) {
      console.log('❌ Validação falhou');
      return;
    }

    console.log('✅ Validação passou, iniciando salvamento...');
    setLoading(true);

    try {
      await onSave(formData);
      console.log('✅ onSave concluído com sucesso');
      // Se chegou aqui, o form será fechado pelo componente pai
    } catch (error) {
      console.error("❌ Erro no handleSubmit:", error);
      setSubmitError(error.message || "Erro ao salvar usuário. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {user ? "Editar Usuário" : "Novo Usuário"}
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
          {/* Mensagem de Erro Global */}
          {submitError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Erro ao criar usuário</p>
                <p className="text-sm text-red-700 mt-1">{submitError}</p>
              </div>
            </div>
          )}

          <form id="user-form" className="space-y-4">
            {/* Nome Completo */}
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Nome Completo *</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="João Silva"
                className={`bg-gray-100 shadow-neumorphic-inset border-none text-gray-800 text-base py-3 ${errors.full_name ? 'border-red-300' : ''}`}
                disabled={loading}
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="joao@empresa.com"
                className={`bg-gray-100 shadow-neumorphic-inset border-none text-gray-800 text-base py-3 ${errors.email ? 'border-red-300' : ''}`}
                disabled={!!user || loading} // Não permite editar email de usuário existente
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              {user && <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>}
            </div>

            {/* Departamento e Cargo */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Departamento</Label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                  disabled={loading}
                >
                  <option value="">Selecione um departamento</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block font-semibold">Cargo</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="Desenvolvedor, Gerente, Analista..."
                  className="bg-gray-100 shadow-neumorphic-inset border-none py-3 text-gray-800"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Telefone</Label>
              <Input
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className="bg-gray-100 shadow-neumorphic-inset border-none py-3 text-gray-800"
                disabled={loading}
              />
            </div>

            {/* Senha - Apenas para novos usuários */}
            {!user && (
              <>
                <div>
                  <Label className="text-gray-700 mb-2 block font-semibold">Senha *</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Mínimo 6 caracteres"
                    className={`bg-gray-100 shadow-neumorphic-inset border-none py-3 text-gray-800 ${errors.password ? 'border-red-300' : ''}`}
                    disabled={loading}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 mb-2 block font-semibold">Confirmar Senha *</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Digite a senha novamente"
                    className={`bg-gray-100 shadow-neumorphic-inset border-none py-3 text-gray-800 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                    disabled={loading}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-password"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 rounded shadow-neumorphic-inset"
                  />
                  <Label htmlFor="show-password" className="text-gray-600 text-sm cursor-pointer">
                    Mostrar senhas
                  </Label>
                </div>
              </>
            )}

            {/* Papel no Sistema */}
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Função</Label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700 font-medium"
                disabled={loading}
              >
                <option value="membro">Membro</option>
                <option value="manager">Gerente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {/* Status Ativo */}
            <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-5 h-5 rounded shadow-neumorphic-inset"
                disabled={loading}
              />
              <Label htmlFor="is_active" className="text-gray-700 font-semibold">
                Usuário ativo no sistema
              </Label>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100 py-3 font-bold"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="user-form" // Associate button with the form
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 py-3 font-bold"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </div>
            ) : (
              user ? "Atualizar" : "Criar Usuário"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
