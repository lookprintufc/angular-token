(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/router'), require('@angular/common/http'), require('@angular/common'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('angular-token', ['exports', '@angular/core', '@angular/router', '@angular/common/http', '@angular/common', 'rxjs', 'rxjs/operators'], factory) :
    (global = global || self, factory(global['angular-token'] = {}, global.ng.core, global.ng.router, global.ng.common.http, global.ng.common, global.rxjs, global.rxjs.operators));
}(this, (function (exports, core, router, http, common, rxjs, operators) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __exportStar(m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var ANGULAR_TOKEN_OPTIONS = new core.InjectionToken('ANGULAR_TOKEN_OPTIONS');

    var AngularTokenService = /** @class */ (function () {
        function AngularTokenService(http, config, platformId, activatedRoute, router) {
            this.http = http;
            this.platformId = platformId;
            this.activatedRoute = activatedRoute;
            this.router = router;
            this.userType = new rxjs.BehaviorSubject(null);
            this.authData = new rxjs.BehaviorSubject(null);
            this.userData = new rxjs.BehaviorSubject(null);
            this.localStorage = {};
            this.global = (typeof window !== 'undefined') ? window : {};
            if (common.isPlatformServer(this.platformId)) {
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
            var observ = this.http.post(this.getServerPath() + this.options.signInPath, body).pipe(operators.share());
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
                return new rxjs.Observable(function (observer) {
                    browser_1.on('loadstop').subscribe(function (ev) {
                        if (ev.url.indexOf(oAuthBrowserCallback_1) > -1) {
                            browser_1.executeScript({ code: "requestCredentials();" }).then(function (credentials) {
                                _this.getAuthDataFromPostMessage(credentials[0]);
                                var pollerObserv = rxjs.interval(400);
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
                .pipe(operators.finalize(function () {
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
            var observ = this.http.get(this.getServerPath() + this.options.validateTokenPath).pipe(operators.share());
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
            var pollerObserv = rxjs.interval(500);
            var responseObserv = rxjs.fromEvent(this.global, 'message').pipe(operators.pluck('data'), operators.filter(this.oAuthWindowResponseFilter));
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
            { type: http.HttpClient },
            { type: undefined, decorators: [{ type: core.Inject, args: [ANGULAR_TOKEN_OPTIONS,] }] },
            { type: Object, decorators: [{ type: core.Inject, args: [core.PLATFORM_ID,] }] },
            { type: router.ActivatedRoute, decorators: [{ type: core.Optional }] },
            { type: router.Router, decorators: [{ type: core.Optional }] }
        ]; };
        AngularTokenService.ɵprov = core.ɵɵdefineInjectable({ factory: function AngularTokenService_Factory() { return new AngularTokenService(core.ɵɵinject(http.HttpClient), core.ɵɵinject(ANGULAR_TOKEN_OPTIONS), core.ɵɵinject(core.PLATFORM_ID), core.ɵɵinject(router.ActivatedRoute, 8), core.ɵɵinject(router.Router, 8)); }, token: AngularTokenService, providedIn: "root" });
        AngularTokenService = __decorate([
            core.Injectable({
                providedIn: 'root',
            }),
            __param(1, core.Inject(ANGULAR_TOKEN_OPTIONS)),
            __param(2, core.Inject(core.PLATFORM_ID)),
            __param(3, core.Optional()),
            __param(4, core.Optional()),
            __metadata("design:paramtypes", [http.HttpClient, Object, Object,
                router.ActivatedRoute,
                router.Router])
        ], AngularTokenService);
        return AngularTokenService;
    }());

    var AngularTokenInterceptor = /** @class */ (function () {
        function AngularTokenInterceptor(tokenService) {
            this.tokenService = tokenService;
        }
        AngularTokenInterceptor.prototype.intercept = function (req, next) {
            var _this = this;
            // Get auth data from local storage
            this.tokenService.getAuthDataFromStorage();
            // Add the headers if the request is going to the configured server
            var authData = this.tokenService.authData.value;
            if (authData &&
                (this.tokenService.tokenOptions.apiBase === null || req.url.match(this.tokenService.tokenOptions.apiBase))) {
                var headers = {
                    'access-token': authData.accessToken,
                    'client': authData.client,
                    'expiry': authData.expiry,
                    'token-type': authData.tokenType,
                    'uid': authData.uid
                };
                req = req.clone({
                    setHeaders: headers
                });
            }
            return next.handle(req).pipe(operators.tap(function (res) { return _this.handleResponse(res); }, function (err) { return _this.handleResponse(err); }));
        };
        // Parse Auth data from response
        AngularTokenInterceptor.prototype.handleResponse = function (res) {
            if (res instanceof http.HttpResponse || res instanceof http.HttpErrorResponse) {
                if (this.tokenService.tokenOptions.apiBase === null || (res.url && res.url.match(this.tokenService.tokenOptions.apiBase))) {
                    this.tokenService.getAuthHeadersFromResponse(res);
                }
            }
        };
        AngularTokenInterceptor.ctorParameters = function () { return [
            { type: AngularTokenService }
        ]; };
        AngularTokenInterceptor = __decorate([
            core.Injectable(),
            __metadata("design:paramtypes", [AngularTokenService])
        ], AngularTokenInterceptor);
        return AngularTokenInterceptor;
    }());

    var AngularTokenModule = /** @class */ (function () {
        function AngularTokenModule(parentModule) {
            if (parentModule) {
                throw new Error('AngularToken is already loaded. It should only be imported in your application\'s main module.');
            }
        }
        AngularTokenModule_1 = AngularTokenModule;
        AngularTokenModule.forRoot = function (options) {
            return {
                ngModule: AngularTokenModule_1,
                providers: [
                    {
                        provide: http.HTTP_INTERCEPTORS,
                        useClass: AngularTokenInterceptor,
                        multi: true
                    },
                    options.angularTokenOptionsProvider ||
                        {
                            provide: ANGULAR_TOKEN_OPTIONS,
                            useValue: options
                        }
                ]
            };
        };
        var AngularTokenModule_1;
        AngularTokenModule.ctorParameters = function () { return [
            { type: AngularTokenModule, decorators: [{ type: core.Optional }, { type: core.SkipSelf }] }
        ]; };
        AngularTokenModule = AngularTokenModule_1 = __decorate([
            core.NgModule(),
            __param(0, core.Optional()), __param(0, core.SkipSelf()),
            __metadata("design:paramtypes", [AngularTokenModule])
        ], AngularTokenModule);
        return AngularTokenModule;
    }());

    exports.ANGULAR_TOKEN_OPTIONS = ANGULAR_TOKEN_OPTIONS;
    exports.AngularTokenModule = AngularTokenModule;
    exports.AngularTokenService = AngularTokenService;
    exports.ɵa = AngularTokenService;
    exports.ɵb = AngularTokenInterceptor;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-token.umd.js.map
