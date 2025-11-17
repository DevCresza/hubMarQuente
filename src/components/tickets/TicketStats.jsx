import React from "react";
import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";

export default function TicketStats({ tickets, currentUser }) {
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => ['aberto', 'em_atendimento', 'aguardando_resposta'].includes(t.status)).length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolvido').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgente' && !['resolvido', 'fechado'].includes(t.status)).length;

  const stats = [
    {
      icon: AlertCircle,
      label: "Total de Chamados",
      value: totalTickets,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: Clock,
      label: "Em Aberto",
      value: openTickets,
      color: "text-orange-500",
      bg: "bg-orange-50"
    },
    {
      icon: CheckCircle,
      label: "Resolvidos",
      value: resolvedTickets,
      color: "text-green-500",
      bg: "bg-green-50"
    },
    {
      icon: XCircle,
      label: "Urgentes",
      value: urgentTickets,
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