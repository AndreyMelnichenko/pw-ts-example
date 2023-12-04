// tslint:disable: no-unsafe-any
import { Response } from "got"
import * as creds from "../../../creds.json"
import { PackList } from "../../models/GraphQL/packList"
import { IUser } from "../../models/user"
import { GotRequestClient } from "../apiClient/gotClient"
import { GotAuthController } from "./gotAuthController"

export type ServiceStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "REJECTED"

export class ApiPackageController {
    private readonly gotClient = new GotRequestClient()
    private readonly authController = new GotAuthController()
    private readonly user: IUser

    constructor(user: IUser = creds.admin) {
        this.user = user
    }

    async getPackList(user: IUser): Promise<PackList> {
        const reqBody: string = JSON.stringify({
            query: `{
                        services {
                            id
                            pk
                            title
                            status
                        }
                    }`,
            variables: {},
        })
        const response = await this.gotClient
            .method("POST")
            .url(this.authController.url)
            .body(reqBody)
            .headers(await this.authController.loginAs(user || this.user))
            .send() as Response
        const respData: PackList = JSON.parse(response.body).data

        return respData
    }

    async setPackStatus(serviceId: number, status: ServiceStatus): Promise<void> {
        const reqBody: string = JSON.stringify({
            query: `mutation MyQuery {
                setPackageStatus(id: ${serviceId}, status: ${status}) { status }
            }`,
            variables: {},
        })
        const response = await this.gotClient
            .method("POST")
            .url(this.authController.url)
            .body(reqBody)
            .headers(await this.authController.loginAs(this.user))
            .send() as Response
        const respData: { setPackageStatus: { status: ServiceStatus } }
            = JSON.parse(response.body).data
    }

    async getPackStatus(serviceId: number): Promise<ServiceStatus> {
        const reqBody: string = JSON.stringify({
            query: `{ getPackageStatus(id: ${serviceId}) }`,
            variables: {},
        })
        const response = await this.gotClient
            .method("POST")
            .url(this.authController.url)
            .body(reqBody)
            .headers(await this.authController.loginAs(this.user))
            .send() as Response
        const respData: { getPackageStatus: ServiceStatus } = JSON.parse(response.body).data

        return respData.getPackageStatus
    }
}
