import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { provideHttpClient } from "@angular/common/http";
import { importProvidersFrom } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import {BrowserAnimationsModule, provideAnimations} from '@angular/platform-browser/animations';
import { provideEffects } from "@ngrx/effects";
import { provideStore } from "@ngrx/store";
import { routes } from "./app.routes";
import { CharacterEffects } from "./store/character.effects";
import { characterReducer } from "./store/character.reducer";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({
      characters: characterReducer,
    }),
    provideEffects([CharacterEffects]),
    provideAnimations(),
    importProvidersFrom(MatNativeDateModule, BrowserAnimationsModule)
  ],
};
