import React from "react";
import { Image, Video, CheckCircle, Eye } from "lucide-react";

export default function AssetStats({ assets }) {
  const totalAssets = assets.length;
  const photos = assets.filter(a => a.type === 'foto').length;
  const videos = assets.filter(a => a.type === 'video' || a.type === 'reel').length;
  const approved = assets.filter(a => a.status === 'aprovado' || a.status === 'publicado').length;

  const stats = [
    {
      icon: Image,
      label: "Total de Assets",
      value: totalAssets,
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      icon: Image,
      label: "Fotos",
      value: photos,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: Video,
      label: "Vídeos",
      value: videos,
      color: "text-pink-500",
      bg: "bg-pink-50"
    },
    {
      icon: CheckCircle,
      label: "Aprovados",
      value: approved,
      color: "text-green-500",
      bg: "bg-green-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {stats.map((stat, index) => (
        <div key={index} className="text-center p-4 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
          <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl ${stat.bg} flex items-center justify-center shadow-neumorphic-soft`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div className="text-2xl font-semibold text-gray-800 mb-1">{stat.value}</div>
          <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}