import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from "@angular/material/autocomplete";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { Store } from "@ngrx/store";
import { combineLatest, debounceTime, map, tap } from "rxjs";
import { SEARCH_DELAY } from "../../constants/constants";
import { setPage, setSearchValue } from "../../store/character.actions";
import { selectQueries } from "../../store/character.selectors";

@Component({
  selector: "app-autocomplete-search",
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatFormField,
    MatInput,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
  ],
  templateUrl: "./autocomplete-search.component.html",
  styleUrl: "./autocomplete-search.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteSearchComponent implements OnInit {
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);

  protected readonly searchControl = new FormControl("");
  protected readonly queries$ = combineLatest([
    this.store.select(selectQueries),
    this.searchControl.valueChanges,
  ]).pipe(
    map(([queries, searchValue]) => {
      return searchValue && searchValue.length > 0
        ? queries.filter((query) => query.includes(searchValue)).slice(0, 7)
        : [];
    }),
  );

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(SEARCH_DELAY),
        tap((value) => {
          this.store.dispatch(setSearchValue({ searchValue: value || "" }));
          this.store.dispatch(setPage({ page: 1 }));
        }),
      )
      .subscribe();
  }
}
