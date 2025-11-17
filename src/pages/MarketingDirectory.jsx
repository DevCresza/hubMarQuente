import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { Plus, Image, Video, Filter, Grid, List, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssetCard from "../components/marketing/AssetCard";
import AssetForm from "../components/marketing/AssetForm";
import AssetDetails from "../components/marketing/AssetDetails";
import AssetFilters from "../components/marketing/AssetFilters";
import AssetStats from "../components/marketing/AssetStats";
import ShareLinkModal from "../components/marketing/ShareLinkModal";

export default function MarketingDirectoryPage() {
  const [assets, setAssets] = useState([]);
  const [collections, setCollections] = useState([]);
  const [brands, setBrands] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    collection: "all",
    brand: "all",
    status: "all",
    category: "all"
  });
  const [viewMode, setViewMode] = useState("grid");
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);

    // Buscar usuários diretamente do Supabase
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('full_name');

    const [assetsData, collectionsData, brandsData] = await Promise.all([
      base44.entities.MarketingAsset.list("-created_date"),
      base44.entities.Collection.list("name"),
      base44.entities.Brand.list("name")
    ]);

    setAssets(assetsData);
    setCollections(collectionsData);
    setBrands(brandsData);
    setUsers(usersData || []);
    setLoading(false);
  };

  const handleSaveAsset = async (assetData) => {
    try {
      if (editingAsset) {
        await base44.entities.MarketingAsset.update(editingAsset.id, assetData);
      } else {
        await base44.entities.MarketingAsset.create({
          ...assetData,
          created_by: currentUser?.id
        });
      }
      setShowForm(false);
      setEditingAsset(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar asset:", error);
      alert("Erro ao salvar asset. Verifique os dados e tente novamente.");
    }
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleViewAsset = (asset) => {
    setSelectedAsset(asset);
  };

  const handleToggleSelect = (asset) => {
    if (selectedAssets.some(a => a.id === asset.id)) {
      setSelectedAssets(selectedAssets.filter(a => a.id !== asset.id));
    } else {
      setSelectedAssets([...selectedAssets, asset]);
    }
  };

  const handleClearSelection = () => {
    setSelectedAssets([]);
  };

  const handleCreateShareLink = () => {
    if (selectedAssets.length === 0) {
      alert("Selecione pelo menos um arquivo para compartilhar");
      return;
    }
    setShowShareModal(true);
  };

  const getFilteredAssets = () => {
    return assets.filter(asset => {
      const searchMatch = 
        asset.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.description?.toLowerCase().includes(filters.search.toLowerCase());

      const typeMatch = filters.type === "all" || asset.type === filters.type;
      const collectionMatch = filters.collection === "all" || asset.collection_id === filters.collection;
      const brandMatch = filters.brand === "all" || asset.brand_id === filters.brand;
      const statusMatch = filters.status === "all" || asset.status === filters.status;
      const categoryMatch = filters.category === "all" || asset.category === filters.category;

      return searchMatch && typeMatch && collectionMatch && brandMatch && statusMatch && categoryMatch;
    });
  };

  const filteredAssets = getFilteredAssets();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando diretório...</p>
        </div>
      </div>
    );
  }

  if (selectedAsset) {
    return (
      <AssetDetails
        asset={selectedAsset}
        collections={collections}
        brands={brands}
        users={users}
        currentUser={currentUser}
        onBack={() => setSelectedAsset(null)}
        onEdit={() => handleEditAsset(selectedAsset)}
        onUpdate={loadData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Diretório de Marketing</h1>
              <p className="text-gray-600">
                Biblioteca de fotos, vídeos e materiais de marketing por coleção e marca
              </p>
            </div>
            <div className="flex gap-3">
              {selectedAssets.length > 0 && (
                <>
                  <Button
                    onClick={handleCreateShareLink}
                    className="bg-purple-500 hover:bg-purple-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Compartilhar ({selectedAssets.length})
                  </Button>
                  <Button
                    onClick={handleClearSelection}
                    variant="outline"
                    className="shadow-neumorphic hover:shadow-neumorphic-pressed bg-gray-100"
                  >
                    Limpar Seleção
                  </Button>
                </>
              )}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid" 
                      ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list" 
                      ? 'shadow-neumorphic-pressed bg-gray-100 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Asset
              </Button>
            </div>
          </div>

          <AssetStats assets={filteredAssets} />
        </div>

        <AssetFilters 
          filters={filters}
          setFilters={setFilters}
          collections={collections}
          brands={brands}
          assetCount={filteredAssets.length}
        />

        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
        }>
          {filteredAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              collection={collections.find(c => c.id === asset.collection_id)}
              brand={brands.find(b => b.id === asset.brand_id)}
              viewMode={viewMode}
              isSelected={selectedAssets.some(a => a.id === asset.id)}
              onSelect={() => handleToggleSelect(asset)}
              onView={() => handleViewAsset(asset)}
              onEdit={() => handleEditAsset(asset)}
            />
          ))}
        </div>

        {filteredAssets.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 shadow-neumorphic-inset flex items-center justify-center">
              <Image className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum asset encontrado</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.type !== 'all'
                ? "Tente ajustar os filtros de busca"
                : "Comece adicionando fotos e vídeos ao diretório"
              }
            </p>
          </div>
        )}

        {showForm && (
          <AssetForm
            asset={editingAsset}
            collections={collections}
            brands={brands}
            users={users}
            currentUser={currentUser}
            onSave={handleSaveAsset}
            onCancel={() => {
              setShowForm(false);
              setEditingAsset(null);
            }}
          />
        )}

        {showShareModal && (
          <ShareLinkModal
            assets={selectedAssets}
            currentUser={currentUser}
            onClose={() => {
              setShowShareModal(false);
              handleClearSelection();
            }}
          />
        )}
      </div>
    </div>
  );
}