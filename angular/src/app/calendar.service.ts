import { formatDate } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiKey = import.meta.env['NG_APP_API_KEY'];
  private calendarId = 'c_f049b179cd81305d0df146197f30755153a65542312c9c86ad719559138b61c6@group.calendar.google.com';
  private apiUrl = 'https://www.googleapis.com/calendar/v3/calendars';

  start = formatDate(new Date(), 'yyyy-MM-dd', 'en-US') + 'T00:00:00-04:00'
  end = formatDate(new Date(), 'yyyy-MM-dd', 'en-US') + 'T23:59:00-04:00'

  constructor(private http: HttpClient) {}

  getEvents(): Observable<any> {
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('timeMin', this.start)
      .set('timeMax', this.end);

    return this.http.get(
      `${this.apiUrl}/${this.calendarId}/events`,
      { params }
    );
  }

}
