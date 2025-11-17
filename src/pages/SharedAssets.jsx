
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Download, ExternalLink, Image as ImageIcon, Video, Eye, Calendar, AlertCircle, Tag, Folder, Link2 } from "lucide-react";

export default function SharedAssetsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get('id');
  
  const [shareLink, setShareLink] = useState(null);
  const [assets, setAssets] = useState([]);
  const [collections, setCollections] = useState([]);
  const [brands, setBrands] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    if (shareId) {
      loadShareLink();
    } else {
      setError("Link inválido");
      setLoading(false);
    }
  }, [shareId]);

  const loadShareLink = async () => {
    try {
      setLoading(true);
      const links = await base44.entities.MarketingShareLink.list();
      const link = links.find(l => l.id === shareId);
      
      if (!link) {
        setError("Link não encontrado ou expirado");
        setLoading(false);
        return;
      }

      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        setError("Este link expirou");
        setLoading(false);
        return;
      }

      if (!link.is_active) {
        setError("Este link não está mais ativo");
        setLoading(false);
        return;
      }

      setShareLink(link);

      if (!link.password) {
        setAuthenticated(true);
        await loadAssets(link.asset_ids, link.id);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar link:", error);
      setError("Erro ao carregar link compartilhado");
      setLoading(false);
    }
  };

  const loadAssets = async (assetIds, linkId) => {
    try {
      const [allAssets, allCollections, allBrands, allCampaigns] = await Promise.all([
        base44.entities.MarketingAsset.list(),
        base44.entities.Collection.list(),
        base44.entities.Brand.list(),
        base44.entities.Campaign.list()
      ]);
      
      const filteredAssets = allAssets.filter(asset => assetIds.includes(asset.id));
      setAssets(filteredAssets);
      setCollections(allCollections);
      setBrands(allBrands);
      setCampaigns(allCampaigns);
      
      const currentLink = await base44.entities.MarketingShareLink.list();
      const linkToUpdate = currentLink.find(l => l.id === linkId);
      if (linkToUpdate) {
        await base44.entities.MarketingShareLink.update(linkId, {
          access_count: (linkToUpdate.access_count || 0) + 1
        });
      }
    } catch (error) {
      console.error("Erro ao carregar assets:", error);
      setError("Erro ao carregar arquivos");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== shareLink.password) {
      setError("Senha incorreta");
      return;
    }

    setAuthenticated(true);
    setError(null);
    await loadAssets(shareLink.asset_ids, shareLink.id);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video':
      case 'reel':
        return Video;
      default:
        return ImageIcon;
    }
  };

  const getCampaignsForAsset = (asset) => {
    return campaigns.filter(c => 
      c.collection_id === asset.collection_id || 
      c.brand_ids?.includes(asset.brand_id)
    );
  };

  const getTotalLinks = () => {
    return assets.reduce((total, asset) => {
      return total + (asset.file_links?.length || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !shareLink) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/'} className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  if (!authenticated && shareLink?.password) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center shadow-neumorphic-soft">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{shareLink.title}</h2>
            {shareLink.description && (
              <p className="text-gray-600 text-sm">{shareLink.description}</p>
            )}
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-700 mb-2 block font-semibold">Senha de Acesso</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Digite a senha"
                className="bg-gray-100 shadow-neumorphic-inset border-none text-gray-800"
                required
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft">
              Acessar Arquivos
            </Button>
          </form>

          {shareLink.expires_at && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3" />
                Válido até {new Date(shareLink.expires_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedAsset) {
    const TypeIcon = getTypeIcon(selectedAsset.type);
    const collection = collections.find(c => c.id === selectedAsset.collection_id);
    const brand = brands.find(b => b.id === selectedAsset.brand_id);
    const assetCampaigns = getCampaignsForAsset(selectedAsset);
    
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
            <Button
              variant="ghost"
              onClick={() => setSelectedAsset(null)}
              className="mb-6 shadow-neumorphic-soft hover:shadow-neumorphic-pressed bg-gray-100"
            >
              ← Voltar
            </Button>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center shadow-neumorphic-soft flex-shrink-0">
                <TypeIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">{selectedAsset.title}</h1>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                    {selectedAsset.type}
                  </span>
                  {selectedAsset.category && (
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700">
                      {selectedAsset.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* FOTO DE CAPA REDUZIDA NO TOPO */}
            {selectedAsset.cover_url && (
              <div className="bg-gray-100 rounded-2xl shadow-neumorphic-inset p-4 mb-6">
                <img 
                  src={selectedAsset.cover_url} 
                  alt={selectedAsset.title}
                  className="w-full max-h-96 object-contain rounded-xl shadow-neumorphic-soft"
                />
              </div>
            )}

            {/* LINKS DE DOWNLOAD - DESTAQUE ABAIXO DA FOTO */}
            {selectedAsset.file_links && selectedAsset.file_links.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 shadow-neumorphic mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-neumorphic-soft">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Arquivos para Download</h3>
                    <p className="text-sm text-gray-600">{selectedAsset.file_links.length} link{selectedAsset.file_links.length !== 1 ? 's' : ''} disponível{selectedAsset.file_links.length !== 1 ? 'is' : ''}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedAsset.file_links.map((link, index) => (
                    <div key={index} className="bg-white rounded-2xl p-5 shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shadow-neumorphic-inset flex-shrink-0">
                            <Link2 className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 mb-1 text-lg">{link.name}</p>
                            <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600 shadow-neumorphic-inset capitalize font-semibold">
                              {link.type}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => window.open(link.url, '_blank')}
                          className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft flex-shrink-0 text-base px-6 py-6"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Acessar Arquivo
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAsset.description && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                <p className="text-gray-600">{selectedAsset.description}</p>
              </div>
            )}

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {collection && (
                <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-500 font-semibold">Coleção</p>
                  </div>
                  <p className="text-gray-800 font-semibold">{collection.name}</p>
                  {collection.description && (
                    <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                  )}
                </div>
              )}

              {brand && (
                <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-500 font-semibold">Marca</p>
                  </div>
                  <p className="text-gray-800 font-semibold">{brand.name}</p>
                </div>
              )}
            </div>

            {/* Campanhas Relacionadas */}
            {assetCampaigns.length > 0 && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Campanhas Relacionadas</h3>
                <div className="space-y-3">
                  {assetCampaigns.map(campaign => (
                    <div key={campaign.id} className="bg-gray-100 rounded-xl p-3 shadow-neumorphic-soft">
                      <p className="font-semibold text-gray-800">{campaign.name}</p>
                      {campaign.description && (
                        <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {campaign.start_date && (
                          <span className="text-xs text-gray-500">
                            Início: {new Date(campaign.start_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {campaign.end_date && (
                          <span className="text-xs text-gray-500">
                            • Fim: {new Date(campaign.end_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedAsset.tags && selectedAsset.tags.length > 0 && (
              <div className="bg-gray-100 rounded-2xl p-4 shadow-neumorphic-inset">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-800">Tags</h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedAsset.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 shadow-neumorphic-inset">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">{shareLink.title}</h1>
          {shareLink.description && (
            <p className="text-gray-600 mb-4">{shareLink.description}</p>
          )}
          
          <div className="flex items-center gap-4 flex-wrap mt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
              <Folder className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-800">{assets.length}</span>
              <span className="text-sm text-blue-700">arquivo{assets.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl">
              <Download className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-800">{getTotalLinks()}</span>
              <span className="text-sm text-purple-700">link{getTotalLinks() !== 1 ? 's' : ''} de download</span>
            </div>
            
            {shareLink.expires_at && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-orange-700">
                  Válido até {new Date(shareLink.expires_at).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map(asset => {
            const TypeIcon = getTypeIcon(asset.type);
            const collection = collections.find(c => c.id === asset.collection_id);
            const brand = brands.find(b => b.id === asset.brand_id);
            const linksCount = asset.file_links?.length || 0;
            
            return (
              <div 
                key={asset.id}
                className="bg-gray-100 rounded-2xl shadow-neumorphic overflow-hidden hover:shadow-neumorphic-pressed transition-all duration-300"
              >
                <div 
                  className="relative h-48 bg-gray-200 group cursor-pointer"
                  onClick={() => setSelectedAsset(asset)}
                >
                  {asset.cover_url ? (
                    <img 
                      src={asset.cover_url} 
                      alt={asset.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TypeIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 shadow-neumorphic-soft">
                      {asset.type}
                    </span>
                  </div>
                  
                  {/* Badge de quantidade de links */}
                  {linksCount > 0 && (
                    <div className="absolute bottom-3 right-3">
                      <div className="px-3 py-1 rounded-lg bg-green-500 text-white shadow-neumorphic-soft flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span className="text-xs font-bold">{linksCount} link{linksCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 truncate">{asset.title}</h3>
                  
                  {asset.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{asset.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {collection && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Folder className="w-3 h-3" />
                        <span className="truncate">{collection.name}</span>
                      </div>
                    )}

                    {brand && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Tag className="w-3 h-3" />
                        <span className="truncate">{brand.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Botão de acesso aos arquivos */}
                  <Button
                    onClick={() => setSelectedAsset(asset)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft font-semibold"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {linksCount > 0 ? `Acessar ${linksCount} Arquivo${linksCount !== 1 ? 's' : ''}` : 'Ver Detalhes'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {assets.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Nenhum arquivo disponível neste momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
