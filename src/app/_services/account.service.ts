import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, of, EMPTY } from 'rxjs';
import { map, concatMap, finalize } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Account } from '@app/_models';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account | null>;
    public account: Observable<Account | null>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.accountSubject = new BehaviorSubject<Account | null>(null);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue() {
        return this.accountSubject.value;
    }

    login() {
        // login with facebook then the API to get a JWT auth token
        return this.loginFacebook().pipe(
            concatMap(accessToken => this.loginApi(accessToken))
        );
    }

    loginFacebook() {
        // login with facebook and return observable with fb access token on success
        const fbLoginPromise = new Promise<fb.StatusResponse>(resolve => FB.login(resolve));
        return from(fbLoginPromise).pipe(
            concatMap(({ authResponse }) => authResponse ? of(authResponse.accessToken) : EMPTY)
        );
    }

    loginApi(accessToken: string) {
        // authenticate with the api using a facebook access token,
        // on success the api returns an account object with a JWT auth token
        return this.http.post<any>(`${baseUrl}/authenticate`, { accessToken })
            .pipe(map(account => {
                this.accountSubject.next(account);
                this.startAuthenticateTimer();
                return account;
            }));
    }

    logout() {
        FB.logout();
        this.stopAuthenticateTimer();
        this.accountSubject.next(null);
        this.router.navigate(['/login']);
    }

    getAccount() {
        return this.http.get<Account>(`${baseUrl}/current`);
    }
    
    updateAccount(params: any) {
        return this.http.put(`${baseUrl}/current`, params)
            .pipe(map((account: any) => {
                // publish updated account to subscribers
                account = { ...this.accountValue, ...account };
                this.accountSubject.next(account);
                return account;
            }));
    }

    deleteAccount() {
        return this.http.delete(`${baseUrl}/current`)
            .pipe(finalize(() => {
                // auto logout after account is deleted
                this.logout();
            }));
    }

    // helper methods

    private authenticateTimeout?: NodeJS.Timeout;

    private startAuthenticateTimer() {
        // parse json object from base64 encoded jwt token
        const jwtBase64 = this.accountValue!.token!.split('.')[1];
        const jwtToken = JSON.parse(atob(jwtBase64));

        // set a timeout to re-authenticate with the api one minute before the token expires
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        const accessToken = FB.getAuthResponse()?.accessToken;
        if (accessToken) {
            this.authenticateTimeout = setTimeout(() => {
                this.loginApi(accessToken).subscribe();
            }, timeout);
        }
    }

    private stopAuthenticateTimer() {
        // cancel timer for re-authenticating with the api
        clearTimeout(this.authenticateTimeout);
    }
}