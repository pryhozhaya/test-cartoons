import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { Character } from "../../../../models/character.model";
import { PopupComponent } from "../popup/popup.component";

@Component({
  selector: "app-character-card",
  imports: [MatDialogModule, CommonModule, MatDialogModule, NgOptimizedImage, PopupComponent],
  templateUrl: "./character-card.component.html",
  styleUrl: "./character-card.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCardComponent {
  @Input({ required: true }) character!: Character;

  isPopupOpen = false;

  openPopup() {
    this.isPopupOpen = true;
  }

  onPopupStateChange(isOpen: boolean) {
    this.isPopupOpen = isOpen;
  }
}
