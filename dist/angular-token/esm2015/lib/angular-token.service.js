import { __decorate, __metadata, __param } from "tslib";
import { Injectable, Optional, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { Observable, fromEvent, interval, BehaviorSubject } from 'rxjs';
import { pluck, filter, share, finalize } from 'rxjs/operators';
import { ANGULAR_TOKEN_OPTIONS } from './angular-token.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./angular-token.token";
import * as i3 from "@angular/router";
let AngularTokenService = class AngularTokenService {
    constructor(http, config, platformId, activatedRoute, router) {
        this.http = http;
        this.platformId = platformId;
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.userType = new BehaviorSubject(null);
        this.authData = new BehaviorSubject(null);
        this.userData = new BehaviorSubject(null);
        this.localStorage = {};
        this.global = (typeof window !== 'undefined') ? window : {};
        if (isPlatformServer(this.platformId)) {
            // Bad pratice, needs fixing
            this.global = {
                open: () => null,
                location: {
                    href: '/',
                    origin: '/'
                }
            };
            // Bad pratice, needs fixing
            this.localStorage.setItem = () => null;
            this.localStorage.getItem = () => null;
            this.localStorage.removeItem = () => null;
        }
        else {
            this.localStorage = localStorage;
        }
        const defaultOptions = {
            apiPath: null,
            apiBase: null,
            signInPath: 'auth/sign_in',
            signInRedirect: null,
            signInStoredUrlStorageKey: null,
            signOutPath: 'auth/sign_out',
            validateTokenPath: 'auth/validate_token',
            signOutFailedValidate: false,
            registerAccountPath: 'auth',
            deleteAccountPath: 'auth',
            registerAccountCallback: this.global.location.href,
            updatePasswordPath: 'auth',
            resetPasswordPath: 'auth/password',
            resetPasswordCallback: this.global.location.href,
            userTypes: null,
            loginField: 'email',
            oAuthBase: this.global.location.origin,
            oAuthPaths: {
                github: 'auth/github'
            },
            oAuthCallbackPath: 'oauth_callback',
            oAuthWindowType: 'newWindow',
            oAuthWindowOptions: null,
            oAuthBrowserCallbacks: {
                github: 'auth/github/callback',
            },
        };
        const mergedOptions = Object.assign(defaultOptions, config);
        this.options = mergedOptions;
        if (this.options.apiBase === null) {
            console.warn(`[angular-token] You have not configured 'apiBase', which may result in security issues. ` +
                `Please refer to the documentation at https://github.com/neroniaky/angular-token/wiki`);
        }
        this.tryLoadAuthData();
    }
    get currentUserType() {
        if (this.userType.value != null) {
            return this.userType.value.name;
        }
        else {
            return undefined;
        }
    }
    get currentUserData() {
        return this.userData.value;
    }
    get currentAuthData() {
        return this.authData.value;
    }
    get apiBase() {
        console.warn('[angular-token] The attribute .apiBase will be removed in the next major release, please use' +
            '.tokenOptions.apiBase instead');
        return this.options.apiBase;
    }
    get tokenOptions() {
        return this.options;
    }
    set tokenOptions(options) {
        this.options = Object.assign(this.options, options);
    }
    userSignedIn() {
        if (this.authData.value == null) {
            return false;
        }
        else {
            return true;
        }
    }
    canActivate(route, state) {
        if (this.userSignedIn()) {
            return true;
        }
        else {
            // Store current location in storage (usefull for redirection after signing in)
            if (this.options.signInStoredUrlStorageKey) {
                this.localStorage.setItem(this.options.signInStoredUrlStorageKey, state.url);
            }
            // Redirect user to sign in if signInRedirect is set
            if (this.router && this.options.signInRedirect) {
                this.router.navigate([this.options.signInRedirect]);
            }
            return false;
        }
    }
    /**
     *
     * Actions
     *
     */
    // Register request
    registerAccount(registerData, additionalData) {
        registerData = Object.assign({}, registerData);
        if (registerData.userType == null) {
            this.userType.next(null);
        }
        else {
            this.userType.next(this.getUserTypeByName(registerData.userType));
            delete registerData.userType;
        }
        if (registerData.password_confirmation == null &&
            registerData.passwordConfirmation != null) {
            registerData.password_confirmation = registerData.passwordConfirmation;
            delete registerData.passwordConfirmation;
        }
        if (additionalData !== undefined) {
            registerData.additionalData = additionalData;
        }
        const login = registerData.login;
        delete registerData.login;
        registerData[this.options.loginField] = login;
        registerData.confirm_success_url = this.options.registerAccountCallback;
        return this.http.post(this.getServerPath() + this.options.registerAccountPath, registerData);
    }
    // Delete Account
    deleteAccount() {
        return this.http.delete(this.getServerPath() + this.options.deleteAccountPath);
    }
    // Sign in request and set storage
    signIn(signInData, additionalData) {
        this.userType.next((signInData.userType == null) ? null : this.getUserTypeByName(signInData.userType));
        const body = {
            [this.options.loginField]: signInData.login,
            password: signInData.password
        };
        if (additionalData !== undefined) {
            body.additionalData = additionalData;
        }
        const observ = this.http.post(this.getServerPath() + this.options.signInPath, body).pipe(share());
        observ.subscribe(res => this.userData.next(res.data));
        return observ;
    }
    signInOAuth(oAuthType, inAppBrowser, platform) {
        const oAuthPath = this.getOAuthPath(oAuthType);
        const callbackUrl = `${this.global.location.origin}/${this.options.oAuthCallbackPath}`;
        const oAuthWindowType = this.options.oAuthWindowType;
        const authUrl = this.getOAuthUrl(oAuthPath, callbackUrl, oAuthWindowType);
        if (oAuthWindowType === 'newWindow' ||
            (oAuthWindowType == 'inAppBrowser' && (!platform || !platform.is('cordova') || !(platform.is('ios') || platform.is('android'))))) {
            const oAuthWindowOptions = this.options.oAuthWindowOptions;
            let windowOptions = '';
            if (oAuthWindowOptions) {
                for (const key in oAuthWindowOptions) {
                    if (oAuthWindowOptions.hasOwnProperty(key)) {
                        windowOptions += `,${key}=${oAuthWindowOptions[key]}`;
                    }
                }
            }
            const popup = window.open(authUrl, '_blank', `closebuttoncaption=Cancel${windowOptions}`);
            return this.requestCredentialsViaPostMessage(popup);
        }
        else if (oAuthWindowType == 'inAppBrowser') {
            let oAuthBrowserCallback = this.options.oAuthBrowserCallbacks[oAuthType];
            if (!oAuthBrowserCallback) {
                throw new Error(`To login with oAuth provider ${oAuthType} using inAppBrowser the callback (in oAuthBrowserCallbacks) is required.`);
            }
            // let oAuthWindowOptions = this.options.oAuthWindowOptions;
            // let windowOptions = '';
            //  if (oAuthWindowOptions) {
            //     for (let key in oAuthWindowOptions) {
            //         windowOptions += `,${key}=${oAuthWindowOptions[key]}`;
            //     }
            // }
            let browser = inAppBrowser.create(authUrl, '_blank', 'location=no');
            return new Observable((observer) => {
                browser.on('loadstop').subscribe((ev) => {
                    if (ev.url.indexOf(oAuthBrowserCallback) > -1) {
                        browser.executeScript({ code: "requestCredentials();" }).then((credentials) => {
                            this.getAuthDataFromPostMessage(credentials[0]);
                            let pollerObserv = interval(400);
                            let pollerSubscription = pollerObserv.subscribe(() => {
                                if (this.userSignedIn()) {
                                    observer.next(this.authData);
                                    observer.complete();
                                    pollerSubscription.unsubscribe();
                                    browser.close();
                                }
                            }, (error) => {
                                observer.error(error);
                                observer.complete();
                            });
                        }, (error) => {
                            observer.error(error);
                            observer.complete();
                        });
                    }
                }, (error) => {
                    observer.error(error);
                    observer.complete();
                });
            });
        }
        else if (oAuthWindowType === 'sameWindow') {
            this.global.location.href = authUrl;
            return undefined;
        }
        else {
            throw new Error(`Unsupported oAuthWindowType "${oAuthWindowType}"`);
        }
    }
    processOAuthCallback() {
        this.getAuthDataFromParams();
    }
    // Sign out request and delete storage
    signOut() {
        return this.http.delete(this.getServerPath() + this.options.signOutPath)
            // Only remove the localStorage and clear the data after the call
            .pipe(finalize(() => {
            this.localStorage.removeItem('accessToken');
            this.localStorage.removeItem('client');
            this.localStorage.removeItem('expiry');
            this.localStorage.removeItem('tokenType');
            this.localStorage.removeItem('uid');
            this.authData.next(null);
            this.userType.next(null);
            this.userData.next(null);
        }));
    }
    // Validate token request
    validateToken() {
        const observ = this.http.get(this.getServerPath() + this.options.validateTokenPath).pipe(share());
        observ.subscribe((res) => this.userData.next(res.data), (error) => {
            if (error.status === 401 && this.options.signOutFailedValidate) {
                this.signOut();
            }
        });
        return observ;
    }
    // Update password request
    updatePassword(updatePasswordData) {
        if (updatePasswordData.userType != null) {
            this.userType.next(this.getUserTypeByName(updatePasswordData.userType));
        }
        let args;
        if (updatePasswordData.passwordCurrent == null) {
            args = {
                password: updatePasswordData.password,
                password_confirmation: updatePasswordData.passwordConfirmation
            };
        }
        else {
            args = {
                current_password: updatePasswordData.passwordCurrent,
                password: updatePasswordData.password,
                password_confirmation: updatePasswordData.passwordConfirmation
            };
        }
        if (updatePasswordData.resetPasswordToken) {
            args.reset_password_token = updatePasswordData.resetPasswordToken;
        }
        const body = args;
        return this.http.put(this.getServerPath() + this.options.updatePasswordPath, body);
    }
    // Reset password request
    resetPassword(resetPasswordData, additionalData) {
        if (additionalData !== undefined) {
            resetPasswordData.additionalData = additionalData;
        }
        this.userType.next((resetPasswordData.userType == null) ? null : this.getUserTypeByName(resetPasswordData.userType));
        const body = {
            [this.options.loginField]: resetPasswordData.login,
            redirect_url: this.options.resetPasswordCallback
        };
        return this.http.post(this.getServerPath() + this.options.resetPasswordPath, body);
    }
    /**
     *
     * Construct Paths / Urls
     *
     */
    getUserPath() {
        return (this.userType.value == null) ? '' : this.userType.value.path + '/';
    }
    getApiPath() {
        let constructedPath = '';
        if (this.options.apiBase != null) {
            constructedPath += this.options.apiBase + '/';
        }
        if (this.options.apiPath != null) {
            constructedPath += this.options.apiPath + '/';
        }
        return constructedPath;
    }
    getServerPath() {
        return this.getApiPath() + this.getUserPath();
    }
    getOAuthPath(oAuthType) {
        let oAuthPath;
        oAuthPath = this.options.oAuthPaths[oAuthType];
        if (oAuthPath == null) {
            oAuthPath = `/auth/${oAuthType}`;
        }
        return oAuthPath;
    }
    getOAuthUrl(oAuthPath, callbackUrl, windowType) {
        let url;
        url = `${this.options.oAuthBase}/${oAuthPath}`;
        url += `?omniauth_window_type=${windowType}`;
        url += `&auth_origin_url=${encodeURIComponent(callbackUrl)}`;
        if (this.userType.value != null) {
            url += `&resource_class=${this.userType.value.name}`;
        }
        return url;
    }
    /**
     *
     * Get Auth Data
     *
     */
    // Try to load auth data
    tryLoadAuthData() {
        const userType = this.getUserTypeByName(this.localStorage.getItem('userType'));
        if (userType) {
            this.userType.next(userType);
        }
        this.getAuthDataFromStorage();
        if (this.activatedRoute) {
            this.getAuthDataFromParams();
        }
        if (this.authData) {
            this.validateToken();
        }
    }
    // Parse Auth data from response
    getAuthHeadersFromResponse(data) {
        const headers = data.headers;
        const authData = {
            accessToken: headers.get('access-token'),
            client: headers.get('client'),
            expiry: headers.get('expiry'),
            tokenType: headers.get('token-type'),
            uid: headers.get('uid')
        };
        this.setAuthData(authData);
    }
    // Parse Auth data from post message
    getAuthDataFromPostMessage(data) {
        const authData = {
            accessToken: data['auth_token'],
            client: data['client_id'],
            expiry: data['expiry'],
            tokenType: 'Bearer',
            uid: data['uid']
        };
        this.setAuthData(authData);
    }
    // Try to get auth data from storage.
    getAuthDataFromStorage() {
        const authData = {
            accessToken: this.localStorage.getItem('accessToken'),
            client: this.localStorage.getItem('client'),
            expiry: this.localStorage.getItem('expiry'),
            tokenType: this.localStorage.getItem('tokenType'),
            uid: this.localStorage.getItem('uid')
        };
        if (this.checkAuthData(authData)) {
            this.authData.next(authData);
        }
    }
    // Try to get auth data from url parameters.
    getAuthDataFromParams() {
        this.activatedRoute.queryParams.subscribe(queryParams => {
            const authData = {
                accessToken: queryParams['token'] || queryParams['auth_token'],
                client: queryParams['client_id'],
                expiry: queryParams['expiry'],
                tokenType: 'Bearer',
                uid: queryParams['uid']
            };
            if (this.checkAuthData(authData)) {
                this.authData.next(authData);
            }
        });
    }
    /**
     *
     * Set Auth Data
     *
     */
    // Write auth data to storage
    setAuthData(authData) {
        if (this.checkAuthData(authData)) {
            this.authData.next(authData);
            this.localStorage.setItem('accessToken', authData.accessToken);
            this.localStorage.setItem('client', authData.client);
            this.localStorage.setItem('expiry', authData.expiry);
            this.localStorage.setItem('tokenType', authData.tokenType);
            this.localStorage.setItem('uid', authData.uid);
            if (this.userType.value != null) {
                this.localStorage.setItem('userType', this.userType.value.name);
            }
        }
    }
    /**
     *
     * Validate Auth Data
     *
     */
    // Check if auth data complete and if response token is newer
    checkAuthData(authData) {
        if (authData.accessToken != null &&
            authData.client != null &&
            authData.expiry != null &&
            authData.tokenType != null &&
            authData.uid != null) {
            if (this.authData.value != null) {
                return authData.expiry >= this.authData.value.expiry;
            }
            return true;
        }
        return false;
    }
    /**
     *
     * OAuth
     *
     */
    requestCredentialsViaPostMessage(authWindow) {
        const pollerObserv = interval(500);
        const responseObserv = fromEvent(this.global, 'message').pipe(pluck('data'), filter(this.oAuthWindowResponseFilter));
        responseObserv.subscribe(this.getAuthDataFromPostMessage.bind(this));
        const pollerSubscription = pollerObserv.subscribe(() => {
            if (authWindow.closed) {
                pollerSubscription.unsubscribe();
            }
            else {
                authWindow.postMessage('requestCredentials', '*');
            }
        });
        return responseObserv;
    }
    oAuthWindowResponseFilter(data) {
        if (data.message === 'deliverCredentials' || data.message === 'authFailure') {
            return data;
        }
    }
    /**
     *
     * Utilities
     *
     */
    // Match user config by user config name
    getUserTypeByName(name) {
        if (name == null || this.options.userTypes == null) {
            return null;
        }
        return this.options.userTypes.find(userType => userType.name === name);
    }
};
AngularTokenService.ctorParameters = () => [
    { type: HttpClient },
    { type: undefined, decorators: [{ type: Inject, args: [ANGULAR_TOKEN_OPTIONS,] }] },
    { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
    { type: ActivatedRoute, decorators: [{ type: Optional }] },
    { type: Router, decorators: [{ type: Optional }] }
];
AngularTokenService.ɵprov = i0.ɵɵdefineInjectable({ factory: function AngularTokenService_Factory() { return new AngularTokenService(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(i2.ANGULAR_TOKEN_OPTIONS), i0.ɵɵinject(i0.PLATFORM_ID), i0.ɵɵinject(i3.ActivatedRoute, 8), i0.ɵɵinject(i3.Router, 8)); }, token: AngularTokenService, providedIn: "root" });
AngularTokenService = __decorate([
    Injectable({
        providedIn: 'root',
    }),
    __param(1, Inject(ANGULAR_TOKEN_OPTIONS)),
    __param(2, Inject(PLATFORM_ID)),
    __param(3, Optional()),
    __param(4, Optional()),
    __metadata("design:paramtypes", [HttpClient, Object, Object,
        ActivatedRoute,
        Router])
], AngularTokenService);
export { AngularTokenService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci10b2tlbi8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyLXRva2VuLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLHNCQUFzQixFQUFFLG1CQUFtQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDbkgsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVoRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQzs7Ozs7QUFzQjlELElBQWEsbUJBQW1CLEdBQWhDLE1BQWEsbUJBQW1CO0lBd0M5QixZQUNVLElBQWdCLEVBQ08sTUFBVyxFQUNiLFVBQWtCLEVBQzNCLGNBQThCLEVBQzlCLE1BQWM7UUFKMUIsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUVLLGVBQVUsR0FBVixVQUFVLENBQVE7UUFDM0IsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQzlCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFaN0IsYUFBUSxHQUE4QixJQUFJLGVBQWUsQ0FBVyxJQUFJLENBQUMsQ0FBQztRQUMxRSxhQUFRLEdBQThCLElBQUksZUFBZSxDQUFXLElBQUksQ0FB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QU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUNoQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUNuQyxDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUE7O1lBbGxCaUIsVUFBVTs0Q0FDdkIsTUFBTSxTQUFDLHFCQUFxQjtZQUNZLE1BQU0sdUJBQTlDLE1BQU0sU0FBQyxXQUFXO1lBQ2lCLGNBQWMsdUJBQWpELFFBQVE7WUFDbUIsTUFBTSx1QkFBakMsUUFBUTs7O0FBN0NBLG1CQUFtQjtJQUgvQixVQUFVLENBQUM7UUFDVixVQUFVLEVBQUUsTUFBTTtLQUNuQixDQUFDO0lBMkNHLFdBQUEsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7SUFDN0IsV0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDbkIsV0FBQSxRQUFRLEVBQUUsQ0FBQTtJQUNWLFdBQUEsUUFBUSxFQUFFLENBQUE7cUNBSkcsVUFBVSxVQUVpQixNQUFNO1FBQ1gsY0FBYztRQUN0QixNQUFNO0dBN0N6QixtQkFBbUIsQ0EybkIvQjtTQTNuQlksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgT3B0aW9uYWwsIEluamVjdCwgUExBVEZPUk1fSUQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlLCBSb3V0ZXIsIENhbkFjdGl2YXRlLCBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBSb3V0ZXJTdGF0ZVNuYXBzaG90IH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IEh0dHBDbGllbnQsIEh0dHBSZXNwb25zZSwgSHR0cEVycm9yUmVzcG9uc2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBpc1BsYXRmb3JtU2VydmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbUV2ZW50LCBpbnRlcnZhbCwgQmVoYXZpb3JTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBwbHVjaywgZmlsdGVyLCBzaGFyZSwgZmluYWxpemUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyB9IGZyb20gJy4vYW5ndWxhci10b2tlbi50b2tlbic7XG5cbmltcG9ydCB7XG4gIFNpZ25JbkRhdGEsXG4gIFJlZ2lzdGVyRGF0YSxcbiAgVXBkYXRlUGFzc3dvcmREYXRhLFxuICBSZXNldFBhc3N3b3JkRGF0YSxcblxuICBVc2VyVHlwZSxcbiAgVXNlckRhdGEsXG4gIEF1dGhEYXRhLFxuICBBcGlSZXNwb25zZSxcblxuICBBbmd1bGFyVG9rZW5PcHRpb25zLFxuXG4gIFRva2VuUGxhdGZvcm0sXG4gIFRva2VuSW5BcHBCcm93c2VyLFxufSBmcm9tICcuL2FuZ3VsYXItdG9rZW4ubW9kZWwnO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhclRva2VuU2VydmljZSBpbXBsZW1lbnRzIENhbkFjdGl2YXRlIHtcblxuICBnZXQgY3VycmVudFVzZXJUeXBlKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMudXNlclR5cGUudmFsdWUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudXNlclR5cGUudmFsdWUubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBnZXQgY3VycmVudFVzZXJEYXRhKCk6IFVzZXJEYXRhIHtcbiAgICByZXR1cm4gdGhpcy51c2VyRGF0YS52YWx1ZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50QXV0aERhdGEoKTogQXV0aERhdGEge1xuICAgIHJldHVybiB0aGlzLmF1dGhEYXRhLnZhbHVlO1xuICB9XG5cbiAgZ2V0IGFwaUJhc2UoKTogc3RyaW5nIHtcbiAgICBjb25zb2xlLndhcm4oJ1thbmd1bGFyLXRva2VuXSBUaGUgYXR0cmlidXRlIC5hcGlCYXNlIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmV4dCBtYWpvciByZWxlYXNlLCBwbGVhc2UgdXNlJyArXG4gICAgJy50b2tlbk9wdGlvbnMuYXBpQmFzZSBpbnN0ZWFkJyk7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hcGlCYXNlO1xuICB9XG5cbiAgZ2V0IHRva2VuT3B0aW9ucygpOiBBbmd1bGFyVG9rZW5PcHRpb25zIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICB9XG5cbiAgc2V0IHRva2VuT3B0aW9ucyhvcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gKDxhbnk+T2JqZWN0KS5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgfVxuXG4gIHByaXZhdGUgb3B0aW9uczogQW5ndWxhclRva2VuT3B0aW9ucztcbiAgcHVibGljIHVzZXJUeXBlOiBCZWhhdmlvclN1YmplY3Q8VXNlclR5cGU+ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxVc2VyVHlwZT4obnVsbCk7XG4gIHB1YmxpYyBhdXRoRGF0YTogQmVoYXZpb3JTdWJqZWN0PEF1dGhEYXRhPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8QXV0aERhdGE+KG51bGwpO1xuICBwdWJsaWMgdXNlckRhdGE6IEJlaGF2aW9yU3ViamVjdDxVc2VyRGF0YT4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFVzZXJEYXRhPihudWxsKTtcbiAgcHJpdmF0ZSBnbG9iYWw6IFdpbmRvdyB8IGFueTtcblxuICBwcml2YXRlIGxvY2FsU3RvcmFnZTogU3RvcmFnZSB8IGFueSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICBASW5qZWN0KEFOR1VMQVJfVE9LRU5fT1BUSU9OUykgY29uZmlnOiBhbnksXG4gICAgQEluamVjdChQTEFURk9STV9JRCkgcHJpdmF0ZSBwbGF0Zm9ybUlkOiBPYmplY3QsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBhY3RpdmF0ZWRSb3V0ZTogQWN0aXZhdGVkUm91dGUsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlclxuICApIHtcbiAgICB0aGlzLmdsb2JhbCA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgPyB3aW5kb3cgOiB7fTtcblxuICAgIGlmIChpc1BsYXRmb3JtU2VydmVyKHRoaXMucGxhdGZvcm1JZCkpIHtcblxuICAgICAgLy8gQmFkIHByYXRpY2UsIG5lZWRzIGZpeGluZ1xuICAgICAgdGhpcy5nbG9iYWwgPSB7XG4gICAgICAgIG9wZW46ICgpOiB2b2lkID0+IG51bGwsXG4gICAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgICAgaHJlZjogJy8nLFxuICAgICAgICAgIG9yaWdpbjogJy8nXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIEJhZCBwcmF0aWNlLCBuZWVkcyBmaXhpbmdcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0gPSAoKTogdm9pZCA9PiBudWxsO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSA9ICgpOiB2b2lkID0+IG51bGw7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtID0gKCk6IHZvaWQgPT4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IEFuZ3VsYXJUb2tlbk9wdGlvbnMgPSB7XG4gICAgICBhcGlQYXRoOiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIGFwaUJhc2U6ICAgICAgICAgICAgICAgICAgICBudWxsLFxuXG4gICAgICBzaWduSW5QYXRoOiAgICAgICAgICAgICAgICAgJ2F1dGgvc2lnbl9pbicsXG4gICAgICBzaWduSW5SZWRpcmVjdDogICAgICAgICAgICAgbnVsbCxcbiAgICAgIHNpZ25JblN0b3JlZFVybFN0b3JhZ2VLZXk6ICBudWxsLFxuXG4gICAgICBzaWduT3V0UGF0aDogICAgICAgICAgICAgICAgJ2F1dGgvc2lnbl9vdXQnLFxuICAgICAgdmFsaWRhdGVUb2tlblBhdGg6ICAgICAgICAgICdhdXRoL3ZhbGlkYXRlX3Rva2VuJyxcbiAgICAgIHNpZ25PdXRGYWlsZWRWYWxpZGF0ZTogICAgICBmYWxzZSxcblxuICAgICAgcmVnaXN0ZXJBY2NvdW50UGF0aDogICAgICAgICdhdXRoJyxcbiAgICAgIGRlbGV0ZUFjY291bnRQYXRoOiAgICAgICAgICAnYXV0aCcsXG4gICAgICByZWdpc3RlckFjY291bnRDYWxsYmFjazogICAgdGhpcy5nbG9iYWwubG9jYXRpb24uaHJlZixcblxuICAgICAgdXBkYXRlUGFzc3dvcmRQYXRoOiAgICAgICAgICdhdXRoJyxcblxuICAgICAgcmVzZXRQYXNzd29yZFBhdGg6ICAgICAgICAgICdhdXRoL3Bhc3N3b3JkJyxcbiAgICAgIHJlc2V0UGFzc3dvcmRDYWxsYmFjazogICAgICB0aGlzLmdsb2JhbC5sb2NhdGlvbi5ocmVmLFxuXG4gICAgICB1c2VyVHlwZXM6ICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIGxvZ2luRmllbGQ6ICAgICAgICAgICAgICAgICAnZW1haWwnLFxuXG4gICAgICBvQXV0aEJhc2U6ICAgICAgICAgICAgICAgICAgdGhpcy5nbG9iYWwubG9jYXRpb24ub3JpZ2luLFxuICAgICAgb0F1dGhQYXRoczoge1xuICAgICAgICBnaXRodWI6ICAgICAgICAgICAgICAgICAgICdhdXRoL2dpdGh1YidcbiAgICAgIH0sXG4gICAgICBvQXV0aENhbGxiYWNrUGF0aDogICAgICAgICAgJ29hdXRoX2NhbGxiYWNrJyxcbiAgICAgIG9BdXRoV2luZG93VHlwZTogICAgICAgICAgICAnbmV3V2luZG93JyxcbiAgICAgIG9BdXRoV2luZG93T3B0aW9uczogICAgICAgICBudWxsLFxuXG4gICAgICBvQXV0aEJyb3dzZXJDYWxsYmFja3M6IHtcbiAgICAgICAgZ2l0aHViOiAgICAgICAgICAgICAgICAgICAnYXV0aC9naXRodWIvY2FsbGJhY2snLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgY29uc3QgbWVyZ2VkT3B0aW9ucyA9ICg8YW55Pk9iamVjdCkuYXNzaWduKGRlZmF1bHRPcHRpb25zLCBjb25maWcpO1xuICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlZE9wdGlvbnM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwaUJhc2UgPT09IG51bGwpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW2FuZ3VsYXItdG9rZW5dIFlvdSBoYXZlIG5vdCBjb25maWd1cmVkICdhcGlCYXNlJywgd2hpY2ggbWF5IHJlc3VsdCBpbiBzZWN1cml0eSBpc3N1ZXMuIGAgK1xuICAgICAgICAgICAgICAgICAgIGBQbGVhc2UgcmVmZXIgdG8gdGhlIGRvY3VtZW50YXRpb24gYXQgaHR0cHM6Ly9naXRodWIuY29tL25lcm9uaWFreS9hbmd1bGFyLXRva2VuL3dpa2lgKTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUxvYWRBdXRoRGF0YSgpO1xuICB9XG5cbiAgdXNlclNpZ25lZEluKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmF1dGhEYXRhLnZhbHVlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgY2FuQWN0aXZhdGUocm91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90KTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMudXNlclNpZ25lZEluKCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTdG9yZSBjdXJyZW50IGxvY2F0aW9uIGluIHN0b3JhZ2UgKHVzZWZ1bGwgZm9yIHJlZGlyZWN0aW9uIGFmdGVyIHNpZ25pbmcgaW4pXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnNpZ25JblN0b3JlZFVybFN0b3JhZ2VLZXkpIHtcbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuc2lnbkluU3RvcmVkVXJsU3RvcmFnZUtleSxcbiAgICAgICAgICBzdGF0ZS51cmxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVkaXJlY3QgdXNlciB0byBzaWduIGluIGlmIHNpZ25JblJlZGlyZWN0IGlzIHNldFxuICAgICAgaWYgKHRoaXMucm91dGVyICYmIHRoaXMub3B0aW9ucy5zaWduSW5SZWRpcmVjdCkge1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5vcHRpb25zLnNpZ25JblJlZGlyZWN0XSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBBY3Rpb25zXG4gICAqXG4gICAqL1xuXG4gIC8vIFJlZ2lzdGVyIHJlcXVlc3RcbiAgcmVnaXN0ZXJBY2NvdW50KHJlZ2lzdGVyRGF0YTogUmVnaXN0ZXJEYXRhLCBhZGRpdGlvbmFsRGF0YT86IGFueSk6IE9ic2VydmFibGU8QXBpUmVzcG9uc2U+IHtcblxuICAgIHJlZ2lzdGVyRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIHJlZ2lzdGVyRGF0YSk7XG5cbiAgICBpZiAocmVnaXN0ZXJEYXRhLnVzZXJUeXBlID09IG51bGwpIHtcbiAgICAgIHRoaXMudXNlclR5cGUubmV4dChudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51c2VyVHlwZS5uZXh0KHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUocmVnaXN0ZXJEYXRhLnVzZXJUeXBlKSk7XG4gICAgICBkZWxldGUgcmVnaXN0ZXJEYXRhLnVzZXJUeXBlO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHJlZ2lzdGVyRGF0YS5wYXNzd29yZF9jb25maXJtYXRpb24gPT0gbnVsbCAmJlxuICAgICAgcmVnaXN0ZXJEYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uICE9IG51bGxcbiAgICApIHtcbiAgICAgIHJlZ2lzdGVyRGF0YS5wYXNzd29yZF9jb25maXJtYXRpb24gPSByZWdpc3RlckRhdGEucGFzc3dvcmRDb25maXJtYXRpb247XG4gICAgICBkZWxldGUgcmVnaXN0ZXJEYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uO1xuICAgIH1cblxuICAgIGlmIChhZGRpdGlvbmFsRGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZWdpc3RlckRhdGEuYWRkaXRpb25hbERhdGEgPSBhZGRpdGlvbmFsRGF0YTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dpbiA9IHJlZ2lzdGVyRGF0YS5sb2dpbjtcbiAgICBkZWxldGUgcmVnaXN0ZXJEYXRhLmxvZ2luO1xuICAgIHJlZ2lzdGVyRGF0YVt0aGlzLm9wdGlvbnMubG9naW5GaWVsZF0gPSBsb2dpbjtcblxuICAgIHJlZ2lzdGVyRGF0YS5jb25maXJtX3N1Y2Nlc3NfdXJsID0gdGhpcy5vcHRpb25zLnJlZ2lzdGVyQWNjb3VudENhbGxiYWNrO1xuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PEFwaVJlc3BvbnNlPihcbiAgICAgIHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnJlZ2lzdGVyQWNjb3VudFBhdGgsIHJlZ2lzdGVyRGF0YVxuICAgICk7XG4gIH1cblxuICAvLyBEZWxldGUgQWNjb3VudFxuICBkZWxldGVBY2NvdW50KCk6IE9ic2VydmFibGU8QXBpUmVzcG9uc2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZTxBcGlSZXNwb25zZT4odGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMuZGVsZXRlQWNjb3VudFBhdGgpO1xuICB9XG5cbiAgLy8gU2lnbiBpbiByZXF1ZXN0IGFuZCBzZXQgc3RvcmFnZVxuICBzaWduSW4oc2lnbkluRGF0YTogU2lnbkluRGF0YSwgYWRkaXRpb25hbERhdGE/OiBhbnkpOiBPYnNlcnZhYmxlPEFwaVJlc3BvbnNlPiB7XG4gICAgdGhpcy51c2VyVHlwZS5uZXh0KChzaWduSW5EYXRhLnVzZXJUeXBlID09IG51bGwpID8gbnVsbCA6IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUoc2lnbkluRGF0YS51c2VyVHlwZSkpO1xuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgIFt0aGlzLm9wdGlvbnMubG9naW5GaWVsZF06IHNpZ25JbkRhdGEubG9naW4sXG4gICAgICBwYXNzd29yZDogc2lnbkluRGF0YS5wYXNzd29yZFxuICAgIH07XG5cbiAgICBpZiAoYWRkaXRpb25hbERhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYm9keS5hZGRpdGlvbmFsRGF0YSA9IGFkZGl0aW9uYWxEYXRhO1xuICAgIH1cblxuICAgIGNvbnN0IG9ic2VydiA9IHRoaXMuaHR0cC5wb3N0PEFwaVJlc3BvbnNlPihcbiAgICAgIHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnNpZ25JblBhdGgsIGJvZHlcbiAgICApLnBpcGUoc2hhcmUoKSk7XG5cbiAgICBvYnNlcnYuc3Vic2NyaWJlKHJlcyA9PiB0aGlzLnVzZXJEYXRhLm5leHQocmVzLmRhdGEpKTtcblxuICAgIHJldHVybiBvYnNlcnY7XG4gIH1cblxuICBzaWduSW5PQXV0aChvQXV0aFR5cGU6IHN0cmluZywgaW5BcHBCcm93c2VyPzogVG9rZW5JbkFwcEJyb3dzZXI8YW55LCBhbnk+LCBwbGF0Zm9ybT86IFRva2VuUGxhdGZvcm0pIHtcblxuICAgIGNvbnN0IG9BdXRoUGF0aDogc3RyaW5nID0gdGhpcy5nZXRPQXV0aFBhdGgob0F1dGhUeXBlKTtcbiAgICBjb25zdCBjYWxsYmFja1VybCA9IGAke3RoaXMuZ2xvYmFsLmxvY2F0aW9uLm9yaWdpbn0vJHt0aGlzLm9wdGlvbnMub0F1dGhDYWxsYmFja1BhdGh9YDtcbiAgICBjb25zdCBvQXV0aFdpbmRvd1R5cGU6IHN0cmluZyA9IHRoaXMub3B0aW9ucy5vQXV0aFdpbmRvd1R5cGU7XG4gICAgY29uc3QgYXV0aFVybDogc3RyaW5nID0gdGhpcy5nZXRPQXV0aFVybChvQXV0aFBhdGgsIGNhbGxiYWNrVXJsLCBvQXV0aFdpbmRvd1R5cGUpO1xuXG4gICAgaWYgKG9BdXRoV2luZG93VHlwZSA9PT0gJ25ld1dpbmRvdycgfHxcbiAgICAgIChvQXV0aFdpbmRvd1R5cGUgPT0gJ2luQXBwQnJvd3NlcicgJiYgKCFwbGF0Zm9ybSB8fCAhcGxhdGZvcm0uaXMoJ2NvcmRvdmEnKSB8fCAhKHBsYXRmb3JtLmlzKCdpb3MnKSB8fCBwbGF0Zm9ybS5pcygnYW5kcm9pZCcpKSkpKSB7XG4gICAgICBjb25zdCBvQXV0aFdpbmRvd09wdGlvbnMgPSB0aGlzLm9wdGlvbnMub0F1dGhXaW5kb3dPcHRpb25zO1xuICAgICAgbGV0IHdpbmRvd09wdGlvbnMgPSAnJztcblxuICAgICAgaWYgKG9BdXRoV2luZG93T3B0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvQXV0aFdpbmRvd09wdGlvbnMpIHtcbiAgICAgICAgICBpZiAob0F1dGhXaW5kb3dPcHRpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgd2luZG93T3B0aW9ucyArPSBgLCR7a2V5fT0ke29BdXRoV2luZG93T3B0aW9uc1trZXldfWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBvcHVwID0gd2luZG93Lm9wZW4oXG4gICAgICAgICAgYXV0aFVybCxcbiAgICAgICAgICAnX2JsYW5rJyxcbiAgICAgICAgICBgY2xvc2VidXR0b25jYXB0aW9uPUNhbmNlbCR7d2luZG93T3B0aW9uc31gXG4gICAgICApO1xuICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdENyZWRlbnRpYWxzVmlhUG9zdE1lc3NhZ2UocG9wdXApO1xuICAgIH0gZWxzZSBpZiAob0F1dGhXaW5kb3dUeXBlID09ICdpbkFwcEJyb3dzZXInKSB7XG4gICAgICBsZXQgb0F1dGhCcm93c2VyQ2FsbGJhY2sgPSB0aGlzLm9wdGlvbnMub0F1dGhCcm93c2VyQ2FsbGJhY2tzW29BdXRoVHlwZV07XG4gICAgICBpZiAoIW9BdXRoQnJvd3NlckNhbGxiYWNrKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVG8gbG9naW4gd2l0aCBvQXV0aCBwcm92aWRlciAke29BdXRoVHlwZX0gdXNpbmcgaW5BcHBCcm93c2VyIHRoZSBjYWxsYmFjayAoaW4gb0F1dGhCcm93c2VyQ2FsbGJhY2tzKSBpcyByZXF1aXJlZC5gKTtcbiAgICAgIH1cbiAgICAgIC8vIGxldCBvQXV0aFdpbmRvd09wdGlvbnMgPSB0aGlzLm9wdGlvbnMub0F1dGhXaW5kb3dPcHRpb25zO1xuICAgICAgLy8gbGV0IHdpbmRvd09wdGlvbnMgPSAnJztcblxuICAgICAgLy8gIGlmIChvQXV0aFdpbmRvd09wdGlvbnMpIHtcbiAgICAgIC8vICAgICBmb3IgKGxldCBrZXkgaW4gb0F1dGhXaW5kb3dPcHRpb25zKSB7XG4gICAgICAvLyAgICAgICAgIHdpbmRvd09wdGlvbnMgKz0gYCwke2tleX09JHtvQXV0aFdpbmRvd09wdGlvbnNba2V5XX1gO1xuICAgICAgLy8gICAgIH1cbiAgICAgIC8vIH1cblxuICAgICAgbGV0IGJyb3dzZXIgPSBpbkFwcEJyb3dzZXIuY3JlYXRlKFxuICAgICAgICAgIGF1dGhVcmwsXG4gICAgICAgICAgJ19ibGFuaycsXG4gICAgICAgICAgJ2xvY2F0aW9uPW5vJ1xuICAgICAgKTtcblxuICAgICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcikgPT4ge1xuICAgICAgICBicm93c2VyLm9uKCdsb2Fkc3RvcCcpLnN1YnNjcmliZSgoZXY6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChldi51cmwuaW5kZXhPZihvQXV0aEJyb3dzZXJDYWxsYmFjaykgPiAtMSkge1xuICAgICAgICAgICAgYnJvd3Nlci5leGVjdXRlU2NyaXB0KHtjb2RlOiBcInJlcXVlc3RDcmVkZW50aWFscygpO1wifSkudGhlbigoY3JlZGVudGlhbHM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVBvc3RNZXNzYWdlKGNyZWRlbnRpYWxzWzBdKTtcblxuICAgICAgICAgICAgICBsZXQgcG9sbGVyT2JzZXJ2ID0gaW50ZXJ2YWwoNDAwKTtcblxuICAgICAgICAgICAgICBsZXQgcG9sbGVyU3Vic2NyaXB0aW9uID0gcG9sbGVyT2JzZXJ2LnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudXNlclNpZ25lZEluKCkpIHtcbiAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodGhpcy5hdXRoRGF0YSk7XG4gICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuXG4gICAgICAgICAgICAgICAgICBwb2xsZXJTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAgIGJyb3dzZXIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sIChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAob0F1dGhXaW5kb3dUeXBlID09PSAnc2FtZVdpbmRvdycpIHtcbiAgICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLmhyZWYgPSBhdXRoVXJsO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBvQXV0aFdpbmRvd1R5cGUgXCIke29BdXRoV2luZG93VHlwZX1cImApO1xuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NPQXV0aENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tUGFyYW1zKCk7XG4gIH1cblxuICAvLyBTaWduIG91dCByZXF1ZXN0IGFuZCBkZWxldGUgc3RvcmFnZVxuICBzaWduT3V0KCk6IE9ic2VydmFibGU8QXBpUmVzcG9uc2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZTxBcGlSZXNwb25zZT4odGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMuc2lnbk91dFBhdGgpXG4gICAgICAvLyBPbmx5IHJlbW92ZSB0aGUgbG9jYWxTdG9yYWdlIGFuZCBjbGVhciB0aGUgZGF0YSBhZnRlciB0aGUgY2FsbFxuICAgICAgLnBpcGUoXG4gICAgICAgIGZpbmFsaXplKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2FjY2Vzc1Rva2VuJyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjbGllbnQnKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2V4cGlyeScpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW5UeXBlJyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1aWQnKTtcblxuICAgICAgICAgICAgdGhpcy5hdXRoRGF0YS5uZXh0KG51bGwpO1xuICAgICAgICAgICAgdGhpcy51c2VyVHlwZS5uZXh0KG51bGwpO1xuICAgICAgICAgICAgdGhpcy51c2VyRGF0YS5uZXh0KG51bGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIHRva2VuIHJlcXVlc3RcbiAgdmFsaWRhdGVUb2tlbigpOiBPYnNlcnZhYmxlPEFwaVJlc3BvbnNlPiB7XG4gICAgY29uc3Qgb2JzZXJ2ID0gdGhpcy5odHRwLmdldDxBcGlSZXNwb25zZT4oXG4gICAgICB0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy52YWxpZGF0ZVRva2VuUGF0aFxuICAgICkucGlwZShzaGFyZSgpKTtcblxuICAgIG9ic2Vydi5zdWJzY3JpYmUoXG4gICAgICAocmVzKSA9PiB0aGlzLnVzZXJEYXRhLm5leHQocmVzLmRhdGEpLFxuICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT09IDQwMSAmJiB0aGlzLm9wdGlvbnMuc2lnbk91dEZhaWxlZFZhbGlkYXRlKSB7XG4gICAgICAgICAgdGhpcy5zaWduT3V0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBvYnNlcnY7XG4gIH1cblxuICAvLyBVcGRhdGUgcGFzc3dvcmQgcmVxdWVzdFxuICB1cGRhdGVQYXNzd29yZCh1cGRhdGVQYXNzd29yZERhdGE6IFVwZGF0ZVBhc3N3b3JkRGF0YSk6IE9ic2VydmFibGU8QXBpUmVzcG9uc2U+IHtcblxuICAgIGlmICh1cGRhdGVQYXNzd29yZERhdGEudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy51c2VyVHlwZS5uZXh0KHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUodXBkYXRlUGFzc3dvcmREYXRhLnVzZXJUeXBlKSk7XG4gICAgfVxuXG4gICAgbGV0IGFyZ3M6IGFueTtcblxuICAgIGlmICh1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDdXJyZW50ID09IG51bGwpIHtcbiAgICAgIGFyZ3MgPSB7XG4gICAgICAgIHBhc3N3b3JkOiAgICAgICAgICAgICAgIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZCxcbiAgICAgICAgcGFzc3dvcmRfY29uZmlybWF0aW9uOiAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzID0ge1xuICAgICAgICBjdXJyZW50X3Bhc3N3b3JkOiAgICAgICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDdXJyZW50LFxuICAgICAgICBwYXNzd29yZDogICAgICAgICAgICAgICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmQsXG4gICAgICAgIHBhc3N3b3JkX2NvbmZpcm1hdGlvbjogIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvblxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodXBkYXRlUGFzc3dvcmREYXRhLnJlc2V0UGFzc3dvcmRUb2tlbikge1xuICAgICAgYXJncy5yZXNldF9wYXNzd29yZF90b2tlbiA9IHVwZGF0ZVBhc3N3b3JkRGF0YS5yZXNldFBhc3N3b3JkVG9rZW47XG4gICAgfVxuXG4gICAgY29uc3QgYm9keSA9IGFyZ3M7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQ8QXBpUmVzcG9uc2U+KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnVwZGF0ZVBhc3N3b3JkUGF0aCwgYm9keSk7XG4gIH1cblxuICAvLyBSZXNldCBwYXNzd29yZCByZXF1ZXN0XG4gIHJlc2V0UGFzc3dvcmQocmVzZXRQYXNzd29yZERhdGE6IFJlc2V0UGFzc3dvcmREYXRhLCBhZGRpdGlvbmFsRGF0YT86IGFueSk6IE9ic2VydmFibGU8QXBpUmVzcG9uc2U+IHtcbiAgICBcbiAgICBcbiAgICBpZiAoYWRkaXRpb25hbERhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzZXRQYXNzd29yZERhdGEuYWRkaXRpb25hbERhdGEgPSBhZGRpdGlvbmFsRGF0YTtcbiAgICB9XG5cbiAgICB0aGlzLnVzZXJUeXBlLm5leHQoXG4gICAgICAocmVzZXRQYXNzd29yZERhdGEudXNlclR5cGUgPT0gbnVsbCkgPyBudWxsIDogdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShyZXNldFBhc3N3b3JkRGF0YS51c2VyVHlwZSlcbiAgICApO1xuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgIFt0aGlzLm9wdGlvbnMubG9naW5GaWVsZF06IHJlc2V0UGFzc3dvcmREYXRhLmxvZ2luLFxuICAgICAgcmVkaXJlY3RfdXJsOiB0aGlzLm9wdGlvbnMucmVzZXRQYXNzd29yZENhbGxiYWNrXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxBcGlSZXNwb25zZT4odGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMucmVzZXRQYXNzd29yZFBhdGgsIGJvZHkpO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogQ29uc3RydWN0IFBhdGhzIC8gVXJsc1xuICAgKlxuICAgKi9cblxuICBwcml2YXRlIGdldFVzZXJQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICh0aGlzLnVzZXJUeXBlLnZhbHVlID09IG51bGwpID8gJycgOiB0aGlzLnVzZXJUeXBlLnZhbHVlLnBhdGggKyAnLyc7XG4gIH1cblxuICBwcml2YXRlIGdldEFwaVBhdGgoKTogc3RyaW5nIHtcbiAgICBsZXQgY29uc3RydWN0ZWRQYXRoID0gJyc7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwaUJhc2UgIT0gbnVsbCkge1xuICAgICAgY29uc3RydWN0ZWRQYXRoICs9IHRoaXMub3B0aW9ucy5hcGlCYXNlICsgJy8nO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBpUGF0aCAhPSBudWxsKSB7XG4gICAgICBjb25zdHJ1Y3RlZFBhdGggKz0gdGhpcy5vcHRpb25zLmFwaVBhdGggKyAnLyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnN0cnVjdGVkUGF0aDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2VydmVyUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldEFwaVBhdGgoKSArIHRoaXMuZ2V0VXNlclBhdGgoKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0T0F1dGhQYXRoKG9BdXRoVHlwZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgb0F1dGhQYXRoOiBzdHJpbmc7XG5cbiAgICBvQXV0aFBhdGggPSB0aGlzLm9wdGlvbnMub0F1dGhQYXRoc1tvQXV0aFR5cGVdO1xuXG4gICAgaWYgKG9BdXRoUGF0aCA9PSBudWxsKSB7XG4gICAgICBvQXV0aFBhdGggPSBgL2F1dGgvJHtvQXV0aFR5cGV9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gb0F1dGhQYXRoO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRPQXV0aFVybChvQXV0aFBhdGg6IHN0cmluZywgY2FsbGJhY2tVcmw6IHN0cmluZywgd2luZG93VHlwZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgdXJsOiBzdHJpbmc7XG5cbiAgICB1cmwgPSAgIGAke3RoaXMub3B0aW9ucy5vQXV0aEJhc2V9LyR7b0F1dGhQYXRofWA7XG4gICAgdXJsICs9ICBgP29tbmlhdXRoX3dpbmRvd190eXBlPSR7d2luZG93VHlwZX1gO1xuICAgIHVybCArPSAgYCZhdXRoX29yaWdpbl91cmw9JHtlbmNvZGVVUklDb21wb25lbnQoY2FsbGJhY2tVcmwpfWA7XG5cbiAgICBpZiAodGhpcy51c2VyVHlwZS52YWx1ZSAhPSBudWxsKSB7XG4gICAgICB1cmwgKz0gYCZyZXNvdXJjZV9jbGFzcz0ke3RoaXMudXNlclR5cGUudmFsdWUubmFtZX1gO1xuICAgIH1cblxuICAgIHJldHVybiB1cmw7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBHZXQgQXV0aCBEYXRhXG4gICAqXG4gICAqL1xuXG4gIC8vIFRyeSB0byBsb2FkIGF1dGggZGF0YVxuICBwcml2YXRlIHRyeUxvYWRBdXRoRGF0YSgpOiB2b2lkIHtcblxuICAgIGNvbnN0IHVzZXJUeXBlID0gdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZSh0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyVHlwZScpKTtcblxuICAgIGlmICh1c2VyVHlwZSkge1xuICAgICAgdGhpcy51c2VyVHlwZS5uZXh0KHVzZXJUeXBlKTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVN0b3JhZ2UoKTtcblxuICAgIGlmICh0aGlzLmFjdGl2YXRlZFJvdXRlKSB7XG4gICAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVBhcmFtcygpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmF1dGhEYXRhKSB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVUb2tlbigpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHJlc3BvbnNlXG4gIHB1YmxpYyBnZXRBdXRoSGVhZGVyc0Zyb21SZXNwb25zZShkYXRhOiBIdHRwUmVzcG9uc2U8YW55PiB8IEh0dHBFcnJvclJlc3BvbnNlKTogdm9pZCB7XG4gICAgY29uc3QgaGVhZGVycyA9IGRhdGEuaGVhZGVycztcblxuICAgIGNvbnN0IGF1dGhEYXRhOiBBdXRoRGF0YSA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuOiAgICBoZWFkZXJzLmdldCgnYWNjZXNzLXRva2VuJyksXG4gICAgICBjbGllbnQ6ICAgICAgICAgaGVhZGVycy5nZXQoJ2NsaWVudCcpLFxuICAgICAgZXhwaXJ5OiAgICAgICAgIGhlYWRlcnMuZ2V0KCdleHBpcnknKSxcbiAgICAgIHRva2VuVHlwZTogICAgICBoZWFkZXJzLmdldCgndG9rZW4tdHlwZScpLFxuICAgICAgdWlkOiAgICAgICAgICAgIGhlYWRlcnMuZ2V0KCd1aWQnKVxuICAgIH07XG5cbiAgICB0aGlzLnNldEF1dGhEYXRhKGF1dGhEYXRhKTtcbiAgfVxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHBvc3QgbWVzc2FnZVxuICBwcml2YXRlIGdldEF1dGhEYXRhRnJvbVBvc3RNZXNzYWdlKGRhdGE6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGF1dGhEYXRhOiBBdXRoRGF0YSA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuOiAgICBkYXRhWydhdXRoX3Rva2VuJ10sXG4gICAgICBjbGllbnQ6ICAgICAgICAgZGF0YVsnY2xpZW50X2lkJ10sXG4gICAgICBleHBpcnk6ICAgICAgICAgZGF0YVsnZXhwaXJ5J10sXG4gICAgICB0b2tlblR5cGU6ICAgICAgJ0JlYXJlcicsXG4gICAgICB1aWQ6ICAgICAgICAgICAgZGF0YVsndWlkJ11cbiAgICB9O1xuXG4gICAgdGhpcy5zZXRBdXRoRGF0YShhdXRoRGF0YSk7XG4gIH1cblxuICAvLyBUcnkgdG8gZ2V0IGF1dGggZGF0YSBmcm9tIHN0b3JhZ2UuXG4gIHB1YmxpYyBnZXRBdXRoRGF0YUZyb21TdG9yYWdlKCk6IHZvaWQge1xuXG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2FjY2Vzc1Rva2VuJyksXG4gICAgICBjbGllbnQ6ICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY2xpZW50JyksXG4gICAgICBleHBpcnk6ICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZXhwaXJ5JyksXG4gICAgICB0b2tlblR5cGU6ICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW5UeXBlJyksXG4gICAgICB1aWQ6ICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndWlkJylcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcbiAgICAgIHRoaXMuYXV0aERhdGEubmV4dChhdXRoRGF0YSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVHJ5IHRvIGdldCBhdXRoIGRhdGEgZnJvbSB1cmwgcGFyYW1ldGVycy5cbiAgcHJpdmF0ZSBnZXRBdXRoRGF0YUZyb21QYXJhbXMoKTogdm9pZCB7XG4gICAgdGhpcy5hY3RpdmF0ZWRSb3V0ZS5xdWVyeVBhcmFtcy5zdWJzY3JpYmUocXVlcnlQYXJhbXMgPT4ge1xuICAgICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgICBhY2Nlc3NUb2tlbjogICAgcXVlcnlQYXJhbXNbJ3Rva2VuJ10gfHwgcXVlcnlQYXJhbXNbJ2F1dGhfdG9rZW4nXSxcbiAgICAgICAgY2xpZW50OiAgICAgICAgIHF1ZXJ5UGFyYW1zWydjbGllbnRfaWQnXSxcbiAgICAgICAgZXhwaXJ5OiAgICAgICAgIHF1ZXJ5UGFyYW1zWydleHBpcnknXSxcbiAgICAgICAgdG9rZW5UeXBlOiAgICAgICdCZWFyZXInLFxuICAgICAgICB1aWQ6ICAgICAgICAgICAgcXVlcnlQYXJhbXNbJ3VpZCddXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5jaGVja0F1dGhEYXRhKGF1dGhEYXRhKSkge1xuICAgICAgICB0aGlzLmF1dGhEYXRhLm5leHQoYXV0aERhdGEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIFNldCBBdXRoIERhdGFcbiAgICpcbiAgICovXG5cbiAgLy8gV3JpdGUgYXV0aCBkYXRhIHRvIHN0b3JhZ2VcbiAgcHJpdmF0ZSBzZXRBdXRoRGF0YShhdXRoRGF0YTogQXV0aERhdGEpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jaGVja0F1dGhEYXRhKGF1dGhEYXRhKSkge1xuXG4gICAgICB0aGlzLmF1dGhEYXRhLm5leHQoYXV0aERhdGEpO1xuXG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhY2Nlc3NUb2tlbicsIGF1dGhEYXRhLmFjY2Vzc1Rva2VuKTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2NsaWVudCcsIGF1dGhEYXRhLmNsaWVudCk7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleHBpcnknLCBhdXRoRGF0YS5leHBpcnkpO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW5UeXBlJywgYXV0aERhdGEudG9rZW5UeXBlKTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VpZCcsIGF1dGhEYXRhLnVpZCk7XG5cbiAgICAgIGlmICh0aGlzLnVzZXJUeXBlLnZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlclR5cGUnLCB0aGlzLnVzZXJUeXBlLnZhbHVlLm5hbWUpO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogVmFsaWRhdGUgQXV0aCBEYXRhXG4gICAqXG4gICAqL1xuXG4gIC8vIENoZWNrIGlmIGF1dGggZGF0YSBjb21wbGV0ZSBhbmQgaWYgcmVzcG9uc2UgdG9rZW4gaXMgbmV3ZXJcbiAgcHJpdmF0ZSBjaGVja0F1dGhEYXRhKGF1dGhEYXRhOiBBdXRoRGF0YSk6IGJvb2xlYW4ge1xuXG4gICAgaWYgKFxuICAgICAgYXV0aERhdGEuYWNjZXNzVG9rZW4gIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEuY2xpZW50ICE9IG51bGwgJiZcbiAgICAgIGF1dGhEYXRhLmV4cGlyeSAhPSBudWxsICYmXG4gICAgICBhdXRoRGF0YS50b2tlblR5cGUgIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEudWlkICE9IG51bGxcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLmF1dGhEYXRhLnZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGF1dGhEYXRhLmV4cGlyeSA+PSB0aGlzLmF1dGhEYXRhLnZhbHVlLmV4cGlyeTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBPQXV0aFxuICAgKlxuICAgKi9cblxuICBwcml2YXRlIHJlcXVlc3RDcmVkZW50aWFsc1ZpYVBvc3RNZXNzYWdlKGF1dGhXaW5kb3c6IGFueSk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3QgcG9sbGVyT2JzZXJ2ID0gaW50ZXJ2YWwoNTAwKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlT2JzZXJ2ID0gZnJvbUV2ZW50KHRoaXMuZ2xvYmFsLCAnbWVzc2FnZScpLnBpcGUoXG4gICAgICBwbHVjaygnZGF0YScpLFxuICAgICAgZmlsdGVyKHRoaXMub0F1dGhXaW5kb3dSZXNwb25zZUZpbHRlcilcbiAgICApO1xuXG4gICAgcmVzcG9uc2VPYnNlcnYuc3Vic2NyaWJlKFxuICAgICAgdGhpcy5nZXRBdXRoRGF0YUZyb21Qb3N0TWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgKTtcblxuICAgIGNvbnN0IHBvbGxlclN1YnNjcmlwdGlvbiA9IHBvbGxlck9ic2Vydi5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgaWYgKGF1dGhXaW5kb3cuY2xvc2VkKSB7XG4gICAgICAgIHBvbGxlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXV0aFdpbmRvdy5wb3N0TWVzc2FnZSgncmVxdWVzdENyZWRlbnRpYWxzJywgJyonKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXNwb25zZU9ic2VydjtcbiAgfVxuXG4gIHByaXZhdGUgb0F1dGhXaW5kb3dSZXNwb25zZUZpbHRlcihkYXRhOiBhbnkpOiBhbnkge1xuICAgIGlmIChkYXRhLm1lc3NhZ2UgPT09ICdkZWxpdmVyQ3JlZGVudGlhbHMnIHx8IGRhdGEubWVzc2FnZSA9PT0gJ2F1dGhGYWlsdXJlJykge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogVXRpbGl0aWVzXG4gICAqXG4gICAqL1xuXG4gIC8vIE1hdGNoIHVzZXIgY29uZmlnIGJ5IHVzZXIgY29uZmlnIG5hbWVcbiAgcHJpdmF0ZSBnZXRVc2VyVHlwZUJ5TmFtZShuYW1lOiBzdHJpbmcpOiBVc2VyVHlwZSB7XG4gICAgaWYgKG5hbWUgPT0gbnVsbCB8fCB0aGlzLm9wdGlvbnMudXNlclR5cGVzID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlclR5cGVzLmZpbmQoXG4gICAgICB1c2VyVHlwZSA9PiB1c2VyVHlwZS5uYW1lID09PSBuYW1lXG4gICAgKTtcbiAgfVxufVxuIl19