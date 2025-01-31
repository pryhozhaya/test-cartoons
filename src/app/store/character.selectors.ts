import { createSelector } from '@ngrx/store';
import { CharacterState } from './character.reducer';

export const selectCharacterState = (state: any) => state.characters;

export const selectCharacters = createSelector(
  selectCharacterState,
  (state: CharacterState) => state.characters
);

export const selectQueries = createSelector(
  selectCharacterState,
  (state: CharacterState) => state.queries
);

export const selectInfo = createSelector(
  selectCharacterState,
  (state: CharacterState) => state.info
);

export const selectLoading = createSelector(
  selectCharacterState,
  (state: CharacterState) => state.loading
);

export const selectPage = createSelector(
  selectCharacterState,
  (state: CharacterState) => state.page
);

export const selectSearchValue = createSelector(
  selectCharacterState,
  (state: CharacterState) => state.searchValue
);

export const selectError = createSelector(
  selectCharacterState,
  (state: CharacterState) => state.error
);

export const selectPageAndTotalPage = createSelector(
    selectPage,
    selectInfo,
    (page, info) => ({
        page,
        pageCount: info?.pages ?? 1,
    })
);