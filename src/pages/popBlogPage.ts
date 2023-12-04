import { Page } from "@playwright/test"

import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"

export class PopBlogPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly title: string = "h1.site-title"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<PopBlogPage> {
        await this.page.waitForLoadState("domcontentloaded", { timeout: 20000 })
        await this.uiElement.waitForUrl(/.*\/blog-suppliers\//g, 20000)
        await this.uiElement.waitForElementVisible(this.title, 10000)

        return this
    }
}
