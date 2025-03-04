import { ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";

import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Store } from "@ngrx/store";
import { AutocompleteSearchComponent } from "../../components/autocomplete-search/autocomplete-search.component";
import { Character } from "../../models/character.model";
import {
  loadCharacters,
  setPage,
  setSelectedCharacter,
} from "../../store/character.actions";
import {
  selectCharacters,
  selectError,
  selectLoading,
  selectPageAndTotalPage,
  selectSelectedCharacter,
} from "../../store/character.selectors";
import { CharacterCardComponent } from "./components/character-card/character-card.component";
import { PopupComponent } from "./components/popup/popup.component";
@Component({
  standalone: true,
  selector: "app-character-list",
  imports: [
    CharacterCardComponent,
    CommonModule,
    ScrollingModule,
    AutocompleteSearchComponent,
    MatProgressSpinnerModule,
    InfiniteScrollDirective,
    PopupComponent,
  ],
  templateUrl: "./character-list.component.html",
  styleUrl: "./character-list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterListComponent implements OnInit {
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);

  protected readonly isLoading$ = this.store.select(selectLoading);
  protected readonly characters$ = this.store.select(selectCharacters);
  protected readonly pageAndCount$ = this.store.select(selectPageAndTotalPage);
  protected readonly error$ = this.store.select(selectError);
  protected readonly selectedCharacter$ = this.store.select(
    selectSelectedCharacter
  );
  protected selectedCharacter: Character | null = null;

  private page = 1;
  private cardsCount = 17;

  ngOnInit(): void {
    this.store.dispatch(loadCharacters());
    this.selectedCharacter$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((character) => {
        this.selectedCharacter = character;
      });
  }

  public onPopupStateChange(isOpen: boolean) {
    this.store.dispatch(
      setSelectedCharacter({
        selectedCharacter: isOpen ? this.selectedCharacter : null,
      })
    );
  }

  pageChange(): void {
    this.page++;
    this.store.dispatch(setPage({ page: this.page }));
  }

  public onScroll(event: number) {
    if (event === this.cardsCount) {
      this.page++;
      this.cardsCount += 17;
      this.store.dispatch(setPage({ page: this.page }));
    }
  }
}
