import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { FormGroup } from "@angular/forms";
import { Utils } from "../../tools/tools";

@Component({
    selector: 'app-store',
    templateUrl: './store.page.html',
    styleUrls: ['./store.page.scss'],
    standalone: false
})
export class StorePage implements OnInit {
credentials = new FormGroup({});
  constructor(
    private router:Router,
  ) { }

  ngOnInit() {
    Utils.cleanLocalStorage();
  }

close(){
  this.router.navigate(['/'])
}



}
