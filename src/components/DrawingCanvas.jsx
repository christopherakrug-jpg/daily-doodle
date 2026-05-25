import { useEffect, useLayoutEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { fabric } from 'fabric'

function makeDotCursor(color, size, isEraser) {
  const r = Math.max(3, Math.min(Math.round(size / 2), 14))
  const dim = r * 2 + 4
  const cx = dim / 2
  const fill = isEraser ? '#ffffff' : color
  const stroke = isEraser ? '#9ca3af' : 'none'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}"><circle cx="${cx}" cy="${cx}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${cx} ${cx}, crosshair`
}

function renderPromptPath(canvas, pathData) {
  const size = canvas.getWidth()
  const scale = (size * 0.55) / 100
  const path = new fabric.Path(pathData, {
    scaleX: scale,
    scaleY: scale,
    stroke: '#1a1a1a',
    strokeWidth: 3,
    strokeUniform: true,
    fill: 'transparent',
    selectable: false,
    evented: false,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    hoverCursor: 'crosshair',
    originX: 'center',
    originY: 'center',
  })
  path._isPrompt = true
  canvas.add(path)
  canvas.centerObject(path)
  canvas.sendToBack(path)
  canvas.renderAll()
  return path
}

const BRUSH_COLOR = '#1a1a1a'

const DrawingCanvas = forwardRef(function DrawingCanvas(
  { brushSize, isErasing, promptPath },
  ref
) {
  const containerRef = useRef(null)
  const canvasElRef = useRef(null)
  const fabricRef = useRef(null)
  const promptPathRef = useRef(promptPath)
  const promptObjectRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState(0)
  const overlaySvgRef = useRef(null)
  const overlayGroupRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const size = Math.min(container.offsetWidth || 320, 600)
    setCanvasSize(size)

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: size,
      height: size,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
    })

    canvas.freeDrawingBrush.color = BRUSH_COLOR
    canvas.freeDrawingBrush.width = 10
    canvas.freeDrawingCursor = makeDotCursor(BRUSH_COLOR, 10, false)
    fabricRef.current = canvas

    if (promptPathRef.current) {
      promptObjectRef.current = renderPromptPath(canvas, promptPathRef.current)
    }

    return () => {
      canvas.dispose()
      fabricRef.current = null
      promptObjectRef.current = null
    }
  }, [])

  useEffect(() => {
    promptPathRef.current = promptPath
    const canvas = fabricRef.current
    if (!canvas || !promptPath) return
    if (promptObjectRef.current) canvas.remove(promptObjectRef.current)
    promptObjectRef.current = renderPromptPath(canvas, promptPath)
  }, [promptPath])

  // Compute SVG overlay transform to match Fabric's centering, before paint to avoid flash
  useLayoutEffect(() => {
    if (!promptPath || !canvasSize || !overlaySvgRef.current || !overlayGroupRef.current) return
    const pathEl = overlaySvgRef.current.querySelector('path')
    if (!pathEl) return
    const bbox = pathEl.getBBox()
    if (bbox.width === 0 && bbox.height === 0) return
    const scale = (canvasSize * 0.55) / 100
    const tx = canvasSize / 2 - (bbox.x + bbox.width / 2) * scale
    const ty = canvasSize / 2 - (bbox.y + bbox.height / 2) * scale
    overlayGroupRef.current.setAttribute('transform', `translate(${tx}, ${ty}) scale(${scale})`)
  }, [promptPath, canvasSize])

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    if (isErasing) {
      canvas.freeDrawingBrush.color = '#ffffff'
      canvas.freeDrawingBrush.width = brushSize * 2.5
      canvas.freeDrawingCursor = makeDotCursor('#ffffff', brushSize * 2.5, true)
    } else {
      canvas.freeDrawingBrush.color = BRUSH_COLOR
      canvas.freeDrawingBrush.width = brushSize
      canvas.freeDrawingCursor = makeDotCursor(BRUSH_COLOR, brushSize, false)
    }
  }, [brushSize, isErasing])

  useImperativeHandle(ref, () => ({
    exportPNG() {
      const canvas = fabricRef.current
      if (!canvas) return null
      // Bring prompt to front so it's always visible in the saved image
      const promptObj = canvas.getObjects().find((o) => o._isPrompt)
      if (promptObj) {
        canvas.bringToFront(promptObj)
        canvas.renderAll()
      }
      const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 })
      if (promptObj) {
        canvas.sendToBack(promptObj)
        canvas.renderAll()
      }
      return dataUrl
    },
    clear() {
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.getObjects().filter((o) => !o._isPrompt).forEach((o) => canvas.remove(o))
      canvas.renderAll()
    },
    isEmpty() {
      return (fabricRef.current?.getObjects().filter((o) => !o._isPrompt).length ?? 0) === 0
    },
  }))

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[600px] mx-auto rounded-2xl overflow-hidden border-2 border-[#EDE8E1] shadow-sm"
    >
      <canvas ref={canvasElRef} style={{ display: 'block', touchAction: 'none' }} />
      {promptPath && canvasSize > 0 && (
        <svg
          ref={overlaySvgRef}
          width={canvasSize}
          height={canvasSize}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <g ref={overlayGroupRef}>
            <path
              d={promptPath}
              stroke={BRUSH_COLOR}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </svg>
      )}
    </div>
  )
})

export default DrawingCanvas
