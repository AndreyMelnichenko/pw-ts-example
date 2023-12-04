import { expect, Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import * as RandomHelper from "../../utils/randomHelper"
import { BasePage } from "../basePage"
import { ServicePage } from "../servicePage"

export class CrossSaleEmailPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly alternativeCategoriesServices: string =
        "//div[@class='alternativesCards-container']//div[@class='cardPreview-description']"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<CrossSaleEmailPage> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible("text=Perfect Your Event", 5000)
        await this.uiElement.waitForElementVisible("text=For your Catering needs", 5000)
        const alternativeServices = (await this.page.$$(this.alternativeCategoriesServices)).length
        expect(alternativeServices).toEqual(8)

        return this
    }

    async openRandomLink(): Promise<ServicePage> {
        const alternativeServices: number = (await this.page.$$(this.alternativeCategoriesServices)).length
        const randomIndex: number = RandomHelper.getRandomInt(0, alternativeServices)
        const randomelement = await this.page.$(`(${this.alternativeCategoriesServices})[${randomIndex}]`)
        await randomelement.scrollIntoViewIfNeeded()
        await randomelement.click()

        return new ServicePage(this.page).pageLoaded()
    }
}
