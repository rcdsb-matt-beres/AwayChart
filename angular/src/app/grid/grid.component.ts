import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../calendar.service';
import { CommonModule, NgFor } from '@angular/common';
import { interval, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-grid',
  imports: [CommonModule, NgFor],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css'
})
export class GridComponent implements OnInit {
  constructor(private calendarService: CalendarService) { }
  private intervalSubscription?: Subscription;

  names = [
    "Aaron McQuade",
    "Alex Fudge",
    "Andrew Dunlop",
    "Andrew Lebert",
    "Andrew Smith",
    "Anthony Walsh",
    "Bethany McCulloch",
    "Brad Pilon",
    "Corey Graveline-Dumouchel",
    "David Priebe",
    "Dean Cybulski",
    "Don White",
    "Gavin McGinley",
    "Josh Burton",
    "Justin Lepine",
    "Kathy Prescott",
    "Matt Beres",
    "Michelle Rowe",
    "Mitch Yackobeck",
    "Sheri Larochelle",
    "Terri Lee",
    "Trevor Smith",
  ];

  events: any[] = [];
  remoteMap = new Map<String, String>();
  conferenceMap = new Map<String, String>();
  awayMap = new Map<String, String>();
  fieldMap = new Map<String, String>();

  displayMap = new Map<String, String>();

  ngOnInit(): void {
    this.names.sort();

    this.calendarService.getEvents().subscribe((response: { items: any[]; }) => {
      this.events = response.items;
      this.itemizeEvents();
    });

    this.intervalSubscription = interval(300000).subscribe(_ => {
      this.remoteMap.clear();
      this.conferenceMap.clear();
      this.awayMap.clear();
      this.fieldMap.clear();
      this.displayMap.clear();
      this.calendarService.getEvents().subscribe((response: { items: any[]; }) => {
        this.events = response.items;
        this.itemizeEvents();
      });
    });
  }

  itemizeEvents() {
    this.events.forEach(event => {
      //Check timing
      let shouldDisplay = true;
      if (event.start.dateTime) {
        const currentDate = new Date();
        const startTime = new Date(event.start.dateTime)
        const endTime = new Date(event.end.dateTime)
        if (!(currentDate >= startTime && currentDate <= endTime)) {
          shouldDisplay = false;
        }
      }

      if (shouldDisplay) {
        //Remote
        if (event.summary.split("-")[1].trim() == "Remote") {
          this.remoteMap.set(event.summary.split("-")[0].trim(), "Remote")
          this.displayMap.set(event.summary.split("-")[0].trim(), "Remote")
        } //Account for Corey's hyphenated last name
        else if (event.summary.split("-")[0].trim() == "Corey Graveline" && event.summary.split("-")[2].trim() == "Remote") {
          this.remoteMap.set("Corey Graveline-Dumouchel", "Remote")
          this.displayMap.set("Corey Graveline-Dumouchel", "Remote")
        }

        //Conference
        if (event.summary.split("-")[1].trim() == "Conference") {
          this.conferenceMap.set(event.summary.split("-")[0].trim(), "Conference");
          if (this.displayMap.get(event.summary.split("-")[0].trim()) == "Remote") {
            this.displayMap.delete(event.summary.split("-")[0].trim());
          }
          this.displayMap.set(event.summary.split("-")[0].trim(), "Conference");
        } //Account for Corey's hyphenated last name
        else if (event.summary.split("-")[0].trim() == "Corey Graveline" && event.summary.split("-")[2].trim() == "Conference") {
          this.conferenceMap.set("Corey Graveline-Dumouchel", "Conference");
          if (this.displayMap.get("Corey Graveline-Dumouchel") == "Remote") {
            this.displayMap.delete("Corey Graveline-Dumouchel");
          }
          this.displayMap.set("Corey Graveline-Dumouchel", "Conference");
        }

        //Out of Office
        if (event.summary.split("-")[1].trim() == "Out of Office") {
          this.awayMap.set(event.summary.split("-")[0].trim(), "Out of Office");
          if (this.displayMap.get(event.summary.split("-")[0].trim()) == "Remote" || this.displayMap.get(event.summary.split("-")[0].trim()) == "Conference") {
            this.displayMap.delete(event.summary.split("-")[0].trim());
          }
          this.displayMap.set(event.summary.split("-")[0].trim(), "Out of Office");
        } //Account for Corey's hyphenated last name
        else if (event.summary.split("-")[0].trim() == "Corey Graveline" && event.summary.split("-")[2].trim() == "Out of Office") {
          this.awayMap.set("Corey Graveline-Dumouchel", "Out of Office")
          if (this.displayMap.get("Corey Graveline-Dumouchel") == "Remote" || this.displayMap.get("Corey Graveline-Dumouchel") == "Conference") {
            this.displayMap.delete("Corey Graveline-Dumouchel");
          }
          this.displayMap.set("Corey Graveline-Dumouchel", "Out of Office")
        }

        //Field
        if (event.summary.split("-")[1].trim().includes("Field")) {
          this.fieldMap.set(event.summary.split("-")[0].trim(), "Field");
          if (this.displayMap.get(event.summary.split("-")[0].trim()) == "Remote" || this.displayMap.get(event.summary.split("-")[0].trim()) == "Conference" || this.displayMap.get(event.summary.split("-")[0].trim()) == "Out of Office") {
            this.displayMap.delete(event.summary.split("-")[0].trim());
          }
          this.displayMap.set(event.summary.split("-")[0].trim(), "Field (" + event.summary.split("(")[1].trim());
        } //Account for Corey's hyphenated last name
        else if (event.summary.split("-")[0].trim() == "Corey Graveline" && event.summary.split("-")[2].trim().includes("Field")) {
          this.fieldMap.set("Corey Graveline-Dumouchel", "Field")
          if (this.displayMap.get("Corey Graveline-Dumouchel") == "Remote" || this.displayMap.get("Corey Graveline-Dumouchel") == "Conference" || this.displayMap.get("Corey Graveline-Dumouchel") == "Out of Office") {
            this.displayMap.delete("Corey Graveline-Dumouchel");
          }
          this.displayMap.set("Corey Graveline-Dumouchel", "Field")
        }
      }
    })
  }
}
