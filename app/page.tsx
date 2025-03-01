"use client"

import * as React from "react"
import { Check, GripVertical, Loader2, Plus, Trash2, X } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { useGetTasksList } from "@/hooks/use-get-tasks-list"
import { useCreateTask } from "@/hooks/use-create-task"
import { useUpdateTask } from "@/hooks/use-update-task"
import { useDeleteTask } from "@/hooks/use-delete-task"
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog"

interface Task {
  id: number
  name: string
  done: boolean
  order: number
}

type TaskAction =
  | { type: "loaded"; tasks: Task[] }
  | { type: "added"; name: string }
  | { type: "changed"; task: Task }
  | { type: "deleted"; id: number }
  | { type: "reordered"; tasks: Task[] }

function tasksReducer(tasks: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case "loaded": {
      // Sort tasks by order
      return action.tasks.sort((a, b) => a.order - b.order)
    }
    case "added": {
      return [
        ...tasks,
        {
          id: Date.now(),
          name: action.name,
          done: false,
          order: tasks.length,
        },
      ]
    }
    case "changed": {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task
        } else {
          return t
        }
      })
    }
    case "deleted": {
      return tasks.filter((t) => t.id !== action.id)
    }
    case "reordered": {
      return action.tasks.map((task, index) => ({
        ...task,
        order: index, 
      }))
    }
    default: {
      throw Error("Unknown action")
    }
  }
}

interface SortableTaskItemProps {
  task: Task
  onToggle: (task: Task) => void
  onEdit: (task: Task | null) => void
  onUpdate: (task: Task, newName: string) => void
  onDelete: (id: number) => void
  editingTask: Task | null
}

function SortableTaskItem({ task, onToggle, onEdit, onUpdate, onDelete, editingTask }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  
  const deleteMutation = useDeleteTask(task.id);

  const { ConfirmationDialog, confirm } = useConfirmationDialog();

  function handleDelete(id: number) {
    confirm(
      // Confirm callback
      () => {
        deleteMutation.mutate();
        onDelete(id);
      },
      // Cancel callback
      () => {},
      // Custom options
      {
        title: "Delete task?",
        description: `Are you sure you want to delete the task?`,
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
      },
    );
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <Button variant="ghost" size="icon" className="cursor-grab touch-none" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Reorder task</span>
      </Button>

      <Button variant="ghost" size="icon" onClick={() => onToggle(task)} className="flex items-center justify-center">
        <div
          className={`h-5 w-5 rounded-sm border ${
            task.done ? "bg-primary border-primary flex items-center justify-center" : "border-muted-foreground"
          }`}
        >
          {task.done && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        <span className="sr-only">Mark task as {task.done ? "undone" : "done"}</span>
      </Button>

      {editingTask?.id === task.id ? (
        <Input
          value={editingTask.name}
          onChange={(e) => onEdit({ ...editingTask, name: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onUpdate(task, editingTask.name)
            } else if (e.key === "Escape") {
              onEdit(null)
            }
          }}
          className="flex-1"
          autoFocus
        />
      ) : (
        <span
          onClick={() => onEdit(task)}
          className={`flex-1 cursor-pointer ${task.done ? "text-muted-foreground line-through" : ""}`}
        >
          {task.name}
        </span>
      )}

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleDelete(task.id)}
        className="hidden group-hover:inline-flex hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete task</span>
      </Button>

      {editingTask?.id === task.id && (
        <Button variant="ghost" size="icon" onClick={() => onEdit(null)}>
          <X className="h-4 w-4" />
          <span className="sr-only">Cancel editing</span>
        </Button>
      )}

      <ConfirmationDialog />
    </div>
  )
}

export default function TaskManager() {
  const [tasks, dispatch] = React.useReducer(tasksReducer, [])
  const [newTaskName, setNewTaskName] = React.useState("")
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [dataLoaded, setDataLoaded] = React.useState(false)

  const tasksQuery = useGetTasksList();
  const isLoading = tasksQuery.isLoading;
  
  const createMutation = useCreateTask();
  const editMutation = useUpdateTask();

  React.useEffect(() => {
    if (tasksQuery.data && tasksQuery.data.length > 0 && !dataLoaded) {
      const tasksData = tasksQuery.data.map(({ createdAt, updatedAt, ...rest }) => rest);
      dispatch({ type: "loaded", tasks: tasksData });
      setDataLoaded(true);
    }
  }, [tasksQuery.data, dataLoaded]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTaskName.trim()) return

    dispatch({
      type: "added",
      name: newTaskName.trim(),
    })

    createMutation.mutate({
      name: newTaskName.trim(),
      done: false,
      order: tasks.length,
    });

    setNewTaskName("")
  }

  function handleToggleTask(task: Task) {
    dispatch({
      type: "changed",
      task: { ...task, done: !task.done },
    });

    editMutation.mutate(
      {
        id: task.id,
        done: !task.done 
      }
    );
  }

  function handleUpdateTask(task: Task, newName: string) {
    dispatch({
      type: "changed",
      task: { ...task, name: newName },
    });

    editMutation.mutate(
      {
        id: task.id,
        name: newName
      }
    );

    setEditingTask(null);
  }

  function handleDeleteTask(id: number) {
    dispatch({
      type: "deleted",
      id,
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id)
      const newIndex = tasks.findIndex((task) => task.id === over.id)

      const newTasks = arrayMove(tasks, oldIndex, newIndex).map((task, index) => ({
        ...task,
        order: index,
      }));
  
      dispatch({
        type: "reordered",
        tasks: newTasks,
      });
      
      newTasks.forEach((task) => {
        editMutation.mutate(
          {
            id: task.id,
            order: task.order
          }
        );
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-6 lg:p-8">
      <Card className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Task Manager</h1>
          <p className="text-sm text-muted-foreground">Manage your tasks efficiently with this modern interface.</p>
        </div>

        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add task</span>
          </Button>
        </form>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
                {tasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={setEditingTask}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    editingTask={editingTask}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {tasks.length === 0 && <div className="text-center text-muted-foreground">No tasks yet. Add one above!</div>}
          </div>
        )}
      </Card>
    </div>
  )
}