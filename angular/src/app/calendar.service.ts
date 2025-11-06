import { formatDate } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiKey = import.meta.env['NG_APP_API_KEY'];
  //This is "IT Dept Staff" calendar
  private staffCalendarId = 'rcdsb.on.ca_55qao1kbprojm6q2snvkrmi4h4@group.calendar.google.com';
  //This is now "IT Working Remotely" calendar, not "Remote Calendar"
  private remoteCalendarId = 'c_a45d8e966d0c7524b6f84ea21df86b3d87f3575b107347c56451886b52f8a83a@group.calendar.google.com';
  private apiUrl = 'https://www.googleapis.com/calendar/v3/calendars';

  start;
  end;

  constructor(private http: HttpClient) {
    let dstOffset = new Date().getTimezoneOffset();
    if (dstOffset < 240) { // If in Daylight Saving Time
      this.start = formatDate(new Date(), 'yyyy-MM-dd', 'en-US') + 'T00:00:00-04:00';
      this.end = formatDate(new Date(), 'yyyy-MM-dd', 'en-US') + 'T23:59:00-04:00';
    } else {
      this.start = formatDate(new Date(), 'yyyy-MM-dd', 'en-US') + 'T00:00:00-05:00';
      this.end = formatDate(new Date(), 'yyyy-MM-dd', 'en-US') + 'T23:59:00-05:00';
    }
  }

  //Gets events from the "IT Dept Staff" calendar
  getEvents(): Observable<any> {
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('timeMin', this.start)
      .set('timeMax', this.end);

    return this.http.get(
      `${this.apiUrl}/${this.staffCalendarId}/events`,
      { params }
    );
  }

  //Gets events from the "IT Working Remotely" calendar
  getRemoteCalendarEvents(): Observable<any> {
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('timeMin', this.start)
      .set('timeMax', this.end);

    return this.http.get(
      `${this.apiUrl}/${this.remoteCalendarId}/events`,
      { params }
    );
  }

}
