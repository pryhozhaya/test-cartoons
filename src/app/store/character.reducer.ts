import {createReducer, on} from '@ngrx/store';
import {Character} from '../models/character.model';
import {Info} from '../models/common-pagination-response.interface';
import {
    loadCharacters,
    loadCharactersFailure,
    loadCharactersSuccess,
    saveSearchQuery,
    setPage,
    setSearchValue
} from './character.actions';

export interface CharacterState {
    loading: boolean;
    characters: Character[];
    queries: string[];
    error: string | null;
    info: Info | null;
    page: number;
    searchValue: string | null
}

export const initialState: CharacterState = {
    loading: false,
    characters: [],
    queries: [],
    error: null,
    info: null,
    page: 1,
    searchValue: null,
};

export const characterReducer = createReducer(
    initialState,

    on(saveSearchQuery, (state, {name}) => ({
        ...state,
        queries: [...new Set([name, ...state.queries])],
    })),
    on(loadCharacters, (state) => ({
        ...state,
        loading: true
    })),
    on(loadCharactersSuccess, (state, {characters, info}) => ({
        ...state,
        characters,
        error: null,
        info: info,
    })),

    on(loadCharactersFailure, (state, {error}) => ({
        ...state,
        error: error.message || "Error",
    })),

    on(setPage, (state, {page}) => ({
        ...state,
        page
    })),

    on(setSearchValue, (state, {searchValue}) => ({
        ...state,
        searchValue
    })),
    on(loadCharactersFailure, loadCharactersSuccess, (state) => ({
        ...state,
        loading: false,
    })),
);
