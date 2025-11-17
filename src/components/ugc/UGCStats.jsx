
import React from "react";
import { Users, TrendingUp, DollarSign, Star } from "lucide-react";

export default function UGCStats({ ugcs, campaigns }) {
  const activeUGCs = ugcs.filter(u => u.status === "ativo");
  const favoriteUGCs = ugcs.filter(u => u.status === "favorito");
  const totalFollowers = ugcs.reduce((sum, ugc) => sum + (ugc.followers_instagram || 0), 0);
  const averageEngagement = ugcs.length ? 
    ugcs.reduce((sum, ugc) => sum + (ugc.engagement_rate || 0), 0) / ugcs.length : 0;
  
  const activeCampaigns = campaigns.filter(c => c.status === "ativa");
  const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0);
  
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString();
  };

  const stats = [
    {
      icon: Users,
      label: "UGCs Ativos",
      value: activeUGCs.length,
      colorClass: "bg-blue-100 text-blue-600"
    },
    {
      icon: Star,
      label: "Favoritos",
      value: favoriteUGCs.length,
      colorClass: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: TrendingUp,
      label: "Alcance Total",
      value: formatNumber(totalFollowers),
      colorClass: "bg-green-100 text-green-600"
    },
    {
      icon: DollarSign,
      label: "Orçamento Total",
      value: `R$ ${formatNumber(totalBudget)}`,
      colorClass: "bg-red-100 text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-2xl shadow-neumorphic-inset">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl shadow-neumorphic-soft ${stat.colorClass}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
