
import React from "react";
import { Users, UserCheck, Clock, Trophy, Shield, Star } from "lucide-react";

export default function UserStats({ users, departments, tasks, currentUser }) {
  const activeUsers = users.filter(u => u.is_active);
  const inactiveUsers = users.filter(u => !u.is_active);
  const usersWithTasks = users.filter(u => tasks.some(t => t.assigned_to === u.id));
  const completedTasks = tasks.filter(t => t.status === 'concluido');
  const totalTasks = tasks.length;
  
  const overallProgress = totalTasks ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const managerUsers = users.filter(u => u.role === 'manager').length;

  const statsData = [
    {
      icon: Users,
      title: "Total de Usuários",
      value: users.length,
      subtitle: `${activeUsers.length} ativos • ${inactiveUsers.length} inativos`,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: UserCheck,
      title: "Com Tarefas",
      value: usersWithTasks.length,
      subtitle: `${Math.round((usersWithTasks.length / (users.length || 1)) * 100)}% dos usuários`,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: Trophy,
      title: "Progresso Geral",
      value: `${overallProgress}%`,
      subtitle: `${completedTasks.length}/${totalTasks} tarefas`,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: Shield,
      title: "Administradores",
      value: adminUsers,
      subtitle: `${managerUsers} gerentes`,
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {statsData.map((stat, index) => (
        <div key={index} className="text-center p-4 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
          <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl ${stat.bgColor} flex items-center justify-center shadow-neumorphic-soft`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div className="text-2xl font-semibold text-gray-800 mb-1">{stat.value}</div>
          <div className="text-sm font-semibold text-gray-700 mb-1">{stat.title}</div>
          <div className="text-xs text-gray-500">{stat.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
