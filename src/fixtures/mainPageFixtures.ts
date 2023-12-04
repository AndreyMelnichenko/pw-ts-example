import { test as base } from "@playwright/test"
import { URL } from "url"
import { MainPage } from "../pages/mainPage"

export const test = base.extend<{ mainPage: MainPage }>({
    mainPage: async ({ isMobile, browser }, use, testInfo) => {

        const urlString = testInfo.project.use.baseURL || ""
        const url = new URL(urlString)
        const context = await browser.newContext({
            locale: "en-US",
            timezoneId: "Europe/London",
        })
        const page = await context.newPage()
        await page.goto(`${url.protocol}//foo:bar@${url.host}`)
        const mainPage = new MainPage(page, isMobile)
        await mainPage.pageLoaded()
        await use(mainPage)
    },
})
