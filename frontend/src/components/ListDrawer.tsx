import { useState } from 'react'
import { useCreateList, useDeleteList, useLists } from '../hooks/useShoppingList'

interface Props {
  selectedListId: number | undefined
  onSelect: (id: number) => void
  onClose: () => void
}

export default function ListDrawer({ selectedListId, onSelect, onClose }: Props) {
  const { data: lists = [] } = useLists()
  const createList = useCreateList()
  const deleteList = useDeleteList()
  const [name, setName] = useState('')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const maxOrder = lists.reduce((m, l) => Math.max(m, l.sort_order), -1)
    createList.mutate(
      { name: trimmed, sort_order: maxOrder + 1 },
      { onSuccess: () => setName('') },
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* Panel */}
      <aside className="relative z-50 w-72 bg-white h-full shadow-xl flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Listen</h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="text-gray-400 hover:text-gray-600 text-lg p-1"
          >
            ✕
          </button>
        </header>

        <ul className="flex-1 overflow-y-auto divide-y divide-gray-50 px-4 py-2">
          {lists.map((l) => (
            <li key={l.id} className="flex items-center justify-between py-2">
              <button
                onClick={() => { onSelect(l.id); onClose() }}
                className={`flex-1 text-left text-sm rounded px-2 py-1 transition-colors ${
                  l.id === selectedListId
                    ? 'font-semibold text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {l.name}
              </button>
              {lists.length > 1 && (
                <button
                  onClick={() => deleteList.mutate(l.id)}
                  aria-label={`${l.name} löschen`}
                  className="text-gray-300 hover:text-red-400 text-sm p-1 rounded transition-colors ml-1"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={handleCreate} className="p-4 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Neue Liste…"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={createList.isPending}
            className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            +
          </button>
        </form>
      </aside>
    </div>
  )
}
