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
  private intervalSubscription?: Subscription;

  constructor() { }

  ngOnInit(): void {
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