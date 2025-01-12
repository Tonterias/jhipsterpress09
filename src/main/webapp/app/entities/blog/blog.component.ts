import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService, JhiDataUtils } from 'ng-jhipster';

import { IBlog } from 'app/shared/model/blog.model';
import { BlogService } from './blog.service';
import { ICommunity } from 'app/shared/model/community.model';
import { CommunityService } from '../community/community.service';

import { Principal } from 'app/core';
import { ITEMS_PER_PAGE } from 'app/shared';

@Component({
    selector: 'jhi-blog',
    templateUrl: './blog.component.html'
})
export class BlogComponent implements OnInit, OnDestroy {
    currentAccount: any;
    blogs: IBlog[];
    communities: ICommunity[];
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

    constructor(
        private blogService: BlogService,
        private communityService: CommunityService,
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
            this.blogService
                .search({
                    page: this.page - 1,
                    query: this.currentSearch,
                    size: this.itemsPerPage,
                    sort: this.sort()
                })
                .subscribe(
                    (res: HttpResponse<IBlog[]>) => this.paginateBlogs(res.body, res.headers),
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
            return;
        }
        this.blogService
            .query({
                page: this.page - 1,
                size: this.itemsPerPage,
                sort: this.sort()
            })
            .subscribe(
                (res: HttpResponse<IBlog[]>) => this.paginateBlogs(res.body, res.headers),
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
        this.router.navigate(['/blog'], {
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
            '/blog',
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
            '/blog',
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
        });
        this.registerChangeInBlogs();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IBlog) {
        return item.id;
    }

    byteSize(field) {
        return this.dataUtils.byteSize(field);
    }

    openFile(contentType, field) {
        return this.dataUtils.openFile(contentType, field);
    }

    registerChangeInBlogs() {
        this.eventSubscriber = this.eventManager.subscribe('blogListModification', response => this.loadAll());
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    myBlogs() {
        const query = {
            page: this.page - 1,
            size: this.itemsPerPage,
            sort: this.sort()
        };
        if (this.currentAccount.id != null) {
            query['userId.equals'] = this.currentAccount.id;
        }
        this.communityService
            .query(query)
            .subscribe(
                (res: HttpResponse<ICommunity[]>) => this.paginateCommunities(res.body, res.headers),
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    private communitiesBlogs() {
        const query = {
            page: this.page - 1,
            size: this.itemsPerPage,
            sort: this.sort()
        };
        if (this.communities != null) {
            const arrayCommmunities = [];
            this.communities.forEach(community => {
                arrayCommmunities.push(community.id);
            });
            query['communityId.in'] = arrayCommmunities;
        }
        this.blogService
            .query(query)
            .subscribe(
                (res: HttpResponse<IBlog[]>) => this.paginateBlogs(res.body, res.headers),
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    private paginateBlogs(data: IBlog[], headers: HttpHeaders) {
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
        this.queryCount = this.totalItems;
        this.blogs = data;
        console.log('CONSOLOG: M:paginateBlogs & O: this.blogs : ', this.blogs);
    }

    private paginateCommunities(data: ICommunity[], headers: HttpHeaders) {
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
        this.queryCount = this.totalItems;
        this.communities = data;
        this.communitiesBlogs();
        console.log('CONSOLOG: M:paginateBlogs & O: this.communities : ', this.communities);
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
