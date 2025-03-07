import { HttpErrorResponse } from "@angular/common/http";
import { createAction, props } from "@ngrx/store";
import { Character } from "../models/character.model";
import { Info } from "../models/common-pagination-response.interface";
import { CharacterCanvas } from "../pages/character-list/models/character-canvas-models";

export const loadCharacters = createAction("[Characters List] Load Characters");

export const loadCharactersSuccess = createAction(
  "[Characters List] Load Characters Success",
  props<{ characters: Character[]; info: Info }>(),
);

export const loadCharactersFailure = createAction(
  "[Characters List] Load Characters Error",
  props<{ error: HttpErrorResponse }>(),
);

export const saveSearchQuery = createAction(
  "[Character] Save Search Query",
  props<{ name: string }>(),
);

export const setPage = createAction(
  "[Characters List] Set Page",
  props<{ page: number }>(),
);

export const setSearchValue = createAction(
  "[Character] Set SearchValue",
  props<{ searchValue: string }>(),
);

export const setSelectedCharacter = createAction(
  "[Character] Set SelectedCharacter",
  props<{ selectedCharacter: Character | null }>(),
);

export const saveCharactersCanvas = createAction(
  "[Character] Save Characters Canvas",
  props<{ charactersCanvas: CharacterCanvas[] }>(),
);

export const setLoading = createAction(
  "[Character] Set Loading",
  props<{ loading: boolean }>(),
);
