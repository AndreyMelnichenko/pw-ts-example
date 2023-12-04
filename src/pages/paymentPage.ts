import { Page } from "@playwright/test"
import { Button } from "../components/button"
import { UIElement } from "../components/uiElement"
import { PaymentInfo } from "../models/paymentInfo"
import { priceOptions } from "../models/priceOptions"
import { BasePage } from "./basePage"
import { PaymentFailedPage } from "./paymentFailedPage"
import { PaymentSuccessPage } from "./paymentSuccessPage"

export class PaymentPage extends BasePage {
    private readonly suppTitle: string = "//h3[text()='%s']"
    private readonly clientName: string = "//h1[text()='%s']"
    private readonly uiElement: UIElement
    private readonly button: Button
    private readonly paymentInfo: PaymentInfo = {
        address: "Test Address",
        cardNumber: "4242424242424242",
        city: "Test",
        country: "Test",
        cvc: "123",
        expiration: "1223",
        isFail: false,
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

    async pageLoaded(): Promise<PaymentPage> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/e\/payment\/\d+\/.*/g)
        await this.uiElement.waitForElementVisible("//div[text()='Debit / Credit card']")
        await this.uiElement.waitForElementVisible("//div[text()='Your billing details']")
        await this.uiElement.waitForElementVisible(this.button.getButtonSelector("MAKE PAYMENT"))

        return this
    }

    async fillPaymentInformation(paymentInfo: PaymentInfo = this.paymentInfo):
        Promise<PaymentSuccessPage | PaymentFailedPage | PaymentPage> {
        const paymentData = {
        ...this.paymentInfo,
        ...paymentInfo,
        }
        await this.uiElement.input.setText("[name='card']", paymentData.cardNumber || "NONE")
        await this.uiElement.input.setText("[name='expiration']", paymentData.expiration || "NONE")
        await this.uiElement.input.setText("[name='cvc']", paymentData.cvc || "NONE")
        await this.uiElement.input.setText("[placeholder='Your address line 1']", paymentData.address || "NONE")
        await this.uiElement.input.setText("[placeholder='City or town']", paymentData.city || "NONE")
        await this.uiElement.input.setText("[placeholder='Postcode']", paymentData.postalCode || "NONE")
        await this.uiElement.input.setText("[placeholder='Phone number']", paymentData.phoneNumber || "NONE")
        if (await this.uiElement.isElementDisplayed(
            "//div[@data-tid='Checkbox']//div[contains(@style, 'background: rgb(255, 255, 255)')]", 5000)) {
                await this.uiElement.clickOnElement("[data-tid='Checkbox']>div")
        }
        await this.uiElement.button.clickButtonByText("MAKE PAYMENT")
        if (paymentData.cardNumber === "4000002760003184") {
            if (paymentData.isFail) {
                await this.uiElement.clickOnElement("button[id='test-source-fail-3ds']", 15000)

                return this.pageLoaded()
            }
            await this.uiElement.clickOnElement("button[id='test-source-authorize-3ds']", 15000)
        }
        if (paymentData.cardNumber === "4000000000009995") {
            return new PaymentFailedPage(this.page, this.isMobile).pageLoaded()
        }

        return new PaymentSuccessPage(this.page, this.isMobile).pageLoaded()
    }

    async isPriceOptionDisplayed(option: priceOptions): Promise<boolean> {
        await this.uiElement.waitForElementVisible(this.getPriceCalculationSelector(option))

        return true
    }

    async getPriceOptionValue(option: priceOptions): Promise<string> {
        return (await this.uiElement.getText(this.getPriceCalculationSelector(option)))
            .replace("£", "")

    }

    private readonly getPriceCalculationSelector = (option: priceOptions): string => {
        let optionText = ""
        if (option === "SERVICE") optionText = "Service price"
        if (option === "TRAVEL") optionText = "Travel expense"
        if (option === "FEE") optionText = "Service fee"
        if (option === "TOTAL") optionText = "Total price"
        if (option === "PAY-AMOUNT") optionText = "Pay to book"

        return `(//*[text()='${optionText}']/following::var)[1]`
    }
}
