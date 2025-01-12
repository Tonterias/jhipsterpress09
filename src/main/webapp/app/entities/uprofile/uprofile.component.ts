import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService, JhiDataUtils } from 'ng-jhipster';

import { IUprofile } from 'app/shared/model/uprofile.model';
import { UprofileService } from './uprofile.service';

import { Principal } from 'app/core';
import { ITEMS_PER_PAGE } from 'app/shared';

@Component({
    selector: 'jhi-uprofile',
    templateUrl: './uprofile.component.html'
})
export class UprofileComponent implements OnInit, OnDestroy {
    currentAccount: any;
    uprofiles: IUprofile[];
    error: any;
    success: any;
    eventSubscriber: Subscription;
    currentSearch: string;
    routeData: any;
    links: any;
    totalItems: any;
    queryCount: any;
    itemsPerPage: any;
    page: any;
    predicate: any;
    previousPage: any;
    reverse: any;
    owner: any;
    isAdmin: boolean;
    hasProfile: boolean;

    constructor(
        private uprofileService: UprofileService,
        private parseLinks: JhiParseLinks,
        private jhiAlertService: JhiAlertService,
        private principal: Principal,
        private activatedRoute: ActivatedRoute,
        private dataUtils: JhiDataUtils,
        private router: Router,
        private eventManager: JhiEventManager
    ) {
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.routeData = this.activatedRoute.data.subscribe(data => {
            this.page = data.pagingParams.page;
            this.previousPage = data.pagingParams.page;
            this.reverse = data.pagingParams.ascending;
            this.predicate = data.pagingParams.predicate;
        });
        this.currentSearch =
            this.activatedRoute.snapshot && this.activatedRoute.snapshot.params['search']
                ? this.activatedRoute.snapshot.params['search']
                : '';
    }

    loadAll() {
        if (this.currentSearch) {
            this.uprofileService
                .search({
                    page: this.page - 1,
                    query: this.currentSearch,
                    size: this.itemsPerPage,
                    sort: this.sort()
                })
                .subscribe(
                    (res: HttpResponse<IUprofile[]>) => this.paginateUprofiles(res.body, res.headers),
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
            return;
        }
        this.uprofileService
            .query({
                page: this.page - 1,
                size: this.itemsPerPage,
                sort: this.sort()
            })
            .subscribe(
                (res: HttpResponse<IUprofile[]>) => this.paginateUprofiles(res.body, res.headers),
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    loadPage(page: number) {
        if (page !== this.previousPage) {
            this.previousPage = page;
            this.transition();
        }
    }

    transition() {
        this.router.navigate(['/uprofile'], {
            queryParams: {
                page: this.page,
                size: this.itemsPerPage,
                search: this.currentSearch,
                sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
            }
        });
        this.loadAll();
    }

    clear() {
        this.page = 0;
        this.currentSearch = '';
        this.router.navigate([
            '/uprofile',
            {
                page: this.page,
                sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
            }
        ]);
        this.loadAll();
    }

    search(query) {
        if (!query) {
            return this.clear();
        }
        this.page = 0;
        this.currentSearch = query;
        this.router.navigate([
            '/uprofile',
            {
                search: this.currentSearch,
                page: this.page,
                sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
            }
        ]);
        this.loadAll();
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then(account => {
            this.currentAccount = account;
            this.owner = account.id;
            this.principal.hasAnyAuthority(['ROLE_ADMIN']).then(result => {
                this.isAdmin = result;
            });
            this.hasProfile = false;
            console.log('CONSOLOG: M:myProfile & O: this.hasProfile:', this.hasProfile);
            const query = {
                //                page: this.page - 1,
                //                size: this.itemsPerPage,
                //                sort: this.sort()
            };
            if (this.currentAccount.id != null) {
                query['userId.equals'] = this.currentAccount.id;
            }
            this.uprofileService.query(query).subscribe(
                (res: HttpResponse<IUprofile[]>) => {
                    if (res.body.length !== 0) {
                        this.hasProfile = true;
                        console.log('CONSOLOG: M:ngOnInit & O: uprofileService-res.body:', res.body);
                        console.log('CONSOLOG: M:ngOnInit & O: this.hasProfile:', this.hasProfile);
                    }
                    //                    this.paginateUprofiles(res.body, res.headers);
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
        });
        this.registerChangeInUprofiles();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IUprofile) {
        return item.id;
    }

    byteSize(field) {
        return this.dataUtils.byteSize(field);
    }

    openFile(contentType, field) {
        return this.dataUtils.openFile(contentType, field);
    }

    registerChangeInUprofiles() {
        this.eventSubscriber = this.eventManager.subscribe('uprofileListModification', response => this.loadAll());
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    myProfile() {
        this.hasProfile = false;
        console.log('CONSOLOG: M:myProfile & O: this.hasProfile:', this.hasProfile);
        const query = {
            page: this.page - 1,
            size: this.itemsPerPage,
            sort: this.sort()
        };
        if (this.currentAccount.id != null) {
            query['userId.equals'] = this.currentAccount.id;
        }
        this.uprofileService.query(query).subscribe(
            (res: HttpResponse<IUprofile[]>) => {
                if (res.body.length !== 0) {
                    this.hasProfile = true;
                    console.log('CONSOLOG: M:myProfile & O: res.body:', res.body);
                    console.log('CONSOLOG: M:myProfile & O: this.hasProfile:', this.hasProfile);
                }
                this.paginateUprofiles(res.body, res.headers);
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    private paginateUprofiles(data: IUprofile[], headers: HttpHeaders) {
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
        this.queryCount = this.totalItems;
        this.uprofiles = data;
        console.log('CONSOLOG: M:paginateProfiles & O: this.owner : ', this.owner);
        console.log('CONSOLOG: M:paginateProfiles & O: this.isAdmin : ', this.isAdmin);
        console.log('CONSOLOG: M:paginateProfiles & O: this.uprofiles : ', this.uprofiles);
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
