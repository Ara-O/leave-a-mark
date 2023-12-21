<template>
  <h3>Leave a mark!</h3>
  <input type="color" v-model="color" />
  <canvas id="canvas" height="500" width="500" ref="canvasElement"></canvas>
</template>

<script lang="ts" setup>
import { fabric } from 'fabric'
import { camelize, ref, watch, watchEffect } from 'vue'
import { io } from 'socket.io-client'

const socket = io('localhost:3000')

socket.on('connect', () => {
  // TODO: Grab already drawn things from database and draw them here
  console.log(socket.id)
})

socket.on('new-path', (path) => {
  console.log('a new path was drawn elsewhere', path)
  let drawnPath = path.path
  Object.setPrototypeOf(drawnPath, Object.getPrototypeOf(new fabric.Path()))
  drawnPath.clone((clone: any) => {
    canvas.add(clone)
  })
})

let canvasElement = ref<HTMLCanvasElement | null>()
let color = ref<string>('')
let canvas: fabric.Canvas

watch(color, () => {
  if (!canvas) return
  canvas.freeDrawingBrush.color = color.value
})

watchEffect(() => {
  canvas = new fabric.Canvas(canvasElement.value as HTMLCanvasElement, {
    isDrawingMode: true
  })

  canvas.on('path:created', (e: any) => {
    socket.emit('path-drawn', e)

    canvas.on('mouse:down', function (options) {
      console.log(options)
    })
  })
})
</script>
