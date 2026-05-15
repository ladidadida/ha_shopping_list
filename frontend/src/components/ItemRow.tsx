import { useRef, useState } from 'react'
import type { Item } from '../api/client'
import { useCategories, useDeleteItem, useToggleItem, useUpdateItem } from '../hooks/useShoppingList'

const LONG_PRESS_MS = 500

interface Props {
  item: Item
  listId: number | undefined
}

export default function ItemRow({ item, listId }: Props) {
  const toggle = useToggleItem(listId)
  const remove = useDeleteItem(listId)
  const update = useUpdateItem(listId)
  const { data: categories = [] } = useCategories()

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(item.name)
  const [editQuantity, setEditQuantity] = useState(item.quantity ?? '')
  const [editCategoryId, setEditCategoryId] = useState<number | null>(item.category_id)
  const nameRef = useRef<HTMLInputElement>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  function startEdit() {
    setEditName(item.name)
    setEditQuantity(item.quantity ?? '')
    setEditCategoryId(item.category_id)
    setEditing(true)
    setTimeout(() => nameRef.current?.focus(), 0)
  }

  function handlePointerDown(e: React.PointerEvent) {
    // Only handle touch/pen; mouse clicks use the desktop hover buttons
    if (e.pointerType === 'mouse') return
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      startEdit()
    }, LONG_PRESS_MS)
  }

  function cancelLongPress() {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (e.pointerType === 'mouse') return
    cancelLongPress()
    if (!didLongPress.current) {
      toggle.mutate({ id: item.id, checked: !item.checked })
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = editName.trim()
    if (!trimmed) return
    update.mutate(
      { id: item.id, data: { name: trimmed, quantity: editQuantity.trim() || null, category_id: editCategoryId } },
      { onSuccess: () => setEditing(false) },
    )
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <li className="py-2 px-1">
        <form onSubmit={handleSave} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              ref={nameRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Name…"
              className="flex-1 rounded-lg border border-indigo-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="text"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Menge…"
              className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {categories.length > 0 && (
            <select
              value={editCategoryId ?? ''}
              onChange={(e) => setEditCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Ohne Kategorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <div className="flex gap-2 justify-between">
            <button
              type="button"
              onClick={() => { setEditing(false); remove.mutate(item.id) }}
              disabled={remove.isPending}
              className="px-3 py-1.5 rounded-lg text-red-400 hover:text-red-600 text-sm transition-colors disabled:opacity-50"
            >
              Löschen
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-gray-600 text-sm transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={update.isPending || !editName.trim()}
                className="px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
              >
                {update.isPending ? '…' : 'Speichern'}
              </button>
            </div>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 py-2 px-1 group">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => toggle.mutate({ id: item.id, checked: !item.checked })}
        className="w-5 h-5 rounded accent-indigo-500 cursor-pointer flex-shrink-0"
      />
      <span
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={cancelLongPress}
        onPointerCancel={cancelLongPress}
        className={`flex-1 text-sm select-none touch-none ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}
      >
        {item.name}
        {item.quantity && (
          <span className="ml-2 text-xs text-gray-400">{item.quantity}</span>
        )}
      </span>
      <button
        onClick={startEdit}
        aria-label={`${item.name} bearbeiten`}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:hidden text-gray-300 hover:text-indigo-400 transition-opacity p-1 rounded"
      >
        ✏️
      </button>
      <button
        onClick={() => remove.mutate(item.id)}
        aria-label={`${item.name} löschen`}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:hidden text-gray-300 hover:text-red-400 transition-opacity p-1 rounded"
      >
        ✕
      </button>
    </li>
  )
}
