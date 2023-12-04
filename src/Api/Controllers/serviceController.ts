// tslint:disable: no-unsafe-any
import { Response } from "got"
import { IUser } from "../../models/user"
import * as DataHelper from "../../utils/dataHelper"
import { GotRequestClient } from "../apiClient/gotClient"
import { GotAuthController } from "./gotAuthController"

export class ApiServiceController {
    private readonly gotClient = new GotRequestClient()
    private readonly authController = new GotAuthController()
    private readonly user: IUser

    constructor(user: IUser = DataHelper.getClientByName("melnichenko.andrey")) {
        this.user = user
    }

    async getServiceInfo(id: string): Promise<PackageInfo> {
        const reqBody: string = JSON.stringify({
            query: `query GET_PUBLISHED_PACKAGE($pk: Int!, $estimatedPriceFilters: SearchFiltersInput!) {
                        publishedPackage(pk: $pk) {
                            id
                            pk
                            title
                            status
                            estimatedPriceInfo(filters: $estimatedPriceFilters) {
                            basePrice
                            }
                            minGuests
                            maxGuests
                        }
                    }`,
            variables: {pk: id, estimatedPriceFilters: {}},
        })
        const response = await this.gotClient
            .method("POST")
            .url(this.authController.url)
            .body(reqBody)
            .headers(await this.authController.loginAs(this.user))
            .send() as Response
        const respData: PackageInfo = JSON.parse(response.body).data.publishedPackage

        return respData
    }
}

export type PackageInfo = {
    id: string,
    pk: number,
    title: string,
    status: string,
    estimatedPriceInfo: {
        basePrice: number
    },
    minGuests: number,
    maxGuests: number
}
