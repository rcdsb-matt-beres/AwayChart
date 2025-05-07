import { Component } from '@angular/core';
import { CalendarService } from '../calendar.service';

@Component({
  selector: 'app-add-event',
  imports: [],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css'
})
export class AddEventComponent {
  onClick() {
    window.location.href = 'https://rcdsb-matt-beres.github.io/Add-Event-Website/';
  }
}
