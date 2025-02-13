import { Shape2D } from './shape.class';

export class Rectangle2D extends Shape2D {
  constructor(x: number, y: number, public w: number, public h: number, color: string = 'black') {
    super(x, y, color);
  }

  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.w, this.h);
  }

  isCursorInside(x: number, y: number): boolean {
    const x1 = Math.min(this.x, this.x + this.w);
    const x2 = Math.max(this.x, this.x + this.w);
    const y1 = Math.min(this.y, this.y + this.h);
    const y2 = Math.max(this.y, this.y + this.h);

    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }

    isCursorNearCorner(x: number, y: number): boolean {
    return (
      x > this.x - 10 && x < this.x && y > this.y - 10 &&  y < this.y ||
      x < this.x + this.w + 10 && x > this.x + this.w && y < this.y + this.h + 10 && y > this.y + this.h ||
      x > this.x - 10 && x < this.x && y < this.y + this.h + 10 && y > this.y + this.h ||
      x < this.x + this.w + 10 && x > this.x + this.w && y > this.y - 10 &&  y < this.y
    );
  }


}
