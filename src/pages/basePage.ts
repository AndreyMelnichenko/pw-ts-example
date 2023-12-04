import { Page } from "@playwright/test"
import config from "../../playwright.config"
import { UIElement } from "../components/uiElement"

export abstract class BasePage {
    page: Page
    protected isMobile = false

    constructor(page: Page) {
        this.page = page
    }
    abstract pageLoaded(): void

    /**
    * ```js
    * // wait for 1 second
    * await this.page.waitFor(1);
    * ```
    */
    async waitFor(sec: number): Promise<void> {
        await this.page.waitForTimeout(sec * 1000)
    }

    async makeScreenshoot(path: string): Promise<void> {
        await this.page.screenshot({ path })
    }

    async goBack(): Promise<void> {
        await this.page.goBack()
    }

    async waitLoader(timeout = 5000): Promise<void> {
        await this.waitFor(1)
        const uiElement = new UIElement(this.page)
        await uiElement.waitForElementVisible("[data-tid='Loader']", timeout, true)
    }

    async isTextPresent(text: string): Promise<boolean> {
        const uiElement = new UIElement(this.page)

        return uiElement.textElement.isTextPresent(text, 15000)
    }

    async isTextContains(text: string): Promise<boolean> {
        const uiElement = new UIElement(this.page)

        return uiElement.textElement.isTextContains(text, 15000)
    }

    async goToPage(path: string): Promise<Page> {
        await this.page.goto(`${config.use.baseURL}${path}`)

        return this.page
    }

    async openNewTab(url: string): Promise<Page> {
        const newPage = await this.page.context().newPage()
        await newPage.goto(url, {timeout: 15000})

        return newPage
    }
}
