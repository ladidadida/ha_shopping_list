import { useState } from 'react'
import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/useShoppingList'

interface Props {
  onClose: () => void
}

export default function CategoryDrawer({ onClose }: Props) {
  const { data: categories = [] } = useCategories()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()
  const [name, setName] = useState('')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const maxOrder = categories.reduce((m, c) => Math.max(m, c.sort_order), -1)
    createCategory.mutate({ name: trimmed, sort_order: maxOrder + 1 }, { onSuccess: () => setName('') })
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* Panel */}
      <aside className="relative z-50 w-72 bg-white h-full shadow-xl flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Kategorien</h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="text-gray-400 hover:text-gray-600 text-lg p-1"
          >
            ✕
          </button>
        </header>

        <ul className="flex-1 overflow-y-auto divide-y divide-gray-50 px-4 py-2">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">{c.name}</span>
              <button
                onClick={() => deleteCategory.mutate(c.id)}
                aria-label={`${c.name} löschen`}
                className="text-gray-300 hover:text-red-400 text-sm p-1 rounded transition-colors"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleCreate} className="p-4 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Neue Kategorie…"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={createCategory.isPending}
            className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            +
          </button>
        </form>
      </aside>
    </div>
  )
}
