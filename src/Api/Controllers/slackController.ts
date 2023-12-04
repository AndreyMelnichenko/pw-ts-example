// tslint:disable: no-unsafe-any
// tslint:disable: no-console
import { Browser, BrowserContext, chromium, Page } from "@playwright/test"
import * as fs from "fs"
import * as creds from "../../../creds.json"
import { TestTypes } from "../../models/testTypes"
import * as DataHelper from "./../../utils/dataHelper"
import { SlackMessageBuilder } from "./slackMessageController"

export class SlackController {
    private page!: Page
    private browser!: Browser
    private context!: BrowserContext
    private channel: string
    private readonly headers: { [key: string]: string }
    private readonly options: { [key: string]: object }
    private readonly slackBaseUrl = "https://slack.com/api"
    private readonly runMode: string
    private readonly slackCannelList = {
        e2e: creds.SLACK.E2E,
        seo: creds.SLACK.SEO,
        vrt: creds.SLACK.VRT,
    }

    constructor(runMode: string) {
        this.runMode = runMode
        this.headers = { Authorization: `Bearer ${creds.SLACK.TOKEN}` }
        this.options = { headers: this.headers }
    }

    async initConnection(slackChannel: TestTypes): Promise<SlackController> {
        this.channel = this.slackCannelList[slackChannel]
        const browserType = chromium
        this.browser = await browserType.launch({ headless: true })
        this.context = await this.browser.newContext()
        this.page = await this.context.newPage()

        return this
    }

    async postSnippetToSlack(): Promise<void> {
        const f = fs.createReadStream("/home/Downloads/2.txt")
        await this.page.request.post(`${this.slackBaseUrl}/files.upload`,
            {
                multipart: {
                    channels: this.channel,
                    file: f,
                    initial_comment: "Test results list",
                },
                ...this.options,
            },
        )
    }

    async postMessageToSlack(testResults: Array<{ test: string, status: string }>): Promise<void> {
        const isFailed = testResults
            .map((el) => el.status)
            .filter((el) => (el.includes("failed") || el.includes("timedOut"))).length !== 0
        const slackBuilder = new SlackMessageBuilder(this.runMode)
        const attachments = slackBuilder.buildAttschments(isFailed, testResults)
        if (DataHelper.getKeyByValue(this.slackCannelList, this.channel) === "vrt") {
            attachments.text = `Visual tests ${attachments.text}`
            attachments.actions?.push(slackBuilder.makeActionButton(
                "Go to VRT report",
                "https://vrt.stage.gigmngr.com/6e420107-9b12-4fe4-868c-c40dc8d61ca9"))
        }
        this.options.headers = {
            "Content-Type": "application/json; charset=utf-8",
            ...this.options.headers,
        }
        await this.page.request.post(`${this.slackBaseUrl}/chat.postMessage`,
            {
                data: JSON.stringify({channel: this.channel, attachments: [attachments]}),
                ...this.options,
            },
        )
    }

}
