import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { AngularTokenService } from './angular-token.service';
import { tap } from 'rxjs/operators';
let AngularTokenInterceptor = class AngularTokenInterceptor {
    constructor(tokenService) {
        this.tokenService = tokenService;
    }
    intercept(req, next) {
        // Get auth data from local storage
        this.tokenService.getAuthDataFromStorage();
        // Add the headers if the request is going to the configured server
        const authData = this.tokenService.authData.value;
        if (authData &&
            (this.tokenService.tokenOptions.apiBase === null || req.url.match(this.tokenService.tokenOptions.apiBase))) {
            const headers = {
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
        return next.handle(req).pipe(tap(res => this.handleResponse(res), err => this.handleResponse(err)));
    }
    // Parse Auth data from response
    handleResponse(res) {
        if (res instanceof HttpResponse || res instanceof HttpErrorResponse) {
            if (this.tokenService.tokenOptions.apiBase === null || (res.url && res.url.match(this.tokenService.tokenOptions.apiBase))) {
                this.tokenService.getAuthHeadersFromResponse(res);
            }
        }
    }
};
AngularTokenInterceptor.ctorParameters = () => [
    { type: AngularTokenService }
];
AngularTokenInterceptor = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AngularTokenService])
], AngularTokenInterceptor);
export { AngularTokenInterceptor };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItdG9rZW4vIiwic291cmNlcyI6WyJsaWIvYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQXdELFlBQVksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTdILE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRzlELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUdyQyxJQUFhLHVCQUF1QixHQUFwQyxNQUFhLHVCQUF1QjtJQUVsQyxZQUFxQixZQUFpQztRQUFqQyxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7SUFBSyxDQUFDO0lBRTVELFNBQVMsQ0FBQyxHQUFxQixFQUFFLElBQWlCO1FBRWhELG1DQUFtQztRQUNuQyxJQUFJLENBQUMsWUFBWSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFFM0MsbUVBQW1FO1FBQ25FLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUVsRCxJQUFJLFFBQVE7WUFDVixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLE9BQU8sS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTtZQUU1RyxNQUFNLE9BQU8sR0FBRztnQkFDZCxjQUFjLEVBQUUsUUFBUSxDQUFDLFdBQVc7Z0JBQ3BDLFFBQVEsRUFBUSxRQUFRLENBQUMsTUFBTTtnQkFDL0IsUUFBUSxFQUFRLFFBQVEsQ0FBQyxNQUFNO2dCQUMvQixZQUFZLEVBQUksUUFBUSxDQUFDLFNBQVM7Z0JBQ2xDLEtBQUssRUFBVyxRQUFRLENBQUMsR0FBRzthQUM3QixDQUFDO1lBRUYsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQ2QsVUFBVSxFQUFFLE9BQU87YUFDcEIsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDNUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUMvQixHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQ2xDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRCxnQ0FBZ0M7SUFDeEIsY0FBYyxDQUFDLEdBQTJEO1FBQ2hGLElBQUksR0FBRyxZQUFZLFlBQVksSUFBSSxHQUFHLFlBQVksaUJBQWlCLEVBQUU7WUFDbkUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFO2dCQUN6SCxJQUFJLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ25EO1NBQ0Y7SUFDSCxDQUFDO0NBQ0YsQ0FBQTs7WUF6Q29DLG1CQUFtQjs7QUFGM0MsdUJBQXVCO0lBRG5DLFVBQVUsRUFBRTtxQ0FHd0IsbUJBQW1CO0dBRjNDLHVCQUF1QixDQTJDbkM7U0EzQ1ksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cEV2ZW50LCBIdHRwUmVxdWVzdCwgSHR0cEludGVyY2VwdG9yLCBIdHRwSGFuZGxlciwgSHR0cFJlc3BvbnNlLCBIdHRwRXJyb3JSZXNwb25zZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHsgQW5ndWxhclRva2VuU2VydmljZSB9IGZyb20gJy4vYW5ndWxhci10b2tlbi5zZXJ2aWNlJztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhclRva2VuSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuXG4gIGNvbnN0cnVjdG9yKCBwcml2YXRlIHRva2VuU2VydmljZTogQW5ndWxhclRva2VuU2VydmljZSApIHsgfVxuXG4gIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuXG4gICAgLy8gR2V0IGF1dGggZGF0YSBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICB0aGlzLnRva2VuU2VydmljZS5nZXRBdXRoRGF0YUZyb21TdG9yYWdlKCk7XG5cbiAgICAvLyBBZGQgdGhlIGhlYWRlcnMgaWYgdGhlIHJlcXVlc3QgaXMgZ29pbmcgdG8gdGhlIGNvbmZpZ3VyZWQgc2VydmVyXG4gICAgY29uc3QgYXV0aERhdGEgPSB0aGlzLnRva2VuU2VydmljZS5hdXRoRGF0YS52YWx1ZTtcblxuICAgIGlmIChhdXRoRGF0YSAmJlxuICAgICAgKHRoaXMudG9rZW5TZXJ2aWNlLnRva2VuT3B0aW9ucy5hcGlCYXNlID09PSBudWxsIHx8IHJlcS51cmwubWF0Y2godGhpcy50b2tlblNlcnZpY2UudG9rZW5PcHRpb25zLmFwaUJhc2UpKSkge1xuXG4gICAgICBjb25zdCBoZWFkZXJzID0ge1xuICAgICAgICAnYWNjZXNzLXRva2VuJzogYXV0aERhdGEuYWNjZXNzVG9rZW4sXG4gICAgICAgICdjbGllbnQnOiAgICAgICBhdXRoRGF0YS5jbGllbnQsXG4gICAgICAgICdleHBpcnknOiAgICAgICBhdXRoRGF0YS5leHBpcnksXG4gICAgICAgICd0b2tlbi10eXBlJzogICBhdXRoRGF0YS50b2tlblR5cGUsXG4gICAgICAgICd1aWQnOiAgICAgICAgICBhdXRoRGF0YS51aWRcbiAgICAgIH07XG5cbiAgICAgIHJlcSA9IHJlcS5jbG9uZSh7XG4gICAgICAgIHNldEhlYWRlcnM6IGhlYWRlcnNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpLnBpcGUodGFwKFxuICAgICAgICByZXMgPT4gdGhpcy5oYW5kbGVSZXNwb25zZShyZXMpLFxuICAgICAgICBlcnIgPT4gdGhpcy5oYW5kbGVSZXNwb25zZShlcnIpXG4gICAgKSk7XG4gIH1cblxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHJlc3BvbnNlXG4gIHByaXZhdGUgaGFuZGxlUmVzcG9uc2UocmVzOiBIdHRwUmVzcG9uc2U8YW55PiB8IEh0dHBFcnJvclJlc3BvbnNlIHwgSHR0cEV2ZW50PGFueT4pOiB2b2lkIHtcbiAgICBpZiAocmVzIGluc3RhbmNlb2YgSHR0cFJlc3BvbnNlIHx8IHJlcyBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlKSB7XG4gICAgICBpZiAodGhpcy50b2tlblNlcnZpY2UudG9rZW5PcHRpb25zLmFwaUJhc2UgPT09IG51bGwgfHwgKHJlcy51cmwgJiYgcmVzLnVybC5tYXRjaCh0aGlzLnRva2VuU2VydmljZS50b2tlbk9wdGlvbnMuYXBpQmFzZSkpKSB7XG4gICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmdldEF1dGhIZWFkZXJzRnJvbVJlc3BvbnNlKHJlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=