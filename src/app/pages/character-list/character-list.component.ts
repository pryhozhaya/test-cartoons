import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AutocompleteSearchComponent} from "../../components/autocomplete-search/autocomplete-search.component";
import {loadCharacters, setPage} from '../../store/character.actions';
import {selectCharacters, selectError, selectPageAndTotalPage} from '../../store/character.selectors';
import {CharacterCardComponent} from "./components/character-card/character-card.component";
import {PageChangeDirective} from "./directives/page-change.directive";

@Component({
    standalone: true,
    selector: 'app-character-list',
    imports: [CharacterCardComponent, CommonModule, ScrollingModule, AutocompleteSearchComponent, PageChangeDirective],
    templateUrl: './character-list.component.html',
    styleUrl: './character-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterListComponent implements OnInit {
    private store = inject(Store);

    protected readonly characters$ = this.store.select(selectCharacters);
    protected readonly pageAndCount$ = this.store.select(selectPageAndTotalPage);
    protected readonly error$ = this.store.select(selectError);

    ngOnInit(): void {
        this.store.dispatch(loadCharacters());
    }

    pageChange(page: number): void {
        this.store.dispatch(setPage({page}));
    }
}
