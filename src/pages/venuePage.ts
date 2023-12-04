import { Page } from "@playwright/test"

import { Button } from "../components/button"
import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"

export class VenuePage extends BasePage {
    private readonly mainText: string = "h1.ui"
    private readonly vanueItems: string = "div.venueItem"
    private readonly popularCategories: string = "//h5[text()='Popular Categories']"
    private readonly button: Button
    private readonly uiElement: UIElement

    constructor(page: Page) {
        super(page)
        this.page = page
        this.button = new Button(this.page)
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<VenuePage> {
        await this.uiElement.waitForUrl(/.*\/venues\/.*/g)
        await this.uiElement.waitForArray(this.vanueItems)
        await this.uiElement.waitForElementVisible(this.popularCategories)

        return this
    }

    async getMainPageText(): Promise<string> {
        return this.uiElement.getText(this.mainText)
    }

    async isH2Text(text: string): Promise<boolean> {
        const selector = `//h2[text()='${text}']`

        return this.uiElement.isElementDisplayed(selector)
    }
}
