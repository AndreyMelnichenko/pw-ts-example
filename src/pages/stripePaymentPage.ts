import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { ProMembershipPage } from "./proMembershipPage"

export class StripePaymentPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly cardNumberInput = "input[placeholder='1234 1234 1234 1234']"
    private readonly expirationDate = "input[placeholder='MM / YY']"
    private readonly cvv = "input[placeholder='CVC']"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<StripePaymentPage> {
        await this.page.waitForLoadState("domcontentloaded", { timeout: 30000 })
        await this.uiElement.waitForUrl(/.*\/checkout.stripe.com\/pay\//g, 35000)
        await this.uiElement.waitForElementVisible(".App-Payment", 15000)

        return this
    }

    async fillPaymentData(): Promise<ProMembershipPage> {
        await this.uiElement.input.setText(this.cardNumberInput, "4242 4242 4242 4242")
        await this.uiElement.input.setText(this.expirationDate, "1223")
        await this.uiElement.input.setText(this.cvv, "123")
        await this.uiElement.input.setText("[id='billingName']", "test")
        await this.uiElement.button.clickButton(".SubmitButton-IconContainer", 10000)
        await this.uiElement.waitForElementVisible(".App-Payment", 55000, true)

        return new ProMembershipPage(this.page, this.isMobile)
    }
}
