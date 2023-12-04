import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"

export class SuppRankingPage extends BasePage {
    private readonly uiElement: UIElement

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<SuppRankingPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/ranking\//g, 15000)
        await this.uiElement.waitForElementVisible("//h1[text()='Verify Your Poptop Listing']", 15000)
        await this.uiElement.waitForElementVisible(".main-content img[src]", 15000)

        return this
    }
}
