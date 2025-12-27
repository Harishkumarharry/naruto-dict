import { Directive, HostListener, Input } from "@angular/core";

@Directive({
    selector: 'img[fallback]',
    standalone: true,
})

export class FallbackImageDirective {
    // @Input() fallback = "/src/assets/images/fallback.jpg";

    @HostListener('error', ['$event'])
    onError(event: Event) {
        const img = event.target as HTMLImageElement;
        img.src = "/src/assets/images/fallback.jpg";
    }
}