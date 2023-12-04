// tslint:disable: no-unsafe-any
import { expect } from "@playwright/test"
import { Response } from "got"
import { TimeSlot, TimeSlots } from "../../models/GraphQL/timeSlots"
import { IUser } from "../../models/user"
import * as DateHelper from "../../utils/dateHelper"
import { GotRequestClient } from "../apiClient/gotClient"
import { GotAuthController } from "./gotAuthController"

export class ApiCalendarController {
    private readonly gotClient = new GotRequestClient()
    private readonly authController = new GotAuthController()
    private readonly user: IUser

    constructor(user: IUser) {
        this.user = user
    }

    async removeTimeSlotsForDay(dayOffset: number): Promise<void> {
        const day = DateHelper.getDateWithDayOffset(dayOffset)
        const timeslots: Array<TimeSlot> = await this.getTimeSlots(day, day)
        timeslots.map((el) => el.pk).forEach(async(el) => this.deleteTimeSlot(el))
    }

    async removeTimeSlotByDate(date: Date): Promise<void> {
        let timeslots: Array<TimeSlot> = await this.getTimeSlots(date, date)
        for (const el of timeslots) {
            await this.deleteTimeSlot(el.pk)
        }
        timeslots = await this.getTimeSlots(date, date)
    }

    async getTimeSlots(from: Date, to: Date): Promise<Array<TimeSlot>> {
        const start = DateHelper.getDateString(from)
        const end = DateHelper.getDateString(to)
        const reqBody: string = JSON.stringify({
            query: `{
                        timeSlots: supplierOffslots(dateFrom: "${start}", dateTo: "${end}") {
                            pk
                            reason
                            providerId
                            dtStart
                            dtEnd
                        }
                    }`,
            variables: {},
        })
        const response = await this.gotClient
            .method("POST")
            .url(this.authController.url)
            .body(reqBody)
            .headers(await this.authController.loginAs(this.user))
            .send() as Response
        const respData: TimeSlots = JSON.parse(response.body).data

        return respData.timeSlots
    }

    async deleteTimeSlot(timeSlotId: number): Promise<Array<TimeSlot>> {
        const reqBody: string = JSON.stringify({
            query: `mutation DELETE_TIME_SLOT($pk: Int!) {
                        deleteOffslot(pk: $pk) {
                            error
                            __typename
                        }
                    }`,
            variables: {pk: timeSlotId},
        })
        const response = await this.gotClient
            .method("POST")
            .url(this.authController.url)
            .body(reqBody)
            .headers(await this.authController.loginAs(this.user))
            .send() as Response
        const respData: TimeSlots = JSON.parse(response.body).data

        return respData.timeSlots
    }

    private async createTimeSlot(serviceId: string, startDate: string, endDate: string, reason: string): Promise<void> {
        const reqBody: string = JSON.stringify({
            query: `mutation SET_TIME_SLOTS($dtStart: DateTime!, $dtEnd: DateTime!, $services: [Int], $reason: String) {
                        createOffslot(
                            dtStart: $dtStart
                            dtEnd: $dtEnd
                            services: $services
                            reason: $reason) {
                            error
                            __typename
                        }
                    }`,
            variables: {
                dtEnd: endDate,
                dtStart: startDate,
                reason,
                services: [serviceId],
            },
        })
        const response = await this.gotClient
            .method("POST")
            .url(this.authController.url)
            .body(reqBody)
            .headers(await this.authController.loginAs(this.user))
            .send() as Response
        const respData = JSON.parse(response.body).data.createOffslot.error
        expect(respData).toBeNull()
    }
}
