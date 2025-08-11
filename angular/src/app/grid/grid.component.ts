import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../calendar.service';
import { CommonModule, NgFor } from '@angular/common';
import { interval, map, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-grid',
  imports: [CommonModule, NgFor],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css'
})
export class GridComponent implements OnInit {
  constructor(private calendarService: CalendarService) { }
  private intervalSubscription?: Subscription;

  // If someone has a hyphenated name, we need to account for that (so greedy, who needs 2 names)
  // Add the full name to this list of names with spaces instead of hyphens
  // Then add it to grabName() and hyphenatedName()
  names = [
    "Aaron McQuade",
    "Alex Fudge",
    "Andrew Dunlop",
    "Andrew Lebert",
    "Andrew Smith",
    "Anthony Walsh",
    "Bethany McCulloch",
    "Brad Pilon",
    "Corey Graveline Dumouchel",
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
    "Terri Lyn Lee",
    "Trevor Smith",
    "Tyler Lloyd Gallan"
  ];

  events: any[] = [];
  displayMap = new Map<String, String>();

  ngOnInit(): void {
    this.names.sort();

    // Grab events from both calendars on load
    this.calendarService.getEvents()
      .pipe(
        switchMap((response: { items: any[]; }) => {
          this.events = response.items;
          return this.calendarService.getRemoteCalendarEvents();
        })
      )
      .subscribe((resp: { items: any[]; }) => {
        this.events = [...this.events, ...resp.items];
        this.itemizeEvents();
      });

    // Refresh chart every minute
    this.intervalSubscription = interval(60000)
      .pipe(
        switchMap(_ => {
          this.displayMap.clear();
          return this.calendarService.getEvents();
        }),
        switchMap((response: { items: any[]; }) => {
          this.events = response.items;
          return this.calendarService.getRemoteCalendarEvents();
        })
      )
      .subscribe((resp: { items: any[]; }) => {
        this.events = [...this.events, ...resp.items];
        this.itemizeEvents();
      });
  }

  ngOnDestroy(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  //The event heirarchy is as follows:
  //Remote
  //Meeting
  //Training
  //Conference
  //Out of Office
  //Field
  //Off

  //This function will take the events from the calendar and itemize them into the displayMap
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
        if (this.hyphenatedName(event.summary.toUpperCase())) {
          //if 2 hyphens
          if (event.summary.split("-").length > 2) {
            event.summary = this.grabName(event.summary.toUpperCase()) + " - " + event.summary.split("-")[2].trim();
          } else { //if 1 hyphen (only the name one)
            event.summary = this.grabName(event.summary.toUpperCase()) + " - " + event.summary.substring(this.grabName(event.summary.toUpperCase()).length + 1).trim();
          }
        }
        //Check for unscheduled/scheduled events from "IT Dept Staff" calendar, set to "Off"
        if (event.summary.split("-").length < 2) {
          if (event.summary.toUpperCase().split("UNSCHEDULED").length > 1) {
            let name = this.grabName(event.summary.toUpperCase().split("UNSCHEDULED")[0].trim());
            //Check for lower priority items that should be removed
            if (this.checkToRemoveForOff(name)) {
              this.displayMap.delete(name);
            }
            this.displayMap.set(name, "Off");
          } else if (event.summary.toUpperCase().split("SCHEDULED").length > 1) {
            let name = this.grabName(event.summary.toUpperCase().split("SCHEDULED")[0].trim());
            //Check for lower priority items that should be removed
            if (this.checkToRemoveForOff(name)) {
              this.displayMap.delete(name);
            }
            this.displayMap.set(name, "Off");
          }
        } else {
          //Remote
          if (event.summary.split("-")[1].trim().toUpperCase() == "REMOTE") {
            //Check for higher priority items that overule
            if (this.checkIfDisplayRemote(event.summary.split("-")[0].trim())) {
              this.displayMap.set(event.summary.split("-")[0].trim(), "Remote");
            }
          }

          //Meeting
          if (event.summary.split("-")[1].trim().toUpperCase() == "MEETING") {
            //Check for lower priority items that should be removed
            if (this.checkToRemoveForMeeting(event.summary.split("-")[0].trim())) {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            //Check for higher priority items that overule
            if (this.checkIfDisplayMeeting(event.summary.split("-")[0].trim())) {
              this.displayMap.set(event.summary.split("-")[0].trim(), "Meeting");
            }
          }

          //Training
          if (event.summary.split("-")[1].trim().toUpperCase() == "TRAINING") {
            //Check for lower priority items that should be removed
            if (this.checkToRemoveForTraining(event.summary.split("-")[0].trim())) {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            //Check for higher priority items that overule
            if (this.checkIfDisplayTraining(event.summary.split("-")[0].trim())) {
              this.displayMap.set(event.summary.split("-")[0].trim(), "Training");
            }
          }

          //Conference
          if (event.summary.split("-")[1].trim().toUpperCase() == "CONFERENCE") {
            //Check for lower priority items that should be removed
            if (this.checkToRemoveForConference(event.summary.split("-")[0].trim())) {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            //Check for higher priority items that overule
            if (this.checkIfDisplayConference(event.summary.split("-")[0].trim())) {
              this.displayMap.set(event.summary.split("-")[0].trim(), "Conference");
            }
          }

          //Out of Office
          if (event.summary.split("-")[1].trim().toUpperCase() == "OUT OF OFFICE") {
            //Check for lower priority items that should be removed
            if (this.checkToRemoveForOutOfOffice(event.summary.split("-")[0].trim())) {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            //Check for higher priority items that overule
            if (this.checkIfDisplayOutOfOffice(event.summary.split("-")[0].trim())) {
              this.displayMap.set(event.summary.split("-")[0].trim(), "Out of Office");
            }
          }

          //Field
          if (event.summary.split("-")[1].trim().toUpperCase().includes("FIELD")) {
            //Check for lower priority items that should be removed
            if (this.checkToRemoveForField(event.summary.split("-")[0].trim())) {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            //Check for higher priority items that overule
            if (this.checkIfDisplayField(event.summary.split("-")[0].trim())) {
              //Account for school codes
              if (event.summary.split("(")[1] != null) {
                this.displayMap.set(
                  event.summary.split("-")[0].trim(),
                  "Field (" + event.summary.split("(")[1].trim()
                );
              } else { //If no school codes, just set to "Field"
                this.displayMap.set(event.summary.split("-")[0].trim(), "Field");
              }
            }
          }

          //Off
          if (event.summary.split("-")[1].trim().toUpperCase() == "OFF" || event.summary.split("-")[1].trim().toUpperCase().includes("SCHEDULE")) {
            //Check for lower priority items that should be removed
            if (this.checkToRemoveForOff(event.summary.split("-")[0].trim())) {
              this.displayMap.delete(event.summary.split("-")[0].trim());
            }
            this.displayMap.set(event.summary.split("-")[0].trim(), "Off");
          }
        }
      }
    })
  }

  //Check if the name is hyphenated
  hyphenatedName(name: string): boolean {
    if (name.includes("COREY GRAVELINE-DUMOUCHEL") || name.includes("TYLER LLOYD-GALLAN") || name.includes("NATALIE BLANK-CAZABON") || name.includes("TERRI-LYN LEE")) {
      return true;
    } else {
      return false;
    }
  }

  //This function is meant to account for people with hyphenated names from "IT Dept Staff" calendar
  grabName(name: string): string {
    if (name.includes("COREY GRAVELINE-DUMOUCHEL")) {
      return "Corey Graveline Dumouchel";
    } else if (name.includes("TYLER LLOYD-GALLAN")) {
      return "Tyler Lloyd Gallan";
    } else if (name.includes("NATALIE BLANK-CAZABON")) {
      return "Natalie Blank Cazabon";
    } else if (name.includes("TERRI-LYN LEE")) {
      return "Terri Lyn Lee";
    }
    let resp: string = "";
    this.names.forEach((n) => {
      if (n.toUpperCase() == name) {
        resp = n;
      }
    })
    return resp;
  }

  //Check if the remote item is superseded by a higher priority item
  checkIfDisplayRemote(summary: string): boolean {
    if (
      this.displayMap.get(summary)?.toUpperCase() != "MEETING" &&
      this.displayMap.get(summary)?.toUpperCase() != "TRAINING" &&
      this.displayMap.get(summary)?.toUpperCase() != "OFF" &&
      !(this.displayMap.get(summary) && this.displayMap.get(summary)!?.toUpperCase().includes("FIELD")) &&
      this.displayMap.get(summary)?.toUpperCase() != "OUT OF OFFICE" &&
      this.displayMap.get(summary)?.toUpperCase() != "CONFERENCE"
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  //No need to check to remove for remote, since it is the lowest priority item

  //Check if the meeting item is superseded by a higher priority item
  checkIfDisplayMeeting(summary: string): boolean {
    if (
      this.displayMap.get(summary)?.toUpperCase() != "TRAINING" &&
      this.displayMap.get(summary)?.toUpperCase() != "OFF" &&
      !(this.displayMap.get(summary) && this.displayMap.get(summary)!?.toUpperCase().includes("FIELD")) &&
      this.displayMap.get(summary)?.toUpperCase() != "OUT OF OFFICE" &&
      this.displayMap.get(summary)?.toUpperCase() != "CONFERENCE"
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  //If remote item exists, delete it since it is superceded by a meeting item
  checkToRemoveForMeeting(summary: string): boolean {
    if (this.displayMap.get(summary)?.toUpperCase() == "REMOTE") {
      return true;
    } else {
      return false;
    }
  }

  //Check if the training item is superseded by a higher priority item
  checkIfDisplayTraining(summary: string): boolean {
    if (
      this.displayMap.get(summary)?.toUpperCase() != "OFF" &&
      !(this.displayMap.get(summary) && this.displayMap.get(summary)!?.toUpperCase().includes("FIELD")) &&
      this.displayMap.get(summary)?.toUpperCase() != "OUT OF OFFICE" &&
      this.displayMap.get(summary)?.toUpperCase() != "CONFERENCE"
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  //If remote/meeting item exists, delete it since it is superceded by a training item
  checkToRemoveForTraining(summary: string): boolean {
    if (
      this.displayMap.get(summary)?.toUpperCase() == "REMOTE" ||
      this.displayMap.get(summary)?.toUpperCase() == "MEETING"
    ) {
      return true;
    } else {
      return false;
    }
  }

  //Check if the conference item is superseded by a higher priority item
  checkIfDisplayConference(summary: string): boolean {
    if (
      this.displayMap.get(summary)?.toUpperCase() != "OFF" &&
      !(this.displayMap.get(summary) && this.displayMap.get(summary)!?.toUpperCase().includes("FIELD")) &&
      this.displayMap.get(summary)?.toUpperCase() != "OUT OF OFFICE"
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  //If remote/meeting/training item exists, delete it since it is superceded by a conference item
  checkToRemoveForConference(summary: string): boolean {
    if (
      this.displayMap.get(summary)?.toUpperCase() == "REMOTE" ||
      this.displayMap.get(summary)?.toUpperCase() == "MEETING" ||
      this.displayMap.get(summary)?.toUpperCase() == "TRAINING"
    ) {
      return true;
    } else {
      return false;
    }
  }

  //Check if the out of office item is superseded by a higher priority item
  checkIfDisplayOutOfOffice(summary: string): boolean {
    if (
      this.displayMap.get(summary)?.toUpperCase() != "OFF" &&
      !(this.displayMap.get(summary) && this.displayMap.get(summary)!?.toUpperCase().includes("FIELD"))
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  //If remote/meeting/training/conference item exists, delete it since it is superceded by an out of office item
  checkToRemoveForOutOfOffice(summary: string): boolean {
    if (
      this.displayMap.get(summary)?.toUpperCase() == "REMOTE" ||
      this.displayMap.get(summary)?.toUpperCase() == "MEETING" ||
      this.displayMap.get(summary)?.toUpperCase() == "TRAINING" ||
      this.displayMap.get(summary)?.toUpperCase() == "CONFERENCE"
    ) {
      return true;
    } else {
      return false;
    }
  }

  //Check if the field item is superseded by a higher priority item
  checkIfDisplayField(summary: string): boolean {
    if (
      this.displayMap.get(summary)?.toUpperCase() != "OFF"
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  //If remote/meeting/training/conference/out of office item exists, delete it since it is superceded by a field item
  checkToRemoveForField(summary: string): boolean {
    if (
      this.displayMap.get(summary)?.toUpperCase() == "REMOTE" ||
      this.displayMap.get(summary)?.toUpperCase() == "MEETING" ||
      this.displayMap.get(summary)?.toUpperCase() == "TRAINING" ||
      this.displayMap.get(summary)?.toUpperCase() == "CONFERENCE" ||
      this.displayMap.get(summary)?.toUpperCase() == "OUT OF OFFICE"
    ) {
      return true;
    } else {
      return false;
    }
  }

  //No need to check if the off item is superseded by a higher priority item, since it is the highest priority

  //If remote/meeting/training/conference/out of office/field item exists, delete it since it is superceded by an off item
  checkToRemoveForOff(summary: string): boolean {
    if (
      this.displayMap.get(summary)?.toUpperCase() == "REMOTE" ||
      this.displayMap.get(summary)?.toUpperCase() == "MEETING" ||
      this.displayMap.get(summary)?.toUpperCase() == "TRAINING" ||
      this.displayMap.get(summary)?.toUpperCase() == "CONFERENCE" ||
      this.displayMap.get(summary)?.toUpperCase() == "OUT OF OFFICE" ||
      (this.displayMap.get(summary) && this.displayMap.get(summary)!?.toUpperCase().includes("FIELD"))
    ) {
      return true;
    } else {
      return false;
    }
  }
}
