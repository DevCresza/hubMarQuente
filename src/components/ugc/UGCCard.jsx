
import React from "react";
import {
  Instagram,
  Users,
  TrendingUp,
  MapPin,
  DollarSign,
  Edit,
  MoreVertical,
  Star,
  Calendar,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tierConfig = {
  nano: { label: "Nano", color: "bg-gray-100 text-gray-700", range: "1K-10K" },
  micro: { label: "Micro", color: "bg-green-100 text-green-700", range: "10K-100K" },
  macro: { label: "Macro", color: "bg-blue-100 text-blue-700", range: "100K-1M" },
  mega: { label: "Mega", color: "bg-purple-100 text-purple-700", range: "1M+" },
  celebrity: { label: "Celebrity", color: "bg-yellow-100 text-yellow-700", range: "5M+" }
};

const statusConfig = {
  ativo: { label: "Ativo", color: "bg-green-100 text-green-700" },
  inativo: { label: "Inativo", color: "bg-gray-100 text-gray-700" },
  favorito: { label: "Favorito", color: "bg-yellow-100 text-yellow-700" },
  blacklist: { label: "Blacklist", color: "bg-red-100 text-red-700" }
};

export default function UGCCard({ ugc, brands, onEdit, onToggleStatus }) {
  const tierInfo = tierConfig[ugc.tier] || tierConfig.micro;
  const statusInfo = statusConfig[ugc.status] || statusConfig.ativo;

  const formatFollowers = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || "0";
  };

  const getPreferredBrandNames = () => {
    if (!ugc.preferred_brands || ugc.preferred_brands.length === 0) return "Nenhuma preferência";
    return ugc.preferred_brands
      .map(brandId => {
        const brand = brands.find(b => b.id === brandId);
        return brand ? brand.name : brandId;
      })
      .join(", ");
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  };

  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6 hover:shadow-neumorphic-pressed transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-neumorphic-soft">
            <span className="text-white font-semibold text-sm">
              {getInitials(ugc.name)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{ugc.name}</h3>
            <p className="text-sm text-gray-600">{ugc.location || "Localização não informada"}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="shadow-neumorphic bg-gray-100 border-none">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleStatus}>
              <Star className="w-4 h-4 mr-2" />
              {ugc.status === "ativo" ? "Marcar como Favorito" : "Ativar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status e Tier */}
      <div className="flex gap-2 mb-4">
        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        <Badge className={tierInfo.color}>
          {tierInfo.label} ({tierInfo.range})
        </Badge>
      </div>

      {/* Social Media Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
          <div className="flex items-center gap-2 mb-1">
            <Instagram className="w-4 h-4 text-pink-500" />
            <span className="text-xs text-gray-500">Instagram</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">
            {formatFollowers(ugc.followers_instagram)}
          </p>
          <p className="text-xs text-gray-600">@{ugc.instagram || "N/A"}</p>
        </div>

        <div className="p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Engagement</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">
            {ugc.engagement_rate ? `${ugc.engagement_rate}%` : "N/A"}
          </p>
          <p className="text-xs text-gray-600">Taxa média</p>
        </div>
      </div>

      {/* Pricing */}
      {(ugc.rate_per_post || ugc.rate_per_story) && (
        <div className="p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Valores</span>
          </div>
          <div className="space-y-1">
            {ugc.rate_per_post && (
              <p className="text-xs text-gray-600">
                Post: R$ {ugc.rate_per_post.toLocaleString()}
              </p>
            )}
            {ugc.rate_per_story && (
              <p className="text-xs text-gray-600">
                Story: R$ {ugc.rate_per_story.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Performance */}
      {ugc.total_collaborations > 0 && (
        <div className="p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">Histórico</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-semibold text-gray-700">{ugc.total_collaborations}</p>
              <p className="text-gray-500">Colaborações</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {ugc.average_performance ? `${ugc.average_performance}%` : "N/A"}
              </p>
              <p className="text-gray-500">Performance</p>
            </div>
          </div>
        </div>
      )}

      {/* Preferred Brands */}
      <div className="p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-xs text-gray-500">Marcas Preferidas</span>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">
          {getPreferredBrandNames()}
        </p>
      </div>

      {/* Contact */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            {ugc.email}
          </div>
          <div className="text-xs text-gray-400">
            {ugc.last_collaboration && (
              <>Última: {new Date(ugc.last_collaboration).toLocaleDateString()}</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
