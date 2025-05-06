import { Component } from '@angular/core';
import { CalendarService } from '../calendar.service';

@Component({
  selector: 'app-add-event',
  imports: [],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css'
})
export class AddEventComponent {
constructor(private calendarService: CalendarService) {}
  onClick() {
    //Go to add event app
  }
}
