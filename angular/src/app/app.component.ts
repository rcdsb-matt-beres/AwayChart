import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CalendarService } from './calendar.service';
import { CommonModule, NgFor } from '@angular/common';
import { ClockComponent } from './clock/clock.component';
import { GridComponent } from './grid/grid.component';
import { get } from 'http';
import { AddEventComponent } from './add-event/add-event.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, GridComponent, ClockComponent, AddEventComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  checkDate = new Date();
  currMonth = this.checkDate.getMonth() + 1;
  currSeason = "";

  constructor(private calendarService: CalendarService, private cdr: ChangeDetectorRef) { }
  events: any[] = [];
  remoteMap = new Map<String, String>();

  ngOnInit(): void {
    this.getSeason();
    this.calendarService.getEvents().subscribe((response: { items: any[]; }) => {
      this.events = response.items;
    });
  }

  getSeason() {
    if (this.currMonth == 12 || this.currMonth <= 2) {
      this.currSeason = "Winter"
    } else if (this.currMonth >= 3 && this.currMonth <= 5) {
      this.currSeason = "Spring"
    } else if (this.currMonth >= 6 && this.currMonth <= 8) {
      this.currSeason = "Summer"
    } else if (this.currMonth >= 9 && this.currMonth <= 11) {
      this.currSeason = "Fall"
    }
    this.cdr.detectChanges();
  }
}
