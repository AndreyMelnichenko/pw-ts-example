import { Page } from "@playwright/test"

import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"

export class SupplierMainPage extends BasePage {
    private readonly avatar = ".member-avatar"
    private readonly uiElement: UIElement

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<SupplierMainPage> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl("**/s/")
        await this.uiElement.waitForElementVisible(this.avatar)

        return this
    }
}
