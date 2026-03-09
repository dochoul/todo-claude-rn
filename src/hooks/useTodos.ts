import { useState, useEffect, useRef, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Todo, Category, Priority, Filter, CATEGORIES, isTodayDue } from '../types/todo';

interface TodoRow {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  due_date: number | null;
  created_at: number;
}

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    category: row.category,
    priority: row.priority,
    createdAt: row.created_at,
    dueDate: row.due_date ?? undefined,
  };
}

export function useTodos(user: User | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const optimisticIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }
    fetchTodos();

    const channel = supabase
      .channel(`todos:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTodo = rowToTodo(payload.new as TodoRow);
            if (optimisticIds.current.has(newTodo.id)) {
              optimisticIds.current.delete(newTodo.id);
              return;
            }
            setTodos((prev) => [newTodo, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = rowToTodo(payload.new as TodoRow);
            setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setTodos((prev) => prev.filter((t) => t.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function fetchTodos(): Promise<void> {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('할일을 불러오는 중 오류가 발생했습니다.');
    } else {
      setTodos((data as TodoRow[]).map(rowToTodo));
    }
    setLoading(false);
  }

  async function addTodo(text: string, category: Category, priority: Priority, dueDate?: number): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || !user) return;

    const newRow = {
      user_id: user.id,
      text: trimmed,
      completed: false,
      category,
      priority,
      created_at: Date.now(),
      due_date: dueDate ?? null,
    };

    const { data, error: insertError } = await supabase
      .from('todos')
      .insert(newRow)
      .select()
      .single();

    if (insertError) {
      setError('할일을 추가하는 중 오류가 발생했습니다.');
    } else {
      const todo = rowToTodo(data as TodoRow);
      optimisticIds.current.add(todo.id);
      setTodos((prev) => [todo, ...prev]);
    }
  }

  async function deleteTodo(id: string): Promise<void> {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    const { error: deleteError } = await supabase.from('todos').delete().eq('id', id);
    if (deleteError) {
      setError('할일을 삭제하는 중 오류가 발생했습니다.');
      fetchTodos();
    }
  }

  async function updateTodo(id: string, updates: Partial<Pick<Todo, 'text' | 'category' | 'priority' | 'dueDate'>>): Promise<void> {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

    const dbUpdates: Record<string, unknown> = { ...updates };
    if ('dueDate' in updates) {
      dbUpdates['due_date'] = updates.dueDate ?? null;
      delete dbUpdates['dueDate'];
    }

    const { error: updateError } = await supabase.from('todos').update(dbUpdates).eq('id', id);
    if (updateError) {
      setError('할일을 수정하는 중 오류가 발생했습니다.');
      fetchTodos();
    }
  }

  async function toggleTodo(id: string): Promise<void> {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const newCompleted = !todo.completed;

    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)));

    const { error: toggleError } = await supabase
      .from('todos')
      .update({ completed: newCompleted })
      .eq('id', id);

    if (toggleError) {
      setError('할일 상태를 변경하는 중 오류가 발생했습니다.');
      fetchTodos();
    }
  }

  const filteredTodos = useMemo<Todo[]>(() => {
    if (filter === 'all') return todos;
    if (filter === 'today') return todos.filter(isTodayDue);
    return todos.filter((t) => t.category === filter);
  }, [todos, filter]);

  const todoCounts = useMemo<Record<Filter, number>>(() => {
    const counts: Record<Filter, number> = {
      all: todos.length,
      today: todos.filter(isTodayDue).length,
    } as Record<Filter, number>;
    for (const cat of CATEGORIES) {
      counts[cat] = todos.filter((t) => t.category === cat).length;
    }
    return counts;
  }, [todos]);

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    filter,
    setFilter,
    filteredTodos,
    todoCounts,
    loading,
    error,
  };
}
