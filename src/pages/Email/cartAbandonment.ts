import { expect, Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import * as RandomHelper from "../../utils/randomHelper"
import { BasePage } from "../basePage"
import { CheckoutPage } from "../checkoutPage"
import { EventDashboard } from "../eventDashboard"

export class CartAbandonment extends BasePage {
    private readonly uiElement: UIElement
    private readonly goToDashboard: string = "//a[text()='Go to dashboard']"
    private readonly goToShortlist: string = ".cta-button.primary-cta"
    private readonly shortlistedServices: string = "//div[@class='yourQuote-preview']//a[@class='cta-link']"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<CartAbandonment> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible("//h3[contains(text(),\"Book The Best Services Before It's Too Late\")]", 5000)
        await this.uiElement.waitForElementVisible("//h4[text()=' Your Shortlist ']", 5000)
        await this.uiElement.waitForElementVisible("//h4[text()=' Your next steps ']", 5000)
        await this.uiElement.waitForElementVisible(this.goToDashboard, 5000)
        await this.uiElement.waitForElementVisible(this.goToShortlist, 5000)
        await this.uiElement.waitForElementVisible("footer.footer", 5000)
        const alternativeServices = (await this.page.$$(this.shortlistedServices)).length
        expect(alternativeServices >= 1).toBeTruthy()

        return this
    }

    async clickOnCardViewDetails(): Promise<CheckoutPage> {
        const shortlistedServices: number = (await this.page.$$(this.shortlistedServices)).length
        const randomIndex: number = RandomHelper.getRandomInt(0, shortlistedServices)
        const randomelement = await this.page.$(`(${this.shortlistedServices})[${randomIndex}]`)
        await randomelement.click()

        return new CheckoutPage(this.page).pageLoaded()
    }

    async clickOnGoToShortList(): Promise<EventDashboard> {
        await this.uiElement.clickOnElement(this.goToShortlist)

        return new EventDashboard(this.page).pageLoaded()
    }

    async clickOnGoToDashboard(): Promise<EventDashboard> {
        await this.uiElement.clickOnElement(this.goToShortlist)

        return new EventDashboard(this.page).pageLoaded()
    }
}
