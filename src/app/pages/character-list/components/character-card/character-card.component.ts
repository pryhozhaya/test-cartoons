import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { Character } from "../../../../models/character.model";
import { PopupComponent } from "../popup/popup.component";

@Component({
  selector: "app-character-card",
  imports: [MatDialogModule, CommonModule, MatDialogModule],
  templateUrl: "./character-card.component.html",
  styleUrl: "./character-card.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCardComponent {
  @Input({ required: true }) character!: Character;

  constructor(private dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(PopupComponent, {
      data: this.character,
    });
  }
}
