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
    "Chris Waito",
    "Dan Schinkel",
    "David Priebe",
    "Dean Cybulski",
    "Gavin McGinley",
    "Josh Burton",
    "Josh Yourth",
    "Justin Lepine",
    "Kathy Prescott",
    "Matt Beres",
    "Michelle Rowe",
    "Mitch Yackobeck",
    "Natalie Blank Cazabon",
    "Sheri Larochelle",
    "Terri Lee",
    "Trevor Smith",
    "Tyler Lloyd Gallan"
  ];

  events: any[] = [];
  remoteMap = new Map<String, String>();
  conferenceMap = new Map<String, String>();
  awayMap = new Map<String, String>();
  fieldMap = new Map<String, String>();
  offMap = new Map<String, String>();
  meetingMap = new Map<String, String>();
  trainingMap = new Map<String, String>();

  displayMap = new Map<String, String>();

  ngOnInit(): void {
    this.names.sort();

    this.calendarService.getEvents().subscribe((response: { items: any[]; }) => {
      this.events = response.items;
      this.calendarService.getRemoteCalendarEvents().subscribe((resp: { items: any[]; }) => {
        this.events = [...this.events, ...resp.items]
        this.itemizeEvents();
      })
    });

    this.intervalSubscription = interval(60000).subscribe(_ => {
      this.remoteMap.clear();
      this.conferenceMap.clear();
      this.awayMap.clear();
      this.fieldMap.clear();
      this.displayMap.clear();
      this.calendarService.getEvents().subscribe((response: { items: any[]; }) => {
        this.events = response.items;
        this.calendarService.getRemoteCalendarEvents().subscribe((resp: { items: any[]; }) => {
          this.events = [...this.events, ...resp.items]
          this.itemizeEvents();
        })
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
        //Check for unscheduled/scheduled event, set to "Off"
        if (event.summary.split("-").length < 2 || event.summary.split("-").length > 2) {
          if (event.summary.toUpperCase().split("UNSCHEDULED").length > 1) {
            let name = this.grabName(event.summary.toUpperCase().split("UNSCHEDULED")[0].trim());
            if (
              this.displayMap.get(name)?.toUpperCase() == "MEETING" ||
              this.displayMap.get(name)?.toUpperCase() == "TRAINING" ||
              this.displayMap.get(name)?.toUpperCase() == "CONFERENCE" ||
              this.displayMap.get(name)?.toUpperCase() == "OUT OF OFFICE" ||
              this.displayMap.get(name)?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(name)?.toUpperCase().includes("FIELD")
            ) {
              this.displayMap.delete(name);
            }
            this.displayMap.set(name, "Off");
            this.offMap.set(name, "Off");
          } else if (event.summary.toUpperCase().split("SCHEDULED").length > 1) {
            let name = this.grabName(event.summary.toUpperCase().split("SCHEDULED")[0].trim());
            if (
              this.displayMap.get(name)?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(name)?.toUpperCase() == "MEETING" ||
              this.displayMap.get(name)?.toUpperCase() == "TRAINING" ||
              this.displayMap.get(name)?.toUpperCase() == "CONFERENCE" ||
              this.displayMap.get(name)?.toUpperCase() == "OUT OF OFFICE" ||
              this.displayMap.get(name)?.toUpperCase().includes("FIELD")
            ) {
              this.displayMap.delete(name);
            }
            this.displayMap.set(name, "Off");
            this.offMap.set(name, "Off");
          }
        } else {
          //Remote
          if (event.summary.split("-")[1].trim().toUpperCase() == "REMOTE") {
            this.remoteMap.set(event.summary.split("-")[0].trim(), "Remote");
            if (
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "OFF" &&
              !this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase().includes("FIELD") &&
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "OUT OF OFFICE" &&
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "CONFERENCE"
            ) {
              this.displayMap.set(event.summary.split("-")[0].trim(), "Remote");
            }
          } else if (
            event.summary.split("-")[0].trim().toUpperCase() == "COREY GRAVELINE" &&
            event.summary.split("-")[2].trim().toUpperCase() == "REMOTE"
          ) {
            this.remoteMap.set("Corey Graveline-Dumouchel", "Remote");
            if (
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "MEETING" &&
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "TRAINING" &&
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "OFF" &&
              !this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase().includes("FIELD") &&
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "OUT OF OFFICE" &&
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "CONFERENCE"
            ) {
              this.displayMap.set("Corey Graveline-Dumouchel", "Remote");
            }
          }

          //Meeting
          if (event.summary.split("-")[1].trim().toUpperCase() == "MEETING") {
            this.meetingMap.set(event.summary.split("-")[0].trim(), "Meeting");
            if (
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "REMOTE"
            ) {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            if (
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "TRAINING" &&
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "CONFERENCE" &&
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "OFF" &&
              !this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase().includes("FIELD") &&
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "OUT OF OFFICE"
            ) {
              this.displayMap.set(event.summary.split("-")[0].trim(), "Meeting");
            }
          } else if (
            event.summary.split("-")[0].trim().toUpperCase() == "COREY GRAVELINE" &&
            event.summary.split("-")[2].trim().toUpperCase() == "MEETING"
          ) {
            this.meetingMap.set("Corey Graveline-Dumouchel", "Meeting");
            if (
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() == "REMOTE"
            ) {
              this.displayMap.delete("Corey Graveline-Dumouchel");
            }
            if (
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "TRAINING" &&
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "CONFERENCE" &&
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "OFF" &&
              !this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase().includes("FIELD") &&
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "OUT OF OFFICE"
            ) {
              this.displayMap.set("Corey Graveline-Dumouchel", "Meeting");
            }
          }

          //Training
          if (event.summary.split("-")[1].trim().toUpperCase() == "TRAINING") {
            this.trainingMap.set(event.summary.split("-")[0].trim(), "Training");
            if (
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "MEETING"
            ) {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            if (
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "CONFERENCE" &&
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "OFF" &&
              !this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase().includes("FIELD") &&
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "OUT OF OFFICE"
            ) {
              this.displayMap.set(event.summary.split("-")[0].trim(), "Training");
            }
          } else if (
            event.summary.split("-")[0].trim().toUpperCase() == "COREY GRAVELINE" &&
            event.summary.split("-")[2].trim().toUpperCase() == "TRAINING"
          ) {
            this.trainingMap.set("Corey Graveline-Dumouchel", "Training");
            if (
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "MEETING"
            ) {
              this.displayMap.delete("Corey Graveline-Dumouchel");
            }
            if (
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "CONFERENCE" &&
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "OFF" &&
              !this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase().includes("FIELD") &&
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "OUT OF OFFICE"
            ) {
              this.displayMap.set("Corey Graveline-Dumouchel", "Training");
            }
          }

          //Conference
          if (event.summary.split("-")[1].trim().toUpperCase() == "CONFERENCE") {
            this.conferenceMap.set(event.summary.split("-")[0].trim(), "Conference");
            if (this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "MEETING" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "TRAINING") {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            if (
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "OFF" &&
              !this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase().includes("FIELD") &&
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "OUT OF OFFICE"
            ) {
              this.displayMap.set(event.summary.split("-")[0].trim(), "Conference");
            }
          } else if (
            event.summary.split("-")[0].trim().toUpperCase() == "COREY GRAVELINE" &&
            event.summary.split("-")[2].trim().toUpperCase() == "CONFERENCE"
          ) {
            this.conferenceMap.set("Corey Graveline-Dumouchel", "Conference");
            if (this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "MEETING" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "TRAINING") {
              this.displayMap.delete("Corey Graveline-Dumouchel");
            }
            if (
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "OFF" &&
              !this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase().includes("FIELD") &&
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "OUT OF OFFICE"
            ) {
              this.displayMap.set("Corey Graveline-Dumouchel", "Conference");
            }
          }

          //Out of Office
          if (event.summary.split("-")[1].trim().toUpperCase() == "OUT OF OFFICE") {
            this.awayMap.set(event.summary.split("-")[0].trim(), "Out of Office");
            if (
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "MEETING" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "TRAINING" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "CONFERENCE"
            ) {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            if (
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "OFF" &&
              !this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase().includes("FIELD")
            ) {
              this.displayMap.set(event.summary.split("-")[0].trim(), "Out of Office");
            }
          } else if (
            event.summary.split("-")[0].trim().toUpperCase() == "COREY GRAVELINE" &&
            event.summary.split("-")[2].trim().toUpperCase() == "OUT OF OFFICE"
          ) {
            this.awayMap.set("Corey Graveline-Dumouchel", "Out of Office");
            if (
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "MEETING" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "TRAINING" ||
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() == "CONFERENCE"
            ) {
              this.displayMap.delete("Corey Graveline-Dumouchel");
            }
            if (
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "OFF" &&
              !this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase().includes("FIELD")
            ) {
              this.displayMap.set("Corey Graveline-Dumouchel", "Out of Office");
            }
          }

          //Field
          if (event.summary.split("-")[1].trim().toUpperCase().includes("FIELD")) {
            this.fieldMap.set(event.summary.split("-")[0].trim(), "Field");
            if (
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "MEETING" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "TRAINING" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "CONFERENCE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "OUT OF OFFICE"
            ) {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            if (this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() != "OFF") {
              if (event.summary.split("(")[1] != null) {
                this.displayMap.set(
                  event.summary.split("-")[0].trim(),
                  "Field (" + event.summary.split("(")[1].trim()
                );
              } else {
                this.displayMap.set(event.summary.split("-")[0].trim(), "Field");
              }
            }
          } else if (
            event.summary.split("-")[0].trim().toUpperCase() == "COREY GRAVELINE" &&
            event.summary.split("-")[2].trim().toUpperCase().includes("FIELD")
          ) {
            this.fieldMap.set("Corey Graveline-Dumouchel", "Field");
            if (
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "MEETING" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "TRAINING" ||
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() == "CONFERENCE" ||
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() == "OUT OF OFFICE"
            ) {
              this.displayMap.delete("Corey Graveline-Dumouchel");
            }
            if (this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() != "OFF") {
              this.displayMap.set("Corey Graveline-Dumouchel", "Field");
            }
          }

          //Off
          if (event.summary.split("-")[1].trim().toUpperCase() == "OFF" || event.summary.split("-")[1].trim().toUpperCase().includes("SCHEDULE")) {
            this.offMap.set(event.summary.split("-")[0].trim(), "Off");
            if (
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "MEETING" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "TRAINING" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "CONFERENCE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "OUT OF OFFICE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase().includes("FIELD")
            ) {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            this.displayMap.set(event.summary.split("-")[0].trim(), "Off");
          } else if (
            event.summary.split("-")[0].trim().toUpperCase() == "COREY GRAVELINE" &&
            event.summary.split("-")[2].trim().toUpperCase() == "OFF"
          ) {
            this.offMap.set("Corey Graveline-Dumouchel", "Off");
            if (
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() == "REMOTE" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "MEETING" ||
              this.displayMap.get(event.summary.split("-")[0].trim())?.toUpperCase() == "TRAINING" ||
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() == "CONFERENCE" ||
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase() == "OUT OF OFFICE" ||
              this.displayMap.get("Corey Graveline-Dumouchel")?.toUpperCase().includes("FIELD")
            ) {
              this.displayMap.delete("Corey Graveline-Dumouchel");
            }
            this.displayMap.set("Corey Graveline-Dumouchel", "Off");
          }
        }
      }
    })
  }

  grabName(name: string): string {
    if (name.includes("COREY GRAVELINE-DUMOUCHEL")) {
      return "Corey Graveline-Dumouchel";
    } else if (name.includes("TYLER LLOYD-GALLAN")) {
      return "Tyler Lloyd Gallan";
    } else if (name.includes("NATALIE BLANK-CAZABON")) {
      return "Natalie Blank Cazabon";
    }
    let resp: string = "";
    this.names.forEach((n) => {
      if (n.toUpperCase() == name) {
        resp = n;
      }
    })
    return resp;
  }
}
