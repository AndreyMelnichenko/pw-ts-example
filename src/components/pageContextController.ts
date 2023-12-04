// tslint:disable: no-unsafe-any
import { Page } from "@playwright/test"

export class PageContextController {
    private readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    async cleanCookies(): Promise<void> {
        await this.page.context().clearCookies()
    }

    async cleanLocalStorage(): Promise<void> {
        await this.page.evaluate(() => localStorage.clear())
    }

}
