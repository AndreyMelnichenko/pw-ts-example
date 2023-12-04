import { expect, Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import * as RandomHelper from "../../utils/randomHelper"
import { BasePage } from "../basePage"
import { SearchPage } from "../searchPage"

export class DepozitFrozen extends BasePage {
    private readonly uiElement: UIElement
    private readonly mainText: string = "//h3[contains(text(),\"You've paid your deposit.\")]"
    private readonly deposit: string = "//p[text()='Deposit amount: ']/strong"
    private readonly serviceFee: string = "//p[text()='Service fee: ']/strong"
    private readonly balance: string = "//p[text()='Remaining Balance (to be paid to the supplier directly before the event): ']/strong"
    private readonly whatHappensForm: string = "//h4[text()=' What happens next?']"
    private readonly suppContact: string = "//h3[text()=\" Supplier's contact details\"]"
    private readonly alternativeCategories: string = "//div[@class='content']/div/a[not(@class='cta-button primary-cta')]"
    private readonly serachButton: string = "//a[@class='cta-button primary-cta']"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<DepozitFrozen> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible(this.mainText, 5000)
        await this.uiElement.waitForElementVisible(this.whatHappensForm, 5000)
        await this.uiElement.waitForElementVisible(this.suppContact, 5000)
        await this.uiElement.waitForElementVisible(this.serachButton, 5000)
        const alternativeServices = (await this.page.$$(this.alternativeCategories)).length
        expect(alternativeServices).toEqual(8)

        return this
    }

    async clickOnSearchNow(): Promise<SearchPage> {
        await this.uiElement.clickOnElement(this.serachButton)

        return new SearchPage(this.page).pageLoaded()
    }

    async clickOnRandomCategory(): Promise<SearchPage> {
        const shortlistedServices: number = (await this.page.$$(this.alternativeCategories)).length
        const randomIndex: number = RandomHelper.getRandomInt(0, shortlistedServices)
        const randomelement = await this.page.$(`(${this.alternativeCategories})[${randomIndex}]`)
        await randomelement.focus()
        await randomelement.click()

        return new SearchPage(this.page).pageLoaded()
    }

    async isDepositEqual(deposit: string): Promise<boolean> {
        return (await this.uiElement.getText(this.deposit)).trim() === deposit
    }

    async isServiceFeeEqual(fee: string): Promise<boolean> {
        return (await this.uiElement.getText(this.serviceFee)).trim() === fee
    }

    async isBalanceEqual(balance: string): Promise<boolean> {
        return (await this.uiElement.getText(this.balance)).trim() === balance
    }
}
