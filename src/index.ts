const canvas = document.getElementById('canvas') as HTMLCanvasElement
canvas.width = 500
canvas.height = 500
const ctx = canvas.getContext('2d')
ctx.fillStyle = '#f8f8f0'
ctx.fillRect(0, 0, 500, 500)
export {}
