import { expect, Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import { EventSummary1 } from "./eventSummary1"

export class EventSummary3 extends EventSummary1 {

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    override async pageLoaded(): Promise<EventSummary1> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible("//h3[contains(text(),'Update On Your')]", 5000)
        await this.uiElement.waitForElementVisible("//h4[text()=' Your Shortlist ']", 5000)
        await this.uiElement.waitForElementVisible("//h4[text()=' More ideas for your event ']", 5000)
        await this.uiElement.waitForElementVisible("footer.footer", 5000)
        const alternativeServices = (await this.page.$$(this.alternativeCategoriesServices)).length
        expect(alternativeServices).toEqual(8)
        const shortlistedServices = (await this.page.$$(this.shortlistedServices)).length
        expect(shortlistedServices > 0).toBeTruthy()

        return this
    }
}
