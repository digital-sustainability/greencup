import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';
import { Page } from 'tns-core-modules/ui/page/page';
import { Carousel } from 'nativescript-carousel';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
  @ViewChild('CarouselView', { static: false }) carouselView: ElementRef<Carousel>;

  isFirstRun = false;

  constructor(
    private _navigationService: NavigationService,
    private _authService: AuthService,
    private _page: Page) {
    _page.actionBarHidden = true;
  }

  ngOnInit() {
    if (this._authService.isFirstRun()) {
      this.isFirstRun = true;
    }
  }

  onNavigateToTabs(): void {
    this._authService.setFirstRun(true);

    this._navigationService.navigateTo('tabs', true);
  }

  onNavigateBack(): void {
    this._navigationService.navigateBack();
  }

  onNavigateToSlide(index): void {
    this.carouselView.nativeElement.selectedPage = index;
  }

}
