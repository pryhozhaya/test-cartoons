import { createFeatureSelector, createSelector } from "@ngrx/store";
import { CharacterCanvas } from "../pages/character-list/models/character-canvas-models";
import * as CharactersStore from "./character.reducer";

export interface State {
  characters: CharactersStore.CharactersState;
}

export const selectCharactersState =
  createFeatureSelector<CharactersStore.CharactersState>("characters");

export const selectCharacters = createSelector(
  selectCharactersState,
  CharactersStore.selectAllCharacters,
);

export const selectQueries = createSelector(
  selectCharactersState,
  CharactersStore.selectQueries,
);

export const selectInfo = createSelector(
  selectCharactersState,
  CharactersStore.selectInfo,
);

export const selectLoading = createSelector(
  selectCharactersState,
  CharactersStore.selectLoading,
);

export const selectPage = createSelector(
  selectCharactersState,
  CharactersStore.selectPage,
);

export const selectSearchValue = createSelector(
  selectCharactersState,
  CharactersStore.selectSearchValue,
);

export const selectSelectedCharacter = createSelector(
  selectCharactersState,
  CharactersStore.selectSelectedCharacter,
);

export const selectError = createSelector(
  selectCharactersState,
  CharactersStore.selectError,
);

export const selectPageAndTotalPage = createSelector(
  selectPage,
  selectInfo,
  (page, info) => ({
    page,
    pageCount: info?.pages ?? 1,
  }),
);

export const selectCharactersCanvas = createSelector(
  selectCharactersState,
  CharactersStore.selectCharactersCanvas,
);

export const selectCharacterCanvasById = (id: number) =>
  createSelector(selectCharactersCanvas, (canvas: CharacterCanvas[]) =>
    canvas.find((c) => c.characterId === id),
  );
