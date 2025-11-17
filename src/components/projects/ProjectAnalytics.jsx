import React from "react";
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Calendar,
  BarChart3,
  Target,
  Zap
} from "lucide-react";

export default function ProjectAnalytics({ project, tasks, users }) {
  // Cálculos de métricas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'concluido').length;
  const inProgressTasks = tasks.filter(t => t.status === 'em_progresso').length;
  const notStartedTasks = tasks.filter(t => t.status === 'nao_iniciado').length;
  
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'concluido') return false;
    return new Date(t.due_date) < new Date();
  }).length;

  const blockedTasks = tasks.filter(t => {
    if (!t.dependencies || t.dependencies.length === 0) return false;
    const depTasks = tasks.filter(dt => t.dependencies.includes(dt.id));
    return depTasks.some(dt => dt.status !== 'concluido');
  }).length;

  const highPriorityTasks = tasks.filter(t => 
    (t.priority === 'alta' || t.priority === 'urgente') && t.status !== 'concluido'
  ).length;

  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Tempo estimado vs real
  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
  const totalActualHours = tasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);
  const timeVariance = totalEstimatedHours ? Math.round(((totalActualHours - totalEstimatedHours) / totalEstimatedHours) * 100) : 0;

  // Produtividade da equipe
  const teamMembers = users.filter(u => project.team_members?.includes(u.id) || u.id === project.owner_id);
  const tasksByMember = teamMembers.map(member => ({
    user: member,
    total: tasks.filter(t => t.assigned_to === member.id).length,
    completed: tasks.filter(t => t.assigned_to === member.id && t.status === 'concluido').length,
    inProgress: tasks.filter(t => t.assigned_to === member.id && t.status === 'em_progresso').length
  }));

  // Estimativa de conclusão
  const remainingTasks = totalTasks - completedTasks;
  const avgTasksPerWeek = completedTasks > 0 ? completedTasks / 4 : 1; // Assumindo 4 semanas
  const weeksToComplete = remainingTasks > 0 ? Math.ceil(remainingTasks / avgTasksPerWeek) : 0;

  // Health Score do projeto
  const healthScore = Math.round(
    (completionRate * 0.4) + 
    ((100 - (overdueTasks / totalTasks) * 100) * 0.3) + 
    ((100 - (blockedTasks / totalTasks) * 100) * 0.3)
  );

  const getHealthColor = (score) => {
    if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Excelente' };
    if (score >= 60) return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Bom' };
    if (score >= 40) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Atenção' };
    return { bg: 'bg-red-100', text: 'text-red-700', label: 'Crítico' };
  };

  const health = getHealthColor(healthScore);

  return (
    <div className="space-y-6">
      {/* Health Score */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl shadow-neumorphic p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-neumorphic-soft">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Health Score do Projeto</h3>
              <p className="text-sm text-gray-600">Avaliação geral de saúde</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-600">{healthScore}</div>
            <div className={`text-sm font-semibold px-3 py-1 rounded-lg ${health.bg} ${health.text}`}>
              {health.label}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{completionRate}%</div>
            <div className="text-xs text-gray-600">Conclusão</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{overdueTasks}</div>
            <div className="text-xs text-gray-600">Atrasadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{blockedTasks}</div>
            <div className="text-xs text-gray-600">Bloqueadas</div>
          </div>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-neumorphic-soft">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{completionRate}%</div>
          <div className="text-sm text-gray-600">Taxa de Conclusão</div>
          <div className="mt-2 w-full h-2 bg-gray-100 rounded-full shadow-neumorphic-inset">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shadow-neumorphic-soft">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{completedTasks}</div>
          <div className="text-sm text-gray-600">Tarefas Concluídas</div>
          <div className="text-xs text-gray-500 mt-1">
            {inProgressTasks} em progresso • {notStartedTasks} não iniciadas
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shadow-neumorphic-soft">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{overdueTasks + blockedTasks}</div>
          <div className="text-sm text-gray-600">Tarefas com Problema</div>
          <div className="text-xs text-gray-500 mt-1">
            {overdueTasks} atrasadas • {blockedTasks} bloqueadas
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shadow-neumorphic-soft">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{weeksToComplete}</div>
          <div className="text-sm text-gray-600">Semanas Restantes</div>
          <div className="text-xs text-gray-500 mt-1">
            Estimativa baseada em {avgTasksPerWeek.toFixed(1)} tarefas/semana
          </div>
        </div>
      </div>

      {/* Tempo: Estimado vs Real */}
      {totalEstimatedHours > 0 && (
        <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-800">Análise de Tempo</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset">
              <div className="text-2xl font-bold text-blue-600">{totalEstimatedHours}h</div>
              <div className="text-sm text-gray-600">Tempo Estimado</div>
            </div>
            
            <div className="text-center p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset">
              <div className="text-2xl font-bold text-purple-600">{totalActualHours}h</div>
              <div className="text-sm text-gray-600">Tempo Real</div>
            </div>
            
            <div className="text-center p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset">
              <div className={`text-2xl font-bold ${timeVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {timeVariance > 0 ? '+' : ''}{timeVariance}%
              </div>
              <div className="text-sm text-gray-600">Variação</div>
            </div>
          </div>
        </div>
      )}

      {/* Produtividade da Equipe */}
      <div className="bg-gray-100 rounded-2xl shadow-neumorphic p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-800">Produtividade da Equipe</h3>
        </div>
        
        <div className="space-y-4">
          {tasksByMember.map(member => {
            const memberCompletionRate = member.total ? Math.round((member.completed / member.total) * 100) : 0;
            
            return (
              <div key={member.user.id} className="p-4 bg-gray-100 rounded-xl shadow-neumorphic-inset">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center shadow-neumorphic-soft">
                      <span className="text-white text-sm font-semibold">
                        {member.user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{member.user.full_name}</p>
                      <p className="text-xs text-gray-500">
                        {member.completed}/{member.total} tarefas concluídas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">{memberCompletionRate}%</div>
                  </div>
                </div>
                
                <div className="w-full h-2 bg-gray-100 rounded-full shadow-neumorphic-inset">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                    style={{ width: `${memberCompletionRate}%` }}
                  ></div>
                </div>
                
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="text-green-600">✓ {member.completed} concluídas</span>
                  <span className="text-blue-600">⏳ {member.inProgress} em progresso</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alertas e Riscos */}
      {(overdueTasks > 0 || blockedTasks > 0 || highPriorityTasks > 0) && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-semibold text-red-800">Alertas e Riscos</h3>
          </div>
          
          <div className="space-y-3">
            {overdueTasks > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-gray-800">Tarefas Atrasadas</span>
                </div>
                <span className="text-xl font-bold text-red-600">{overdueTasks}</span>
              </div>
            )}
            
            {blockedTasks > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-800">Tarefas Bloqueadas</span>
                </div>
                <span className="text-xl font-bold text-orange-600">{blockedTasks}</span>
              </div>
            )}
            
            {highPriorityTasks > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-800">Alta Prioridade Pendente</span>
                </div>
                <span className="text-xl font-bold text-yellow-600">{highPriorityTasks}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}