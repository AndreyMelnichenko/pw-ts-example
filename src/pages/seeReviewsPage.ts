import { Page } from "@playwright/test"

import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"

export class SeeReviewsPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly mainText: string = "//strong[text()='How Poptop Reviews works?']"
    private readonly link: string = "//a[@href and text()='How to Get Positive Reviews from Clients']"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<SeeReviewsPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/s\/profile\/reviews\//g)
        await this.uiElement.waitForElementVisible(this.mainText)
        await this.uiElement.waitForElementVisible(this.link)

        return this
    }
}
