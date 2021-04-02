import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { AngularTokenService } from './angular-token.service';
import { tap } from 'rxjs/operators';
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
        return next.handle(req).pipe(tap(function (res) { return _this.handleResponse(res); }, function (err) { return _this.handleResponse(err); }));
    };
    // Parse Auth data from response
    AngularTokenInterceptor.prototype.handleResponse = function (res) {
        if (res instanceof HttpResponse || res instanceof HttpErrorResponse) {
            if (this.tokenService.tokenOptions.apiBase === null || (res.url && res.url.match(this.tokenService.tokenOptions.apiBase))) {
                this.tokenService.getAuthHeadersFromResponse(res);
            }
        }
    };
    AngularTokenInterceptor.ctorParameters = function () { return [
        { type: AngularTokenService }
    ]; };
    AngularTokenInterceptor = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [AngularTokenService])
    ], AngularTokenInterceptor);
    return AngularTokenInterceptor;
}());
export { AngularTokenInterceptor };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItdG9rZW4vIiwic291cmNlcyI6WyJsaWIvYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQXdELFlBQVksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTdILE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRzlELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUdyQztJQUVFLGlDQUFxQixZQUFpQztRQUFqQyxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7SUFBSyxDQUFDO0lBRTVELDJDQUFTLEdBQVQsVUFBVSxHQUFxQixFQUFFLElBQWlCO1FBQWxELGlCQTRCQztRQTFCQyxtQ0FBbUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBRTNDLG1FQUFtRTtRQUNuRSxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFFbEQsSUFBSSxRQUFRO1lBQ1YsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7WUFFNUcsSUFBTSxPQUFPLEdBQUc7Z0JBQ2QsY0FBYyxFQUFFLFFBQVEsQ0FBQyxXQUFXO2dCQUNwQyxRQUFRLEVBQVEsUUFBUSxDQUFDLE1BQU07Z0JBQy9CLFFBQVEsRUFBUSxRQUFRLENBQUMsTUFBTTtnQkFDL0IsWUFBWSxFQUFJLFFBQVEsQ0FBQyxTQUFTO2dCQUNsQyxLQUFLLEVBQVcsUUFBUSxDQUFDLEdBQUc7YUFDN0IsQ0FBQztZQUVGLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO2dCQUNkLFVBQVUsRUFBRSxPQUFPO2FBQ3BCLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQzVCLFVBQUEsR0FBRyxJQUFJLE9BQUEsS0FBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBeEIsQ0FBd0IsRUFDL0IsVUFBQSxHQUFHLElBQUksT0FBQSxLQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUF4QixDQUF3QixDQUNsQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBR0QsZ0NBQWdDO0lBQ3hCLGdEQUFjLEdBQXRCLFVBQXVCLEdBQTJEO1FBQ2hGLElBQUksR0FBRyxZQUFZLFlBQVksSUFBSSxHQUFHLFlBQVksaUJBQWlCLEVBQUU7WUFDbkUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFO2dCQUN6SCxJQUFJLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ25EO1NBQ0Y7SUFDSCxDQUFDOztnQkF4Q2tDLG1CQUFtQjs7SUFGM0MsdUJBQXVCO1FBRG5DLFVBQVUsRUFBRTt5Q0FHd0IsbUJBQW1CO09BRjNDLHVCQUF1QixDQTJDbkM7SUFBRCw4QkFBQztDQUFBLEFBM0NELElBMkNDO1NBM0NZLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEh0dHBFdmVudCwgSHR0cFJlcXVlc3QsIEh0dHBJbnRlcmNlcHRvciwgSHR0cEhhbmRsZXIsIEh0dHBSZXNwb25zZSwgSHR0cEVycm9yUmVzcG9uc2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IEFuZ3VsYXJUb2tlblNlcnZpY2UgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4uc2VydmljZSc7XG5cbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJUb2tlbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcblxuICBjb25zdHJ1Y3RvciggcHJpdmF0ZSB0b2tlblNlcnZpY2U6IEFuZ3VsYXJUb2tlblNlcnZpY2UgKSB7IH1cblxuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcblxuICAgIC8vIEdldCBhdXRoIGRhdGEgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgdGhpcy50b2tlblNlcnZpY2UuZ2V0QXV0aERhdGFGcm9tU3RvcmFnZSgpO1xuXG4gICAgLy8gQWRkIHRoZSBoZWFkZXJzIGlmIHRoZSByZXF1ZXN0IGlzIGdvaW5nIHRvIHRoZSBjb25maWd1cmVkIHNlcnZlclxuICAgIGNvbnN0IGF1dGhEYXRhID0gdGhpcy50b2tlblNlcnZpY2UuYXV0aERhdGEudmFsdWU7XG5cbiAgICBpZiAoYXV0aERhdGEgJiZcbiAgICAgICh0aGlzLnRva2VuU2VydmljZS50b2tlbk9wdGlvbnMuYXBpQmFzZSA9PT0gbnVsbCB8fCByZXEudXJsLm1hdGNoKHRoaXMudG9rZW5TZXJ2aWNlLnRva2VuT3B0aW9ucy5hcGlCYXNlKSkpIHtcblxuICAgICAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAgICAgJ2FjY2Vzcy10b2tlbic6IGF1dGhEYXRhLmFjY2Vzc1Rva2VuLFxuICAgICAgICAnY2xpZW50JzogICAgICAgYXV0aERhdGEuY2xpZW50LFxuICAgICAgICAnZXhwaXJ5JzogICAgICAgYXV0aERhdGEuZXhwaXJ5LFxuICAgICAgICAndG9rZW4tdHlwZSc6ICAgYXV0aERhdGEudG9rZW5UeXBlLFxuICAgICAgICAndWlkJzogICAgICAgICAgYXV0aERhdGEudWlkXG4gICAgICB9O1xuXG4gICAgICByZXEgPSByZXEuY2xvbmUoe1xuICAgICAgICBzZXRIZWFkZXJzOiBoZWFkZXJzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKS5waXBlKHRhcChcbiAgICAgICAgcmVzID0+IHRoaXMuaGFuZGxlUmVzcG9uc2UocmVzKSxcbiAgICAgICAgZXJyID0+IHRoaXMuaGFuZGxlUmVzcG9uc2UoZXJyKVxuICAgICkpO1xuICB9XG5cblxuICAvLyBQYXJzZSBBdXRoIGRhdGEgZnJvbSByZXNwb25zZVxuICBwcml2YXRlIGhhbmRsZVJlc3BvbnNlKHJlczogSHR0cFJlc3BvbnNlPGFueT4gfCBIdHRwRXJyb3JSZXNwb25zZSB8IEh0dHBFdmVudDxhbnk+KTogdm9pZCB7XG4gICAgaWYgKHJlcyBpbnN0YW5jZW9mIEh0dHBSZXNwb25zZSB8fCByZXMgaW5zdGFuY2VvZiBIdHRwRXJyb3JSZXNwb25zZSkge1xuICAgICAgaWYgKHRoaXMudG9rZW5TZXJ2aWNlLnRva2VuT3B0aW9ucy5hcGlCYXNlID09PSBudWxsIHx8IChyZXMudXJsICYmIHJlcy51cmwubWF0Y2godGhpcy50b2tlblNlcnZpY2UudG9rZW5PcHRpb25zLmFwaUJhc2UpKSkge1xuICAgICAgICB0aGlzLnRva2VuU2VydmljZS5nZXRBdXRoSGVhZGVyc0Zyb21SZXNwb25zZShyZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19