// tslint:disable: no-console
import { InbucketAPIClient, MessageModel, PreviewMessageModel } from "inbucket-js-client"

import { Page } from "@playwright/test"

export class InbucketController {
    private readonly inbucketUrl: string = "https://inbucket.stage.gigmngr.com/"
    private readonly mailBoxName: string = "test"
    private readonly client: InbucketAPIClient = new InbucketAPIClient(this.inbucketUrl)
    private readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    async getMessage(subject = ""): Promise<MessageModel> {
        const id: string = await this.getMessageIdBySubject(subject)
        const message: MessageModel = await this.client.message(this.mailBoxName, id)

        return message
    }

    async cleanMailBox(): Promise<void> {
        const inbox = await this.client.mailbox(this.mailBoxName)
        if (inbox.length > 0) {
            for (const msg of inbox) {
                const res = await this.client.deleteMessage(this.mailBoxName, msg.id)
                // console.log(`CLEAN MAILBOX - ${res}`)
            }
        }
    }

    private async getMessageIdBySubject(subject = ""): Promise<string> {
        let id = "0"
        let i = 0
        while (id === "0" && i <= 80) {
            await this.page.waitForTimeout(1)
            console.log(`Wait email ${i}s`)
            i = i + 1
            const actualMessageList: Array<PreviewMessageModel> = await this.client.mailbox(this.mailBoxName)
            actualMessageList.forEach((msg) => {
                if (msg.subject === subject) {
                    id = msg.id
                    console.log(`Found ${i} mails from ${actualMessageList.length}, filtered ID: ${id}`)
                }
            })
        }
        if (id === "0") {
            throw new Error(`Can't find email by Subject: ${subject}`)
        }

        return id
    }
}
