export default function Toolbar({
  brushSize,
  isErasing,
  onSizeChange,
  onEraserToggle,
  onClear,
}) {
  return (
    <div className="w-full max-w-[600px] mx-auto bg-white rounded-2xl border border-[#EDE8E1] shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-400 shrink-0 uppercase tracking-wide">Size</span>
        <div className="flex items-center justify-center w-7 h-7 shrink-0" aria-hidden="true">
          <div
            className="rounded-full bg-gray-700"
            style={{
              width: `${Math.min(Math.max(brushSize * 0.8, 3), 24)}px`,
              height: `${Math.min(Math.max(brushSize * 0.8, 3), 24)}px`,
            }}
          />
        </div>

        <input
          type="range"
          min={2}
          max={30}
          value={brushSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="flex-1 h-2 cursor-pointer"
          aria-label="Brush size"
        />

        <button
          onClick={onEraserToggle}
          className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-colors shrink-0 ${
            isErasing
              ? 'bg-accent text-white border-accent'
              : 'border-[#E0D9D0] text-gray-600 hover:border-gray-400'
          }`}
        >
          Eraser
        </button>

        <button
          onClick={onClear}
          className="px-3 py-1.5 rounded-xl text-sm font-semibold border border-[#E0D9D0] text-gray-600 hover:text-red-500 hover:border-red-300 transition-colors shrink-0"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
