import { useState } from 'react'
import AddItemForm from './components/AddItemForm'
import CategoryDrawer from './components/CategoryDrawer'
import CategorySection from './components/CategorySection'
import ListDrawer from './components/ListDrawer'
import { useCategories, useDeleteCheckedItems, useItems, useLists } from './hooks/useShoppingList'
import type { Category, Item } from './api/client'

export default function App() {
  const { data: lists = [] } = useLists()
  const [selectedListId, setSelectedListId] = useState<number | undefined>(undefined)
  const [listDrawerOpen, setListDrawerOpen] = useState(false)
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false)

  // Once lists load, default to the first one
  const activeListId = selectedListId ?? lists[0]?.id
  const activeList = lists.find((l) => l.id === activeListId)

  const { data: categories = [], isLoading: catsLoading } = useCategories()
  const { data: items = [], isLoading: itemsLoading } = useItems(activeListId)
  const deleteChecked = useDeleteCheckedItems(activeListId)

  const checkedCount = items.filter((i: Item) => i.checked).length

  // Group items by category_id, preserving category sort order
  const categoryMap = new Map<number, Category>(categories.map((c) => [c.id, c]))
  const uncategorised: Item[] = []
  const grouped = new Map<number, Item[]>()

  for (const item of items) {
    if (item.category_id === null || !categoryMap.has(item.category_id)) {
      uncategorised.push(item)
    } else {
      const bucket = grouped.get(item.category_id) ?? []
      bucket.push(item)
      grouped.set(item.category_id, bucket)
    }
  }

  const loading = catsLoading || itemsLoading

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          {/* List selector (left side) */}
          <button
            onClick={() => setListDrawerOpen(true)}
            className="flex items-center gap-1 text-lg font-bold text-gray-800 hover:text-indigo-600 transition-colors"
            title="Liste wechseln"
          >
            🛒 {activeList?.name ?? 'Einkaufsliste'}
            <span className="text-xs text-gray-400 font-normal ml-1">▾</span>
          </button>

          <div className="flex items-center gap-2">
            {checkedCount > 0 && (
              <button
                onClick={() => deleteChecked.mutate()}
                disabled={deleteChecked.isPending}
                className="text-sm text-red-400 hover:text-red-500 disabled:opacity-50 transition-colors"
              >
                Erledigte löschen ({checkedCount})
              </button>
            )}
            <button
              onClick={() => setCategoryDrawerOpen(true)}
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
              title="Kategorien verwalten"
            >
              🏷️ Kategorien
              <span className="text-xs text-gray-400 font-normal ml-0.5">▾</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 pb-8 pt-4 flex flex-col gap-4">
        <AddItemForm categories={categories} listId={activeListId} />

        {loading && (
          <p className="text-center text-sm text-gray-400 py-4">Laden…</p>
        )}

        {!loading && items.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            Keine Artikel – füge oben etwas hinzu!
          </p>
        )}

        {/* Categorised sections */}
        {categories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            items={grouped.get(cat.id) ?? []}
            listId={activeListId}
          />
        ))}

        {/* Uncategorised items */}
        <CategorySection category={null} items={uncategorised} listId={activeListId} />
      </main>

      {/* Drawers */}
      {listDrawerOpen && (
        <ListDrawer
          selectedListId={activeListId}
          onSelect={(id) => setSelectedListId(id)}
          onClose={() => setListDrawerOpen(false)}
        />
      )}
      {categoryDrawerOpen && <CategoryDrawer onClose={() => setCategoryDrawerOpen(false)} />}
    </div>
  )
}
