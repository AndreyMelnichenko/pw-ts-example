import { expect, Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import * as RandomHelper from "../../utils/randomHelper"
import { BasePage } from "../basePage"
import { SearchPage } from "../searchPage"

export class Upsell2 extends BasePage {
    private readonly uiElement: UIElement
    private readonly mainText: string = "//p[contains(text(),'Make your event better than you could have imagined.')]"
    private readonly alternativeCategories: string = "//div[@style]//a/div/span"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<Upsell2> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible("//h3[contains(text(),'With An Extraordinary Experience')]", 5000)
        await this.uiElement.waitForElementVisible(this.mainText, 5000)
        await this.uiElement.waitForElementVisible("footer.footer", 5000)
        const alternativeServices = (await this.page.$$(this.alternativeCategories)).length
        expect(alternativeServices).toEqual(8)

        return this
    }

    async clickOnRandomCategory(): Promise<SearchPage> {
        const shortlistedServices: number = (await this.page.$$(this.alternativeCategories)).length
        const randomIndex: number = RandomHelper.getRandomInt(0, shortlistedServices)
        const randomelement = await this.page.$(`(${this.alternativeCategories})[${randomIndex}]`)
        await randomelement.scrollIntoViewIfNeeded()
        await randomelement.click()

        return new SearchPage(this.page).pageLoaded()
    }
}
