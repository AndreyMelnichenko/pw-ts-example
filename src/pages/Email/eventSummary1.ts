import { expect, Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import * as RandomHelper from "../../utils/randomHelper"
import { BasePage } from "../basePage"
import { CheckoutPage } from "../checkoutPage"
import { EventDashboard } from "../eventDashboard"
import { SearchPage } from "../searchPage"

export class EventSummary1 extends BasePage {
    protected uiElement: UIElement
    protected readonly alternativeCategoriesServices: string = "//h4[text()=' More ideas for your event ']/following-sibling::a"
    protected readonly gotToEventDashboard: string = ".cta-button.primary-cta"
    protected readonly shortlistedServices: string = "div.yourQuote-preview"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<EventSummary1> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible("//h3[contains(text(),'Your Event So Far')]", 5000)
        await this.uiElement.waitForElementVisible("//h4[text()=' Your Shortlist ']", 5000)
        await this.uiElement.waitForElementVisible("//h4[text()=' More ideas for your event ']", 5000)
        await this.uiElement.waitForElementVisible("footer.footer", 5000)
        const alternativeServices = (await this.page.$$(this.alternativeCategoriesServices)).length
        expect(alternativeServices).toEqual(8)
        const shortlistedServices = (await this.page.$$(this.shortlistedServices)).length
        expect(shortlistedServices > 0).toBeTruthy()

        return this
    }

    async checkViewDetailsLink(): Promise<CheckoutPage> {
        const selector = `${this.shortlistedServices} a.cta-link`
        await this.uiElement.waitForElementVisible(selector)
        await this.uiElement.clickOnElement(selector)

        return new CheckoutPage(this.page).pageLoaded()
    }

    async openEventDashboard(): Promise<EventDashboard> {
        await this.uiElement.clickOnElement(this.gotToEventDashboard)

        return new EventDashboard(this.page).pageLoaded()
    }

    async openRandomLink(): Promise<SearchPage> {
        const alternativeServices: number = (await this.page.$$(this.alternativeCategoriesServices)).length
        const randomIndex: number = RandomHelper.getRandomInt(0, alternativeServices - 1)
        await this.uiElement.clickOnElement(`(${this.alternativeCategoriesServices})[${randomIndex}]`)

        return new SearchPage(this.page).pageLoaded()
    }
}
