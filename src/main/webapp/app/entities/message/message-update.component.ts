import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';
import { JhiAlertService } from 'ng-jhipster';

import { IMessage } from 'app/shared/model/message.model';
import { MessageService } from './message.service';
import { IUser, UserService } from 'app/core';
import { IFollow } from 'app/shared/model/follow.model';
import { FollowService } from '../follow/follow.service';
import { IBlockuser } from 'app/shared/model/blockuser.model';
import { BlockuserService } from '../blockuser/blockuser.service';
import { IUprofile } from 'app/shared/model/uprofile.model';
import { UprofileService } from '../uprofile/uprofile.service';

import { Principal } from 'app/core';

@Component({
    selector: 'jhi-message-update',
    templateUrl: './message-update.component.html'
})
export class MessageUpdateComponent implements OnInit {
    //    message: IMessage;
    private _message: IMessage;
    isSaving: boolean;

    users: IUser[] = [];
    user: IUser;
    uprofiles: IUprofile[];
    uprofile: IUprofile;

    creationDate: string;

    follows: IFollow[];
    loggedUser: IUser;
    blockusers: IBlockuser[];

    currentAccount: any;
    isAllowedUser: boolean;

    routeData: any;
    nameParamFollows: any;
    valueParamFollows: number;
    blockeduserId: number;

    alerts: any[];

    constructor(
        private jhiAlertService: JhiAlertService,
        private messageService: MessageService,
        private userService: UserService,
        private uprofileService: UprofileService,
        private followService: FollowService,
        private blockuserService: BlockuserService,
        private principal: Principal,
        private activatedRoute: ActivatedRoute
    ) {
        this.activatedRoute.queryParams.subscribe(params => {
            if (params.uprofileIdEquals != null) {
                this.nameParamFollows = 'uprofileId';
                this.valueParamFollows = params.uprofileIdEquals;
                console.log('CONSOLOG: M:ngOnInit & O: this.activatedRoute.queryParams : ', this.nameParamFollows, this.valueParamFollows);
            }
        });
    }

    ngOnInit() {
        //        this.onWarning('BLOCKED BY USER');
        this.isSaving = false;
        this.isAllowedUser = true;
        this.activatedRoute.data.subscribe(({ message }) => {
            this.message = message;
            this.creationDate = moment().format(DATE_TIME_FORMAT);
            this.message.creationDate = moment(this.creationDate);
            const query = {};
            if (this.valueParamFollows != null) {
                query['id.equals'] = Number(this.valueParamFollows);
            }
            this.uprofileService.query(query).subscribe(
                (res: HttpResponse<IUprofile[]>) => {
                    this.message.receiverId = res.body[0].userId;
                    this.blockeduserId = res.body[0].userId;
                    console.log('CONSOLOG: M:ngOnInit & O: this.message.receiverId:', this.message.receiverId);
                    this.principal.identity().then(account => {
                        this.currentAccount = account;
                        this.message.senderId = this.currentAccount.id;
                        console.log('CONSOLOG: M:ngOnInit & O: this.currentAccount : ', this.currentAccount);
                        this.isBlockUser().subscribe(
                            (res2: HttpResponse<IBlockuser[]>) => {
                                this.blockusers = res2.body;
                                console.log('CONSOLOG: M:currentLoggedProfile & O:  this.blockusers : ', this.blockusers);
                                if (this.blockusers.length > 0) {
                                    this.isAllowedUser = false;
                                    this.valueParamFollows = null;
                                    //                                    this.onWarning('BLOCKED BY USER');
                                    console.log('CONSOLOG: M:currentLoggedProfile & O:  this.isAllowedUser : ', this.isAllowedUser);
                                    return this.blockusers[0];
                                }
                            },
                            (res3: HttpErrorResponse) => this.onError(res3.message)
                        );
                    });
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
        });
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        this.message.creationDate = this.creationDate != null ? moment(this.creationDate, DATE_TIME_FORMAT) : null;
        if (this.message.id !== undefined) {
            this.subscribeToSaveResponse(this.messageService.update(this.message));
        } else {
            if (this.message.receiverId !== undefined) {
                if (this.isAllowedUser === true) {
                    console.log('CONSOLOG: M:save & O: this.isBlockUser.length : NO-BLOCKED ', this.isBlockUser.length);
                    this.subscribeToSaveResponse(this.messageService.create(this.message));
                }
            }
        }
    }

    private isBlockUser() {
        this.isAllowedUser = true;
        const query = {};
        if (this.currentAccount.id != null) {
            query['blockeduserId.in'] = this.blockeduserId;
            query['blockinguserId.in'] = this.currentAccount.id;
        }
        console.log('CONSOLOG: M:isBlockUser & O: query : ', query);
        return this.blockuserService.query(query);
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IMessage>>) {
        result.subscribe((res: HttpResponse<IMessage>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
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

    //    private onWarning(errorMessage: string) {
    //        console.log('CONSOLOG: M:onWarning & O:  errorMessage : ', errorMessage);
    //        this.alerts = [];
    //        console.log('CONSOLOG: M:onWarning & O:  this.alerts : ', this.alerts);
    //        this.alerts.push(
    //            this.jhiAlertService.addAlert(
    //                {
    //                    type: 'info',
    //                    msg: errorMessage,
    //                    timeout: 5000,
    //                    toast: false,
    //                    scoped: true
    //                },
    //                this.alerts
    //            )
    //        );
    //        console.log('CONSOLOG: M:onWarning & O:  this.alerts2 : ', this.alerts);
    //    }

    trackUserById(index: number, item: IUser) {
        return item.id;
    }

    get message() {
        return this._message;
    }

    set message(message: IMessage) {
        this._message = message;
        this.creationDate = moment(message.creationDate).format(DATE_TIME_FORMAT);
    }
}
