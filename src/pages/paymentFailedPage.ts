import { Page } from "@playwright/test"
import { Button } from "../components/button"
import { UIElement } from "../components/uiElement"
import { PaymentInfo } from "../models/paymentInfo"
import { BasePage } from "./basePage"
import { PaymentPage } from "./paymentPage"
import { PaymentSuccessPage } from "./paymentSuccessPage"

export class PaymentFailedPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly button: Button
    private readonly paymentInfo: PaymentInfo = {
        address: "Test Address",
        cardNumber: "4242424242424242",
        city: "Test",
        country: "Test",
        cvc: "123",
        expiration: "1223",
        phoneNumber: "111111111111",
        postalCode: "Test",
    }

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.button = new Button(this.page)
    }

    async pageLoaded(): Promise<PaymentFailedPage> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/e\/payment\/\d+\/.*/g)
        await this.uiElement.waitForElementVisible(".ui.negative.message", 25000)

        return this
    }

    async fillPaymentInformation(paymentInfo: PaymentInfo = this.paymentInfo):
        Promise<PaymentSuccessPage | PaymentFailedPage> {
        const paymentData = {
        ...this.paymentInfo,
        ...paymentInfo,
        }
        const payment = await new PaymentPage(this.page, this.isMobile).pageLoaded()

        return payment.fillPaymentInformation(paymentData)
    }
}
