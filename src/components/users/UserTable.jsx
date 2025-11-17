import React from "react";
import { format } from "date-fns";
import { Edit, UserCheck, UserX, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserTable({ users, departments, tasks, onEdit, onToggleStatus, canEdit }) {
  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : "Sem departamento";
  };

  const getUserTasks = (userId) => {
    const userTasks = tasks.filter(task => task.assigned_to === userId);
    const completed = userTasks.filter(t => t.status === 'concluido').length;
    return { total: userTasks.length, completed };
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  };

  return (
    <div className="bg-gray-100 rounded-2xl shadow-neumorphic overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200">
            <TableHead className="text-gray-600 font-medium">Usuário</TableHead>
            <TableHead className="text-gray-600 font-medium">Departamento</TableHead>
            <TableHead className="text-gray-600 font-medium">Contato</TableHead>
            <TableHead className="text-gray-600 font-medium">Tarefas</TableHead>
            <TableHead className="text-gray-600 font-medium">Status</TableHead>
            {canEdit && <TableHead className="text-gray-600 font-medium">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const userTaskStats = getUserTasks(user.id);
            return (
              <TableRow 
                key={user.id} 
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!user.is_active ? 'opacity-60' : ''}`}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-neumorphic-soft flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {getInitials(user.full_name)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">{user.full_name}</p>
                      <p className="text-sm text-gray-500">{user.position || "Sem cargo"}</p>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <p className="text-sm text-gray-700">{getDepartmentName(user.department_id)}</p>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <p className="text-gray-700">
                      {userTaskStats.completed}/{userTaskStats.total}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userTaskStats.total > 0 
                        ? `${Math.round((userTaskStats.completed / userTaskStats.total) * 100)}% concluído`
                        : "Sem tarefas"
                      }
                    </p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    user.is_active 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                
                {canEdit && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(user)}
                        className="shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStatus(user.id, user.is_active)}
                        className={`shadow-neumorphic-soft hover:shadow-neumorphic-pressed transition-all duration-200 bg-gray-100 ${
                          user.is_active ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}