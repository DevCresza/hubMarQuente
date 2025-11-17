
import React, { useState, useEffect } from "react";
import { Collection } from "@/api/entities";
import { Stylist } from "@/api/entities";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import CollectionCard from "../components/collections/CollectionCard";
import CollectionForm from "../components/collections/CollectionForm";
import CollectionDetails from "../components/collections/CollectionDetails";

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [collectionsData, stylistsData] = await Promise.all([
      Collection.list("-launch_date"),
      Stylist.list("name"),
    ]);
    setCollections(collectionsData);
    setStylists(stylistsData);
    setLoading(false);
  };

  const handleSaveCollection = async (collectionData) => {
    if (editingCollection) {
      await Collection.update(editingCollection.id, collectionData);
    } else {
      await Collection.create(collectionData);
    }
    setShowForm(false);
    setEditingCollection(null);
    loadData();
    if(selectedCollection){
      const updatedSelection = await Collection.get(selectedCollection.id);
      setSelectedCollection(updatedSelection);
    }
  };

  const handleEditCollection = (collection) => {
    setEditingCollection(collection);
    setShowForm(true);
  };

  const handleDeleteCollection = async (collectionId) => {
    if (confirm("Tem certeza que deseja excluir esta coleção?")) {
      await Collection.delete(collectionId);
      if(selectedCollection && selectedCollection.id === collectionId){
        setSelectedCollection(null);
      }
      loadData();
    }
  };

  const handleViewCollection = (collection) => {
    setSelectedCollection(collection);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
          <p className="text-gray-600">Carregando coleções...</p>
        </div>
      </div>
    );
  }

  if (selectedCollection) {
    return (
      <CollectionDetails
        collection={selectedCollection}
        onBack={() => setSelectedCollection(null)}
        onEdit={() => handleEditCollection(selectedCollection)}
        onDelete={() => handleDeleteCollection(selectedCollection.id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Gestão de Coleções</h1>
              <p className="text-gray-600">Planeje e organize seus drops e lançamentos</p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Coleção
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map(collection => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              stylist={stylists.find(s => s.id === collection.stylist)}
              onView={() => handleViewCollection(collection)}
              onEdit={() => handleEditCollection(collection)}
              onDelete={() => handleDeleteCollection(collection.id)}
            />
          ))}
        </div>

        {collections.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 shadow-neumorphic-inset flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">Nenhuma coleção criada</h3>
            <p className="text-gray-600 mb-6">Comece a planejar seu próximo lançamento.</p>
            <Button onClick={() => setShowForm(true)} className="bg-blue-500 hover:bg-blue-600 text-white shadow-neumorphic-soft">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Coleção
            </Button>
          </div>
        )}

        {showForm && (
          <CollectionForm
            collection={editingCollection}
            stylists={stylists}
            onSave={handleSaveCollection}
            onCancel={() => {
              setShowForm(false);
              setEditingCollection(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
