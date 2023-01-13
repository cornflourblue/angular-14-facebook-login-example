import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services';
import { Account } from '@app/_models';

@Component({ templateUrl: 'edit-account.component.html' })
export class EditAccountComponent implements OnInit {
    form!: FormGroup;
    account!: Account;
    isSaving = false;
    isDeleting = false;
    submitted = false;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            extraInfo: ['']
        });

        // populate form with current account details
        this.account = this.accountService.accountValue!;
        this.form.patchValue(this.account);
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    saveAccount() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.isSaving = true;
        this.error = '';
        this.accountService.updateAccount(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['/']);
                },
                error: error => {
                    this.error = error;
                    this.isSaving = false;
                }
            });
    }

    deleteAccount() {
        this.isDeleting = true;
        this.accountService.deleteAccount()
            .pipe(first())
            .subscribe();
    }
}