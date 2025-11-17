
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Edit, 
  Trash2, 
  DollarSign, 
  Target, 
  Image,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  conceito: { label: "Conceito", color: "bg-purple-100 text-purple-800" },
  planejamento: { label: "Planejamento", color: "bg-yellow-100 text-yellow-800" },
  desenvolvimento: { label: "Desenvolvimento", color: "bg-blue-100 text-blue-800" },
  producao: { label: "Produção", color: "bg-orange-100 text-orange-800" },
  fotografia: { label: "Fotografia", color: "bg-green-100 text-green-800" },
  campanha: { label: "Campanha", color: "bg-indigo-100 text-indigo-800" },
  lancado: { label: "Lançado", color: "bg-green-100 text-green-800" },
  arquivado: { label: "Arquivado", color: "bg-gray-200 text-gray-800" },
};

export default function CollectionDetails({ collection, onBack, onEdit, onDelete }) {
  const currentStatus = statusConfig[collection.status] || statusConfig.conceito;
  
  const totalInvested = collection.investments?.filter(inv => inv.status === 'pago')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
  const budgetUsed = collection.budget ? Math.round((totalInvested / collection.budget) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">{collection.name}</h1>
              <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
            </div>
            <div className="flex gap-3">
              <Button onClick={onEdit} className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button 
                onClick={onDelete}
                variant="outline"
                className="shadow-neumorphic hover:shadow-neumorphic-pressed bg-gray-100 text-red-600 border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>

          {collection.theme && (
            <div className="text-center">
              <p className="text-xl text-gray-600 italic">"{collection.theme}"</p>
            </div>
          )}
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição */}
            {collection.description && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Conceito da Coleção</h3>
                <p className="text-gray-600 leading-relaxed">{collection.description}</p>
              </div>
            )}

            {/* Inspiração */}
            {collection.inspiration && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Inspirações</h3>
                <p className="text-gray-600 leading-relaxed">{collection.inspiration}</p>
              </div>
            )}

            {/* Público-alvo */}
            {collection.target_audience && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Público-alvo</h3>
                <p className="text-gray-600 leading-relaxed">{collection.target_audience}</p>
              </div>
            )}

            {/* Investimentos Detalhados */}
            {collection.investments && collection.investments.length > 0 && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Investimentos Detalhados</h3>
                <div className="space-y-3">
                  {collection.investments.map((inv, index) => (
                    <div key={index} className="p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                      <div className="flex items-start justify-between mb-2">
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
                            {inv.supplier && <span>Fornecedor: {inv.supplier}</span>}
                            {inv.date && <span>• {format(new Date(inv.date), 'dd/MM/yyyy')}</span>}
                          </div>
                          {inv.notes && (
                            <p className="text-sm text-gray-500 mt-2">{inv.notes}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="text-lg font-semibold text-gray-800">
                            R$ {Number(inv.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links do Drive */}
            {collection.drive_links && Object.values(collection.drive_links).some(v => v) && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Arquivos da Coleção</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(collection.drive_links).map(([key, url]) => {
                    if (!url) return null;
                    const labels = {
                      inspiration_board: "Mood Board",
                      raw_photos: "Fotos Brutas",
                      edited_photos: "Fotos Editadas",
                      videos: "Vídeos",
                      marketing_materials: "Material de Marketing"
                    };
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset hover:shadow-neumorphic-pressed transition-all duration-200 flex items-center gap-3"
                      >
                        <Image className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-700 font-medium">{labels[key]}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Parcerias */}
            {collection.brand_partnerships && collection.brand_partnerships.length > 0 && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Parcerias da Coleção</h3>
                <div className="space-y-4">
                  {collection.brand_partnerships.map((partnership, index) => (
                    <div key={index} className="p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-700">{partnership.brand_name}</h4>
                          <p className="text-sm text-gray-500">{partnership.partnership_type}</p>
                          {partnership.contact_info && (
                            <p className="text-sm text-gray-600 mt-1">{partnership.contact_info}</p>
                          )}
                        </div>
                        {partnership.contract_value && (
                          <div className="text-right">
                            <span className="text-lg font-semibold text-green-600">
                              R$ {partnership.contract_value.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cronograma */}
            <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Cronograma</h3>
              <div className="space-y-4">
                {collection.production_start && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Início da Produção</p>
                      <p className="font-semibold text-gray-700">
                        {format(new Date(collection.production_start), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                
                {collection.photoshoot_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Sessão de Fotos</p>
                      <p className="font-semibold text-gray-700">
                        {format(new Date(collection.photoshoot_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                
                {collection.campaign_start && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Início da Campanha</p>
                      <p className="font-semibold text-gray-700">
                        {format(new Date(collection.campaign_start), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                
                {collection.launch_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500">Lançamento</p>
                      <p className="font-semibold text-gray-700">
                        {format(new Date(collection.launch_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Orçamento */}
            {collection.budget > 0 && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Orçamento & Investimentos</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Orçamento Total</span>
                    <span className="text-xl font-semibold text-gray-700">
                      R$ {collection.budget.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Investido</span>
                    <span className="text-lg font-semibold text-blue-600">
                      R$ {totalInvested.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="w-full h-3 bg-gray-100 rounded-full shadow-neumorphic-inset">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{budgetUsed}% utilizado</span>
                    <span className="text-gray-500">
                      R$ {(collection.budget - totalInvested).toLocaleString()} disponível
                    </span>
                  </div>
                  
                  {collection.investments && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        {collection.investments.length} investimento{collection.investments.length !== 1 ? 's' : ''} cadastrado{collection.investments.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {collection.investments.filter(i => i.status === 'pago').length} pago{collection.investments.filter(i => i.status === 'pago').length !== 1 ? 's' : ''} • 
                        {collection.investments.filter(i => i.status === 'aprovado').length} aprovado{collection.investments.filter(i => i.status === 'aprovado').length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Observações */}
            {collection.notes && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Observações</h3>
                <p className="text-gray-600 leading-relaxed">{collection.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
