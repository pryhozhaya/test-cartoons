import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { select, Store } from "@ngrx/store";
import { of, tap } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { CharacterService } from "../services/character.service";
import {
  loadCharacters,
  loadCharactersFailure,
  loadCharactersSuccess,
  saveSearchQuery,
  setPage,
} from "./character.actions";
import { selectPage, selectSearchValue } from "./character.selectors";

@Injectable()
export class CharacterEffects {
  private actions$ = inject(Actions);
  private characterService = inject(CharacterService);
  private store = inject(Store);

  getCharacters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCharacters, setPage),
      concatLatestFrom(() => [
        this.store.pipe(select(selectPage)),
        this.store.pipe(select(selectSearchValue)),
      ]),
      switchMap(([_, page, name]) =>
        this.characterService.getCharacters(name, page).pipe(
          tap(() => {
            if (name && name.length >= 4) {
              this.store.dispatch(saveSearchQuery({ name }));
            }
          }),
          map(({ results, info }) =>
            loadCharactersSuccess({ characters: results, info }),
          ),
          catchError((error) => of(loadCharactersFailure({ error }))),
        ),
      ),
    ),
  );
}
