import { Component, OnInit } from '@angular/core';
import { CalendarService } from './calendar.service';
import { CommonModule, NgFor } from '@angular/common';
import { ClockComponent } from './clock/clock.component';
import { GridComponent } from './grid/grid.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, GridComponent, ClockComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{

  constructor(private calendarService: CalendarService) {}
  events: any[] = [];
  remoteMap = new Map<String, String>();

  ngOnInit(): void {
    this.calendarService.getEvents().subscribe((response: { items: any[]; }) => {
      this.events = response.items;
      this.itemizeEvents();
    });
  }

  itemizeEvents() {
    this.events.forEach(event => {
      if (event.summary.split("-")[1].trim() == "Remote") {
        this.remoteMap.set(event.summary.split("-")[0].trim(), "Remote")
      } else if (event.summary.split("-")[0].trim() == "Corey Graveline" && event.summary.split("-")[2].trim() == "Remote"){
        this.remoteMap.set("Corey Graveline-Dumouchel", "Remote")
      }
    })
  }

}
