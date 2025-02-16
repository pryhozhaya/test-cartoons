import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { setLoading } from "../store/character.actions";

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private store: Store) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    this.store.dispatch(setLoading({ loading: true }));

    return next.handle(req).pipe(
      finalize(() => {
        this.store.dispatch(setLoading({ loading: false }));
      }),
    );
  }
}
