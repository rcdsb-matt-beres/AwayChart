import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent implements OnInit, OnDestroy {
  currentTime: string = '';
  currentDate: string = '';
  private intervalSubscription?: Subscription;

  constructor() { }

  ngOnInit(): void {
    const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    this.currentDate = `${monthNames[month - 1]} ${day}, ${year}`;
    this.intervalSubscription = interval(1000)
      .pipe(map(() => new Date()))
      .subscribe(date => {
        this.currentTime = date.toLocaleTimeString();
      });
  }

  ngOnDestroy(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
}