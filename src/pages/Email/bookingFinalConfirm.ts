import { Page } from "@playwright/test"

import { Button } from "../../components/button"
import { UIElement } from "../../components/uiElement"
import { BasePage } from "../basePage"

export class BookingFinalConfirm extends BasePage {
    private readonly button: Button
    private readonly uiElement: UIElement
    private readonly mainText: string = "//h3[contains(text(),'Booking Confirmed!')]"
    private readonly userName: string = "//p[contains(text(),'Hi %s,')]"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.button = new Button(this.page)
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<BookingFinalConfirm> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible(this.mainText)

        return this
    }

    async isUserName(name: string): Promise<boolean> {
        return this.uiElement.isElementDisplayed(this.userName.replace("%s", name))
    }

    async isNoticeText(suppName: string, date: string): Promise<boolean> {
        return this.uiElement.isElementDisplayed(`//p[contains(text(),'${suppName} has now accepted the deposit for your booking on ${date}.')]`)
    }

    async isDepositAmount(deposit: string): Promise<boolean> {
        return this.uiElement.isElementDisplayed(`//p[text()='Deposit amount: ']/strong[text()='£${deposit}']`)
    }

    async isServiceFee(fee: string): Promise<boolean> {
        return this.uiElement.isElementDisplayed(`//p[text()='Service fee: ']/strong[text()='£${fee}']`)
    }

    async isBalance(balance: string): Promise<boolean> {
        return this.uiElement.isElementDisplayed(`//p[text()='Remaining Balance (to be paid to the supplier): ']/strong[text()='£${balance}']`)
    }
}
