import { CANVAS_COLORS, RECTANGLE_COLORS } from "../models/constants";
import { Shape2D } from "./shape.class";

export class Rectangle2D extends Shape2D {
  constructor(
    x: number,
    y: number,
    public w: number,
    public h: number,
    public angle: number,
    color: string = RECTANGLE_COLORS.green
  ) {
    super(x, y, color);
  }

  redraw(context: CanvasRenderingContext2D): void {
    context.save();
    context.translate(this.x + this.w / 2, this.y + this.h / 2);
    context.rotate(this.angle);
    context.beginPath();
    context.fillStyle = this.color;
    context.rect(-this.w / 2, -this.h / 2, this.w, this.h);
    context.fill();
    console.log(this)
    const circle = new Path2D();
    circle.arc(-this.w / 2, -this.h / 2, 8, 0, 2 * Math.PI);
    context.fillStyle = CANVAS_COLORS.blue;
    context.fill(circle);
    context.strokeStyle = CANVAS_COLORS.white;
    context.stroke(circle);
    context.restore();
  }

  isCursorInside(
    context: CanvasRenderingContext2D,
    cursorX: number,
    cursorY: number
  ): boolean {
    const rect = new Path2D();
    rect.rect(this.x, this.y, this.w, this.h);
    context.save();
    context.translate(this.x + this.w / 2, this.y + this.h / 2);
    context.rotate(this.angle);
    context.restore();
    const mouseInside = context.isPointInPath(rect, cursorX, cursorY);
    return mouseInside;
  }

  isCursorNearCorner(
    context: CanvasRenderingContext2D,
    cursorX: number,
    cursorY: number
  ): boolean {
    const centerX = this.x + this.w / 2;
    const centerY = this.y + this.h / 2;
    const rotatedX =
      centerX +
      (this.x - centerX) * Math.cos(this.angle) -
      (this.y - centerY) * Math.sin(this.angle);
    const rotatedY =
      centerY +
      (this.x - centerX) * Math.sin(this.angle) +
      (this.y - centerY) * Math.cos(this.angle);
    const circle = new Path2D();
    circle.arc(rotatedX, rotatedY, 8, 0, 2 * Math.PI);
    return context.isPointInPath(circle, cursorX, cursorY);
  }
}
