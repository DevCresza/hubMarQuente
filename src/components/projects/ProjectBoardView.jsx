
import React from "react";
import { Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskItem from "./TaskItem";
import TaskQuickAdd from "./TaskQuickAdd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ProjectBoardView({ sections, tasks = [], users, allTasks = [], currentUser, projectId, onAddTask, onUpdateTask, onDeleteTask, onViewTask }) {
  const getTasksBySection = (sectionId) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(t => t.section_id === sectionId).sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = draggableId;
    const newSectionId = destination.droppableId;
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    const updates = {
      section_id: newSectionId,
      order: destination.index
    };

    const targetSection = sections.find(s => s.id === newSectionId);
    if (targetSection) {
      if (targetSection.name.toLowerCase().includes('andamento') || targetSection.name.toLowerCase().includes('progresso')) {
        if (task.status === 'nao_iniciado') {
          updates.status = 'em_progresso';
        }
      } else if (targetSection.name.toLowerCase().includes('conclu') || targetSection.name.toLowerCase().includes('done')) {
        if (task.status !== 'concluido') {
          updates.status = 'concluido';
        }
      } else if (targetSection.name.toLowerCase().includes('fazer') || targetSection.order === 0) {
        if (task.status === 'em_progresso') {
          updates.status = 'nao_iniciado';
        }
      }
    }

    onUpdateTask(taskId, updates);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {sections.map((section) => {
          const sectionTasks = getTasksBySection(section.id);

          return (
            <div
              key={section.id}
              className="flex-shrink-0 w-80 bg-gray-100 rounded-2xl shadow-neumorphic p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{section.name}</h3>
                  <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    {sectionTasks.length}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <Droppable droppableId={section.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 mb-3 min-h-[100px] ${
                      snapshot.isDraggingOver ? 'bg-blue-50 rounded-xl' : ''
                    }`}
                  >
                    {sectionTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'opacity-50' : ''}
                          >
                            <TaskItem
                              task={task}
                              users={users}
                              allTasks={allTasks}
                              sections={sections}
                              onUpdate={(updates) => onUpdateTask(task.id, updates)}
                              onDelete={() => onDeleteTask(task.id)}
                              onView={onViewTask}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <TaskQuickAdd 
                sectionId={section.id}
                projectId={projectId}
                users={users}
                allTasks={allTasks}
                currentUser={currentUser}
                onAdd={(taskData) => onAddTask(taskData, section.id)}
              />
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
