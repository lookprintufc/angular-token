var AngularTokenModule_1;
import { __decorate, __metadata, __param } from "tslib";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { AngularTokenInterceptor } from './angular-token.interceptor';
import { ANGULAR_TOKEN_OPTIONS } from './angular-token.token';
export * from './angular-token.service';
let AngularTokenModule = AngularTokenModule_1 = class AngularTokenModule {
    constructor(parentModule) {
        if (parentModule) {
            throw new Error('AngularToken is already loaded. It should only be imported in your application\'s main module.');
        }
    }
    static forRoot(options) {
        return {
            ngModule: AngularTokenModule_1,
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
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
    }
};
AngularTokenModule.ctorParameters = () => [
    { type: AngularTokenModule, decorators: [{ type: Optional }, { type: SkipSelf }] }
];
AngularTokenModule = AngularTokenModule_1 = __decorate([
    NgModule(),
    __param(0, Optional()), __param(0, SkipSelf()),
    __metadata("design:paramtypes", [AngularTokenModule])
], AngularTokenModule);
export { AngularTokenModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLXRva2VuLyIsInNvdXJjZXMiOlsibGliL2FuZ3VsYXItdG9rZW4ubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDekQsT0FBTyxFQUF1QixRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUV0RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUU5RCxjQUFjLHlCQUF5QixDQUFDO0FBR3hDLElBQWEsa0JBQWtCLDBCQUEvQixNQUFhLGtCQUFrQjtJQUU3QixZQUFvQyxZQUFnQztRQUNsRSxJQUFJLFlBQVksRUFBRTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLGdHQUFnRyxDQUFDLENBQUM7U0FDbkg7SUFDSCxDQUFDO0lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUE0QjtRQUN6QyxPQUFPO1lBQ0wsUUFBUSxFQUFFLG9CQUFrQjtZQUM1QixTQUFTLEVBQUU7Z0JBQ1Q7b0JBQ0UsT0FBTyxFQUFFLGlCQUFpQjtvQkFDMUIsUUFBUSxFQUFFLHVCQUF1QjtvQkFDakMsS0FBSyxFQUFFLElBQUk7aUJBQ1o7Z0JBQ0QsT0FBTyxDQUFDLDJCQUEyQjtvQkFDbkM7d0JBQ0UsT0FBTyxFQUFFLHFCQUFxQjt3QkFDOUIsUUFBUSxFQUFFLE9BQU87cUJBQ2xCO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUE7O1lBdEJtRCxrQkFBa0IsdUJBQXZELFFBQVEsWUFBSSxRQUFROztBQUZ0QixrQkFBa0I7SUFEOUIsUUFBUSxFQUFFO0lBR0ksV0FBQSxRQUFRLEVBQUUsQ0FBQSxFQUFFLFdBQUEsUUFBUSxFQUFFLENBQUE7cUNBQWUsa0JBQWtCO0dBRnpELGtCQUFrQixDQXdCOUI7U0F4Qlksa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSFRUUF9JTlRFUkNFUFRPUlMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSwgT3B0aW9uYWwsIFNraXBTZWxmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBbmd1bGFyVG9rZW5JbnRlcmNlcHRvciB9IGZyb20gJy4vYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvcic7XG5pbXBvcnQgeyBBbmd1bGFyVG9rZW5PcHRpb25zIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLm1vZGVsJztcbmltcG9ydCB7IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyB9IGZyb20gJy4vYW5ndWxhci10b2tlbi50b2tlbic7XG5cbmV4cG9ydCAqIGZyb20gJy4vYW5ndWxhci10b2tlbi5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyVG9rZW5Nb2R1bGUge1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBTa2lwU2VsZigpIHBhcmVudE1vZHVsZTogQW5ndWxhclRva2VuTW9kdWxlKSB7XG4gICAgaWYgKHBhcmVudE1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbmd1bGFyVG9rZW4gaXMgYWxyZWFkeSBsb2FkZWQuIEl0IHNob3VsZCBvbmx5IGJlIGltcG9ydGVkIGluIHlvdXIgYXBwbGljYXRpb25cXCdzIG1haW4gbW9kdWxlLicpO1xuICAgIH1cbiAgfVxuICBzdGF0aWMgZm9yUm9vdChvcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zKTogTW9kdWxlV2l0aFByb3ZpZGVyczxBbmd1bGFyVG9rZW5Nb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEFuZ3VsYXJUb2tlbk1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUlMsXG4gICAgICAgICAgdXNlQ2xhc3M6IEFuZ3VsYXJUb2tlbkludGVyY2VwdG9yLFxuICAgICAgICAgIG11bHRpOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIG9wdGlvbnMuYW5ndWxhclRva2VuT3B0aW9uc1Byb3ZpZGVyIHx8XG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBBTkdVTEFSX1RPS0VOX09QVElPTlMsXG4gICAgICAgICAgdXNlVmFsdWU6IG9wdGlvbnNcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH07XG4gIH1cbn1cbiJdfQ==