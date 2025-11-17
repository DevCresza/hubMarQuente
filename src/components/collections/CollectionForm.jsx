import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Calendar as CalendarIcon, Plus, Trash2, Edit, Target, Mic, LinkIcon, DollarSign } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const CustomInput = ({ label, ...props }) => (
  <div>
    <Label className="text-gray-700 mb-2 block font-semibold">{label}</Label>
    <input {...props} className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700" />
  </div>
);

const CustomTextarea = ({ label, ...props }) => (
  <div>
    <Label className="text-gray-700 mb-2 block font-semibold">{label}</Label>
    <textarea {...props} className="w-full h-24 px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700" />
  </div>
);

const CustomSelect = ({ label, children, ...props }) => (
  <div>
    <Label className="text-gray-700 mb-2 block font-semibold">{label}</Label>
    <select {...props} className="w-full px-4 py-3 bg-gray-100 shadow-neumorphic-inset border-none rounded-xl text-gray-700">
      {children}
    </select>
  </div>
);

export default function CollectionForm({ collection, stylists, styles, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: collection?.name || "",
    description: collection?.description || "",
    theme: collection?.theme || "",
    inspiration: collection?.inspiration || "",
    target_audience: collection?.target_audience || "",
    
    launch_date: collection?.launch_date ? new Date(collection.launch_date) : null,
    production_start: collection?.production_start ? new Date(collection.production_start) : null,
    photoshoot_date: collection?.photoshoot_date ? new Date(collection.photoshoot_date) : null,
    campaign_start: collection?.campaign_start ? new Date(collection.campaign_start) : null,
    
    status: collection?.status || "conceito",
    
    budget: collection?.budget || 0,
    investments: collection?.investments || [],
    
    drive_links: collection?.drive_links || {
      inspiration_board: "",
      raw_photos: "",
      edited_photos: "",
      videos: "",
      marketing_materials: ""
    },
    
    notes: collection?.notes || "",
  });

  const [newInvestment, setNewInvestment] = useState({
    category: "producao",
    description: "",
    amount: "",
    date: new Date(),
    supplier: "",
    status: "planejado",
    payment_method: "",
    notes: ""
  });
  
  const toISODate = (date) => date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      launch_date: toISODate(formData.launch_date),
      production_start: toISODate(formData.production_start),
      photoshoot_date: toISODate(formData.photoshoot_date),
      campaign_start: toISODate(formData.campaign_start),
      budget: Number(formData.budget),
      investments: formData.investments.map(inv => ({
        ...inv,
        amount: Number(inv.amount),
        date: toISODate(inv.date)
      }))
    };
    onSave(dataToSave);
  };

  const handleAddInvestment = () => {
    if (newInvestment.description && newInvestment.amount) {
      setFormData({
        ...formData,
        investments: [...formData.investments, { ...newInvestment }]
      });
      setNewInvestment({
        category: "producao",
        description: "",
        amount: "",
        date: new Date(),
        supplier: "",
        status: "planejado",
        payment_method: "",
        notes: ""
      });
    }
  };

  const handleRemoveInvestment = (index) => {
    setFormData({
      ...formData,
      investments: formData.investments.filter((_, i) => i !== index)
    });
  };

  const getTotalInvested = () => {
    return formData.investments
      .filter(inv => inv.status === 'pago')
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  };

  const DatePicker = ({ label, date, onSelect }) => (
    <div>
      <Label className="text-gray-700 mb-2 block font-semibold">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"outline"} className="w-full justify-start text-left font-normal bg-gray-100 shadow-neumorphic-inset border-none">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy") : <span>Selecione</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-neumorphic bg-gray-100 border-none">
          <Calendar mode="single" selected={date} onSelect={onSelect} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-3xl shadow-neumorphic max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">
              {collection ? "Editar Coleção" : "Nova Coleção"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onCancel} className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações Básicas */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shadow-neumorphic-soft">
                  <Edit className="w-5 h-5 text-blue-600"/>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Informações Básicas</h3>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4 shadow-neumorphic-inset">
                <CustomInput label="Nome da Coleção *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ex: Essência Urbana" required />
                <CustomTextarea label="Descrição / Conceito" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Uma coleção inspirada na arquitetura e no ritmo da cidade." />
                <div className="grid md:grid-cols-2 gap-4">
                  <CustomInput label="Tema" value={formData.theme} onChange={(e) => setFormData({...formData, theme: e.target.value})} placeholder="Conexões e contrastes" />
                  <CustomSelect label="Status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="conceito">Conceito</option>
                    <option value="planejamento">Planejamento</option>
                    <option value="desenvolvimento">Desenvolvimento</option>
                    <option value="producao">Produção</option>
                    <option value="fotografia">Fotografia</option>
                    <option value="campanha">Campanha</option>
                    <option value="lancado">Lançado</option>
                    <option value="arquivado">Arquivado</option>
                  </CustomSelect>
                </div>
              </div>
            </div>

            {/* Inspiração e Público */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shadow-neumorphic-soft">
                  <Target className="w-5 h-5 text-purple-600"/>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Inspiração & Público</h3>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4 shadow-neumorphic-inset">
                <CustomTextarea label="Inspirações e Referências" value={formData.inspiration} onChange={(e) => setFormData({...formData, inspiration: e.target.value})} placeholder="Movimento artístico, texturas naturais, cartela de cores..." />
                <CustomTextarea label="Público-alvo" value={formData.target_audience} onChange={(e) => setFormData({...formData, target_audience: e.target.value})} placeholder="Jovens adultos, 25-35 anos, interessados em moda sustentável..." />
              </div>
            </div>
            
            {/* Cronograma */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shadow-neumorphic-soft">
                  <CalendarIcon className="w-5 h-5 text-green-600"/>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Cronograma</h3>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 shadow-neumorphic-inset">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <DatePicker label="Início Produção" date={formData.production_start} onSelect={(date) => setFormData({...formData, production_start: date})} />
                  <DatePicker label="Sessão de Fotos" date={formData.photoshoot_date} onSelect={(date) => setFormData({...formData, photoshoot_date: date})} />
                  <DatePicker label="Início Campanha" date={formData.campaign_start} onSelect={(date) => setFormData({...formData, campaign_start: date})} />
                  <DatePicker label="Lançamento" date={formData.launch_date} onSelect={(date) => setFormData({...formData, launch_date: date})} />
                </div>
              </div>
            </div>

            {/* Financeiro */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shadow-neumorphic-soft">
                  <DollarSign className="w-5 h-5 text-orange-600"/>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Financeiro</h3>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 space-y-6 shadow-neumorphic-inset">
                <CustomInput type="number" label="Orçamento Total (R$)" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} placeholder="20000" />
                
                {/* Investimentos Detalhados */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700 font-bold">Investimentos Detalhados</Label>
                    <span className="text-sm text-gray-600">
                      Total Investido: R$ {getTotalInvested().toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                  </div>

                  {/* Lista de Investimentos */}
                  {formData.investments.length > 0 && (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {formData.investments.map((inv, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 shadow-neumorphic-soft">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                                  {inv.category}
                                </span>
                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                  inv.status === 'pago' ? 'bg-green-100 text-green-700' :
                                  inv.status === 'aprovado' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {inv.status}
                                </span>
                              </div>
                              <p className="font-semibold text-gray-800 mb-1">{inv.description}</p>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <span>R$ {Number(inv.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                {inv.supplier && <span>• {inv.supplier}</span>}
                                {inv.date && <span>• {format(new Date(inv.date), 'dd/MM/yyyy')}</span>}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveInvestment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulário Novo Investimento */}
                  <div className="bg-blue-50 rounded-xl p-4 space-y-3 border-2 border-blue-200">
                    <p className="text-sm font-semibold text-gray-700">Adicionar Novo Investimento</p>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={newInvestment.category}
                        onChange={(e) => setNewInvestment({...newInvestment, category: e.target.value})}
                        className="px-3 py-2 bg-white shadow-neumorphic-inset border-none rounded-lg text-gray-700 text-sm"
                      >
                        <option value="producao">Produção</option>
                        <option value="fotografia">Fotografia</option>
                        <option value="marketing">Marketing</option>
                        <option value="evento">Evento</option>
                        <option value="logistica">Logística</option>
                        <option value="terceiros">Terceiros</option>
                        <option value="outro">Outro</option>
                      </select>
                      <select
                        value={newInvestment.status}
                        onChange={(e) => setNewInvestment({...newInvestment, status: e.target.value})}
                        className="px-3 py-2 bg-white shadow-neumorphic-inset border-none rounded-lg text-gray-700 text-sm"
                      >
                        <option value="planejado">Planejado</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="pago">Pago</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                    <input
                      value={newInvestment.description}
                      onChange={(e) => setNewInvestment({...newInvestment, description: e.target.value})}
                      placeholder="Descrição do investimento"
                      className="w-full px-3 py-2 bg-white shadow-neumorphic-inset border-none rounded-lg text-gray-700 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={newInvestment.amount}
                        onChange={(e) => setNewInvestment({...newInvestment, amount: e.target.value})}
                        placeholder="Valor (R$)"
                        className="px-3 py-2 bg-white shadow-neumorphic-inset border-none rounded-lg text-gray-700 text-sm"
                      />
                      <input
                        value={newInvestment.supplier}
                        onChange={(e) => setNewInvestment({...newInvestment, supplier: e.target.value})}
                        placeholder="Fornecedor (opcional)"
                        className="px-3 py-2 bg-white shadow-neumorphic-inset border-none rounded-lg text-gray-700 text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddInvestment}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Investimento
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Links e Arquivos */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shadow-neumorphic-soft">
                  <LinkIcon className="w-5 h-5 text-indigo-600"/>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Links & Arquivos</h3>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4 shadow-neumorphic-inset">
                <div className="grid md:grid-cols-2 gap-4">
                  <CustomInput label="Moodboard" value={formData.drive_links.inspiration_board} onChange={(e) => setFormData({...formData, drive_links: {...formData.drive_links, inspiration_board: e.target.value}})} placeholder="Link para o painel de inspiração" />
                  <CustomInput label="Fotos Brutas" value={formData.drive_links.raw_photos} onChange={(e) => setFormData({...formData, drive_links: {...formData.drive_links, raw_photos: e.target.value}})} placeholder="Link para a pasta de fotos brutas" />
                  <CustomInput label="Fotos Editadas" value={formData.drive_links.edited_photos} onChange={(e) => setFormData({...formData, drive_links: {...formData.drive_links, edited_photos: e.target.value}})} placeholder="Link para a pasta de fotos editadas" />
                  <CustomInput label="Vídeos" value={formData.drive_links.videos} onChange={(e) => setFormData({...formData, drive_links: {...formData.drive_links, videos: e.target.value}})} placeholder="Link para a pasta de vídeos" />
                </div>
                <CustomInput label="Material de Marketing" value={formData.drive_links.marketing_materials} onChange={(e) => setFormData({...formData, drive_links: {...formData.drive_links, marketing_materials: e.target.value}})} placeholder="Link para a pasta de marketing" />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center shadow-neumorphic-soft">
                  <Mic className="w-5 h-5 text-gray-600"/>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Observações</h3>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 shadow-neumorphic-inset">
                <CustomTextarea label="Anotações Gerais" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Detalhes adicionais, feedbacks, próximos passos..." />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
          <Button type="button" onClick={onCancel} className="flex-1 shadow-neumorphic hover:shadow-neumorphic-pressed bg-gray-100 font-bold">Cancelar</Button>
          <Button type="submit" onClick={handleSubmit} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft font-bold">Salvar</Button>
        </div>
      </div>
    </div>
  );
}