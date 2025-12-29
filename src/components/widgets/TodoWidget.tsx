import { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ListTodo, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStorage } from '@/hooks/useStorage';
import { Todo } from '@/lib/storage';
import { cn } from '@/lib/utils';

const categories = ['work', 'personal', 'urgent', 'later'];
const categoryColors: Record<string, string> = {
  work: 'bg-blue-500/20 text-blue-400',
  personal: 'bg-green-500/20 text-green-400',
  urgent: 'bg-red-500/20 text-red-400',
  later: 'bg-yellow-500/20 text-yellow-400',
};

export function TodoWidget() {
  const [todos, setTodos] = useStorage('todos');
  const [newTodo, setNewTodo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const addTodo = async () => {
    if (!newTodo.trim() || !todos) return;

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      category: selectedCategory,
      createdAt: Date.now(),
    };

    await setTodos([todo, ...todos]);
    setNewTodo('');
    setSelectedCategory(undefined);
  };

  const toggleTodo = async (id: string) => {
    if (!todos) return;
    await setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = async (id: string) => {
    if (!todos) return;
    await setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const completedCount = todos?.filter((t) => t.completed).length || 0;
  const totalCount = todos?.length || 0;

  return (
    <div className="widget animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ListTodo className="w-4 h-4" />
          <span className="text-sm font-medium">Todos</span>
        </div>
        {totalCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{totalCount}
          </Badge>
        )}
      </div>

      {/* Add todo */}
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Add a task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          className="bg-background/50 text-sm"
        />
        <Button size="icon" onClick={addTodo} disabled={!newTodo.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? undefined : cat)}
            className={cn(
              'px-2 py-0.5 rounded-full text-xs transition-all',
              selectedCategory === cat
                ? categoryColors[cat]
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Todo list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {todos?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks yet. Add one above!
          </p>
        ) : (
          todos?.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                'group flex items-center gap-2 p-2 rounded-lg transition-all',
                'hover:bg-background/50',
                todo.completed && 'opacity-60'
              )}
            >
              <button onClick={() => toggleTodo(todo.id)} className="flex-shrink-0">
                {todo.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    'text-sm block truncate',
                    todo.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {todo.text}
                </span>
                {todo.category && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full inline-block mt-1',
                      categoryColors[todo.category]
                    )}
                  >
                    {todo.category}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteTodo(todo.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
