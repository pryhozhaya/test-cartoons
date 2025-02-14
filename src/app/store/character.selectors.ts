import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import { CharacterCanvas } from '../models/character.model';
import * as charactersStore from './character.reducer';

export interface State {
  characters: charactersStore.CharactersState
}

export const reducers: ActionReducerMap<State> = {
  characters: charactersStore.reducer,
};

export const selectCharactersState = createFeatureSelector<charactersStore.CharactersState>('characters');

export const selectCharacters = createSelector(
  selectCharactersState,
  charactersStore.selectAllCharacters
);

export const selectQueries = createSelector(
  selectCharactersState,
  charactersStore.selectQueries
);

export const selectInfo = createSelector(
  selectCharactersState,
  charactersStore.selectInfo
);

export const selectLoading = createSelector(
  selectCharactersState,
  charactersStore.selectLoading
);

export const selectPage = createSelector(
  selectCharactersState,
  charactersStore.selectPage
);

export const selectSearchValue = createSelector(
  selectCharactersState,
  charactersStore.selectSearchValue
);

export const selectError = createSelector(
  selectCharactersState,
  charactersStore.selectError
);

export const selectPageAndTotalPage = createSelector(
    selectPage,
    selectInfo,
    (page, info) => ({
        page,
        pageCount: info?.pages ?? 1,
    })
);

export const selectCharactersCanvas = createSelector(
  selectCharactersState,
  charactersStore.selectCharactersCanvas
);

export const selectCharacterCanvasById = (id: number) =>
  createSelector(
    selectCharactersCanvas,
    (canvas: CharacterCanvas[]) => canvas.find((c) => c.characterId === id)
  );

