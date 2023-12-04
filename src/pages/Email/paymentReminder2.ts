import { Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import { BasePage } from "../basePage"
import { CheckoutPage } from "../checkoutPage"
import { PaymentSuccessPage } from "../paymentSuccessPage"

export class PaymentReminder2 extends BasePage {
    private readonly uiElement: UIElement
    private readonly mainText: string = "//h1[text()='Your Booking Is Pending']"
    private readonly viewServiceDetails: string = "//a[@class='cta-button primary-cta' and text()='View Service Details']"
    private readonly payDeposit: string = "//a[@class='cta-button primary-cta' and text()='Pay deposit']"
    private readonly footerText: string = "//h3[text()='Still Searching?']"
    private readonly booking: string = ".content .shortListed-package img"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<PaymentReminder2> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible(this.viewServiceDetails, 5000)
        await this.uiElement.waitForElementVisible(this.payDeposit, 5000)
        await this.uiElement.waitForElementVisible(this.footerText, 5000)
        await this.uiElement.waitForElementVisible(this.booking, 5000)
        await this.uiElement.waitForElementVisible("footer.footer", 5000)

        return this
    }

    async clickOnViewDetails(): Promise<CheckoutPage> {
        await this.uiElement.clickOnElement(this.viewServiceDetails)

        return new CheckoutPage(this.page).pageLoaded()
    }

    async clickOnPayDeposit(): Promise<PaymentSuccessPage> {
        await this.uiElement.clickOnElement(this.payDeposit)

        return new PaymentSuccessPage(this.page).pageLoaded()
    }
}
