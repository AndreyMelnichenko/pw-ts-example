// tslint:disable: no-unsafe-any
import { Page } from "@playwright/test"
import * as creds from "../../../creds.json"
import { EmailContext } from "../../models/GraphQL/EmailContext/emailContext"

export class MailingController {
    private readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    triggerTemplate = async(
        templateName: string,
        attributes: Array<string>): Promise<EmailContext> => {
        const reqBody: string = JSON.stringify({
            query: `{
                        triggerEmail(name: "${templateName}", attributes: ["${attributes.join("\",\"")}"], sendToEmailprovider: true) {
                            context
                            recipients
                            errorDescriptions
                        }
                    }`,
            variables: {},
        })
        const response = await this.page.request.post(creds["API-BASE-URL"], { data: reqBody })

        return JSON.parse(JSON.parse(JSON.stringify(await response.json())).data.triggerEmail.context) as EmailContext
    }
}
