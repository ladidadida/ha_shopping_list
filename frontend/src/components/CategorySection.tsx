import { useEffect, useRef, useState } from 'react'
import { useCreateItem } from '../hooks/useShoppingList'
import ItemRow from './ItemRow'
import type { Category, Item } from '../api/client'

interface Props {
  category: Category | null
  items: Item[]
  listId: number | undefined
}

function InlineAddRow({
  categoryId,
  listId,
  onDone,
}: {
  categoryId: number | null
  listId: number | undefined
  onDone: () => void
}) {
  const [name, setName] = useState('')
  const createItem = useCreateItem(listId)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    createItem.mutate(
      { name: trimmed, category_id: categoryId },
      { onSuccess: () => setName('') },
    )
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onDone()
  }

  return (
    <li className="flex items-center gap-2 py-2 px-1">
      <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Artikel…"
          className="flex-1 rounded-lg border border-indigo-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={createItem.isPending || !name.trim()}
          className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-40 transition-colors"
        >
          {createItem.isPending ? '…' : '+'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-2 py-1.5 rounded-lg text-gray-400 hover:text-gray-600 text-sm transition-colors"
          aria-label="Abbrechen"
        >
          ✕
        </button>
      </form>
    </li>
  )
}

export default function CategorySection({ category, items, listId }: Props) {
  const [adding, setAdding] = useState(false)

  if (items.length === 0 && !adding) return null

  return (
    <section>
      <div className="flex items-center justify-between px-1 mb-1 mt-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {category?.name ?? 'Ohne Kategorie'}
        </h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            aria-label={`Artikel zu ${category?.name ?? 'Ohne Kategorie'} hinzufügen`}
            className="text-gray-300 hover:text-indigo-500 transition-colors text-base leading-none px-1"
            title="Artikel hier hinzufügen"
          >
            +
          </button>
        )}
      </div>
      <ul className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50 px-3">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} listId={listId} />
        ))}
        {adding && (
          <InlineAddRow
            categoryId={category?.id ?? null}
            listId={listId}
            onDone={() => setAdding(false)}
          />
        )}
      </ul>
    </section>
  )
}
