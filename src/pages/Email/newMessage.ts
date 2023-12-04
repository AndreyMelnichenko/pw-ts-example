import { Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import { BasePage } from "../basePage"
import { CheckoutPage } from "../checkoutPage"
import { EventDashboard } from "../eventDashboard"

export class NewMessage extends BasePage {
    private readonly uiElement: UIElement
    private readonly readAndReplayButton: string = "//a[@class='cta-button' and text()='Read & Reply']"
    private readonly goToDashboard: string = "//a[@href and text()='Go to dashboard']"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<NewMessage> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible("//h3[text()='Incoming Message!']", 5000)
        await this.uiElement.waitForElementVisible("//h4[text()=' Safe & Secure ']", 5000)
        await this.uiElement.waitForElementVisible("footer.footer", 5000)
        await this.uiElement.waitForElementVisible(this.readAndReplayButton, 5000)
        await this.uiElement.waitForElementVisible(this.goToDashboard, 5000)

        return this
    }

    async clickOnReadAndReplay(): Promise<CheckoutPage> {
        await this.uiElement.clickOnElement(this.readAndReplayButton)

        return new CheckoutPage(this.page).pageLoaded()
    }

    async clickOnGoToDashboard(): Promise<EventDashboard> {
        await this.uiElement.clickOnElement(this.goToDashboard)

        return new EventDashboard(this.page).pageLoaded()
    }
}
