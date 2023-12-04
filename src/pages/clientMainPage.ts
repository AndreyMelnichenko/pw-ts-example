import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { Header } from "./components/header"
import { EventDashboard } from "./eventDashboard"

export class ClientMainPage extends BasePage {
    readonly header: Header
    private readonly clientLogo: string = "[data-tid='Avatar']"
    private readonly savedServices: string = "//header//div[@data-tid='Stack']//button"
    private readonly uiElement: UIElement

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.header = new Header(this.page, isMobile)
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<ClientMainPage> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/e\/.*/g, 30000)
        await this.uiElement.waitForElementVisible(this.clientLogo, 25000)

        return this
    }

    async clickOnEventByType(eventType: string): Promise<EventDashboard> {
        await this.uiElement.clickOnElement(`//div[@class='ui header' and text()='${eventType}']`)

        return new EventDashboard(this.page, this.isMobile).pageLoaded()
    }
}
