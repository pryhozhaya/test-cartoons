import { EntityAdapter, EntityState, createEntityAdapter } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Character, CharacterCanvas } from '../models/character.model';
import { Info } from '../models/common-pagination-response.interface';
import {
    addCharacters,
    loadCharacters,
    loadCharactersFailure,
    loadCharactersSuccess,
    saveCharactersCanvas,
    saveSearchQuery,
    setPage,
    setSearchValue,
    upsertCharacters
} from './character.actions';

export interface CharactersState extends EntityState<Character> {
    loading: boolean;
    queries: string[];
    error: string | null;
    info: Info | null;
    page: number;
    searchValue: string | null;
    charactersCanvas: CharacterCanvas[];
}

export const adapter: EntityAdapter<Character> = createEntityAdapter<Character>(
);

export const initialState: CharactersState = adapter.getInitialState({ 
    loading: false,
    queries: [],
    error: null,
    info: null,
    page: 1,
    searchValue: null,
    charactersCanvas:[],
});

export const characterReducer = createReducer(
    initialState,

    on(saveSearchQuery, (state, { name }) => ({
        ...state,
        queries: [...new Set([name, ...state.queries])],
    })),

    on(loadCharacters, (state) => ({
        ...state,
        loading: true,
    })),

    on(loadCharactersSuccess, (state, { characters, info }) =>
        adapter.setAll(characters, {
            ...state,
            loading: false,
            info,
        })
    ),

    on(loadCharactersFailure, (state, { error }) => ({
        ...state,
        error: error.message || 'Error',
        loading: false,
    })),

    on(setPage, (state, { page }) => ({
        ...state,
        page,
    })),

    on(setSearchValue, (state, { searchValue }) => ({
        ...state,
        searchValue,
    })),

    on(addCharacters, (state, { characters }) =>
        adapter.addMany(characters, state)
    ),

    on(upsertCharacters, (state, { characters }) =>
        adapter.upsertMany(characters, state)
    ),

    on(saveCharactersCanvas, (state, { charactersCanvas }) => ({
        ...state,
        charactersCanvas,
    })),
);

export function reducer(state: CharactersState | undefined, action: Action) {
    return characterReducer(state, action);
  }

  const {
    selectIds,
    selectEntities,
    selectAll,
  } = adapter.getSelectors();
   
  export const selectCharactersIds = selectIds;
  export const selectCharacterEntities = selectEntities;
  export const selectAllCharacters = selectAll;

  export const selectQueries = (state: CharactersState) => state.queries;
  export const selectInfo = (state: CharactersState) => state.info;
  export const selectLoading = (state: CharactersState) => state.loading;
  export const selectPage = (state: CharactersState) => state.page;
  export const selectSearchValue = (state: CharactersState) => state.searchValue;
  export const selectError = (state: CharactersState) => state.error; 
  export const selectCharactersCanvas = (state: CharactersState) => state.charactersCanvas;






   