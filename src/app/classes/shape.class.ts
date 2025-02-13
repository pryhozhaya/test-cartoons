export abstract class Shape2D {
  protected constructor(public x: number, public y: number, public color: string = 'black') {}

  abstract draw(context: CanvasRenderingContext2D): void;
  abstract isCursorInside(x: number, y: number): boolean;
  abstract isCursorNearCorner(x: number, y: number): boolean;

  move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  setColor(color: string): void {
    this.color = color;
  }
}
