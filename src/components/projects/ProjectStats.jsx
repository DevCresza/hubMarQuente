import React from "react";
import { FolderKanban, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function ProjectStats({ projects, currentUser }) {
  const myProjects = projects.filter(p => p.owner_id === currentUser?.id);
  const activeProjects = projects.filter(p => p.status === 'em_andamento');
  const completedProjects = projects.filter(p => p.status === 'concluido');
  const urgentProjects = projects.filter(p => p.priority === 'urgente');

  const stats = [
    {
      icon: FolderKanban,
      label: "Meus Projetos",
      value: myProjects.length,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: Clock,
      label: "Em Andamento",
      value: activeProjects.length,
      color: "text-yellow-500",
      bg: "bg-yellow-50"
    },
    {
      icon: CheckCircle,
      label: "Concluídos",
      value: completedProjects.length,
      color: "text-green-500",
      bg: "bg-green-50"
    },
    {
      icon: AlertCircle,
      label: "Urgentes",
      value: urgentProjects.length,
      color: "text-red-500",
      bg: "bg-red-50"
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