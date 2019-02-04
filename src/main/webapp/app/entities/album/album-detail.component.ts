import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService, JhiDataUtils } from 'ng-jhipster';

import { IAlbum } from 'app/shared/model/album.model';

import { IPhoto } from 'app/shared/model/photo.model';
import { PhotoService } from '../photo/photo.service';
import { ITEMS_PER_PAGE } from 'app/shared';

@Component({
    selector: 'jhi-album-detail',
    templateUrl: './album-detail.component.html'
})
export class AlbumDetailComponent implements OnInit {
    album: IAlbum;
    photos: IPhoto[];

    routeData: any;
    links: any;
    totalItems: any;
    queryCount: any;
    itemsPerPage: any;
    page: any;
    predicate: any;
    previousPage: any;
    reverse: any;

    constructor(private activatedRoute: ActivatedRoute, private photoService: PhotoService, private jhiAlertService: JhiAlertService) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ album }) => {
            this.album = album;
            this.usersAlbumsPhotos();
        });
    }

    previousState() {
        window.history.back();
    }

    private usersAlbumsPhotos() {
        const query = {};
        if (this.album != null) {
            const arrayAlbums = [];
            query['albumId.in'] = this.album.id;
        }
        this.photoService.query(query).subscribe(
            (res: HttpResponse<IPhoto[]>) => {
                //                        this.photos = this.photos.concat(res.body);
                this.photos = res.body;
                console.log('CONSOLOG: M:paginatePhotos & O: this.photos : ', this.photos);
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
