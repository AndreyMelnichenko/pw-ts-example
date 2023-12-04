import { expect, Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import * as RandomHelper from "../../utils/randomHelper"
import { BasePage } from "../basePage"
import { SearchPage } from "../searchPage"
import { ServicePage } from "../servicePage"

export class Upsell3 extends BasePage {
    private readonly uiElement: UIElement
    private readonly mainText: string = "//p[contains(text(),'Your perfect service is ready and waiting for your')]"
    private readonly alternativeCategories: string = "//div[@style]//a/div/span[@class='cardDescription-title']"
    private readonly quoteCard: string = "//div[@class='yourQuote-preview']//a[@class='cta-link']"
    private readonly showMore: string = "//a[@class='cta-button primary-cta']"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<Upsell3> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible("//h3[contains(text(),'Time To RSVP')]", 5000)
        await this.uiElement.waitForElementVisible(this.mainText, 5000)
        await this.uiElement.waitForElementVisible("footer.footer", 5000)
        const alternativeServices = (await this.page.$$(this.alternativeCategories)).length
        expect(alternativeServices).toEqual(8)

        return this
    }

    async clickOnRandomCategory(): Promise<ServicePage> {
        const shortlistedServices: number = (await this.page.$$(this.alternativeCategories)).length
        const randomIndex: number = RandomHelper.getRandomInt(0, shortlistedServices)
        const selector = `(${this.alternativeCategories})[${randomIndex}]`
        await this.uiElement.waitForElementVisible(selector)
        await this.uiElement.clickOnElement(selector)

        return new ServicePage(this.page).pageLoaded()
    }

    async clickOnShowMore(): Promise<SearchPage> {
        await this.uiElement.clickOnElement(this.showMore)

        return new SearchPage(this.page).pageLoaded()
    }

    async clickOnViewDetails(): Promise<ServicePage> {
        await this.uiElement.clickOnElement(this.quoteCard)

        return new ServicePage(this.page).pageLoaded()
    }
}
