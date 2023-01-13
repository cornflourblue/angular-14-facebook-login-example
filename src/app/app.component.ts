import { Component } from '@angular/core';

import { AccountService } from './_services';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent {
    constructor(protected accountService: AccountService) {}
}