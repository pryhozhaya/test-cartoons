import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Character } from '../../../../models/character.model';

@Component({
  selector: 'app-character-card',
  imports: [],
  templateUrl: './character-card.component.html',
  styleUrl: './character-card.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCardComponent {
  @Input({ required: true }) character!: Character;
}
