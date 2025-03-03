import { KeyValuePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  signal,
  viewChild,
} from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { select, Store } from "@ngrx/store";
import {
  EMPTY,
  filter,
  fromEvent,
  map,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
} from "rxjs";
import { Point, Poligon } from "../../../../classes/rectangle.class";

import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { saveCharactersCanvas } from "../../../../store/character.actions";
import {
  selectCharacterCanvasById,
  selectCharactersCanvas,
} from "../../../../store/character.selectors";
import { CanvaState, RECTANGLE_COLORS } from "../../constants/constants";
import { CharacterCanvas } from "../../models/character-canvas-models";

@Component({
  selector: "app-popup",
  imports: [KeyValuePipe, FormsModule, ReactiveFormsModule],
  templateUrl: "./popup.component.html",
  styleUrl: "./popup.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupComponent implements OnInit, OnDestroy {
  @Input() data: any;
  @Output() isOpenChange = new EventEmitter<boolean>();

  public scaleValue = signal<number>(1);

  protected readonly rectangleColors = RECTANGLE_COLORS;
  protected colorControl = new FormControl(this.rectangleColors.blue);

  private destroyRef = inject(DestroyRef);
  private store = inject(Store);
  private renderer = inject(Renderer2);

  private initialWidth = 0;
  private allCharactersCanvas$ = this.store.select(selectCharactersCanvas);
  private allCharactersCanvas: CharacterCanvas[] = [];
  private objectCollection: Poligon[] = [];
  private state: CanvaState = CanvaState.idle;
  private canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");
  private canvas = computed<HTMLCanvasElement>(
    () => this.canvasRef().nativeElement
  );
  private context = computed<CanvasRenderingContext2D>(
    () => this.canvas().getContext("2d") as CanvasRenderingContext2D
  );
  private popupRef = viewChild.required<ElementRef<HTMLElement>>("popup");
  private popup = computed<HTMLElement>(() => this.popupRef().nativeElement);
  private resizerRef = viewChild.required<ElementRef<HTMLElement>>("resizer");
  private resizer = computed<HTMLElement>(
    () => this.resizerRef().nativeElement
  );

  ngOnInit(): void {
    this.initResize();
    this.configureCanvas();
    this.store
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        select(selectCharacterCanvasById(this.data.id))
      )
      .subscribe((charactersCanvas) => {
        charactersCanvas?.canvas.forEach((shape) => {
          const { points, angle, color } = shape;
          const newPoligon = new Poligon(points, angle, color);
          this.objectCollection.push(newPoligon);
        });
      });

    this.allCharactersCanvas$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((charactersCanvas) => {
        this.allCharactersCanvas = [...charactersCanvas];
      });
    this.drawItemCollection();
    this.mouseEventSubscription();
  }

  get color(): string {
    return this.colorControl.value || RECTANGLE_COLORS.blue;
  }

  ngOnDestroy(): void {
    this.saveCanvas();
  }

  public closePopup() {
    this.isOpenChange.emit(false);
  }

  initResize() {
    fromEvent<MouseEvent>(this.resizer(), "mousedown").subscribe((event) => {
      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = this.popup().offsetWidth;
      const startHeight = this.popup().offsetHeight;

      const mouseMove$ = fromEvent<MouseEvent>(document, "mousemove");
      const mouseUp$ = fromEvent<MouseEvent>(document, "mouseup");

      const moveSub = mouseMove$
        .pipe(takeUntil(mouseUp$))
        .subscribe((moveEvent) => {
          const newWidth = startWidth + (moveEvent.clientX - startX);
          const newHeight = startHeight + (moveEvent.clientY - startY);
          this.renderer.setStyle(this.popup(), "width", `${newWidth}px`);
          this.renderer.setStyle(this.popup(), "height", `${newHeight}px`);

          this.scaleValue.set(this.popup().offsetWidth / this.initialWidth);

          // this.renderer.setStyle(this.canvas(), "width", `${newWidth - 40}px`);
          // this.renderer.setStyle(
          //   this.canvas(),
          //   "height",
          //   `${newHeight - 150}px`
          // );

          // console.log(this.canvas().width, this.canvas().height);
          // this.objectCollection.map((poligon) => {
          //   poligon.points.map((point) => {
          //     point.x += deltaWidth;
          //     point.y += deltaHeight;
          //   })
          // })
          // this.setCanvasScale();
          // this.drawItemCollection();
        });

      mouseUp$.subscribe(() => moveSub.unsubscribe());
    });
  }

  protected reset(): void {
    this.objectCollection = [];
    this.drawItemCollection();
  }

  protected saveCanvas(): void {
    const index = this.allCharactersCanvas.findIndex(
      (item) => item.characterId === this.data.id
    );
    const updatedCanvas: CharacterCanvas = {
      characterId: this.data.id,
      canvas: [...this.objectCollection],
    };

    const charactersCanvas =
      index > -1
        ? [
            ...this.allCharactersCanvas.slice(0, index),
            updatedCanvas,
            ...this.allCharactersCanvas.slice(index + 1),
          ]
        : [...this.allCharactersCanvas, updatedCanvas];

    this.store.dispatch(saveCharactersCanvas({ charactersCanvas }));
  }

  private configureCanvas(): void {
    this.initialWidth = this.popup().offsetWidth;
    const newWidth = this.initialWidth - 40;
    const newHeight = this.popup().offsetHeight - 100;
    this.renderer.setStyle(this.canvas(), "width", `${newWidth}px`);
    this.renderer.setStyle(this.canvas(), "height", `${newHeight}px`);
    this.canvas().style.backgroundImage = `url(${this.data.image})`;
    this.setCanvasScale();

    fromEvent(window, "resize")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.popup().style.width.includes("%")) {
          const newWidth = (this.popup().offsetWidth / window.innerWidth) * 100;
          this.renderer.setStyle(
            this.popup(),
            "width",
            `${Math.trunc(newWidth)}%`
          );
        }
        this.scaleValue.set(this.popup().offsetWidth / this.initialWidth);
      });
  }

  private clearCanvas(): void {
    this.context().clearRect(0, 0, this.canvas().width, this.canvas().height);
  }

  public saveCanvasImageAsJpeg(quality = 0.92) {
    this.clearCanvas();
    const base_image = new Image();
    base_image.crossOrigin = "anonymous";
    base_image.src = this.data.image;
    base_image.onload = () => {
      this.context().drawImage(
        base_image,
        0,
        0,
        this.canvas().width,
        this.canvas().height
      );
      this.objectCollection.forEach((poligon) =>
        poligon.redraw(this.context())
      );

      const link = document.createElement("a");
      link.download = "canvas-image.png";
      link.href = this.canvas().toDataURL("image/png", quality);
      link.click();
      link.remove();
    };
  }

  private isNearFirstPoint(
    drawningPoligon: Point[],
    x: number,
    y: number
  ): boolean {
    const startPointRadius = 10;
    const firstPoint = drawningPoligon[0];
    const distance = Math.sqrt(
      Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2)
    );

    return distance <= startPointRadius;
  }

  private drawItemCollection(): void {
    this.clearCanvas();
    this.objectCollection.forEach((poligon) => poligon.redraw(this.context()));
  }

  private setCanvasScale(): void {
    const scale = window.devicePixelRatio;
    this.canvas().width = this.canvas().clientWidth * scale;
    this.canvas().height = this.canvas().clientHeight * scale;
  }

  private mouseEventSubscription() {
    const mouseDown$ = fromEvent<MouseEvent>(this.canvas(), "mousedown");
    const mouseMove$ = fromEvent<MouseEvent>(this.canvas(), "mousemove");
    const mouseUp$ = fromEvent<MouseEvent>(document, "mouseup");
    let drawningPoligon: Point[] = [];

    // Drawing logic
    mouseDown$
      .pipe(
        filter(
          () =>
            this.state === CanvaState.idle || this.state === CanvaState.drawing
        ),

        map((event) => ({ x: event.offsetX, y: event.offsetY })),
        tap(({ x, y }) => {
          this.context().fillStyle = `rgba(${this.color}, 0.5)`;
          this.context().lineWidth = 2;
          this.context().strokeStyle = `rgba(${this.color})`;
          if (this.state === CanvaState.idle) {
            this.state = CanvaState.drawing;
            drawningPoligon.push({ x, y });
            this.context().beginPath();
            this.context().moveTo(x, y);
          } else {
            if (this.isNearFirstPoint(drawningPoligon, x, y)) {
              this.context().closePath();
              this.context().stroke();
              this.context().fill();
              const newPoligon = new Poligon(drawningPoligon, 0, this.color);
              this.objectCollection.push(newPoligon);
              this.state = CanvaState.idle;
              drawningPoligon = [];
              this.drawItemCollection();
            } else {
              drawningPoligon.push({ x, y });
              drawningPoligon.forEach((point, index) => {
                if (index === 0) {
                  this.context().moveTo(point.x, point.y);
                } else {
                  this.context().lineTo(point.x, point.y);
                }
              });
              this.context().stroke();
            }
          }
        }),
        switchMap(({ x, y }) =>
          mouseMove$.pipe(
            throttleTime(16),
            filter(() => this.state === CanvaState.drawing),
            map((event) => ({
              xCurrent: event.offsetX,
              yCurrent: event.offsetY,
            })),
            tap(({ xCurrent, yCurrent }) => {
              const lastPoint = drawningPoligon.at(-1) || { x, y };
              this.drawItemCollection();
              this.context().lineWidth = 2;
              this.context().strokeStyle = `rgba(${this.color})`;
              this.context().beginPath();
              drawningPoligon.forEach((point, index) => {
                if (index === 0) {
                  this.context().moveTo(point.x, point.y);
                } else {
                  this.context().lineTo(point.x, point.y);
                }
              });
              this.context().stroke();
              this.context().moveTo(lastPoint.x, lastPoint.y);
              this.context().lineTo(xCurrent, yCurrent);
              this.context().stroke();
            })
          )
        )
      )
      .subscribe();

    // Cursor and state management
    mouseMove$
      .pipe(
        filter(
          () =>
            this.state !== CanvaState.drag && this.state !== CanvaState.drawing
        ),
        map((event) => {
          const moveItem = this.objectCollection.find((item) =>
            item.isCursorInside(this.context(), event.offsetX, event.offsetY)
          );
          const rotateItem = this.objectCollection.find((item) =>
            item.isCursorNearCorner(
              this.context(),
              event.offsetX,
              event.offsetY
            )
          );

          return moveItem ? "move" : rotateItem ? "rotate" : null;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((currentItem) => {
        switch (currentItem) {
          case "move":
            this.canvas().style.cursor = "grab";
            this.state = CanvaState.moving;
            break;
          case "rotate":
            this.canvas().style.cursor = "move";
            this.state = CanvaState.rotating;
            break;
          default:
            this.canvas().style.cursor = "default";
            this.state = CanvaState.idle;
            break;
        }
      });

    // Moving logic
    mouseDown$
      .pipe(
        filter(() => this.state === CanvaState.moving),
        switchMap((downEvent) => {
          this.state = CanvaState.drag;
          const currentItem = this.objectCollection.find((item) =>
            item.isCursorInside(
              this.context(),
              downEvent.offsetX,
              downEvent.offsetY
            )
          );
          if (currentItem) {
            this.drawItemCollection();
            currentItem.createFrame(this.context());
          } else {
            return EMPTY;
          }

          let previousOffsetX = downEvent.offsetX,
            previousOffsetY = downEvent.offsetY;

          return mouseMove$.pipe(
            tap((moveEvent) => {
              const dx = moveEvent.offsetX - previousOffsetX;
              const dy = moveEvent.offsetY - previousOffsetY;
              previousOffsetX = moveEvent.offsetX;
              previousOffsetY = moveEvent.offsetY;
              currentItem.move(dx, dy);

              this.drawItemCollection();
              currentItem.createFrame(this.context());
            }),
            takeUntil(mouseUp$.pipe(tap(() => (this.state = CanvaState.idle))))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    // Rotating logic
    mouseDown$
      .pipe(
        filter(() => this.state === CanvaState.rotating),

        switchMap((downEvent) => {
          this.state = CanvaState.drag;
          const currentItem = this.objectCollection.find((item) =>
            item.isCursorNearCorner(
              this.context(),
              downEvent.offsetX,
              downEvent.offsetY
            )
          );
          if (!currentItem) {
            return EMPTY;
          }

          return mouseMove$.pipe(
            tap((moveEvent) => {
              const targetX = moveEvent.offsetX;
              const targetY = moveEvent.offsetY;
              const minMaxPoints = currentItem.keyPoints;

              const dx1 = minMaxPoints.minX - minMaxPoints.centerX;
              const dy1 = minMaxPoints.minY - minMaxPoints.centerY;

              const dx2 = targetX - minMaxPoints.centerX;
              const dy2 = targetY - minMaxPoints.centerY;

              const angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);

              currentItem.angle = angle;

              this.drawItemCollection();
              currentItem.redraw(this.context());
              currentItem.createFrame(this.context());
            }),

            takeUntil(
              mouseUp$.pipe(
                tap(() => {
                  this.state = CanvaState.idle;
                })
              )
            )
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}
