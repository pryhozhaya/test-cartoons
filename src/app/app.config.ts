import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { importProvidersFrom, isDevMode } from "@angular/core";
import { MatNativeDateModule } from "@angular/material/core";
import {
  BrowserAnimationsModule,
  provideAnimations,
} from "@angular/platform-browser/animations";
import { provideEffects } from "@ngrx/effects";
import { provideStore } from "@ngrx/store";
import { routes } from "./app.routes";
import { LoadingInterceptor } from "./interceptor/loading.interceptor";
import { CharacterEffects } from "./store/character.effects";
import { characterReducer } from "./store/character.reducer";
import { provideStoreDevtools } from '@ngrx/store-devtools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
        characters: characterReducer,
    }),
    provideHttpClient(withInterceptorsFromDi()),
    {
        provide: HTTP_INTERCEPTORS,
        useClass: LoadingInterceptor,
        multi: true,
    },
    provideEffects([CharacterEffects]),
    provideAnimations(),
    importProvidersFrom(MatNativeDateModule, BrowserAnimationsModule),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
],
};
