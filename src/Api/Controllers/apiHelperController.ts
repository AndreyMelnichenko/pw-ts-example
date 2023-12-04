// tslint:disable: no-unsafe-any
import { Page } from "@playwright/test"
import * as creds from "../../../creds.json"
import { Profile } from "../../models/GraphQL/profile"

export class ApiHelperController {
    private readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    getUserId = async (): Promise<Profile> => {
        const reqBody: string =
            JSON.stringify({
                query: `{
                            me {
                                id
                                pk
                                roles
                                email
                                client {
                                    id
                                    name
                                }
                                profile {
                                    id
                                    banned
                                    currentPlan {
                                        name
                                    }
                                }
                            }
                        }`,
                variables: {},
        })
        const response = await this.page.request.post(creds["API-BASE-URL"], { data: reqBody })
        const profile: Profile = JSON.parse(JSON.stringify(await response.json())).data.me

        return profile
    }

    getCityList = async (): Promise<Array<string>> => {
        const reqBody: string = JSON.stringify({
                                    query: `{
                                        cities {
                                            edges {
                                                node {
                                                    city
                                                }
                                            }
                                        }
                                    }`,
                                    variables: {},
                                })

        const response = await this.page.request.post(creds["API-BASE-URL"], { data: reqBody })
        const cities: Array<{ node: {city: string} }> =
            JSON.parse(JSON.stringify(await response.json())).data.cities.edges

        return cities.map((element) => element.node.city)
    }

    getPostcodes = async (character: string): Promise<Array<string>> => {
        const reqBody: string = JSON.stringify({
            query: `
                query GET_LOCATIONS($location: String!, $locationType: Int) {
                    geoLocations(location: $location, locationType: $locationType) {
                        location
                    }
                }`,
            variables: {
                    location: character,
                    locationType: 1,
            },
        })

        const response = await this.page.request.post(creds["API-BASE-URL"], { data: reqBody })
        const codes: Array<{location: string}> =
            JSON.parse(JSON.stringify(await response.json())).data.geoLocations

        return codes.map((element) => element.location)
    }
}
