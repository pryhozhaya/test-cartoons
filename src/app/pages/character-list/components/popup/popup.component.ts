import { KeyValuePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  viewChild,
} from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { select, Store } from "@ngrx/store";
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

import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { saveCharactersCanvas } from "../../../../store/character.actions";
import {
  selectCharacterCanvasById,
  selectCharactersCanvas,
} from "../../../../store/character.selectors";
import { finalizeWithValue } from "../../../../utils/rxjs-operator";
import {
  CanvaState,
  RECTANGLE_COLORS,
  ROTATE_SPEED,
} from "../../constants/constants";
import { CharacterCanvas } from "../../models/character-canvas-models";

@Component({
  selector: "app-popup",
  imports: [
    KeyValuePipe,
    MatDialogModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  templateUrl: "./popup.component.html",
  styleUrl: "./popup.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupComponent implements OnInit, OnDestroy {
  private data = inject(MAT_DIALOG_DATA);
  private destroyRef = inject(DestroyRef);
  private store = inject(Store);

  private allCharactersCanvas$ = this.store.select(selectCharactersCanvas);
  private allCharactersCanvas: CharacterCanvas[] = [];
  private objectCollection: Rectangle2D[] = [];
  private state: CanvaState = CanvaState.idle;

  protected readonly rectangleColors = RECTANGLE_COLORS;
  protected colorControl = new FormControl(this.rectangleColors.blue);

  private canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");
  private canvas = computed<HTMLCanvasElement>(
    () => this.canvasRef().nativeElement,
  );
  private context = computed<CanvasRenderingContext2D>(
    () => this.canvas().getContext("2d") as CanvasRenderingContext2D,
  );

  ngOnInit(): void {
    this.store
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        select(selectCharacterCanvasById(this.data.id)),
      )
      .subscribe((charactersCanvas) => {
        charactersCanvas?.canvas.forEach((shape) => {
          const { x, y, w, h, angle, color } = shape;
          const newRect = new Rectangle2D(x, y, w, h, angle, color);
          this.objectCollection.push(newRect);
        });
      });

    this.allCharactersCanvas$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((charactersCanvas) => {
        this.allCharactersCanvas = [...charactersCanvas];
      });

    this.setCanvasScale();
    this.canvas().style.backgroundImage = `url(${this.data.image})`;
    this.objectCollection.forEach((shape) => shape.redraw(this.context()));
    this.mouseEventSubscription();
  }

  get color(): string {
    return this.colorControl.value || RECTANGLE_COLORS.green;
  }

  ngOnDestroy(): void {
    this.saveCanvas();
  }

  protected reset(): void {
    this.objectCollection = [];
    this.drawItemCollection();
  }

  protected saveCanvas(): void {
    const index = this.allCharactersCanvas.findIndex(
      (item) => item.characterId === this.data.id,
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

  private clearCanvas(): void {
    this.context().clearRect(0, 0, this.canvas().width, this.canvas().height);
  }

  private drawItemCollection(): void {
    this.clearCanvas();
    this.objectCollection.forEach((shape) => shape.redraw(this.context()));
  }

  private setCanvasScale(): void {
    const scale = window.devicePixelRatio;
    this.canvas().width = this.canvas().clientWidth * scale;
    this.canvas().height = this.canvas().clientHeight * scale + 50;
  }

  private mouseEventSubscription() {
    const mouseDown$ = fromEvent<MouseEvent>(this.canvas(), "mousedown");
    const mouseMove$ = fromEvent<MouseEvent>(this.canvas(), "mousemove");
    const mouseUp$ = fromEvent<MouseEvent>(document, "mouseup");

    // Drawing logic
    mouseDown$
      .pipe(
        filter(() => this.state === CanvaState.idle),
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
                this.color,
              );
              this.clearCanvas();
              this.objectCollection.forEach((shape) =>
                shape.redraw(this.context()),
              );
              newRect.redraw(this.context());
              return newRect;
            }, null),
            takeUntil(
              mouseUp$.pipe(
                tap(() => {
                  this.state = CanvaState.idle;
                }),
              ),
            ),
            finalizeWithValue((rect) => {
              if (rect) {
                this.objectCollection.push(rect);
              }
            }),
          ),
        ),
      )
      .subscribe();

    // Cursor and state management
    mouseMove$
      .pipe(
        filter(() => this.state !== CanvaState.drag),
        map((event) => {
          const moveItem = this.objectCollection.find((item) =>
            item.isCursorInside(this.context(), event.offsetX, event.offsetY),
          );
          const rotateItem = this.objectCollection.find((item) =>
            item.isCursorNearCorner(
              this.context(),
              event.offsetX,
              event.offsetY,
            ),
          );

          return moveItem ? "move" : rotateItem ? "rotate" : null;
        }),
        takeUntilDestroyed(this.destroyRef),
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
              downEvent.offsetY,
            ),
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
                moveEvent.offsetY - offsetY - currentItem.y,
              );

              this.drawItemCollection();
            }),
            takeUntil(mouseUp$.pipe(tap(() => (this.state = CanvaState.idle)))),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
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
              downEvent.offsetY,
            ),
          );
          if (!currentItem) {
            return EMPTY;
          }

          return mouseMove$.pipe(
            scan((previous, moveEvent) => {
              const dx = moveEvent.clientX - previous.clientX;
              currentItem.angle += dx * ROTATE_SPEED;
              this.clearCanvas();
              this.context().save();
              this.objectCollection.forEach((shape) =>
                shape.redraw(this.context()),
              );
              currentItem.redraw(this.context());
              return moveEvent;
            }, downEvent),
            takeUntil(
              mouseUp$.pipe(
                tap(() => {
                  this.state = CanvaState.idle;
                }),
              ),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
