import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  viewChild,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { select, Store } from "@ngrx/store";
import {
  EMPTY,
  filter,
  fromEvent,
  map,
  scan,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import { Rectangle2D } from "../../../../classes/rectangle.class";
import { CharacterCanvas } from "../../../../models/character.model";
import { saveCharactersCanvas } from "../../../../store/character.actions";
import {
  selectCharacterCanvasById,
  selectCharactersCanvas,
} from "../../../../store/character.selectors";
import { finalizeWithValue } from "../../../../utils/rxjs-operator";

@Component({
  selector: "app-popup",
  imports: [MatDialogModule, MatDialogModule, MatFormFieldModule],
  templateUrl: "./popup.component.html",
  styleUrl: "./popup.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupComponent implements OnInit, OnDestroy {
  public data = inject(MAT_DIALOG_DATA);
  private store = inject(Store);
  private dialogRef = inject(MatDialogRef<PopupComponent>);

  private destroy$ = new Subject<void>();
  private allcharactersCanvas: CharacterCanvas[] = [];
  private objectCollection: Rectangle2D[] = [];
  private state: "drawing" | "moving" | "rotating" | "idle" | "drag" = "idle";
  private allCharactersCanvas$ = this.store.select(selectCharactersCanvas);

  private canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");
  private canvas = computed<HTMLCanvasElement>(
    () => this.canvasRef().nativeElement
  );
  private context = computed<CanvasRenderingContext2D>(
    () => this.canvas().getContext("2d") as CanvasRenderingContext2D
  );

  ngOnInit(): void {
    this.store
      .pipe(
        takeUntil(this.destroy$),
        select(selectCharacterCanvasById(this.data.id))
      )
      .subscribe((charactersCanvas) => {
        charactersCanvas?.canvas.forEach((shape) => {
          const { x, y, w, h, angle, color } = shape;
          const newRect = new Rectangle2D(x, y, w, h, angle, color);
          this.objectCollection.push(newRect);
        });
      });

    this.allCharactersCanvas$
      .pipe(takeUntil(this.destroy$))
      .subscribe((charactersCanvas) => {
        this.allcharactersCanvas = [...charactersCanvas];
      });

    this.setCanvasScale();
    this.canvas().style.backgroundImage = `url(${this.data.image})`;
    this.canvas().style.backgroundSize = "cover";

    const mouseDown$ = fromEvent<MouseEvent>(this.canvas(), "mousedown");
    const mouseMove$ = fromEvent<MouseEvent>(this.canvas(), "mousemove");
    const mouseUp$ = fromEvent<MouseEvent>(document, "mouseup");

    this.objectCollection.forEach((shape) => shape.rotate(this.context()));

    // Drawing logic
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
                0,
                "blue"
              );
              this.clearCanvas();
              this.objectCollection.forEach((shape) =>
                shape.rotate(this.context())
              );
              newRect.rotate(this.context());
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

    // Cursor and state management
    mouseMove$
      .pipe(
        filter(() => this.state !== "drag"),
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
        takeUntil(this.destroy$)
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

    // Moving logic
    mouseDown$
      .pipe(
        filter(() => this.state === "moving"),
        switchMap((downEvent) => {
          this.state = "drag";
          const currentItem = this.objectCollection.find((item) =>
            item.isCursorInside(
              this.context(),
              downEvent.offsetX,
              downEvent.offsetY
            )
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

    // Rotating logic
    let lastMouseX = 0;

    mouseDown$
      .pipe(
        filter(() => this.state === "rotating"),
        switchMap((downEvent) => {
          this.state = "drag";
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
              let dx = moveEvent.clientX - lastMouseX;
              currentItem.angle += dx * 0.02;
              this.clearCanvas();
              this.context().save();
              this.objectCollection.forEach((shape) =>
                shape.rotate(this.context())
              );
              currentItem.rotate(this.context());
              lastMouseX = moveEvent.clientX;
            }),
            takeUntil(
              mouseUp$.pipe(
                tap(() => {
                  this.state = "idle";
                })
              )
            )
          );
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public reset(): void {
    this.objectCollection = [];
    this.drawItemCollection();
  }

  private clearCanvas(): void {
    this.context().clearRect(0, 0, this.canvas().width, this.canvas().height);
  }

  private drawItemCollection(): void {
    this.clearCanvas();
    this.objectCollection.forEach((shape) => shape.rotate(this.context()));
  }

  private setCanvasScale(): void {
    const scale = window.devicePixelRatio;
    this.canvas().width = this.canvas().clientWidth * scale;
    this.canvas().height = this.canvas().clientHeight * scale + 50;
  }

  onNoClick(): void {
    const index = this.allcharactersCanvas.findIndex(
      (item) => item.characterId === this.data.id
    );
    const updatedCanvas: CharacterCanvas = {
      characterId: this.data.id,
      canvas: [...this.objectCollection],
    };

    const charactersCanvas =
      index > -1
        ? [
            ...this.allcharactersCanvas.slice(0, index),
            updatedCanvas,
            ...this.allcharactersCanvas.slice(index + 1),
          ]
        : [...this.allcharactersCanvas, updatedCanvas];

    this.store.dispatch(saveCharactersCanvas({ charactersCanvas }));
    this.dialogRef.close();
  }
}
