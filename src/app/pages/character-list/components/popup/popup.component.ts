import {
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
  EMPTY,
  filter,
  fromEvent,
  map,
  scan,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import { Rectangle2D } from "../../../../classes/rectangle.class";
import { finalizeWithValue } from "../../../../utils/rxjs-operator";

@Component({
  selector: "app-popup",
  imports: [MatDialogModule, MatDialogModule, MatFormFieldModule],
  templateUrl: "./popup.component.html",
  styleUrl: "./popup.component.scss",
})
export class PopupComponent {
  public data = inject(MAT_DIALOG_DATA);

  private canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");
  private canvas = computed<HTMLCanvasElement>(
    () => this.canvasRef().nativeElement
  );
  private context = computed<CanvasRenderingContext2D>(
    () => this.canvas().getContext("2d") as CanvasRenderingContext2D
  );

  private objectCollection: Rectangle2D[] = [];
  private state: "drawing" | "moving" | "rotating" | "idle" | "drag" = "idle";

  constructor(public dialogRef: MatDialogRef<PopupComponent>) {}

  ngOnInit(): void {
    this.setCanvasScale();
    this.canvas().style.backgroundImage = `url(${this.data.image})`;
    this.canvas().style.backgroundSize = "cover";

    const mouseDown$ = fromEvent<MouseEvent>(this.canvas(), "mousedown");
    const mouseMove$ = fromEvent<MouseEvent>(this.canvas(), "mousemove");
    const mouseUp$ = fromEvent<MouseEvent>(document, "mouseup");

    mouseDown$
      .pipe(
        filter(() => this.state === "idle"),
        map((event) => ({ x: event.offsetX, y: event.offsetY })),
        switchMap(({ x, y }) =>
          mouseMove$.pipe(
            scan((rect: Rectangle2D | null, event: MouseEvent) => {
              const newRect = new Rectangle2D(
                x,
                y,
                event.offsetX - x,
                event.offsetY - y,
                "blue"
              );
              this.context().clearRect(0, 0, 1000, 1000);
              this.objectCollection.forEach((shape) =>
                shape.draw(this.context())
              );
              newRect.draw(this.context());
              return newRect;
            }, null),
            takeUntil(
              mouseUp$.pipe(
                tap(() => {
                  this.state = "idle";
                })
              )
            ),
            finalizeWithValue((rect) => {
              if (rect) {
                this.objectCollection.push(rect);
              }
            })
          )
        )
      )
      .subscribe();

    mouseMove$
      .pipe(
        filter(() => this.state !== "drag"),
        map((event) => {
          const moveItem = this.objectCollection.find((item) =>
            item.isCursorInside(event.offsetX, event.offsetY)
          );
          const rotateItem = this.objectCollection.find((item) =>
            item.isCursorNearCorner(event.offsetX, event.offsetY)
          );

          return moveItem ? "move" : rotateItem ? "rotate" : null;
        })
      )
      .subscribe((currentItem) => {
        switch (currentItem) {
          case "move":
            this.canvas().style.cursor = "grab";
            this.state = "moving";
            break;
          case "rotate":
            this.canvas().style.cursor = "move";
            this.state = "rotating";
            break;
          default:
            this.canvas().style.cursor = "default";
            this.state = "idle";
            break;
        }
      });

    mouseDown$
      .pipe(
        filter(() => this.state === "moving"),
        switchMap((downEvent) => {
          this.state = "drag";
          const currentItem = this.objectCollection.find((item) =>
            item.isCursorInside(downEvent.offsetX, downEvent.offsetY)
          );
          if (!currentItem) {
            return EMPTY;
          }

          const offsetX = downEvent.offsetX - currentItem.x;
          const offsetY = downEvent.offsetY - currentItem.y;

          return mouseMove$.pipe(
            tap((moveEvent) => {
              currentItem.move(
                moveEvent.offsetX - offsetX - currentItem.x,
                moveEvent.offsetY - offsetY - currentItem.y
              );
              this.drawItemCollection();
            }),
            takeUntil(mouseUp$.pipe(tap(() => (this.state = "idle"))))
          );
        })
      )
      .subscribe();

   
  }

  public reset(): void {
    this.objectCollection = [];
    this.drawItemCollection();
  }

  private drawItemCollection(): void {
    this.context().clearRect(0, 0, this.canvas().width, this.canvas().height);
    this.objectCollection.forEach((shape) => shape.draw(this.context()));
  }

  private setCanvasScale(): void {
    const scale = window.devicePixelRatio;
    this.canvas().width = this.canvas().clientWidth * scale;
    this.canvas().height = this.canvas().clientHeight * scale + 50;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
