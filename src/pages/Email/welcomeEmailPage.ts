import { expect, Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import * as RandomHelper from "../../utils/randomHelper"
import { BasePage } from "../basePage"
import { EventDashboard } from "../eventDashboard"
import { SearchPage } from "../searchPage"

export class WelcomeEmailPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly alternativeCategoriesServices: string = "//h4/following-sibling::a"
    private readonly gotToEventDashboard: string = "//button[contains(text(),'Go to event dashboard')]"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<WelcomeEmailPage> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible("//h3[contains(text(),', Welcome to Poptop!')]", 5000)
        await this.uiElement.waitForElementVisible("//h4[text()=' More ideas for your event ']", 5000)
        await this.uiElement.waitForElementVisible("//h4[text()=' How Poptop Works:']", 5000)
        await this.uiElement.waitForElementVisible(
            "//div[@class='content']//p[text()='Everything you need for your event is just a few clicks away..']", 5000)
        const alternativeServices = (await this.page.$$(this.alternativeCategoriesServices)).length
        expect(alternativeServices).toEqual(8)

        return this
    }

    async openEventDashboard(): Promise<EventDashboard> {
        await this.uiElement.clickOnElement(this.gotToEventDashboard)

        return new EventDashboard(this.page).pageLoaded()
    }

    async openRandomLink(): Promise<SearchPage> {
        const alternativeServices: number = (await this.page.$$(this.alternativeCategoriesServices)).length
        const randomIndex: number = RandomHelper.getRandomInt(0, alternativeServices)
        const randomelement = await this.page.$(`(${this.alternativeCategoriesServices})[${randomIndex}]`)
        await randomelement.scrollIntoViewIfNeeded()
        await randomelement.click()

        return new SearchPage(this.page).pageLoaded()
    }
}
