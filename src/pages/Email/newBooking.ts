import { expect, Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import * as RandomHelper from "../../utils/randomHelper"
import { BasePage } from "../basePage"
import { PaymentSuccessPage } from "../paymentSuccessPage"
import { SearchPage } from "../searchPage"

export class NewBooking extends BasePage {
    private readonly uiElement: UIElement
    private readonly mainText: string = "//h3[contains(text(),'Congrats on your new booking!')]"
    private readonly alternativeCategories: string = "//div[@class='content']/div/a"
    private readonly payDeposit: string = "a.cta-button"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<NewBooking> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
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
        await randomelement.focus()
        await randomelement.click()

        return new SearchPage(this.page).pageLoaded()
    }

    async clickOnPayDeposit(): Promise<PaymentSuccessPage> {
        await this.uiElement.clickOnElement(this.payDeposit)

        return new PaymentSuccessPage(this.page).pageLoaded()
    }
}
