import { EntityAdapter, EntityState, createEntityAdapter } from "@ngrx/entity";
import { createReducer, on } from "@ngrx/store";
import { Character } from "../models/character.model";
import { Info } from "../models/common-pagination-response.interface";
import { CharacterCanvas } from "../pages/character-list/models/character-canvas-models";
import {
  loadCharacters,
  loadCharactersFailure,
  loadCharactersSuccess,
  saveCharactersCanvas,
  saveSearchQuery,
  setLoading,
  setPage,
  setSearchValue,
} from "./character.actions";

export interface CharactersState extends EntityState<Character> {
  loading: boolean;
  queries: string[];
  error: string | null;
  info: Info | null;
  page: number;
  searchValue: string | null;
  charactersCanvas: CharacterCanvas[];
}

export const adapter: EntityAdapter<Character> =
  createEntityAdapter<Character>();

export const initialState: CharactersState = adapter.getInitialState({
  loading: false,
  queries: [],
  error: null,
  info: null,
  page: 1,
  searchValue: null,
  charactersCanvas: [],
});

export const characterReducer = createReducer(
  initialState,

  on(saveSearchQuery, (state, { name }) => ({
    ...state,
    queries: [...new Set([name, ...state.queries])],
  })),

  on(loadCharacters, (state) => ({
    ...state,
  })),

  on(loadCharactersSuccess, (state, { characters, info }) =>
    adapter.setAll(characters, {
      ...state,
      info,
      error: null,
    }),
  ),

  on(loadCharactersFailure, (state, { error }) => ({
    ...state,
    error: error.message || "Error",
  })),

  on(setPage, (state, { page }) => ({
    ...state,
    page,
  })),

  on(setSearchValue, (state, { searchValue }) => ({
    ...state,
    searchValue,
  })),

  on(setLoading, (state, { loading }) => ({
    ...state,
    loading,
  })),

  on(saveCharactersCanvas, (state, { charactersCanvas }) => ({
    ...state,
    charactersCanvas,
  })),
);

const { selectAll } = adapter.getSelectors();

export const selectAllCharacters = selectAll;

export const selectQueries = (state: CharactersState) => state.queries;
export const selectInfo = (state: CharactersState) => state.info;
export const selectLoading = (state: CharactersState) => state.loading;
export const selectPage = (state: CharactersState) => state.page;
export const selectSearchValue = (state: CharactersState) => state.searchValue;
export const selectError = (state: CharactersState) => state.error;
export const selectCharactersCanvas = (state: CharactersState) =>
  state.charactersCanvas;
