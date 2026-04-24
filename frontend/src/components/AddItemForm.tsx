import { useState } from 'react'
import { useCreateItem } from '../hooks/useShoppingList'
import type { Category } from '../api/client'

interface Props {
  categories: Category[]
  listId: number | undefined
}

export default function AddItemForm({ categories, listId }: Props) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const createItem = useCreateItem(listId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    createItem.mutate(
      {
        name: trimmed,
        quantity: quantity.trim() || undefined,
        category_id: categoryId,
      },
      {
        onSuccess: () => {
          setName('')
          setQuantity('')
        },
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Artikel hinzufügen…"
          required
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Menge"
          className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-500"
        >
          <option value="">Keine Kategorie</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={createItem.isPending}
          className="px-5 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 active:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {createItem.isPending ? '…' : 'Hinzufügen'}
        </button>
      </div>
    </form>
  )
}
