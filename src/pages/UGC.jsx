
import React, { useState, useEffect } from "react";
import { UGC } from "@/api/entities";
import { Brand } from "@/api/entities";
import { Campaign } from "@/api/entities";
import { Plus, Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import UGCCard from "../components/ugc/UGCCard";
import UGCForm from "../components/ugc/UGCForm";
import UGCStats from "../components/ugc/UGCStats";
import UGCFilters from "../components/ugc/UGCFilters";

export default function UGCPage() {
  const [ugcs, setUgcs] = useState([]);
  const [brands, setBrands] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    tier: "all",
    status: "ativo",
    brand: "all"
  });
  const [showForm, setShowForm] = useState(false);
  const [editingUGC, setEditingUGC] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [ugcsData, brandsData, campaignsData] = await Promise.all([
      UGC.list("-likes"),
      Brand.list("name"),
      Campaign.list("-start_date")
    ]);
    setUgcs(ugcsData);
    setBrands(brandsData);
    setCampaigns(campaignsData);
    setLoading(false);
  };

  const handleSaveUGC = async (ugcData) => {
    if (editingUGC) {
      await UGC.update(editingUGC.id, ugcData);
    } else {
      await UGC.create(ugcData);
    }
    setShowForm(false);
    setEditingUGC(null);
    loadData();
  };

  const handleEditUGC = (ugc) => {
    setEditingUGC(ugc);
    setShowForm(true);
  };

  const handleToggleStatus = async (ugcId, currentStatus) => {
    const newStatus = currentStatus === "ativo" ? "inativo" : "ativo";
    await UGC.update(ugcId, { status: newStatus });
    loadData();
  };

  const filteredUGCs = ugcs.filter(ugc => {
    const searchMatch = 
      ugc.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      ugc.instagram?.toLowerCase().includes(filters.search.toLowerCase());
    
    const tierMatch = filters.tier === "all" || ugc.tier === filters.tier;
    const statusMatch = filters.status === "all" || ugc.status === filters.status;
    const brandMatch = filters.brand === "all" || ugc.preferred_brands?.includes(filters.brand);

    return searchMatch && tierMatch && statusMatch && brandMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando UGCs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Gestão de UGCs</h1>
              <p className="text-gray-600">
                Gerencie influenciadores, criadores de conteúdo e parcerias
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo UGC
            </Button>
          </div>

          {/* Stats */}
          <UGCStats ugcs={ugcs} campaigns={campaigns} />
        </div>

        {/* Filters */}
        <UGCFilters 
          filters={filters}
          setFilters={setFilters}
          brands={brands}
          ugcCount={filteredUGCs.length}
        />

        {/* UGCs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUGCs.map(ugc => (
            <UGCCard
              key={ugc.id}
              ugc={ugc}
              brands={brands}
              onEdit={() => handleEditUGC(ugc)}
              onToggleStatus={() => handleToggleStatus(ugc.id, ugc.status)}
            />
          ))}
        </div>

        {filteredUGCs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 shadow-neumorphic-inset flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum UGC encontrado</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.tier !== 'all' || filters.status !== 'ativo'
                ? "Tente ajustar os filtros de busca"
                : "Comece adicionando o primeiro criador de conteúdo"
              }
            </p>
            {(!filters.search && filters.tier === 'all' && filters.status === 'ativo') && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro UGC
              </Button>
            )}
          </div>
        )}

        {/* UGC Form Modal */}
        {showForm && (
          <UGCForm
            ugc={editingUGC}
            brands={brands}
            onSave={handleSaveUGC}
            onCancel={() => {
              setShowForm(false);
              setEditingUGC(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
