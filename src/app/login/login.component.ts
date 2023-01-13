import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AccountService } from '@app/_services';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent {
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private accountService: AccountService
    ) {
        // redirect to home if already logged in
        if (this.accountService.accountValue) {
            this.router.navigate(['/']);
        }
    }

    login() {
        this.accountService.login()
            .subscribe(() => {
                // get return url from query parameters or default to home page
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                this.router.navigateByUrl(returnUrl);
            });
    }
}