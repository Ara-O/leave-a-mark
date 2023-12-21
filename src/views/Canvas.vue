<template>
  <h3>Leave a mark!</h3>
  <input type="color" v-model="color" />
  <canvas id="canvas" height="500" width="500" ref="canvasElement"></canvas>
</template>

<script lang="ts" setup>
import { fabric } from 'fabric'
import { ref, watch, watchEffect } from 'vue'

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
    console.log(e.path)
    e.path.stroke = 'rgb(255,0,0)'
    canvas.add(e.path)
    // canvas.add(new fabric.Path(e.path))
  })
})
</script>
