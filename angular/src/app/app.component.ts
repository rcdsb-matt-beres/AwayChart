import { Component, OnInit } from '@angular/core';
import { CalendarService } from './calendar.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{

  constructor(private calendarService: CalendarService) {}
  events: any[] = [];

  remoteEvents: any[] = [];

  ngOnInit(): void {
    this.calendarService.getEvents().subscribe((response: { items: any[]; }) => {
      this.events = response.items;
    });
  }

}
