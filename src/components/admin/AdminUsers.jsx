import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { Users, TrendingUp, TrendingDown, Award, AlertCircle } from "lucide-react";

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Buscar usuários diretamente do Supabase
    const { data: usersData } = await supabase
      .from('users')
      .select('*');

    const [tasksData, departmentsData] = await Promise.all([
      base44.entities.Task.list(),
      base44.entities.Department.list()
    ]);

    setUsers(usersData || []);
    setTasks(tasksData);
    setDepartments(departmentsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse shadow-neumorphic-inset"></div>
        <p className="text-gray-600">Carregando usuários...</p>
      </div>
    );
  }

  const userAnalysis = users
    .filter(u => u.is_active)
    .map(user => {
      const userTasks = tasks.filter(t => t.assigned_to === user.id);
      const completed = userTasks.filter(t => t.status === 'concluido').length;
      const inProgress = userTasks.filter(t => t.status === 'em_progresso').length;
      const notStarted = userTasks.filter(t => t.status === 'nao_iniciado').length;
      const overdue = userTasks.filter(t => {
        if (!t.due_date || t.status === 'concluido') return false;
        return new Date(t.due_date) < new Date();
      }).length;

      const completionRate = userTasks.length ? Math.round((completed / userTasks.length) * 100) : 0;

      const tasksWithTime = userTasks.filter(t => t.estimated_hours && t.actual_hours);
      const totalEstimated = tasksWithTime.reduce((sum, t) => sum + t.estimated_hours, 0);
      const totalActual = tasksWithTime.reduce((sum, t) => sum + t.actual_hours, 0);
      const timeVariance = totalEstimated ? Math.round(((totalActual - totalEstimated) / totalEstimated) * 100) : null;

      const department = departments.find(d => d.id === user.department_id);

      return {
        ...user,
        department: department?.name || 'Sem departamento',
        departmentColor: department?.color || '#gray',
        totalTasks: userTasks.length,
        completed,
        inProgress,
        notStarted,
        overdue,
        completionRate,
        totalEstimated,
        totalActual,
        timeVariance,
        hasIssues: overdue > 0 || (timeVariance !== null && timeVariance > 20)
      };
    })
    .sort((a, b) => {
      if (a.hasIssues && !b.hasIssues) return -1;
      if (!a.hasIssues && b.hasIssues) return 1;
      return b.completionRate - a.completionRate;
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userAnalysis.map(user => (
          <div key={user.id} className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-neumorphic-soft">
                  <span className="text-white font-semibold">
                    {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{user.full_name}</h3>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: user.departmentColor }}
                    ></span>
                    <p className="text-sm text-gray-600">{user.department}</p>
                  </div>
                </div>
              </div>
              {user.hasIssues && (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                <div className="text-xl font-bold text-gray-800">{user.completionRate}%</div>
                <div className="text-xs text-gray-500">Taxa</div>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                <div className="text-xl font-bold text-green-600">{user.completed}</div>
                <div className="text-xs text-gray-500">Concluídas</div>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                <div className="text-xl font-bold text-blue-600">{user.inProgress}</div>
                <div className="text-xs text-gray-500">Em Andamento</div>
              </div>
            </div>

            {user.overdue > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
                <span className="text-sm text-red-700 font-semibold">
                  ⚠️ {user.overdue} tarefa(s) atrasada(s)
                </span>
              </div>
            )}

            {user.timeVariance !== null && (
              <div className={`p-3 border rounded-xl ${
                user.timeVariance > 0 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    Tempo: {user.totalEstimated}h est. / {user.totalActual}h real
                  </span>
                  <div className="flex items-center gap-1">
                    {user.timeVariance > 0 ? (
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    )}
                    <span className={`font-bold ${user.timeVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {user.timeVariance > 0 ? '+' : ''}{user.timeVariance}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="w-full h-2 bg-gray-100 rounded-full shadow-neumorphic-inset">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${user.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}