import { CANVAS_COLORS, RECTANGLE_COLORS } from "../pages/character-list/constants/constants";
import { Shape2D } from "./shape.class";

export class Rectangle2D extends Shape2D {
  constructor(
    public override x: number,
    public override y: number,
    public w: number,
    public h: number,
    public angle: number,
    public override color: string = RECTANGLE_COLORS.green
  ) {
    super(x, y, color);
  }

  redraw(context: CanvasRenderingContext2D): void {
    const rotatePoint = new Path2D();
    context.save();
    context.translate(this.x + this.w / 2, this.y + this.h / 2);
    context.rotate(this.angle);
    context.beginPath();
    context.fillStyle = this.color;
    context.rect(-this.w / 2, -this.h / 2, this.w, this.h);
    context.fill();
    rotatePoint.arc(-this.w / 2, -this.h / 2, 8, 0, 2 * Math.PI);
    context.fillStyle = CANVAS_COLORS.blue;
    context.fill(rotatePoint);
    context.strokeStyle = CANVAS_COLORS.white;
    context.stroke(rotatePoint);
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
    return context.isPointInPath(rect, cursorX, cursorY);
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
    const rotatePoint = new Path2D();
    rotatePoint.arc(rotatedX, rotatedY, 8, 0, 2 * Math.PI);
    return context.isPointInPath(rotatePoint, cursorX, cursorY);
  }
}
