import { Page } from "@playwright/test"
import { Button } from "../components/button"
import { UIElement } from "../components/uiElement"
import { priceOptions } from "../models/priceOptions"
import * as StringHelper from "../utils/stringHelper"
import { BasePage } from "./basePage"
import { BillingDetailsPage } from "./billingDetailsPage"
import { Header } from "./components/header"
import { SuppCalendarPage } from "./suppCalendarPage"

export class SuppCheckoutPage extends BasePage {
    readonly header: Header
    private readonly uiElement: UIElement
    private readonly button: Button
    private readonly headerText: string = "//h1[text()='Booking summary']"
    private readonly quoteInfo: string = "(//h4[text()='Event details']/following::div//div[@data-tid='Stack'])[1]"
    private readonly priceCalculation: string = "//div[text()='Price details']"
    private readonly serviceCardMinified: string = "[data-tid='ServiceCardMinified']"
    private readonly suppInfo: string = "[data-tid='ContactInfo']"
    private readonly messageSupplierForm: string = "form[id='message-supplier-form']"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.button = new Button(this.page)
        this.header = new Header(this.page, this.isMobile)
    }

    async pageLoaded(): Promise<SuppCheckoutPage> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/inbox\/\d+\/.*/g, 15000)
        await this.uiElement.waitForElementVisible(this.headerText, 15000)
        await this.uiElement.waitForElementVisible(this.quoteInfo, 15000)
        await this.uiElement.waitForElementVisible(this.serviceCardMinified, 15000)
        await this.uiElement.waitForElementVisible(this.suppInfo, 15000)
        // await this.uiElement.waitForElementVisible(this.priceCalculation, 15000)
        await this.uiElement.waitForElementVisible(this.messageSupplierForm, 15000)

        return this
    }

    async isPriceOptionDisplayed(option: priceOptions): Promise<boolean> {
        await this.uiElement.waitForElementVisible(this.getPriceCalculationSelector(option))

        return true
    }

    async getPriceOptionValue(option: priceOptions): Promise<string> {
        return (await this.uiElement.getText(this.getPriceCalculationSelector(option)))
            .replace("£", "")

    }

    async confirmBooking(): Promise<void> {
        await this.uiElement.button.clickButtonByText("CONFIRM BOOKING")
        await this.isTextPresent("Booking confirmed!")
        await this.uiElement.button.clickButtonByText("GOT IT")
        await this.pageLoaded()
    }

    async cancelConfirmedBooking(): Promise<SuppCalendarPage> {
        await this.uiElement.button.clickButtonByText("CANCEL BOOKING")
        await this.uiElement.input.setText("input[placeholder='Please specify the cancellation reason']",
            "Change data of event")
        await this.uiElement.button.clickButton("//form//button[@data-tid='Button']//span[text()='CANCEL BOOKING']",
            15000)
        await this.setServiceToBlock()
        await this.uiElement.button.clickButtonByText("YES, I’M SURE")

        return new SuppCalendarPage(this.page, this.isMobile).pageLoaded()
    }

    async cancelUnConfirmedBooking(): Promise<SuppCalendarPage> {
        await this.uiElement.button.clickButtonByText("CANCEL BOOKING")
        await this.uiElement.waitForElementVisible("//div[text()='Are you sure you want to cancel this booking?']")
        await this.uiElement.clickOnElement("(//button[@data-tid='Button']//span[text()='CANCEL BOOKING'])[2]")
        await this.uiElement
            .waitForElementVisible("//div[text()='Are you sure you want to cancel this booking?']", 15000, true)
        await this.setServiceToBlock()
        await this.uiElement.button.clickButtonByText("YES, I’M SURE")

        return new SuppCalendarPage(this.page, this.isMobile).pageLoaded()
    }

    async cancelRequest(): Promise<void> {
        await this.uiElement.button.clickButtonByText("CANCEL REQUEST")
        await this.uiElement.textElement.waitForText("Please, provide a reason why you want to decline this event.")
        await this.uiElement.clickOnElement("[data-tid='Input']", 15000)
        await this.uiElement.clickOnElement("//*[@data-tid='Dialog']//div[text()='Sorry – this date is taken']", 15000)
        await this.uiElement.waitForElementVisible("[data-tid='Input'][value='Sorry – this date is taken']", 15000)
        await this.uiElement.button.clickButton("//form//button[@data-tid='Button']//span[text()='CANCEL REQUEST']")
        await this.uiElement.textElement.waitForText("Your quote was removed")
    }

    async reSubmitQuote(resubmitValues: {service: string, travel: string, deposit: string}): Promise<void> {
        await this.uiElement.clickOnElement("//button//span[text()='SUBMIT A BESPOKE QUOTE']")
        await this.uiElement.textElement.waitForText("Bespoke Quote")
        await this.setReSubmitValues("Total service price", resubmitValues.service)
        await this.setReSubmitValues("Travel expenses", resubmitValues.travel)
        await this.setReSubmitValues("Deposit", resubmitValues.deposit)
        await this.uiElement.button.clickButtonByText("SUBMIT")
    }

    async clickToAddBankDetails(): Promise<BillingDetailsPage> {
        await this.uiElement.button.clickButtonByText("ADD BANK DETAILS TO CONFIRM")

        return new BillingDetailsPage(this.page, this.isMobile).pageLoaded()
    }
    async sendMsgWithAttachment(text = "test text"): Promise<string> {
        const msgText = await this.addMessage(text)
        await this.openUploadForm()
        await this.uploadImg("test1.jpg")
        await this.uiElement.button.clickButtonByText("SEND MESSAGE")
        await this.isTextPresent(text)

        return msgText
    }

    async sendMessage(text = "test text"): Promise<string> {
        const msgText = await this.addMessage(text)
        await this.uiElement.button.clickButtonByText("SEND MESSAGE")
        await this.isTextPresent(text)

        return msgText
    }

    private async setReSubmitValues(
        fieldName: "Total service price" | "Deposit" | "Travel expenses",
        value: string): Promise<void> {
        await this.uiElement.input
            .setText(`(//div[text()='${fieldName}']/following::input[@data-tid='Input'])[1]`, value)
    }

    private async addMessage(text: string = StringHelper.getRandomText(50)): Promise<string> {
        const selector = "[data-tid='MultilineInput']>textarea"
        await this.uiElement.input.setText(selector, text, 15000)

        return text
    }

    private async openUploadForm(): Promise<SuppCheckoutPage> {
        await this.uiElement.clickOnElement("button>.plus.icon")
        await this.uiElement.waitForElementVisible(".ui.modal.transition.visible.active>div", 15000)

        return this
    }

    private async uploadImg(imgName: "test1.jpg" | "test2.jpg" | "test3.jpg" = "test1.jpg"): Promise<SuppCheckoutPage> {
        await this.uiElement.input.uploadFile(`./src/fixtures/${imgName}`)
        await this.uiElement.waitForElementVisible(".ui.green.left.corner.label")
        await this.uiElement.clickOnElement("//button[text()='Done']")

        return this
    }

    private async setServiceToBlock(): Promise<void> {
        await this.uiElement.waitForElementVisible("//div[text()='BLOCK TIME SLOTS']")
        await this.uiElement.clickOnElement("[placeholder='Select services']", 5000)
        await this.waitFor(1)
        await this.uiElement.clickOnElement("[data-tid='Dialog']>div:nth-child(2)")
        await this.uiElement.button.clickButtonByText("APPLY")
        await this.uiElement.waitForElementVisible("//div[text()='BLOCK TIME SLOTS']", 5000, true)
    }

    private getPriceCalculationSelector(option: priceOptions): string {
        let optionText = ""
        if (option === "SERVICE") optionText = "Service price"
        if (option === "EXTRA") optionText = "Extra options"
        if (option === "TRAVEL") optionText = "Travel expense"
        if (option === "FEE") {
            return `(${this.priceCalculation}/following::div//span[text()='Client’s service fee']/following::data//var)[1]`
        }
        if (option === "TOTAL") optionText = "Total price"
        if (option === "DEPOSIT") {
            return `${this.priceCalculation}/following::div//div[contains(text(),'Deposit')]/following-sibling::data//var`
        }
        if (option === "DEPOSIT-FEE") optionText = "Receive before the event"
        if (option === "PAY-AMOUNT") optionText = "What you pay now"

        return `${this.priceCalculation}/following::div//div[text()='${optionText}']/following-sibling::data//var`
    }
}
