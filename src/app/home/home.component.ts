import { Component } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services';
import { Account } from '@app/_models';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
    account!: Account;

    constructor(private accountService: AccountService) { }

    ngOnInit() {
        this.accountService.getAccount()
            .pipe(first())
            .subscribe(x => this.account = x);
    }
}