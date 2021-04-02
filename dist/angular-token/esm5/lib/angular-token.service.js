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
var AngularTokenService = /** @class */ (function () {
    function AngularTokenService(http, config, platformId, activatedRoute, router) {
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
                open: function () { return null; },
                location: {
                    href: '/',
                    origin: '/'
                }
            };
            // Bad pratice, needs fixing
            this.localStorage.setItem = function () { return null; };
            this.localStorage.getItem = function () { return null; };
            this.localStorage.removeItem = function () { return null; };
        }
        else {
            this.localStorage = localStorage;
        }
        var defaultOptions = {
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
        var mergedOptions = Object.assign(defaultOptions, config);
        this.options = mergedOptions;
        if (this.options.apiBase === null) {
            console.warn("[angular-token] You have not configured 'apiBase', which may result in security issues. " +
                "Please refer to the documentation at https://github.com/neroniaky/angular-token/wiki");
        }
        this.tryLoadAuthData();
    }
    Object.defineProperty(AngularTokenService.prototype, "currentUserType", {
        get: function () {
            if (this.userType.value != null) {
                return this.userType.value.name;
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularTokenService.prototype, "currentUserData", {
        get: function () {
            return this.userData.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularTokenService.prototype, "currentAuthData", {
        get: function () {
            return this.authData.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularTokenService.prototype, "apiBase", {
        get: function () {
            console.warn('[angular-token] The attribute .apiBase will be removed in the next major release, please use' +
                '.tokenOptions.apiBase instead');
            return this.options.apiBase;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularTokenService.prototype, "tokenOptions", {
        get: function () {
            return this.options;
        },
        set: function (options) {
            this.options = Object.assign(this.options, options);
        },
        enumerable: true,
        configurable: true
    });
    AngularTokenService.prototype.userSignedIn = function () {
        if (this.authData.value == null) {
            return false;
        }
        else {
            return true;
        }
    };
    AngularTokenService.prototype.canActivate = function (route, state) {
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
    };
    /**
     *
     * Actions
     *
     */
    // Register request
    AngularTokenService.prototype.registerAccount = function (registerData, additionalData) {
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
        var login = registerData.login;
        delete registerData.login;
        registerData[this.options.loginField] = login;
        registerData.confirm_success_url = this.options.registerAccountCallback;
        return this.http.post(this.getServerPath() + this.options.registerAccountPath, registerData);
    };
    // Delete Account
    AngularTokenService.prototype.deleteAccount = function () {
        return this.http.delete(this.getServerPath() + this.options.deleteAccountPath);
    };
    // Sign in request and set storage
    AngularTokenService.prototype.signIn = function (signInData, additionalData) {
        var _a;
        var _this = this;
        this.userType.next((signInData.userType == null) ? null : this.getUserTypeByName(signInData.userType));
        var body = (_a = {},
            _a[this.options.loginField] = signInData.login,
            _a.password = signInData.password,
            _a);
        if (additionalData !== undefined) {
            body.additionalData = additionalData;
        }
        var observ = this.http.post(this.getServerPath() + this.options.signInPath, body).pipe(share());
        observ.subscribe(function (res) { return _this.userData.next(res.data); });
        return observ;
    };
    AngularTokenService.prototype.signInOAuth = function (oAuthType, inAppBrowser, platform) {
        var _this = this;
        var oAuthPath = this.getOAuthPath(oAuthType);
        var callbackUrl = this.global.location.origin + "/" + this.options.oAuthCallbackPath;
        var oAuthWindowType = this.options.oAuthWindowType;
        var authUrl = this.getOAuthUrl(oAuthPath, callbackUrl, oAuthWindowType);
        if (oAuthWindowType === 'newWindow' ||
            (oAuthWindowType == 'inAppBrowser' && (!platform || !platform.is('cordova') || !(platform.is('ios') || platform.is('android'))))) {
            var oAuthWindowOptions = this.options.oAuthWindowOptions;
            var windowOptions = '';
            if (oAuthWindowOptions) {
                for (var key in oAuthWindowOptions) {
                    if (oAuthWindowOptions.hasOwnProperty(key)) {
                        windowOptions += "," + key + "=" + oAuthWindowOptions[key];
                    }
                }
            }
            var popup = window.open(authUrl, '_blank', "closebuttoncaption=Cancel" + windowOptions);
            return this.requestCredentialsViaPostMessage(popup);
        }
        else if (oAuthWindowType == 'inAppBrowser') {
            var oAuthBrowserCallback_1 = this.options.oAuthBrowserCallbacks[oAuthType];
            if (!oAuthBrowserCallback_1) {
                throw new Error("To login with oAuth provider " + oAuthType + " using inAppBrowser the callback (in oAuthBrowserCallbacks) is required.");
            }
            // let oAuthWindowOptions = this.options.oAuthWindowOptions;
            // let windowOptions = '';
            //  if (oAuthWindowOptions) {
            //     for (let key in oAuthWindowOptions) {
            //         windowOptions += `,${key}=${oAuthWindowOptions[key]}`;
            //     }
            // }
            var browser_1 = inAppBrowser.create(authUrl, '_blank', 'location=no');
            return new Observable(function (observer) {
                browser_1.on('loadstop').subscribe(function (ev) {
                    if (ev.url.indexOf(oAuthBrowserCallback_1) > -1) {
                        browser_1.executeScript({ code: "requestCredentials();" }).then(function (credentials) {
                            _this.getAuthDataFromPostMessage(credentials[0]);
                            var pollerObserv = interval(400);
                            var pollerSubscription = pollerObserv.subscribe(function () {
                                if (_this.userSignedIn()) {
                                    observer.next(_this.authData);
                                    observer.complete();
                                    pollerSubscription.unsubscribe();
                                    browser_1.close();
                                }
                            }, function (error) {
                                observer.error(error);
                                observer.complete();
                            });
                        }, function (error) {
                            observer.error(error);
                            observer.complete();
                        });
                    }
                }, function (error) {
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
            throw new Error("Unsupported oAuthWindowType \"" + oAuthWindowType + "\"");
        }
    };
    AngularTokenService.prototype.processOAuthCallback = function () {
        this.getAuthDataFromParams();
    };
    // Sign out request and delete storage
    AngularTokenService.prototype.signOut = function () {
        var _this = this;
        return this.http.delete(this.getServerPath() + this.options.signOutPath)
            // Only remove the localStorage and clear the data after the call
            .pipe(finalize(function () {
            _this.localStorage.removeItem('accessToken');
            _this.localStorage.removeItem('client');
            _this.localStorage.removeItem('expiry');
            _this.localStorage.removeItem('tokenType');
            _this.localStorage.removeItem('uid');
            _this.authData.next(null);
            _this.userType.next(null);
            _this.userData.next(null);
        }));
    };
    // Validate token request
    AngularTokenService.prototype.validateToken = function () {
        var _this = this;
        var observ = this.http.get(this.getServerPath() + this.options.validateTokenPath).pipe(share());
        observ.subscribe(function (res) { return _this.userData.next(res.data); }, function (error) {
            if (error.status === 401 && _this.options.signOutFailedValidate) {
                _this.signOut();
            }
        });
        return observ;
    };
    // Update password request
    AngularTokenService.prototype.updatePassword = function (updatePasswordData) {
        if (updatePasswordData.userType != null) {
            this.userType.next(this.getUserTypeByName(updatePasswordData.userType));
        }
        var args;
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
        var body = args;
        return this.http.put(this.getServerPath() + this.options.updatePasswordPath, body);
    };
    // Reset password request
    AngularTokenService.prototype.resetPassword = function (resetPasswordData, additionalData) {
        var _a;
        if (additionalData !== undefined) {
            resetPasswordData.additionalData = additionalData;
        }
        this.userType.next((resetPasswordData.userType == null) ? null : this.getUserTypeByName(resetPasswordData.userType));
        var body = (_a = {},
            _a[this.options.loginField] = resetPasswordData.login,
            _a.redirect_url = this.options.resetPasswordCallback,
            _a);
        return this.http.post(this.getServerPath() + this.options.resetPasswordPath, body);
    };
    /**
     *
     * Construct Paths / Urls
     *
     */
    AngularTokenService.prototype.getUserPath = function () {
        return (this.userType.value == null) ? '' : this.userType.value.path + '/';
    };
    AngularTokenService.prototype.getApiPath = function () {
        var constructedPath = '';
        if (this.options.apiBase != null) {
            constructedPath += this.options.apiBase + '/';
        }
        if (this.options.apiPath != null) {
            constructedPath += this.options.apiPath + '/';
        }
        return constructedPath;
    };
    AngularTokenService.prototype.getServerPath = function () {
        return this.getApiPath() + this.getUserPath();
    };
    AngularTokenService.prototype.getOAuthPath = function (oAuthType) {
        var oAuthPath;
        oAuthPath = this.options.oAuthPaths[oAuthType];
        if (oAuthPath == null) {
            oAuthPath = "/auth/" + oAuthType;
        }
        return oAuthPath;
    };
    AngularTokenService.prototype.getOAuthUrl = function (oAuthPath, callbackUrl, windowType) {
        var url;
        url = this.options.oAuthBase + "/" + oAuthPath;
        url += "?omniauth_window_type=" + windowType;
        url += "&auth_origin_url=" + encodeURIComponent(callbackUrl);
        if (this.userType.value != null) {
            url += "&resource_class=" + this.userType.value.name;
        }
        return url;
    };
    /**
     *
     * Get Auth Data
     *
     */
    // Try to load auth data
    AngularTokenService.prototype.tryLoadAuthData = function () {
        var userType = this.getUserTypeByName(this.localStorage.getItem('userType'));
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
    };
    // Parse Auth data from response
    AngularTokenService.prototype.getAuthHeadersFromResponse = function (data) {
        var headers = data.headers;
        var authData = {
            accessToken: headers.get('access-token'),
            client: headers.get('client'),
            expiry: headers.get('expiry'),
            tokenType: headers.get('token-type'),
            uid: headers.get('uid')
        };
        this.setAuthData(authData);
    };
    // Parse Auth data from post message
    AngularTokenService.prototype.getAuthDataFromPostMessage = function (data) {
        var authData = {
            accessToken: data['auth_token'],
            client: data['client_id'],
            expiry: data['expiry'],
            tokenType: 'Bearer',
            uid: data['uid']
        };
        this.setAuthData(authData);
    };
    // Try to get auth data from storage.
    AngularTokenService.prototype.getAuthDataFromStorage = function () {
        var authData = {
            accessToken: this.localStorage.getItem('accessToken'),
            client: this.localStorage.getItem('client'),
            expiry: this.localStorage.getItem('expiry'),
            tokenType: this.localStorage.getItem('tokenType'),
            uid: this.localStorage.getItem('uid')
        };
        if (this.checkAuthData(authData)) {
            this.authData.next(authData);
        }
    };
    // Try to get auth data from url parameters.
    AngularTokenService.prototype.getAuthDataFromParams = function () {
        var _this = this;
        this.activatedRoute.queryParams.subscribe(function (queryParams) {
            var authData = {
                accessToken: queryParams['token'] || queryParams['auth_token'],
                client: queryParams['client_id'],
                expiry: queryParams['expiry'],
                tokenType: 'Bearer',
                uid: queryParams['uid']
            };
            if (_this.checkAuthData(authData)) {
                _this.authData.next(authData);
            }
        });
    };
    /**
     *
     * Set Auth Data
     *
     */
    // Write auth data to storage
    AngularTokenService.prototype.setAuthData = function (authData) {
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
    };
    /**
     *
     * Validate Auth Data
     *
     */
    // Check if auth data complete and if response token is newer
    AngularTokenService.prototype.checkAuthData = function (authData) {
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
    };
    /**
     *
     * OAuth
     *
     */
    AngularTokenService.prototype.requestCredentialsViaPostMessage = function (authWindow) {
        var pollerObserv = interval(500);
        var responseObserv = fromEvent(this.global, 'message').pipe(pluck('data'), filter(this.oAuthWindowResponseFilter));
        responseObserv.subscribe(this.getAuthDataFromPostMessage.bind(this));
        var pollerSubscription = pollerObserv.subscribe(function () {
            if (authWindow.closed) {
                pollerSubscription.unsubscribe();
            }
            else {
                authWindow.postMessage('requestCredentials', '*');
            }
        });
        return responseObserv;
    };
    AngularTokenService.prototype.oAuthWindowResponseFilter = function (data) {
        if (data.message === 'deliverCredentials' || data.message === 'authFailure') {
            return data;
        }
    };
    /**
     *
     * Utilities
     *
     */
    // Match user config by user config name
    AngularTokenService.prototype.getUserTypeByName = function (name) {
        if (name == null || this.options.userTypes == null) {
            return null;
        }
        return this.options.userTypes.find(function (userType) { return userType.name === name; });
    };
    AngularTokenService.ctorParameters = function () { return [
        { type: HttpClient },
        { type: undefined, decorators: [{ type: Inject, args: [ANGULAR_TOKEN_OPTIONS,] }] },
        { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
        { type: ActivatedRoute, decorators: [{ type: Optional }] },
        { type: Router, decorators: [{ type: Optional }] }
    ]; };
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
    return AngularTokenService;
}());
export { AngularTokenService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci10b2tlbi8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyLXRva2VuLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLHNCQUFzQixFQUFFLG1CQUFtQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDbkgsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVoRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQzs7Ozs7QUFzQjlEO0lBd0NFLDZCQUNVLElBQWdCLEVBQ08sTUFBVyxFQUNiLFVBQWtCLEVBQzNCLGNBQThCLEVBQzlCLE1BQWM7UUFKMUIsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUVLLGVBQVUsR0FBVixVQUFVLENBQVE7UUFDM0IsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQzlCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFaN0IsYUFBUSxHQUE4QixJQUFJLGVBQWUsQ0FBVyxJQUFJLENBQUMsQ0FBQztRQUMxRSxhQUFRLEdBQThCLElBQUksZUFBZSxDQUFXLElBQUksQ0FBQyxDQUFDO1FBQzFFLGFBQVEsR0FBOEIsSUFBSSxl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MEIsSUFBWTtRQUNwQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxFQUFFO1lBQ2xELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FDaEMsVUFBQSxRQUFRLElBQUksT0FBQSxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksRUFBdEIsQ0FBc0IsQ0FDbkMsQ0FBQztJQUNKLENBQUM7O2dCQWpsQmUsVUFBVTtnREFDdkIsTUFBTSxTQUFDLHFCQUFxQjtnQkFDWSxNQUFNLHVCQUE5QyxNQUFNLFNBQUMsV0FBVztnQkFDaUIsY0FBYyx1QkFBakQsUUFBUTtnQkFDbUIsTUFBTSx1QkFBakMsUUFBUTs7O0lBN0NBLG1CQUFtQjtRQUgvQixVQUFVLENBQUM7WUFDVixVQUFVLEVBQUUsTUFBTTtTQUNuQixDQUFDO1FBMkNHLFdBQUEsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7UUFDN0IsV0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDbkIsV0FBQSxRQUFRLEVBQUUsQ0FBQTtRQUNWLFdBQUEsUUFBUSxFQUFFLENBQUE7eUNBSkcsVUFBVSxVQUVpQixNQUFNO1lBQ1gsY0FBYztZQUN0QixNQUFNO09BN0N6QixtQkFBbUIsQ0EybkIvQjs4QkF6cEJEO0NBeXBCQyxBQTNuQkQsSUEybkJDO1NBM25CWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBPcHRpb25hbCwgSW5qZWN0LCBQTEFURk9STV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIFJvdXRlciwgQ2FuQWN0aXZhdGUsIEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIFJvdXRlclN0YXRlU25hcHNob3QgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cFJlc3BvbnNlLCBIdHRwRXJyb3JSZXNwb25zZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IGlzUGxhdGZvcm1TZXJ2ZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tRXZlbnQsIGludGVydmFsLCBCZWhhdmlvclN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHBsdWNrLCBmaWx0ZXIsIHNoYXJlLCBmaW5hbGl6ZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgQU5HVUxBUl9UT0tFTl9PUFRJT05TIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLnRva2VuJztcblxuaW1wb3J0IHtcbiAgU2lnbkluRGF0YSxcbiAgUmVnaXN0ZXJEYXRhLFxuICBVcGRhdGVQYXNzd29yZERhdGEsXG4gIFJlc2V0UGFzc3dvcmREYXRhLFxuXG4gIFVzZXJUeXBlLFxuICBVc2VyRGF0YSxcbiAgQXV0aERhdGEsXG4gIEFwaVJlc3BvbnNlLFxuXG4gIEFuZ3VsYXJUb2tlbk9wdGlvbnMsXG5cbiAgVG9rZW5QbGF0Zm9ybSxcbiAgVG9rZW5JbkFwcEJyb3dzZXIsXG59IGZyb20gJy4vYW5ndWxhci10b2tlbi5tb2RlbCc7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFyVG9rZW5TZXJ2aWNlIGltcGxlbWVudHMgQ2FuQWN0aXZhdGUge1xuXG4gIGdldCBjdXJyZW50VXNlclR5cGUoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy51c2VyVHlwZS52YWx1ZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy51c2VyVHlwZS52YWx1ZS5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjdXJyZW50VXNlckRhdGEoKTogVXNlckRhdGEge1xuICAgIHJldHVybiB0aGlzLnVzZXJEYXRhLnZhbHVlO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRBdXRoRGF0YSgpOiBBdXRoRGF0YSB7XG4gICAgcmV0dXJuIHRoaXMuYXV0aERhdGEudmFsdWU7XG4gIH1cblxuICBnZXQgYXBpQmFzZSgpOiBzdHJpbmcge1xuICAgIGNvbnNvbGUud2FybignW2FuZ3VsYXItdG9rZW5dIFRoZSBhdHRyaWJ1dGUgLmFwaUJhc2Ugd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZXh0IG1ham9yIHJlbGVhc2UsIHBsZWFzZSB1c2UnICtcbiAgICAnLnRva2VuT3B0aW9ucy5hcGlCYXNlIGluc3RlYWQnKTtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmFwaUJhc2U7XG4gIH1cblxuICBnZXQgdG9rZW5PcHRpb25zKCk6IEFuZ3VsYXJUb2tlbk9wdGlvbnMge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gIH1cblxuICBzZXQgdG9rZW5PcHRpb25zKG9wdGlvbnM6IEFuZ3VsYXJUb2tlbk9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSAoPGFueT5PYmplY3QpLmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zO1xuICBwdWJsaWMgdXNlclR5cGU6IEJlaGF2aW9yU3ViamVjdDxVc2VyVHlwZT4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFVzZXJUeXBlPihudWxsKTtcbiAgcHVibGljIGF1dGhEYXRhOiBCZWhhdmlvclN1YmplY3Q8QXV0aERhdGE+ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxBdXRoRGF0YT4obnVsbCk7XG4gIHB1YmxpYyB1c2VyRGF0YTogQmVoYXZpb3JTdWJqZWN0PFVzZXJEYXRhPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8VXNlckRhdGE+KG51bGwpO1xuICBwcml2YXRlIGdsb2JhbDogV2luZG93IHwgYW55O1xuXG4gIHByaXZhdGUgbG9jYWxTdG9yYWdlOiBTdG9yYWdlIHwgYW55ID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIEBJbmplY3QoQU5HVUxBUl9UT0tFTl9PUFRJT05TKSBjb25maWc6IGFueSxcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJvdXRlcjogUm91dGVyXG4gICkge1xuICAgIHRoaXMuZ2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHt9O1xuXG4gICAgaWYgKGlzUGxhdGZvcm1TZXJ2ZXIodGhpcy5wbGF0Zm9ybUlkKSkge1xuXG4gICAgICAvLyBCYWQgcHJhdGljZSwgbmVlZHMgZml4aW5nXG4gICAgICB0aGlzLmdsb2JhbCA9IHtcbiAgICAgICAgb3BlbjogKCk6IHZvaWQgPT4gbnVsbCxcbiAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICBocmVmOiAnLycsXG4gICAgICAgICAgb3JpZ2luOiAnLydcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gQmFkIHByYXRpY2UsIG5lZWRzIGZpeGluZ1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSA9ICgpOiB2b2lkID0+IG51bGw7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtID0gKCk6IHZvaWQgPT4gbnVsbDtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0gPSAoKTogdm9pZCA9PiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWZhdWx0T3B0aW9uczogQW5ndWxhclRva2VuT3B0aW9ucyA9IHtcbiAgICAgIGFwaVBhdGg6ICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgYXBpQmFzZTogICAgICAgICAgICAgICAgICAgIG51bGwsXG5cbiAgICAgIHNpZ25JblBhdGg6ICAgICAgICAgICAgICAgICAnYXV0aC9zaWduX2luJyxcbiAgICAgIHNpZ25JblJlZGlyZWN0OiAgICAgICAgICAgICBudWxsLFxuICAgICAgc2lnbkluU3RvcmVkVXJsU3RvcmFnZUtleTogIG51bGwsXG5cbiAgICAgIHNpZ25PdXRQYXRoOiAgICAgICAgICAgICAgICAnYXV0aC9zaWduX291dCcsXG4gICAgICB2YWxpZGF0ZVRva2VuUGF0aDogICAgICAgICAgJ2F1dGgvdmFsaWRhdGVfdG9rZW4nLFxuICAgICAgc2lnbk91dEZhaWxlZFZhbGlkYXRlOiAgICAgIGZhbHNlLFxuXG4gICAgICByZWdpc3RlckFjY291bnRQYXRoOiAgICAgICAgJ2F1dGgnLFxuICAgICAgZGVsZXRlQWNjb3VudFBhdGg6ICAgICAgICAgICdhdXRoJyxcbiAgICAgIHJlZ2lzdGVyQWNjb3VudENhbGxiYWNrOiAgICB0aGlzLmdsb2JhbC5sb2NhdGlvbi5ocmVmLFxuXG4gICAgICB1cGRhdGVQYXNzd29yZFBhdGg6ICAgICAgICAgJ2F1dGgnLFxuXG4gICAgICByZXNldFBhc3N3b3JkUGF0aDogICAgICAgICAgJ2F1dGgvcGFzc3dvcmQnLFxuICAgICAgcmVzZXRQYXNzd29yZENhbGxiYWNrOiAgICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLmhyZWYsXG5cbiAgICAgIHVzZXJUeXBlczogICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgbG9naW5GaWVsZDogICAgICAgICAgICAgICAgICdlbWFpbCcsXG5cbiAgICAgIG9BdXRoQmFzZTogICAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbC5sb2NhdGlvbi5vcmlnaW4sXG4gICAgICBvQXV0aFBhdGhzOiB7XG4gICAgICAgIGdpdGh1YjogICAgICAgICAgICAgICAgICAgJ2F1dGgvZ2l0aHViJ1xuICAgICAgfSxcbiAgICAgIG9BdXRoQ2FsbGJhY2tQYXRoOiAgICAgICAgICAnb2F1dGhfY2FsbGJhY2snLFxuICAgICAgb0F1dGhXaW5kb3dUeXBlOiAgICAgICAgICAgICduZXdXaW5kb3cnLFxuICAgICAgb0F1dGhXaW5kb3dPcHRpb25zOiAgICAgICAgIG51bGwsXG5cbiAgICAgIG9BdXRoQnJvd3NlckNhbGxiYWNrczoge1xuICAgICAgICBnaXRodWI6ICAgICAgICAgICAgICAgICAgICdhdXRoL2dpdGh1Yi9jYWxsYmFjaycsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBjb25zdCBtZXJnZWRPcHRpb25zID0gKDxhbnk+T2JqZWN0KS5hc3NpZ24oZGVmYXVsdE9wdGlvbnMsIGNvbmZpZyk7XG4gICAgdGhpcy5vcHRpb25zID0gbWVyZ2VkT3B0aW9ucztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBpQmFzZSA9PT0gbnVsbCkge1xuICAgICAgY29uc29sZS53YXJuKGBbYW5ndWxhci10b2tlbl0gWW91IGhhdmUgbm90IGNvbmZpZ3VyZWQgJ2FwaUJhc2UnLCB3aGljaCBtYXkgcmVzdWx0IGluIHNlY3VyaXR5IGlzc3Vlcy4gYCArXG4gICAgICAgICAgICAgICAgICAgYFBsZWFzZSByZWZlciB0byB0aGUgZG9jdW1lbnRhdGlvbiBhdCBodHRwczovL2dpdGh1Yi5jb20vbmVyb25pYWt5L2FuZ3VsYXItdG9rZW4vd2lraWApO1xuICAgIH1cblxuICAgIHRoaXMudHJ5TG9hZEF1dGhEYXRhKCk7XG4gIH1cblxuICB1c2VyU2lnbmVkSW4oKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuYXV0aERhdGEudmFsdWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBjYW5BY3RpdmF0ZShyb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgc3RhdGU6IFJvdXRlclN0YXRlU25hcHNob3QpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy51c2VyU2lnbmVkSW4oKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFN0b3JlIGN1cnJlbnQgbG9jYXRpb24gaW4gc3RvcmFnZSAodXNlZnVsbCBmb3IgcmVkaXJlY3Rpb24gYWZ0ZXIgc2lnbmluZyBpbilcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lnbkluU3RvcmVkVXJsU3RvcmFnZUtleSkge1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICAgIHRoaXMub3B0aW9ucy5zaWduSW5TdG9yZWRVcmxTdG9yYWdlS2V5LFxuICAgICAgICAgIHN0YXRlLnVybFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWRpcmVjdCB1c2VyIHRvIHNpZ24gaW4gaWYgc2lnbkluUmVkaXJlY3QgaXMgc2V0XG4gICAgICBpZiAodGhpcy5yb3V0ZXIgJiYgdGhpcy5vcHRpb25zLnNpZ25JblJlZGlyZWN0KSB7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFt0aGlzLm9wdGlvbnMuc2lnbkluUmVkaXJlY3RdKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIEFjdGlvbnNcbiAgICpcbiAgICovXG5cbiAgLy8gUmVnaXN0ZXIgcmVxdWVzdFxuICByZWdpc3RlckFjY291bnQocmVnaXN0ZXJEYXRhOiBSZWdpc3RlckRhdGEsIGFkZGl0aW9uYWxEYXRhPzogYW55KTogT2JzZXJ2YWJsZTxBcGlSZXNwb25zZT4ge1xuXG4gICAgcmVnaXN0ZXJEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgcmVnaXN0ZXJEYXRhKTtcblxuICAgIGlmIChyZWdpc3RlckRhdGEudXNlclR5cGUgPT0gbnVsbCkge1xuICAgICAgdGhpcy51c2VyVHlwZS5uZXh0KG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVzZXJUeXBlLm5leHQodGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShyZWdpc3RlckRhdGEudXNlclR5cGUpKTtcbiAgICAgIGRlbGV0ZSByZWdpc3RlckRhdGEudXNlclR5cGU7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgcmVnaXN0ZXJEYXRhLnBhc3N3b3JkX2NvbmZpcm1hdGlvbiA9PSBudWxsICYmXG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRDb25maXJtYXRpb24gIT0gbnVsbFxuICAgICkge1xuICAgICAgcmVnaXN0ZXJEYXRhLnBhc3N3b3JkX2NvbmZpcm1hdGlvbiA9IHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbjtcbiAgICAgIGRlbGV0ZSByZWdpc3RlckRhdGEucGFzc3dvcmRDb25maXJtYXRpb247XG4gICAgfVxuXG4gICAgaWYgKGFkZGl0aW9uYWxEYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlZ2lzdGVyRGF0YS5hZGRpdGlvbmFsRGF0YSA9IGFkZGl0aW9uYWxEYXRhO1xuICAgIH1cblxuICAgIGNvbnN0IGxvZ2luID0gcmVnaXN0ZXJEYXRhLmxvZ2luO1xuICAgIGRlbGV0ZSByZWdpc3RlckRhdGEubG9naW47XG4gICAgcmVnaXN0ZXJEYXRhW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXSA9IGxvZ2luO1xuXG4gICAgcmVnaXN0ZXJEYXRhLmNvbmZpcm1fc3VjY2Vzc191cmwgPSB0aGlzLm9wdGlvbnMucmVnaXN0ZXJBY2NvdW50Q2FsbGJhY2s7XG5cbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8QXBpUmVzcG9uc2U+KFxuICAgICAgdGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMucmVnaXN0ZXJBY2NvdW50UGF0aCwgcmVnaXN0ZXJEYXRhXG4gICAgKTtcbiAgfVxuXG4gIC8vIERlbGV0ZSBBY2NvdW50XG4gIGRlbGV0ZUFjY291bnQoKTogT2JzZXJ2YWJsZTxBcGlSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZGVsZXRlPEFwaVJlc3BvbnNlPih0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy5kZWxldGVBY2NvdW50UGF0aCk7XG4gIH1cblxuICAvLyBTaWduIGluIHJlcXVlc3QgYW5kIHNldCBzdG9yYWdlXG4gIHNpZ25JbihzaWduSW5EYXRhOiBTaWduSW5EYXRhLCBhZGRpdGlvbmFsRGF0YT86IGFueSk6IE9ic2VydmFibGU8QXBpUmVzcG9uc2U+IHtcbiAgICB0aGlzLnVzZXJUeXBlLm5leHQoKHNpZ25JbkRhdGEudXNlclR5cGUgPT0gbnVsbCkgPyBudWxsIDogdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShzaWduSW5EYXRhLnVzZXJUeXBlKSk7XG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXTogc2lnbkluRGF0YS5sb2dpbixcbiAgICAgIHBhc3N3b3JkOiBzaWduSW5EYXRhLnBhc3N3b3JkXG4gICAgfTtcblxuICAgIGlmIChhZGRpdGlvbmFsRGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBib2R5LmFkZGl0aW9uYWxEYXRhID0gYWRkaXRpb25hbERhdGE7XG4gICAgfVxuXG4gICAgY29uc3Qgb2JzZXJ2ID0gdGhpcy5odHRwLnBvc3Q8QXBpUmVzcG9uc2U+KFxuICAgICAgdGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMuc2lnbkluUGF0aCwgYm9keVxuICAgICkucGlwZShzaGFyZSgpKTtcblxuICAgIG9ic2Vydi5zdWJzY3JpYmUocmVzID0+IHRoaXMudXNlckRhdGEubmV4dChyZXMuZGF0YSkpO1xuXG4gICAgcmV0dXJuIG9ic2VydjtcbiAgfVxuXG4gIHNpZ25Jbk9BdXRoKG9BdXRoVHlwZTogc3RyaW5nLCBpbkFwcEJyb3dzZXI/OiBUb2tlbkluQXBwQnJvd3NlcjxhbnksIGFueT4sIHBsYXRmb3JtPzogVG9rZW5QbGF0Zm9ybSkge1xuXG4gICAgY29uc3Qgb0F1dGhQYXRoOiBzdHJpbmcgPSB0aGlzLmdldE9BdXRoUGF0aChvQXV0aFR5cGUpO1xuICAgIGNvbnN0IGNhbGxiYWNrVXJsID0gYCR7dGhpcy5nbG9iYWwubG9jYXRpb24ub3JpZ2lufS8ke3RoaXMub3B0aW9ucy5vQXV0aENhbGxiYWNrUGF0aH1gO1xuICAgIGNvbnN0IG9BdXRoV2luZG93VHlwZTogc3RyaW5nID0gdGhpcy5vcHRpb25zLm9BdXRoV2luZG93VHlwZTtcbiAgICBjb25zdCBhdXRoVXJsOiBzdHJpbmcgPSB0aGlzLmdldE9BdXRoVXJsKG9BdXRoUGF0aCwgY2FsbGJhY2tVcmwsIG9BdXRoV2luZG93VHlwZSk7XG5cbiAgICBpZiAob0F1dGhXaW5kb3dUeXBlID09PSAnbmV3V2luZG93JyB8fFxuICAgICAgKG9BdXRoV2luZG93VHlwZSA9PSAnaW5BcHBCcm93c2VyJyAmJiAoIXBsYXRmb3JtIHx8ICFwbGF0Zm9ybS5pcygnY29yZG92YScpIHx8ICEocGxhdGZvcm0uaXMoJ2lvcycpIHx8IHBsYXRmb3JtLmlzKCdhbmRyb2lkJykpKSkpIHtcbiAgICAgIGNvbnN0IG9BdXRoV2luZG93T3B0aW9ucyA9IHRoaXMub3B0aW9ucy5vQXV0aFdpbmRvd09wdGlvbnM7XG4gICAgICBsZXQgd2luZG93T3B0aW9ucyA9ICcnO1xuXG4gICAgICBpZiAob0F1dGhXaW5kb3dPcHRpb25zKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9BdXRoV2luZG93T3B0aW9ucykge1xuICAgICAgICAgIGlmIChvQXV0aFdpbmRvd09wdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICB3aW5kb3dPcHRpb25zICs9IGAsJHtrZXl9PSR7b0F1dGhXaW5kb3dPcHRpb25zW2tleV19YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9wdXAgPSB3aW5kb3cub3BlbihcbiAgICAgICAgICBhdXRoVXJsLFxuICAgICAgICAgICdfYmxhbmsnLFxuICAgICAgICAgIGBjbG9zZWJ1dHRvbmNhcHRpb249Q2FuY2VsJHt3aW5kb3dPcHRpb25zfWBcbiAgICAgICk7XG4gICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0Q3JlZGVudGlhbHNWaWFQb3N0TWVzc2FnZShwb3B1cCk7XG4gICAgfSBlbHNlIGlmIChvQXV0aFdpbmRvd1R5cGUgPT0gJ2luQXBwQnJvd3NlcicpIHtcbiAgICAgIGxldCBvQXV0aEJyb3dzZXJDYWxsYmFjayA9IHRoaXMub3B0aW9ucy5vQXV0aEJyb3dzZXJDYWxsYmFja3Nbb0F1dGhUeXBlXTtcbiAgICAgIGlmICghb0F1dGhCcm93c2VyQ2FsbGJhY2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUbyBsb2dpbiB3aXRoIG9BdXRoIHByb3ZpZGVyICR7b0F1dGhUeXBlfSB1c2luZyBpbkFwcEJyb3dzZXIgdGhlIGNhbGxiYWNrIChpbiBvQXV0aEJyb3dzZXJDYWxsYmFja3MpIGlzIHJlcXVpcmVkLmApO1xuICAgICAgfVxuICAgICAgLy8gbGV0IG9BdXRoV2luZG93T3B0aW9ucyA9IHRoaXMub3B0aW9ucy5vQXV0aFdpbmRvd09wdGlvbnM7XG4gICAgICAvLyBsZXQgd2luZG93T3B0aW9ucyA9ICcnO1xuXG4gICAgICAvLyAgaWYgKG9BdXRoV2luZG93T3B0aW9ucykge1xuICAgICAgLy8gICAgIGZvciAobGV0IGtleSBpbiBvQXV0aFdpbmRvd09wdGlvbnMpIHtcbiAgICAgIC8vICAgICAgICAgd2luZG93T3B0aW9ucyArPSBgLCR7a2V5fT0ke29BdXRoV2luZG93T3B0aW9uc1trZXldfWA7XG4gICAgICAvLyAgICAgfVxuICAgICAgLy8gfVxuXG4gICAgICBsZXQgYnJvd3NlciA9IGluQXBwQnJvd3Nlci5jcmVhdGUoXG4gICAgICAgICAgYXV0aFVybCxcbiAgICAgICAgICAnX2JsYW5rJyxcbiAgICAgICAgICAnbG9jYXRpb249bm8nXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyKSA9PiB7XG4gICAgICAgIGJyb3dzZXIub24oJ2xvYWRzdG9wJykuc3Vic2NyaWJlKChldjogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKGV2LnVybC5pbmRleE9mKG9BdXRoQnJvd3NlckNhbGxiYWNrKSA+IC0xKSB7XG4gICAgICAgICAgICBicm93c2VyLmV4ZWN1dGVTY3JpcHQoe2NvZGU6IFwicmVxdWVzdENyZWRlbnRpYWxzKCk7XCJ9KS50aGVuKChjcmVkZW50aWFsczogYW55KSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tUG9zdE1lc3NhZ2UoY3JlZGVudGlhbHNbMF0pO1xuXG4gICAgICAgICAgICAgIGxldCBwb2xsZXJPYnNlcnYgPSBpbnRlcnZhbCg0MDApO1xuXG4gICAgICAgICAgICAgIGxldCBwb2xsZXJTdWJzY3JpcHRpb24gPSBwb2xsZXJPYnNlcnYuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51c2VyU2lnbmVkSW4oKSkge1xuICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh0aGlzLmF1dGhEYXRhKTtcbiAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG5cbiAgICAgICAgICAgICAgICAgIHBvbGxlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgICAgYnJvd3Nlci5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSwgKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChvQXV0aFdpbmRvd1R5cGUgPT09ICdzYW1lV2luZG93Jykge1xuICAgICAgdGhpcy5nbG9iYWwubG9jYXRpb24uaHJlZiA9IGF1dGhVcmw7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIG9BdXRoV2luZG93VHlwZSBcIiR7b0F1dGhXaW5kb3dUeXBlfVwiYCk7XG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzc09BdXRoQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5nZXRBdXRoRGF0YUZyb21QYXJhbXMoKTtcbiAgfVxuXG4gIC8vIFNpZ24gb3V0IHJlcXVlc3QgYW5kIGRlbGV0ZSBzdG9yYWdlXG4gIHNpZ25PdXQoKTogT2JzZXJ2YWJsZTxBcGlSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZGVsZXRlPEFwaVJlc3BvbnNlPih0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy5zaWduT3V0UGF0aClcbiAgICAgIC8vIE9ubHkgcmVtb3ZlIHRoZSBsb2NhbFN0b3JhZ2UgYW5kIGNsZWFyIHRoZSBkYXRhIGFmdGVyIHRoZSBjYWxsXG4gICAgICAucGlwZShcbiAgICAgICAgZmluYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnYWNjZXNzVG9rZW4nKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NsaWVudCcpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZXhwaXJ5Jyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlblR5cGUnKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VpZCcpO1xuXG4gICAgICAgICAgICB0aGlzLmF1dGhEYXRhLm5leHQobnVsbCk7XG4gICAgICAgICAgICB0aGlzLnVzZXJUeXBlLm5leHQobnVsbCk7XG4gICAgICAgICAgICB0aGlzLnVzZXJEYXRhLm5leHQobnVsbCk7XG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICApO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgdG9rZW4gcmVxdWVzdFxuICB2YWxpZGF0ZVRva2VuKCk6IE9ic2VydmFibGU8QXBpUmVzcG9uc2U+IHtcbiAgICBjb25zdCBvYnNlcnYgPSB0aGlzLmh0dHAuZ2V0PEFwaVJlc3BvbnNlPihcbiAgICAgIHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnZhbGlkYXRlVG9rZW5QYXRoXG4gICAgKS5waXBlKHNoYXJlKCkpO1xuXG4gICAgb2JzZXJ2LnN1YnNjcmliZShcbiAgICAgIChyZXMpID0+IHRoaXMudXNlckRhdGEubmV4dChyZXMuZGF0YSksXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgaWYgKGVycm9yLnN0YXR1cyA9PT0gNDAxICYmIHRoaXMub3B0aW9ucy5zaWduT3V0RmFpbGVkVmFsaWRhdGUpIHtcbiAgICAgICAgICB0aGlzLnNpZ25PdXQoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9ic2VydjtcbiAgfVxuXG4gIC8vIFVwZGF0ZSBwYXNzd29yZCByZXF1ZXN0XG4gIHVwZGF0ZVBhc3N3b3JkKHVwZGF0ZVBhc3N3b3JkRGF0YTogVXBkYXRlUGFzc3dvcmREYXRhKTogT2JzZXJ2YWJsZTxBcGlSZXNwb25zZT4ge1xuXG4gICAgaWYgKHVwZGF0ZVBhc3N3b3JkRGF0YS51c2VyVHlwZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLnVzZXJUeXBlLm5leHQodGhpcy5nZXRVc2VyVHlwZUJ5TmFtZSh1cGRhdGVQYXNzd29yZERhdGEudXNlclR5cGUpKTtcbiAgICB9XG5cbiAgICBsZXQgYXJnczogYW55O1xuXG4gICAgaWYgKHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZEN1cnJlbnQgPT0gbnVsbCkge1xuICAgICAgYXJncyA9IHtcbiAgICAgICAgcGFzc3dvcmQ6ICAgICAgICAgICAgICAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkLFxuICAgICAgICBwYXNzd29yZF9jb25maXJtYXRpb246ICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDb25maXJtYXRpb25cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3MgPSB7XG4gICAgICAgIGN1cnJlbnRfcGFzc3dvcmQ6ICAgICAgIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZEN1cnJlbnQsXG4gICAgICAgIHBhc3N3b3JkOiAgICAgICAgICAgICAgIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZCxcbiAgICAgICAgcGFzc3dvcmRfY29uZmlybWF0aW9uOiAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICh1cGRhdGVQYXNzd29yZERhdGEucmVzZXRQYXNzd29yZFRva2VuKSB7XG4gICAgICBhcmdzLnJlc2V0X3Bhc3N3b3JkX3Rva2VuID0gdXBkYXRlUGFzc3dvcmREYXRhLnJlc2V0UGFzc3dvcmRUb2tlbjtcbiAgICB9XG5cbiAgICBjb25zdCBib2R5ID0gYXJncztcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dDxBcGlSZXNwb25zZT4odGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMudXBkYXRlUGFzc3dvcmRQYXRoLCBib2R5KTtcbiAgfVxuXG4gIC8vIFJlc2V0IHBhc3N3b3JkIHJlcXVlc3RcbiAgcmVzZXRQYXNzd29yZChyZXNldFBhc3N3b3JkRGF0YTogUmVzZXRQYXNzd29yZERhdGEsIGFkZGl0aW9uYWxEYXRhPzogYW55KTogT2JzZXJ2YWJsZTxBcGlSZXNwb25zZT4ge1xuICAgIFxuICAgIFxuICAgIGlmIChhZGRpdGlvbmFsRGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXNldFBhc3N3b3JkRGF0YS5hZGRpdGlvbmFsRGF0YSA9IGFkZGl0aW9uYWxEYXRhO1xuICAgIH1cblxuICAgIHRoaXMudXNlclR5cGUubmV4dChcbiAgICAgIChyZXNldFBhc3N3b3JkRGF0YS51c2VyVHlwZSA9PSBudWxsKSA/IG51bGwgOiB0aGlzLmdldFVzZXJUeXBlQnlOYW1lKHJlc2V0UGFzc3dvcmREYXRhLnVzZXJUeXBlKVxuICAgICk7XG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXTogcmVzZXRQYXNzd29yZERhdGEubG9naW4sXG4gICAgICByZWRpcmVjdF91cmw6IHRoaXMub3B0aW9ucy5yZXNldFBhc3N3b3JkQ2FsbGJhY2tcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PEFwaVJlc3BvbnNlPih0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy5yZXNldFBhc3N3b3JkUGF0aCwgYm9keSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBDb25zdHJ1Y3QgUGF0aHMgLyBVcmxzXG4gICAqXG4gICAqL1xuXG4gIHByaXZhdGUgZ2V0VXNlclBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXMudXNlclR5cGUudmFsdWUgPT0gbnVsbCkgPyAnJyA6IHRoaXMudXNlclR5cGUudmFsdWUucGF0aCArICcvJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0QXBpUGF0aCgpOiBzdHJpbmcge1xuICAgIGxldCBjb25zdHJ1Y3RlZFBhdGggPSAnJztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBpQmFzZSAhPSBudWxsKSB7XG4gICAgICBjb25zdHJ1Y3RlZFBhdGggKz0gdGhpcy5vcHRpb25zLmFwaUJhc2UgKyAnLyc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcGlQYXRoICE9IG51bGwpIHtcbiAgICAgIGNvbnN0cnVjdGVkUGF0aCArPSB0aGlzLm9wdGlvbnMuYXBpUGF0aCArICcvJztcbiAgICB9XG5cbiAgICByZXR1cm4gY29uc3RydWN0ZWRQYXRoO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRTZXJ2ZXJQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QXBpUGF0aCgpICsgdGhpcy5nZXRVc2VyUGF0aCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRPQXV0aFBhdGgob0F1dGhUeXBlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBvQXV0aFBhdGg6IHN0cmluZztcblxuICAgIG9BdXRoUGF0aCA9IHRoaXMub3B0aW9ucy5vQXV0aFBhdGhzW29BdXRoVHlwZV07XG5cbiAgICBpZiAob0F1dGhQYXRoID09IG51bGwpIHtcbiAgICAgIG9BdXRoUGF0aCA9IGAvYXV0aC8ke29BdXRoVHlwZX1gO1xuICAgIH1cblxuICAgIHJldHVybiBvQXV0aFBhdGg7XG4gIH1cblxuICBwcml2YXRlIGdldE9BdXRoVXJsKG9BdXRoUGF0aDogc3RyaW5nLCBjYWxsYmFja1VybDogc3RyaW5nLCB3aW5kb3dUeXBlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCB1cmw6IHN0cmluZztcblxuICAgIHVybCA9ICAgYCR7dGhpcy5vcHRpb25zLm9BdXRoQmFzZX0vJHtvQXV0aFBhdGh9YDtcbiAgICB1cmwgKz0gIGA/b21uaWF1dGhfd2luZG93X3R5cGU9JHt3aW5kb3dUeXBlfWA7XG4gICAgdXJsICs9ICBgJmF1dGhfb3JpZ2luX3VybD0ke2VuY29kZVVSSUNvbXBvbmVudChjYWxsYmFja1VybCl9YDtcblxuICAgIGlmICh0aGlzLnVzZXJUeXBlLnZhbHVlICE9IG51bGwpIHtcbiAgICAgIHVybCArPSBgJnJlc291cmNlX2NsYXNzPSR7dGhpcy51c2VyVHlwZS52YWx1ZS5uYW1lfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIEdldCBBdXRoIERhdGFcbiAgICpcbiAgICovXG5cbiAgLy8gVHJ5IHRvIGxvYWQgYXV0aCBkYXRhXG4gIHByaXZhdGUgdHJ5TG9hZEF1dGhEYXRhKCk6IHZvaWQge1xuXG4gICAgY29uc3QgdXNlclR5cGUgPSB0aGlzLmdldFVzZXJUeXBlQnlOYW1lKHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJUeXBlJykpO1xuXG4gICAgaWYgKHVzZXJUeXBlKSB7XG4gICAgICB0aGlzLnVzZXJUeXBlLm5leHQodXNlclR5cGUpO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tU3RvcmFnZSgpO1xuXG4gICAgaWYgKHRoaXMuYWN0aXZhdGVkUm91dGUpIHtcbiAgICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tUGFyYW1zKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYXV0aERhdGEpIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZVRva2VuKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gUGFyc2UgQXV0aCBkYXRhIGZyb20gcmVzcG9uc2VcbiAgcHVibGljIGdldEF1dGhIZWFkZXJzRnJvbVJlc3BvbnNlKGRhdGE6IEh0dHBSZXNwb25zZTxhbnk+IHwgSHR0cEVycm9yUmVzcG9uc2UpOiB2b2lkIHtcbiAgICBjb25zdCBoZWFkZXJzID0gZGF0YS5oZWFkZXJzO1xuXG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIGhlYWRlcnMuZ2V0KCdhY2Nlc3MtdG9rZW4nKSxcbiAgICAgIGNsaWVudDogICAgICAgICBoZWFkZXJzLmdldCgnY2xpZW50JyksXG4gICAgICBleHBpcnk6ICAgICAgICAgaGVhZGVycy5nZXQoJ2V4cGlyeScpLFxuICAgICAgdG9rZW5UeXBlOiAgICAgIGhlYWRlcnMuZ2V0KCd0b2tlbi10eXBlJyksXG4gICAgICB1aWQ6ICAgICAgICAgICAgaGVhZGVycy5nZXQoJ3VpZCcpXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QXV0aERhdGEoYXV0aERhdGEpO1xuICB9XG5cbiAgLy8gUGFyc2UgQXV0aCBkYXRhIGZyb20gcG9zdCBtZXNzYWdlXG4gIHByaXZhdGUgZ2V0QXV0aERhdGFGcm9tUG9zdE1lc3NhZ2UoZGF0YTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIGRhdGFbJ2F1dGhfdG9rZW4nXSxcbiAgICAgIGNsaWVudDogICAgICAgICBkYXRhWydjbGllbnRfaWQnXSxcbiAgICAgIGV4cGlyeTogICAgICAgICBkYXRhWydleHBpcnknXSxcbiAgICAgIHRva2VuVHlwZTogICAgICAnQmVhcmVyJyxcbiAgICAgIHVpZDogICAgICAgICAgICBkYXRhWyd1aWQnXVxuICAgIH07XG5cbiAgICB0aGlzLnNldEF1dGhEYXRhKGF1dGhEYXRhKTtcbiAgfVxuXG4gIC8vIFRyeSB0byBnZXQgYXV0aCBkYXRhIGZyb20gc3RvcmFnZS5cbiAgcHVibGljIGdldEF1dGhEYXRhRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG5cbiAgICBjb25zdCBhdXRoRGF0YTogQXV0aERhdGEgPSB7XG4gICAgICBhY2Nlc3NUb2tlbjogICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYWNjZXNzVG9rZW4nKSxcbiAgICAgIGNsaWVudDogICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjbGllbnQnKSxcbiAgICAgIGV4cGlyeTogICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdleHBpcnknKSxcbiAgICAgIHRva2VuVHlwZTogICAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlblR5cGUnKSxcbiAgICAgIHVpZDogICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1aWQnKVxuICAgIH07XG5cbiAgICBpZiAodGhpcy5jaGVja0F1dGhEYXRhKGF1dGhEYXRhKSkge1xuICAgICAgdGhpcy5hdXRoRGF0YS5uZXh0KGF1dGhEYXRhKTtcbiAgICB9XG4gIH1cblxuICAvLyBUcnkgdG8gZ2V0IGF1dGggZGF0YSBmcm9tIHVybCBwYXJhbWV0ZXJzLlxuICBwcml2YXRlIGdldEF1dGhEYXRhRnJvbVBhcmFtcygpOiB2b2lkIHtcbiAgICB0aGlzLmFjdGl2YXRlZFJvdXRlLnF1ZXJ5UGFyYW1zLnN1YnNjcmliZShxdWVyeVBhcmFtcyA9PiB7XG4gICAgICBjb25zdCBhdXRoRGF0YTogQXV0aERhdGEgPSB7XG4gICAgICAgIGFjY2Vzc1Rva2VuOiAgICBxdWVyeVBhcmFtc1sndG9rZW4nXSB8fCBxdWVyeVBhcmFtc1snYXV0aF90b2tlbiddLFxuICAgICAgICBjbGllbnQ6ICAgICAgICAgcXVlcnlQYXJhbXNbJ2NsaWVudF9pZCddLFxuICAgICAgICBleHBpcnk6ICAgICAgICAgcXVlcnlQYXJhbXNbJ2V4cGlyeSddLFxuICAgICAgICB0b2tlblR5cGU6ICAgICAgJ0JlYXJlcicsXG4gICAgICAgIHVpZDogICAgICAgICAgICBxdWVyeVBhcmFtc1sndWlkJ11cbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLmNoZWNrQXV0aERhdGEoYXV0aERhdGEpKSB7XG4gICAgICAgIHRoaXMuYXV0aERhdGEubmV4dChhdXRoRGF0YSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogU2V0IEF1dGggRGF0YVxuICAgKlxuICAgKi9cblxuICAvLyBXcml0ZSBhdXRoIGRhdGEgdG8gc3RvcmFnZVxuICBwcml2YXRlIHNldEF1dGhEYXRhKGF1dGhEYXRhOiBBdXRoRGF0YSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNoZWNrQXV0aERhdGEoYXV0aERhdGEpKSB7XG5cbiAgICAgIHRoaXMuYXV0aERhdGEubmV4dChhdXRoRGF0YSk7XG5cbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FjY2Vzc1Rva2VuJywgYXV0aERhdGEuYWNjZXNzVG9rZW4pO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY2xpZW50JywgYXV0aERhdGEuY2xpZW50KTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2V4cGlyeScsIGF1dGhEYXRhLmV4cGlyeSk7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b2tlblR5cGUnLCBhdXRoRGF0YS50b2tlblR5cGUpO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndWlkJywgYXV0aERhdGEudWlkKTtcblxuICAgICAgaWYgKHRoaXMudXNlclR5cGUudmFsdWUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VyVHlwZScsIHRoaXMudXNlclR5cGUudmFsdWUubmFtZSk7XG4gICAgICB9XG5cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBWYWxpZGF0ZSBBdXRoIERhdGFcbiAgICpcbiAgICovXG5cbiAgLy8gQ2hlY2sgaWYgYXV0aCBkYXRhIGNvbXBsZXRlIGFuZCBpZiByZXNwb25zZSB0b2tlbiBpcyBuZXdlclxuICBwcml2YXRlIGNoZWNrQXV0aERhdGEoYXV0aERhdGE6IEF1dGhEYXRhKTogYm9vbGVhbiB7XG5cbiAgICBpZiAoXG4gICAgICBhdXRoRGF0YS5hY2Nlc3NUb2tlbiAhPSBudWxsICYmXG4gICAgICBhdXRoRGF0YS5jbGllbnQgIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEuZXhwaXJ5ICE9IG51bGwgJiZcbiAgICAgIGF1dGhEYXRhLnRva2VuVHlwZSAhPSBudWxsICYmXG4gICAgICBhdXRoRGF0YS51aWQgIT0gbnVsbFxuICAgICkge1xuICAgICAgaWYgKHRoaXMuYXV0aERhdGEudmFsdWUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYXV0aERhdGEuZXhwaXJ5ID49IHRoaXMuYXV0aERhdGEudmFsdWUuZXhwaXJ5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIE9BdXRoXG4gICAqXG4gICAqL1xuXG4gIHByaXZhdGUgcmVxdWVzdENyZWRlbnRpYWxzVmlhUG9zdE1lc3NhZ2UoYXV0aFdpbmRvdzogYW55KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBwb2xsZXJPYnNlcnYgPSBpbnRlcnZhbCg1MDApO1xuXG4gICAgY29uc3QgcmVzcG9uc2VPYnNlcnYgPSBmcm9tRXZlbnQodGhpcy5nbG9iYWwsICdtZXNzYWdlJykucGlwZShcbiAgICAgIHBsdWNrKCdkYXRhJyksXG4gICAgICBmaWx0ZXIodGhpcy5vQXV0aFdpbmRvd1Jlc3BvbnNlRmlsdGVyKVxuICAgICk7XG5cbiAgICByZXNwb25zZU9ic2Vydi5zdWJzY3JpYmUoXG4gICAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVBvc3RNZXNzYWdlLmJpbmQodGhpcylcbiAgICApO1xuXG4gICAgY29uc3QgcG9sbGVyU3Vic2NyaXB0aW9uID0gcG9sbGVyT2JzZXJ2LnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAoYXV0aFdpbmRvdy5jbG9zZWQpIHtcbiAgICAgICAgcG9sbGVyU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdXRoV2luZG93LnBvc3RNZXNzYWdlKCdyZXF1ZXN0Q3JlZGVudGlhbHMnLCAnKicpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlT2JzZXJ2O1xuICB9XG5cbiAgcHJpdmF0ZSBvQXV0aFdpbmRvd1Jlc3BvbnNlRmlsdGVyKGRhdGE6IGFueSk6IGFueSB7XG4gICAgaWYgKGRhdGEubWVzc2FnZSA9PT0gJ2RlbGl2ZXJDcmVkZW50aWFscycgfHwgZGF0YS5tZXNzYWdlID09PSAnYXV0aEZhaWx1cmUnKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBVdGlsaXRpZXNcbiAgICpcbiAgICovXG5cbiAgLy8gTWF0Y2ggdXNlciBjb25maWcgYnkgdXNlciBjb25maWcgbmFtZVxuICBwcml2YXRlIGdldFVzZXJUeXBlQnlOYW1lKG5hbWU6IHN0cmluZyk6IFVzZXJUeXBlIHtcbiAgICBpZiAobmFtZSA9PSBudWxsIHx8IHRoaXMub3B0aW9ucy51c2VyVHlwZXMgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VyVHlwZXMuZmluZChcbiAgICAgIHVzZXJUeXBlID0+IHVzZXJUeXBlLm5hbWUgPT09IG5hbWVcbiAgICApO1xuICB9XG59XG4iXX0=