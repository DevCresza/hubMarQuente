
import React, { useState } from "react";
import { Plus, X, Clock, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TaskQuickAdd({ sectionId, projectId, users, allTasks = [], onAdd, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState(currentUser?.id || "");
  const [duration, setDuration] = useState("");
  const [durationType, setDurationType] = useState("dias");
  const [showDependencies, setShowDependencies] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState([]);

  const handleAdd = () => {
    if (!taskTitle.trim()) return;
    
    const taskData = {
      title: taskTitle,
      project_id: projectId, // Adicionar project_id obrigatório
      status: "nao_iniciado",
      priority: "media",
      assigned_to: assignedTo || currentUser?.id,
      dependencies: selectedDependencies
    };

    // Calcular datas automaticamente se duração foi especificada
    if (duration && parseFloat(duration) > 0) {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      
      let dueDate = new Date(startDate);
      
      if (durationType === "dias") {
        dueDate.setDate(dueDate.getDate() + parseFloat(duration));
      } else if (durationType === "horas") {
        dueDate.setHours(dueDate.getHours() + parseFloat(duration));
      }
      
      taskData.start_date = startDate.toISOString().split('T')[0];
      taskData.due_date = dueDate.toISOString().split('T')[0];
      
      // Só incluir estimated_hours se for um número válido
      const hours = durationType === "horas" ? parseFloat(duration) : parseFloat(duration) * 8;
      if (!isNaN(hours) && hours > 0) {
        taskData.estimated_hours = hours;
      }
    }
    
    onAdd(taskData, sectionId);
    
    setTaskTitle("");
    setAssignedTo(currentUser?.id || "");
    setDuration("");
    setSelectedDependencies([]);
    setShowForm(false);
  };

  const handleToggleDependency = (taskId) => {
    if (selectedDependencies.includes(taskId)) {
      setSelectedDependencies(selectedDependencies.filter(id => id !== taskId));
    } else {
      setSelectedDependencies([...selectedDependencies, taskId]);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full p-3 text-left text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-gray-300"
      >
        <Plus className="w-4 h-4" />
        Adicionar tarefa
      </button>
    );
  }

  return (
    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      <Input
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
          } else if (e.key === 'Escape') {
            setShowForm(false);
            setTaskTitle("");
          }
        }}
        placeholder="Nome da tarefa..."
        className="mb-2 h-9 text-sm"
        autoFocus
      />
      
      {/* Duração rápida */}
      <div className="mb-2 flex gap-2">
        <div className="flex-1 relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duração"
            className="pl-8 h-8 text-xs"
            step="0.5"
            min="0"
          />
        </div>
        <select
          value={durationType}
          onChange={(e) => setDurationType(e.target.value)}
          className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
        >
          <option value="horas">Horas</option>
          <option value="dias">Dias</option>
        </select>
      </div>

      {/* Seletor de responsável */}
      <div className="mb-2">
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
        >
          <option value="">Selecione o responsável</option>
          {users.filter(u => u.is_active).map(user => (
            <option key={user.id} value={user.id}>
              {user.full_name} {user.id === currentUser?.id && "(Você)"}
            </option>
          ))}
        </select>
      </div>

      {/* Dependências */}
      {allTasks.length > 0 && (
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setShowDependencies(!showDependencies)}
            className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800 mb-1"
          >
            <Link2 className="w-3 h-3" />
            Dependências {selectedDependencies.length > 0 && `(${selectedDependencies.length})`}
          </button>
          
          {showDependencies && (
            <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-2 border border-gray-200">
              {allTasks.map(task => (
                <label 
                  key={task.id}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedDependencies.includes(task.id)}
                    onChange={() => handleToggleDependency(task.id)}
                    className="w-3 h-3 rounded"
                  />
                  <span className="flex-1 truncate">{task.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          onClick={handleAdd}
          size="sm"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-8 text-xs"
          disabled={!taskTitle.trim() || !assignedTo}
        >
          Adicionar
        </Button>
        <Button 
          onClick={() => {
            setShowForm(false);
            setTaskTitle("");
            setAssignedTo(currentUser?.id || "");
            setDuration("");
            setSelectedDependencies([]);
          }}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {duration && parseFloat(duration) > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          Início hoje → Prazo em {duration} {durationType}
        </p>
      )}
      {selectedDependencies.length > 0 && (
        <p className="text-xs text-orange-600 mt-1">
          Esta tarefa depende de {selectedDependencies.length} outra(s)
        </p>
      )}
    </div>
  );
}
