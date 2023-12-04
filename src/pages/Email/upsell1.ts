import { expect, Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import * as RandomHelper from "../../utils/randomHelper"
import { BasePage } from "../basePage"
import { SearchPage } from "../searchPage"
import { ServicePage } from "../servicePage"

export class Upsell1 extends BasePage {
    private readonly uiElement: UIElement
    private readonly exploreMoreButton: string = "//a[@class='cta-button primary-cta' and text()='Explore more']"
    private readonly alternativeServices: string = "//a[@class='cardPreview-container']"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<Upsell1> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible("//h3[contains(text(),'Explore more ')]", 5000)
        await this.uiElement.waitForElementVisible("//p[text()='Explore hundreds of extraordinary experiences and services!']", 5000)
        await this.uiElement.waitForElementVisible(".alternativesCards-container", 5000)
        await this.uiElement.waitForElementVisible(this.exploreMoreButton, 5000)
        await this.uiElement.waitForElementVisible("footer.footer", 5000)
        const alternativeServices = (await this.page.$$(this.alternativeServices)).length
        expect(alternativeServices).toEqual(8)

        return this
    }

    async openRandomAlternativeServece(): Promise<ServicePage> {
        const alternativeServices: number = (await this.page.$$(this.alternativeServices)).length
        const randomIndex: number = RandomHelper.getRandomInt(0, alternativeServices)
        const randomelement = await this.page.$(`(${this.alternativeServices})[${randomIndex}]`)
        await randomelement.click()

        return new ServicePage(this.page).pageLoaded()
    }

    async checkExploreMoreLink(): Promise<SearchPage> {
        await this.uiElement.clickOnElement(this.exploreMoreButton)

        return new SearchPage(this.page).pageLoaded()
    }
}
