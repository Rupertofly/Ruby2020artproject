export function drawCircle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  const ctx = context;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
}
