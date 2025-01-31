import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';

@Directive({
    selector: '[appPageChange]'
})
export class PageChangeDirective {
    @Input({required: true}) config = {page: 1, pageCount: 1};
    @Output() pageChangeEmit = new EventEmitter<number>();

    @HostListener('scroll', ['$event'])
    onScroll(event: Event): void {
        const {page, pageCount} = this.config
        const target = event.target as HTMLElement;
        const scrollTop = target.scrollTop;
        const containerHeight = target.offsetHeight;
        const contentHeight = target.scrollHeight;

        if (scrollTop + containerHeight >= contentHeight && page < pageCount) {
            this.pageChangeEmit.emit(page + 1);
            target.scrollTo({top: 1, behavior: 'smooth'});
        } else if (scrollTop === 0 && page > 1) {
            this.pageChangeEmit.emit(page - 1);
            target.scrollTo({top: contentHeight - containerHeight - 1, behavior: 'smooth'});
        }
    }
}
