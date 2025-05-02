import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../calendar.service';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-grid',
  imports: [CommonModule, NgFor],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css'
})
export class GridComponent implements OnInit{
  constructor(private calendarService: CalendarService) {}
  names = [
    "Aaron McQuade",
    "Alex Fudge",
    "Andrew Dunlop",
    "Andrew Lebert",
    "Andrew Smith",
    "Anthony Walsh",
    "Brad Pilon",
    "Corey Graveline-Dumouchel",
    "David Priebe",
    "Dean Cybulski",
    "Don White",
    "Josh Burton",
    "Justin Lepine",
    "Matt Beres",
    "Michelle Rowe",
    "Mitch Yackobeck"
  ];

  events: any[] = [];
  remoteMap = new Map<String, String>();

  ngOnInit(): void {
    this.names.sort();
    this.calendarService.getEvents().subscribe((response: { items: any[]; }) => {
      this.events = response.items;
      this.itemizeEvents();
    });
  }

  itemizeEvents() {
    this.events.forEach(event => {
      if (event.summary.split("-")[1].trim() == "Remote") {
        this.remoteMap.set(event.summary.split("-")[0].trim(), "Remote")
      } //Account for Corey's hyphenated last name
      else if (event.summary.split("-")[0].trim() == "Corey Graveline" && event.summary.split("-")[2].trim() == "Remote"){
        this.remoteMap.set("Corey Graveline-Dumouchel", "Remote")
      }
    })
  }

}
