import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';
import { JhiAlertService } from 'ng-jhipster';

import { IVtopic } from 'app/shared/model/vtopic.model';
import { VtopicService } from './vtopic.service';
import { IUser, UserService } from 'app/core';

import { Principal } from 'app/core';

@Component({
    selector: 'jhi-vtopic-update',
    templateUrl: './vtopic-update.component.html'
})
export class VtopicUpdateComponent implements OnInit {
    vtopic: IVtopic;
    isSaving: boolean;

    users: IUser[];
    creationDate: string;
    currentAccount: any;

    constructor(
        private jhiAlertService: JhiAlertService,
        private vtopicService: VtopicService,
        private userService: UserService,
        private principal: Principal,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.principal.identity().then(account => {
            this.currentAccount = account;
            console.log('CONSOLOG: M:ngOnInit & O: this.currentAccount.id : ', this.currentAccount.id);
            this.userService.findById(this.currentAccount.id).subscribe(
                (res: HttpResponse<IUser>) => {
                    this.vtopic.userId = res.body.id;
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
        });
        this.activatedRoute.data.subscribe(({ vtopic }) => {
            this.vtopic = vtopic;
            this.creationDate = moment().format(DATE_TIME_FORMAT);
            this.vtopic.creationDate = moment(this.creationDate);
        });
        this.userService.query().subscribe(
            (res: HttpResponse<IUser[]>) => {
                this.users = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        this.vtopic.creationDate = this.creationDate != null ? moment(this.creationDate, DATE_TIME_FORMAT) : null;
        if (this.vtopic.id !== undefined) {
            this.subscribeToSaveResponse(this.vtopicService.update(this.vtopic));
        } else {
            this.subscribeToSaveResponse(this.vtopicService.create(this.vtopic));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IVtopic>>) {
        result.subscribe((res: HttpResponse<IVtopic>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    private onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    trackUserById(index: number, item: IUser) {
        return item.id;
    }
}
