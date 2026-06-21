import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  completeTodo,
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
  type TodoCreate,
  type TodoUpdate,
} from '../api/client'

export const TODOS_KEY = ['todos'] as const

export function useTodos() {
  return useQuery({ queryKey: TODOS_KEY, queryFn: fetchTodos })
}

export function useCreateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TodoCreate) => createTodo(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  })
}

export function useUpdateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TodoUpdate }) => updateTodo(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  })
}

export function useCompleteTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => completeTodo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  })
}

export function useDeleteTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  })
}

// Batches multiple position/column updates from a single Kanban drag-end into one
// mutation, so the todos query is only invalidated once.
export function useMoveTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: { id: string; data: TodoUpdate }[]) => {
      await Promise.all(updates.map(({ id, data }) => updateTodo(id, data)))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  })
}
