import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase, supabaseAdmin } from "@/api/supabaseClient";
import { Users, TrendingUp, TrendingDown, Award, AlertCircle, KeyRound, Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetPasswordModal, setResetPasswordModal] = useState(null); // { userId, userName, email }
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

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

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const openResetPasswordModal = (user) => {
    const generated = generateRandomPassword();
    setNewPassword(generated);
    setShowPassword(true);
    setPasswordCopied(false);
    setPasswordResetSuccess(false);
    setResetPasswordModal({ userId: user.id, userName: user.full_name, email: user.email });
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!supabaseAdmin) {
      alert("Service key não configurada. Configure VITE_SUPABASE_SERVICE_KEY no .env");
      return;
    }

    setResettingPassword(true);
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUser(
        resetPasswordModal.userId,
        { password: newPassword }
      );

      if (error) {
        throw error;
      }

      setPasswordResetSuccess(true);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      alert("Erro ao redefinir senha: " + (error.message || "Tente novamente"));
    } finally {
      setResettingPassword(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
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
      const completed = userTasks.filter(t => t.status === 'done').length;
      const inProgress = userTasks.filter(t => t.status === 'in_progress').length;
      const notStarted = userTasks.filter(t => t.status === 'todo').length;
      const overdue = userTasks.filter(t => {
        if (!t.due_date || t.status === 'done') return false;
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

            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="w-full h-2 bg-gray-100 rounded-full shadow-neumorphic-inset">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                    style={{ width: `${user.completionRate}%` }}
                  ></div>
                </div>
              </div>
              <Button
                onClick={() => openResetPasswordModal(user)}
                variant="outline"
                size="sm"
                className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 shadow-neumorphic-soft"
              >
                <KeyRound className="w-4 h-4 mr-1" />
                Nova Senha
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Redefinição de Senha */}
      {resetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Redefinir Senha</h3>
                <p className="text-sm text-gray-500">{resetPasswordModal.userName}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              E-mail: <strong>{resetPasswordModal.email}</strong>
            </p>

            {passwordResetSuccess ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-800 font-semibold mb-2">Senha redefinida com sucesso!</p>
                  <p className="text-sm text-green-700">
                    Envie a nova senha ao usuário. Ele poderá alterá-la após o login.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border">
                  <input
                    type="text"
                    value={newPassword}
                    readOnly
                    className="flex-1 bg-transparent text-gray-800 font-mono text-sm outline-none"
                  />
                  <button
                    onClick={copyPassword}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Copiar senha"
                  >
                    {passwordCopied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>

                <Button
                  onClick={() => setResetPasswordModal(null)}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                >
                  Fechar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nova Senha</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={copyPassword}
                      className="p-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
                      title="Copiar senha"
                    >
                      {passwordCopied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setNewPassword(generateRandomPassword())}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Gerar nova senha aleatória
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setResetPasswordModal(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleResetPassword}
                    disabled={resettingPassword || !newPassword || newPassword.length < 6}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {resettingPassword ? "Redefinindo..." : "Redefinir Senha"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}