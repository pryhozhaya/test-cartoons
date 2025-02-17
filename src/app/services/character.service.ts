import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment.development";
import { Character } from "../models/character.model";
import { CommonPaginationResponse } from "../models/common-pagination-response.interface";

@Injectable({
  providedIn: "root",
})
export class CharacterService {
  private http = inject(HttpClient);

  getCharacters(
    name: string,
    page: number,
  ): Observable<CommonPaginationResponse<Character>> {
    const params = new HttpParams({
      fromObject: Object.fromEntries(
        Object.entries({ name, page: page.toString() }) // Приводим page к строке
          .filter(([_, v]) => v !== null), // Убираем null
      ),
    });

    return this.http.get<CommonPaginationResponse<Character>>(
      environment.baseUrlAPI,
      { params },
    );
  }
}
