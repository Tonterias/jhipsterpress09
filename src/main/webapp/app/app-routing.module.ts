import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { errorRoute, navbarRoute } from './layouts';
import { DEBUG_INFO_ENABLED } from 'app/app.constants';

const LAYOUT_ROUTES = [navbarRoute, ...errorRoute];

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                ...LAYOUT_ROUTES,
                {
                    path: 'admin',
                    loadChildren: './admin/admin.module#JhipsterpressAdminModule'
                }
            ],
            {
                useHash: true,
                enableTracing: DEBUG_INFO_ENABLED,
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled'
            }
        )
    ],
    exports: [RouterModule]
})
export class JhipsterpressAppRoutingModule {}
