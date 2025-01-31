import {HttpClient, HttpParams} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Character} from '../models/character.model';
import {CommonPaginationResponse} from '../models/common-pagination-response.interface';
import {environment} from "../../environments/environment.development";

@Injectable({
    providedIn: 'root',
})
export class CharacterService {
    private http = inject(HttpClient);

    getCharacters(name: string | null, page: number): Observable<CommonPaginationResponse<Character>> {
        let params = new HttpParams();
        if (name) {
            params = params.set('name', name);
        }
        params = params.set('page', page);
        return this.http.get<CommonPaginationResponse<Character>>(environment.baseUrlAPI, {params});
    }

}
