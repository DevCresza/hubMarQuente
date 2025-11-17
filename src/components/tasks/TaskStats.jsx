import React from "react";
import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";

export default function TaskStats({ tasks, currentUser }) {
  const myTasks = tasks.filter(t => t.assigned_to === currentUser?.id);
  const completed = tasks.filter(t => t.status === "concluido").length;
  const inProgress = tasks.filter(t => t.status === "em_progresso").length;
  const overdue = tasks.filter(t => {
    if (t.status === "concluido" || !t.due_date) return false;
    return new Date(t.due_date) < new Date();
  }).length;
  const myCompleted = myTasks.filter(t => t.status === "concluido").length;
  const myCompletionRate = myTasks.length ? Math.round((myCompleted / myTasks.length) * 100) : 0;

  const statsData = [
    {
      icon: CheckCircle,
      title: "Concluídas",
      value: completed,
      subtitle: `${tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0}% do total`,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: Clock,
      title: "Em Progresso",
      value: inProgress,
      subtitle: `${myTasks.filter(t => t.status === "em_progresso").length} suas`,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: AlertCircle,
      title: "Atrasadas",
      value: overdue,
      subtitle: overdue > 0 ? "Requerem atenção" : "Tudo em dia!",
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      icon: TrendingUp,
      title: "Sua Performance",
      value: `${myCompletionRate}%`,
      subtitle: `${myCompleted}/${myTasks.length} concluídas`,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {statsData.map((stat, index) => (
        <div key={index} className="text-center p-4 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
          <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl ${stat.bgColor} flex items-center justify-center shadow-neumorphic-soft`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
          <div className="text-sm font-semibold text-gray-700 mb-1">{stat.title}</div>
          <div className="text-xs text-gray-500">{stat.subtitle}</div>
        </div>
      ))}
    </div>
  );
}