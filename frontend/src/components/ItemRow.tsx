import { useDeleteItem, useToggleItem } from '../hooks/useShoppingList'
import type { Item } from '../api/client'

interface Props {
  item: Item
  listId: number | undefined
}

export default function ItemRow({ item, listId }: Props) {
  const toggle = useToggleItem(listId)
  const remove = useDeleteItem(listId)

  return (
    <li className="flex items-center gap-3 py-2 px-1 group">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => toggle.mutate({ id: item.id, checked: !item.checked })}
        className="w-5 h-5 rounded accent-indigo-500 cursor-pointer flex-shrink-0"
      />
      <span
        className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}
      >
        {item.name}
        {item.quantity && (
          <span className="ml-2 text-xs text-gray-400">{item.quantity}</span>
        )}
      </span>
      <button
        onClick={() => remove.mutate(item.id)}
        aria-label={`${item.name} löschen`}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-300 hover:text-red-400 transition-opacity p-1 rounded"
      >
        ✕
      </button>
    </li>
  )
}
