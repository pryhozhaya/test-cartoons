import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Character } from "../../../../models/character.model";
import {
  setSelectedCharacter
} from "../../../../store/character.actions";

@Component({
  selector: "app-character-card",
  imports: [
    MatDialogModule,
    CommonModule,
    MatDialogModule,
    NgOptimizedImage,
  ],
  templateUrl: "./character-card.component.html",
  styleUrl: "./character-card.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCardComponent {
  @Input({ required: true }) character!: Character;
  private store = inject(Store);

  openPopup() {
    this.store.dispatch(
      setSelectedCharacter({ selectedCharacter: this.character || null })
    );
  }
}
