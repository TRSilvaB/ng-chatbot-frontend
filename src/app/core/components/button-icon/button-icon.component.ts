import { Component, Input } from '@angular/core';
import { IconService } from '../../services/icon-service/icon.service';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-button-icon',
  standalone: true,
  templateUrl: './button-icon.component.html',
  styleUrls: ['./button-icon.component.scss'],
  imports: [NgClass, NgIf],
})
export class ButtonIconComponent {
  @Input() icon: string = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-147q-14 0-28.5-5T426-168l-69-63q-106-97-191.5-192.5T80-634q0-94 63-157t157-63q53 0 100 22.5t80 61.5q33-39 80-61.5T660-854q94 0 157 63t63 157q0 115-85 211T602-230l-68 62q-11 11-25.5 16t-28.5 5Zm-38-543q-29-41-62-62.5T300-774q-60 0-100 40t-40 100q0 52 37 110.5T285.5-410q51.5 55 106 103t88.5 79q34-31 88.5-79t106-103Q726-465 763-523.5T800-634q0-60-40-100t-100-40q-47 0-80 21.5T518-690q-7 10-17 15t-21 5q-11 0-21-5t-17-15Zm38 189Z"/></svg>`;
  @Input() text: string | null = null;
  @Input() iconPosition: 'left' | 'top' | 'right' | 'bottom' = 'left';

  constructor(public iconService: IconService) {}
}
