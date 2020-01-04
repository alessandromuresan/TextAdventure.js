import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {

  @Input()
  id: string;

  constructor() { }

  ngOnInit() {
    console.log(this.id);
  }

}
