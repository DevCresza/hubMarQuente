import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, User, Briefcase, MapPin, Heart, CreditCard, Shield } from "lucide-react";

export default function UserFormComplete({ user, departments, users, onSave, onCancel }) {
  const [activeTab, setActiveTab] = useState("basico");
  const [formData, setFormData] = useState({
    // Dados Básicos
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    birth_date: user?.birth_date || "",
    cpf: user?.cpf || "",
    avatar_url: user?.avatar_url || "",

    // Dados Profissionais
    department_id: user?.department_id || "",
    position: user?.position || "",
    role: user?.role || "membro",
    direct_manager: user?.direct_manager || "",
    hire_date: user?.hire_date || "",
    pis: user?.pis || "",

    // Endereço
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zip_code: user?.zip_code || "",

    // Emergência e Saúde
    emergency_contact_name: user?.emergency_contact_name || "",
    emergency_contact_phone: user?.emergency_contact_phone || "",
    blood_type: user?.blood_type || "",
    has_disabilities: user?.has_disabilities || false,
    disability_description: user?.disability_description || "",

    // Dados Bancários
    bank_name: user?.bank_name || "",
    bank_agency: user?.bank_agency || "",
    bank_account: user?.bank_account || "",

    // Sistema
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

    // Validações básicas
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

    // Validar CPF se preenchido
    if (formData.cpf && formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = "CPF deve ter 11 dígitos";
    }

    // Validar telefone se preenchido
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = "Telefone inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('📝 UserFormComplete - handleSubmit chamado');
    setSubmitError(null);

    if (!validateForm()) {
      console.log('❌ Validação falhou');
      return;
    }

    console.log('✅ Validação passou, iniciando salvamento...');
    setLoading(true);

    try {
      await onSave(formData);
      console.log('✅ onSave concluído com sucesso');
    } catch (error) {
      console.error("❌ Erro no handleSubmit:", error);
      setSubmitError(error.message || "Erro ao salvar usuário. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const tabs = [
    { id: "basico", label: "Dados Básicos", icon: User },
    { id: "profissional", label: "Profissional", icon: Briefcase },
    { id: "endereco", label: "Endereço", icon: MapPin },
    { id: "emergencia", label: "Emergência", icon: Heart },
    { id: "bancario", label: "Bancário", icon: CreditCard },
    { id: "sistema", label: "Sistema", icon: Shield }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
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

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0 px-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Mensagem de Erro Global */}
          {submitError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Erro ao criar usuário</p>
                <p className="text-sm text-red-700 mt-1">{submitError}</p>
              </div>
            </div>
          )}

          <form id="user-form" className="space-y-4">
            {/* ABA: Dados Básicos */}
            {activeTab === "basico" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Nome Completo *</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="João Silva Santos"
                      className={`bg-gray-100 shadow-neumorphic-inset border-none ${errors.full_name ? 'border-red-300' : ''}`}
                      disabled={loading}
                    />
                    {errors.full_name && <p className="text-red-600 text-xs mt-1">{errors.full_name}</p>}
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="joao@empresa.com"
                      className={`bg-gray-100 shadow-neumorphic-inset border-none ${errors.email ? 'border-red-300' : ''}`}
                      disabled={loading || user}
                    />
                    {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Telefone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
                      placeholder="(11) 99999-9999"
                      className={`bg-gray-100 shadow-neumorphic-inset border-none ${errors.phone ? 'border-red-300' : ''}`}
                      disabled={loading}
                    />
                    {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">CPF</Label>
                    <Input
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                      placeholder="000.000.000-00"
                      className={`bg-gray-100 shadow-neumorphic-inset border-none ${errors.cpf ? 'border-red-300' : ''}`}
                      disabled={loading}
                    />
                    {errors.cpf && <p className="text-red-600 text-xs mt-1">{errors.cpf}</p>}
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Data de Nascimento</Label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Senhas apenas para novo usuário */}
                {!user && (
                  <div className="border-t border-gray-300 pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Credenciais de Acesso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-700 mb-2 block font-semibold">Senha *</Label>
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Mínimo 6 caracteres"
                          className={`bg-gray-100 shadow-neumorphic-inset border-none ${errors.password ? 'border-red-300' : ''}`}
                          disabled={loading}
                        />
                        {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                      </div>

                      <div>
                        <Label className="text-gray-700 mb-2 block font-semibold">Confirmar Senha *</Label>
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          placeholder="Digite a senha novamente"
                          className={`bg-gray-100 shadow-neumorphic-inset border-none ${errors.confirmPassword ? 'border-red-300' : ''}`}
                          disabled={loading}
                        />
                        {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        className="rounded"
                      />
                      <Label className="text-sm text-gray-600">Mostrar senhas</Label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA: Dados Profissionais */}
            {activeTab === "profissional" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Departamento</Label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                      className="w-full bg-gray-100 shadow-neumorphic-inset border-none rounded-xl px-4 py-3 text-gray-800"
                      disabled={loading}
                    >
                      <option value="">Selecione um departamento</option>
                      {departments?.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Cargo</Label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      placeholder="Desenvolvedor, Gerente, Analista..."
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Função/Role *</Label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-gray-100 shadow-neumorphic-inset border-none rounded-xl px-4 py-3 text-gray-800"
                      disabled={loading}
                    >
                      <option value="admin">Administrador</option>
                      <option value="manager">Gerente</option>
                      <option value="membro">Membro</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Gestor Direto</Label>
                    <select
                      value={formData.direct_manager}
                      onChange={(e) => setFormData({...formData, direct_manager: e.target.value})}
                      className="w-full bg-gray-100 shadow-neumorphic-inset border-none rounded-xl px-4 py-3 text-gray-800"
                      disabled={loading}
                    >
                      <option value="">Sem gestor direto</option>
                      {users?.filter(u => u.id !== user?.id).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Data de Contratação</Label>
                    <Input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">PIS</Label>
                    <Input
                      value={formData.pis}
                      onChange={(e) => setFormData({...formData, pis: e.target.value.replace(/\D/g, '').slice(0, 11)})}
                      placeholder="000.00000.00-0"
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ABA: Endereço */}
            {activeTab === "endereco" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-gray-700 mb-2 block font-semibold">Endereço</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Rua, número, complemento"
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Cidade</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="São Paulo"
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Estado</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase().slice(0, 2)})}
                      placeholder="SP"
                      maxLength={2}
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">CEP</Label>
                    <Input
                      value={formData.zip_code}
                      onChange={(e) => setFormData({...formData, zip_code: formatCEP(e.target.value)})}
                      placeholder="00000-000"
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ABA: Emergência e Saúde */}
            {activeTab === "emergencia" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contato de Emergência</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Nome do Contato</Label>
                    <Input
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                      placeholder="Maria Silva"
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Telefone do Contato</Label>
                    <Input
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({...formData, emergency_contact_phone: formatPhone(e.target.value)})}
                      placeholder="(11) 99999-9999"
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6">Informações de Saúde</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Tipo Sanguíneo</Label>
                    <select
                      value={formData.blood_type}
                      onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                      className="w-full bg-gray-100 shadow-neumorphic-inset border-none rounded-xl px-4 py-3 text-gray-800"
                      disabled={loading}
                    >
                      <option value="">Selecione</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      checked={formData.has_disabilities}
                      onChange={(e) => setFormData({...formData, has_disabilities: e.target.checked})}
                      className="rounded"
                    />
                    <Label className="text-gray-700">Possui alguma deficiência</Label>
                  </div>

                  {formData.has_disabilities && (
                    <div className="md:col-span-2">
                      <Label className="text-gray-700 mb-2 block font-semibold">Descrição da Deficiência</Label>
                      <textarea
                        value={formData.disability_description}
                        onChange={(e) => setFormData({...formData, disability_description: e.target.value})}
                        placeholder="Descreva a deficiência..."
                        rows={3}
                        className="w-full bg-gray-100 shadow-neumorphic-inset border-none rounded-xl px-4 py-3 text-gray-800 resize-none"
                        disabled={loading}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA: Dados Bancários */}
            {activeTab === "bancario" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-gray-700 mb-2 block font-semibold">Banco</Label>
                    <Input
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      placeholder="Ex: Banco do Brasil, Itaú, Santander..."
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Agência</Label>
                    <Input
                      value={formData.bank_agency}
                      onChange={(e) => setFormData({...formData, bank_agency: e.target.value})}
                      placeholder="0000"
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block font-semibold">Conta</Label>
                    <Input
                      value={formData.bank_account}
                      onChange={(e) => setFormData({...formData, bank_account: e.target.value})}
                      placeholder="00000-0"
                      className="bg-gray-100 shadow-neumorphic-inset border-none"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ABA: Sistema */}
            {activeTab === "sistema" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded"
                  />
                  <Label className="text-gray-700">Usuário ativo no sistema</Label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Usuário ativo:</strong> Pode fazer login e acessar o sistema.<br />
                    <strong>Usuário inativo:</strong> Não pode fazer login, mas seus dados são preservados.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={loading}
            className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
          >
            {loading ? "Salvando..." : user ? "Atualizar Usuário" : "Criar Usuário"}
          </Button>
        </div>
      </div>
    </div>
  );
}
