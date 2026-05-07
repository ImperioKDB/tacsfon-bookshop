export default function CategoryFilter({ categories, selected, onChange }) {
  const options = [{ id: '', name: 'All' }, ...categories]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {options.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[36px] border
            ${selected === cat.id
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
            }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
