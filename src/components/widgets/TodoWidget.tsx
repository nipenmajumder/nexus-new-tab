import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStorage } from '@/hooks/useStorage';
import { Todo } from '@/lib/storage';
import { cn } from '@/lib/utils';

const categories = ['work', 'personal', 'urgent', 'later'];
const categoryColors: Record<string, string> = {
  work: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  personal: 'bg-green-500/20 text-green-400 border-green-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  later: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

interface TodoWidgetProps {
  compact?: boolean;
}

export function TodoWidget({ compact = false }: TodoWidgetProps) {
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
    <div className={compact ? 'widget-compact' : 'widget'}>
      {/* Minimal header with counter */}
      <div className="flex items-center justify-end mb-2">
        {totalCount > 0 && (
          <Badge variant="secondary" className="text-xs font-mono">
            {completedCount}/{totalCount}
          </Badge>
        )}
      </div>

      {/* Add todo */}
      <div className="flex gap-2 mb-2">
        <Input
          placeholder="Add a task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          className={cn(
            "bg-background/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50",
            compact ? "text-xs h-8" : "text-sm"
          )}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="icon" onClick={addTodo} disabled={!newTodo.trim()} className={cn("shrink-0", compact && "h-8 w-8")}>
            <Plus className={compact ? "w-3 h-3" : "w-4 h-4"} />
          </Button>
        </motion.div>
      </div>

      {/* Category pills - hidden in compact mode */}
      {!compact && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? undefined : cat)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs transition-all border capitalize',
                selectedCategory === cat
                  ? categoryColors[cat]
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      )}

      {/* Todo list */}
      <div className={cn("space-y-1 flex-1 overflow-y-auto pr-1", compact ? "max-h-20" : "")}>
        <AnimatePresence mode="popLayout">
          {todos?.length === 0 ? (
            <motion.p 
              className="text-sm text-muted-foreground text-center py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No tasks yet
            </motion.p>
          ) : (
            todos?.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={cn(
                  'group flex items-center gap-2 p-2 rounded-lg transition-all',
                  'hover:bg-background/50',
                  todo.completed && 'opacity-60'
                )}
              >
                <motion.button 
                  onClick={() => toggleTodo(todo.id)} 
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </motion.button>
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      'text-sm block truncate transition-all',
                      todo.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {todo.text}
                  </span>
                  {todo.category && !compact && (
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 border',
                        categoryColors[todo.category]
                      )}
                    >
                      {todo.category}
                    </span>
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="group-hover:opacity-100"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-destructive/10"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </motion.div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
