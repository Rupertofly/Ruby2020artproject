export function drawCircle(
    drawingContext: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
) {
    drawingContext.beginPath();
    drawingContext.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
}
