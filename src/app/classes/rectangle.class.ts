import { CANVAS_COLORS, RECTANGLE_COLORS } from "../pages/character-list/constants/constants";

export interface Point {
  x: number;
  y: number;
}

export class Poligon {
  constructor(
    public points: Point[],
    public angle: number,
    public color: string = RECTANGLE_COLORS.green
  ) {
  }

  redraw(context: CanvasRenderingContext2D): void {
    const { centerX, centerY } = this.keyPoints;
    const poligon = new Path2D();
    const rotatedPoints = this.points.map((point) => {
      return {
        x: centerX + (point.x - centerX) * Math.cos(this.angle) - (point.y - centerY) * Math.sin(this.angle),
        y: centerY + (point.x - centerX) * Math.sin(this.angle) + (point.y - centerY) * Math.cos(this.angle)
      };
    })

    rotatedPoints.forEach((point, index) => {
      if (index === 0) {
        poligon.moveTo(point.x, point.y);
      } else {
        poligon.lineTo(point.x, point.y);
      }
    });
    poligon.closePath();

    context.fillStyle = `rgba(${this.color}, 0.5)`;
    context.lineWidth = 2;
    context.strokeStyle = `rgba(${this.color})`;
    context.fill(poligon);
    context.stroke(poligon);
  }

  move(dx: number, dy: number): void {
    this.points.forEach((point) => {
      point.x += dx;
      point.y += dy;
    });
  }

  isCursorInside(
    context: CanvasRenderingContext2D,
    cursorX: number,
    cursorY: number
  ): boolean {
    const path = new Path2D();
    context.save();
    const { centerX, centerY } = this.keyPoints;

    const rotatedPoints = this.points.map((point) => {
      return {
        x: centerX + (point.x - centerX) * Math.cos(this.angle) - (point.y - centerY) * Math.sin(this.angle),
        y: centerY + (point.x - centerX) * Math.sin(this.angle) + (point.y - centerY) * Math.cos(this.angle)
      };
    })
    
    path.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);

    rotatedPoints.forEach((point, index) => {
      if (index === 0) {
        path.moveTo(point.x, point.y);
      } else {
        path.lineTo(point.x, point.y);
      }
    });
    path.closePath();

    context.restore();
    return context.isPointInPath(path, cursorX, cursorY);
  }

  createFrame(context: CanvasRenderingContext2D) {
    const { minX, maxX, minY, maxY, centerX, centerY } = this.keyPoints;
    const framePoints = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];

    const rotatedPoints = framePoints.map((point) => {
      return {
        x: centerX + (point.x - centerX) * Math.cos(this.angle) - (point.y - centerY) * Math.sin(this.angle),
        y: centerY + (point.x - centerX) * Math.sin(this.angle) + (point.y - centerY) * Math.cos(this.angle)
      };
    })

    const frame = new Path2D();
    rotatedPoints.forEach((point, index) => {
      if (index === 0) {
        frame.moveTo(point.x, point.y);
      } else {
        frame.lineTo(point.x, point.y);
      }
    });
    frame.closePath();
    context.lineWidth = 1;
    context.strokeStyle = "black";
    context.stroke(frame);

    const rotatePoint = new Path2D();
    rotatePoint.arc(rotatedPoints[0].x, rotatedPoints[0].y, 6, 0, 2 * Math.PI);
    context.fillStyle = CANVAS_COLORS.blue;
    context.fill(rotatePoint);
  }

  get keyPoints() {
    const minX = this.points.reduce((min, current) => {
      return min < current.x ? min : current.x;
    }, this.points[0].x);
    const maxX = this.points.reduce((max, current) => {
      return max > current.x ? max : current.x;
    }, this.points[0].x);
    const minY = this.points.reduce((min, current) => {
      return min < current.y ? min : current.y;
    }, this.points[0].y);
    const maxY = this.points.reduce((max, current) => {
      return max > current.y ? max : current.y;
    }, this.points[0].y);
    const centerX = minX + (maxX - minX) / 2;
    const centerY =  minY + (maxY - minY) / 2;
    return {
      minX,
      maxX,
      centerX,
      minY,
      maxY,
      centerY
    };
  }
  isCursorNearCorner(
    context: CanvasRenderingContext2D,
    cursorX: number,
    cursorY: number,
  ): boolean {
    const { minX, maxX, centerX,  minY, maxY, centerY } = this.keyPoints;
    const rotatedX =
      centerX +
      (minX - centerX) * Math.cos(this.angle) -
      (minY - centerY) * Math.sin(this.angle);
    const rotatedY =
      centerY +
      (minX - centerX) * Math.sin(this.angle) +
      (minY - centerY) * Math.cos(this.angle);
    const rotatePoint = new Path2D();
    rotatePoint.arc(rotatedX, rotatedY, 8, 0, 2 * Math.PI);
    return context.isPointInPath(rotatePoint, cursorX, cursorY);
  }
}
