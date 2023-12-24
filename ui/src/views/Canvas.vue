<template>
  <main>
    <canvas id="canvas" height="960" width="2000" ref="canvasElement"></canvas>
    <div class="expanded extras">
      <img
        @click="toggleExpandExtras"
        src="@/assets/hamburger1.svg"
        alt="Hamburger icon"
        class="hamburger-icon"
      />
      <h5 class="extras-title">Extras</h5>
      <div class="extras-options">
        <h5>Line color</h5>
        <input type="color" v-model="color" class="color-picker" />
      </div>
      <h5 class="line-thickness-title">Line thickness: {{ thickness }}</h5>
      <input type="range" min="1" max="10" class="color-picker" v-model="thickness" />
    </div>
  </main>
</template>

<script lang="ts" setup>
import { fabric } from 'fabric'
import { ref, watch, watchEffect } from 'vue'
import { io } from 'socket.io-client'

let canvasElement = ref<HTMLCanvasElement | null>()
let color = ref<string>('')
let canvas: fabric.Canvas
let thickness = ref<number>(1)

const socket = io(import.meta.env.VITE_API_SOCKET_URL)

function toggleExpandExtras() {
  document.querySelector('.extras')?.classList.toggle('expanded')
}

socket.on('connect', () => {
  console.log(socket.id)

  //Backend will receive path and emit the retrieve path method
  socket.on('retrieve-path', (paths: any) => {
    paths.forEach((path: any) => {
      Object.setPrototypeOf(path.path, Object.getPrototypeOf(new fabric.Path()))
      path.path.clone((clone: any) => {
        canvas.add(clone)
      })
    })
  })
})

socket.on('new-path', (path) => {
  console.log('a new path was drawn elsewhere', path)
  let drawnPath = path.path
  Object.setPrototypeOf(drawnPath, Object.getPrototypeOf(new fabric.Path()))
  drawnPath.clone((clone: any) => {
    canvas.add(clone)
  })
})

watch(color, () => {
  if (!canvas) return
  canvas.freeDrawingBrush.color = color.value
})

watch(thickness, () => {
  if (!canvas) return
  canvas.freeDrawingBrush.width = thickness.value
})

watchEffect(() => {
  const CELL_SIZE = 20

  canvas = new fabric.Canvas(canvasElement.value as HTMLCanvasElement, {
    isDrawingMode: true,
    backgroundColor: 'rgb(255,255,255)',
    selectionColor: 'rgb(0, 0,223)',
    selectionLineWidth: 2,
    width: window.outerWidth,
    height: window.outerHeight,
    viewportTransform: [1, 0, 0, 1, -window.outerWidth / 2, -window.outerHeight / 2],
    fireRightClick: true,
    fireMiddleClick: true
  })

  fabric.Object.prototype.objectCaching = false

  var infBGrid = fabric.util.createClass(fabric.Object, {
    type: 'infBGrid',

    initialize: function () {},

    render: function (ctx: any) {
      let zoom = canvas.getZoom()
      //@ts-ignore
      let offX = canvas.viewportTransform[4]
      //@ts-ignore
      let offY = canvas.viewportTransform[5]

      ctx.save()
      ctx.strokeStyle = '#e7e7e7'
      ctx.lineWidth = 0.4

      let gridSize = CELL_SIZE * zoom

      const numCellsX = Math.ceil(canvas.getWidth() / gridSize)
      const numCellsY = Math.ceil(canvas.getHeight() / gridSize)

      let gridOffsetX = offX % gridSize
      let gridOffsetY = offY % gridSize
      ctx.beginPath()

      // vertical lines
      for (let i = 0; i <= numCellsX; i++) {
        let x = gridOffsetX + i * gridSize
        ctx.moveTo((x - offX) / zoom, (0 - offY) / zoom)
        ctx.lineTo((x - offX) / zoom, (canvas.getHeight() - offY) / zoom)
      }

      // horizontal lines
      for (let i = 0; i <= numCellsY; i++) {
        let y = gridOffsetY + i * gridSize
        ctx.moveTo((0 - offX) / zoom, (y - offY) / zoom)
        ctx.lineTo((canvas.getWidth() - offX) / zoom, (y - offY) / zoom)
      }

      ctx.stroke()
      ctx.closePath()
      ctx.restore()
    }
  })

  var bg = new infBGrid()

  canvas.add(bg)
  canvas.renderAll()

  canvas.on('mouse:wheel', function (opt) {
    var delta = opt.e.deltaY
    var zoom = canvas.getZoom()
    zoom *= 0.9995 ** delta
    if (zoom > 10) zoom = 10
    if (zoom < 0.1) zoom = 0.1
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
    opt.e.preventDefault()
    opt.e.stopPropagation()
  })

  canvas.on('path:created', (e: any) => {
    socket.emit('path-drawn', e)

    canvas.on('mouse:down', function (options) {
      console.log(options)
    })
  })
})
</script>
