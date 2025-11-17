import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, User, Tag, Eye, Edit, Trash2, DollarSign, Camera } from "lucide-react";
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

export default function CollectionCard({ collection, stylist, styles, onView, onEdit, onDelete }) {
  const currentStatus = statusConfig[collection.status] || statusConfig.conceito;
  
  const totalInvested = collection.investments?.filter(inv => inv.status === 'pago')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
  const budgetUsed = collection.budget ? Math.round((totalInvested / collection.budget) * 100) : 0;

  return (
    <div className="bg-gray-100 rounded-3xl p-6 flex flex-col justify-between shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-300 cursor-pointer"
         onClick={onView}>
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-medium text-gray-700 mb-2">{collection.name}</h3>
            <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
          </div>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={onEdit} className="bg-gray-100 shadow-neumorphic-soft hover:shadow-neumorphic-pressed rounded-lg">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="bg-gray-100 shadow-neumorphic-soft hover:shadow-neumorphic-pressed text-red-500 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {collection.theme && (
          <p className="text-sm text-gray-600 mb-4 italic">"{collection.theme}"</p>
        )}
        
        {collection.description && (
          <p className="text-sm text-gray-500 mb-6 line-clamp-3">{collection.description}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Datas Importantes */}
        <div className="grid grid-cols-2 gap-2">
          {collection.launch_date && (
            <div className="p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Lançamento</span>
              </div>
              <p className="text-sm font-medium text-gray-700">
                {format(new Date(collection.launch_date), "dd/MM", { locale: ptBR })}
              </p>
            </div>
          )}
          
          {collection.photoshoot_date && (
            <div className="p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
              <div className="flex items-center gap-2 mb-1">
                <Camera className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Fotografia</span>
              </div>
              <p className="text-sm font-medium text-gray-700">
                {format(new Date(collection.photoshoot_date), "dd/MM", { locale: ptBR })}
              </p>
            </div>
          )}
        </div>

        {/* Orçamento */}
        {collection.budget > 0 && (
          <div className="p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Investimento</span>
              </div>
              <span className="text-xs text-gray-600">{budgetUsed}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full shadow-neumorphic-inset mb-2">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-700">
              R$ {totalInvested?.toLocaleString()} / R$ {collection.budget?.toLocaleString()}
            </p>
            {collection.investments && collection.investments.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {collection.investments.length} investimento{collection.investments.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>

      {/* View Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full shadow-neumorphic-soft hover:shadow-neumorphic-pressed text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalhes
        </Button>
      </div>
    </div>
  );
}