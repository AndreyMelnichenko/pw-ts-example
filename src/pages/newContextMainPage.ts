import { Browser, BrowserContext, chromium, TestInfo } from "@playwright/test"
import { URL } from "url"
import { MainPage } from "./mainPage"

export class NewContextMainPage {
    private readonly browserType = chromium
    private readonly testInfo: TestInfo

    constructor(testInfo: TestInfo) {
        this.testInfo = testInfo
    }

    async getNewContextPage(isMobile = false): Promise<MainPage> {
        const browser: Browser = await this.browserType.launch()
        const context: BrowserContext = await browser.newContext({
            locale: "en-US",
            timezoneId: "Europe/London",
        })
        const urlString = this.testInfo.project.use.baseURL || ""
        const url = new URL(urlString)
        const newPage = await context.newPage()
        await newPage.goto(`${url.protocol}//foo:bar@${url.host}`)
        const mainPage = new MainPage(newPage, isMobile)
        await mainPage.pageLoaded()

        return mainPage
    }
}
