import { Browser, BrowserContext, chromium, Page } from "@playwright/test"
import * as creds from "../../../creds.json"
import { MainPage } from "../../pages/mainPage"
import { SupplierServicePage } from "../../pages/supplierServicePage"

export class AuthController {
    private readonly browserType = chromium
    private loginedPage: SupplierServicePage
    private browser: Browser

    async logIn(): Promise<Page> {
        this.browser = await this.browserType.launch({ headless: true })
        const context: BrowserContext = await this.browser.newContext()
        const customPage: Page = await context.newPage()
        await customPage.goto("/")
        const mainPage = new MainPage(customPage)
        await mainPage.pageLoaded()
        const loginPage = await mainPage.openLoginForm()
        await loginPage.pageLoaded()
        this.loginedPage = await loginPage.loginAs(creds.admin) as SupplierServicePage

        return this.loginedPage.page
    }

    async close(): Promise<void> {
        await this.browser.close()
    }
}
