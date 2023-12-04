import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { EventDashboard } from "./eventDashboard"

export class EventListPage extends BasePage {
    private readonly events: string = "//div[@data-tid='Stack']//div[text()='Anniversary']"
    private readonly uiElement: UIElement

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<EventListPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/e\/events\//g)
        await this.uiElement.waitForElementVisible(this.events)

        return this
    }

    async getEventCount(): Promise<number> {
        const events = await this.page.$$(this.events)

        return events.length
    }

    async clickOnEventByType(eventType: string): Promise<EventDashboard> {
        await this.uiElement.clickOnElement(`//div[@data-tid='Stack']//div[text()='${eventType}']`)

        return new EventDashboard(this.page, this.isMobile).pageLoaded()
    }
}
