import { Page } from "@playwright/test"
import { Button } from "../components/button"
import { UIElement } from "../components/uiElement"
import { PriceModifyer, PriveModifyerNameList } from "../models/priceModifyer"
import { priceOptions } from "../models/priceOptions"
import { TimeSlotList, TimeSlotListArr } from "../models/timeSlotList"
import * as StringHelper from "../utils/stringHelper"
import { BasePage } from "./basePage"
import { Header } from "./components/header"
import { EventDashboard } from "./eventDashboard"
import { PaymentPage } from "./paymentPage"
import { SearchPage } from "./searchPage"
import { ServicePage } from "./servicePage"

export class CheckoutPage extends BasePage {
    readonly header: Header
    private readonly uiElement: UIElement
    private readonly button: Button
    private readonly headerText: string = "//*[text()='Instant Quote']"
    private readonly quoteInfo: string = "(//h5[text()='Event details']/following::div//div[@data-tid='Stack'])[1]"
    private readonly priceCalculation: string = "//*[text()='Price details' or text()='Price Calculation']"
    private readonly serviceCardMinified: string = "[data-tid='ServiceCardMinified']"
    private readonly suppInfo: string = "[data-tid='ContactInfo']"
    private readonly messageSupplierForm: string = "form[id='message-supplier-form']"
    private readonly serviceTitle: string = "div[data-tid='Stack'] h3"
    private readonly guestAmountInput: string = "[id='quote-chargingQuantity'] [data-tid='Input']"
    private readonly bookingComment: string = "textarea[placeholder='Describe your event in short']"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.button = new Button(this.page)
        this.header = new Header(this.page, this.isMobile)
    }

    async pageLoaded(): Promise<CheckoutPage> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/inbox\/\d+\/.*/g, 30000)
        await this.uiElement.waitForElementVisible(this.headerText, 35000)
        await this.uiElement.waitForElementVisible(this.quoteInfo, 15000)
        await this.uiElement.waitForElementVisible(this.serviceCardMinified, 15000)
        await this.uiElement.waitForElementVisible(this.suppInfo, 15000)
        await this.uiElement.waitForElementVisible(this.priceCalculation, 15000)
        await this.uiElement.waitForElementVisible(this.messageSupplierForm, 15000)

        return this
    }

    async checkQuoteId(expId: string): Promise<boolean> {
        return this.page.url().includes(expId)
    }

    async getQuoteId(): Promise<string> {
        const url = this.page.url()
        const regexp = /.*\/inbox\/(\d+)\/.*/gm
        const quoteId = regexp.exec(url) || ""
        if (quoteId?.length < 2) throw new Error("No valid regexp")

        return quoteId[1] || "No valid Quote id"
    }

    async getServiceTitle(): Promise<string> {
        return this.uiElement.getText(this.serviceTitle)
    }

    async isMessageArea(): Promise<boolean> {
        return this.uiElement.isVisible("textarea")
    }

    async clickOnBookNow(): Promise<PaymentPage> {
        await this.waitFor(2)
        const selector = this.uiElement.button.getButtonSelector("BOOK NOW")
        await this.uiElement.waitForElementVisible(selector)
        await this.uiElement.button.clickButtonByText("BOOK NOW")

        return this.fillBookingComment()
    }

    async clickOnCta(): Promise<PaymentPage> {
        await this.waitFor(2)
        const selector = "//*[text()='PAY NOW' or text()='BOOK NOW']"
        await this.uiElement.waitForElementVisible(selector)
        await this.uiElement.button.clickButton(selector)
        if (await this.uiElement.isElementDisplayed(this.bookingComment)) {
            await this.fillBookingComment()
        }

        return new PaymentPage(this.page, this.isMobile).pageLoaded()
    }

    async declineQuoteWithReason(reason:
        "Other" |
        "No longer need this quote" |
        "Looking for something alternative" |
        "Need different requirements" |
        "Quote is out of budget"): Promise<CheckoutPage> {
        await this.uiElement.button.clickButtonByText("REMOVE")
        await this.uiElement.clickOnElement("[data-tid='Stack'] [data-tid='Dropdown']", 5000)
        await this.uiElement.clickOnElement(`//div[text()='${reason}']`, 5000)
        if (reason === "Other") {
            await this.uiElement.input.setText("[placeholder='Tell more']", "Test quote decline reason message")
        }
        await this.uiElement.button.clickButtonByText("REMOVE QUOTE")

        return this
    }

    async isDeclineLightMessage(): Promise<boolean> {
        return this.uiElement
            .isElementDisplayed("//div[contains(@style, 'border-radius: 8px')]/h4[text()='Service Declined']", 15000)
    }

    async clickOnLightMessageLink(): Promise<SearchPage> {
        await this.waitFor(5)
        await this.uiElement.clickOnElement("//div[contains(@style, 'border-radius: 8px')]//a")

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }

    async clickOnEditButton(): Promise<ServicePage> {
        await this.uiElement.clickOnElement("//a[@data-tid='Link' and text()='Edit']")

        return new ServicePage(this.page, this.isMobile).pageLoaded()
    }

    async clickOnLinkWithText(text: string): Promise<ServicePage> {
        await this.uiElement.clickOnElement(`//a[@data-tid='Link' and text()='${text}']`)

        return new ServicePage(this.page, this.isMobile).pageLoaded()
    }

    async setGuestAmount(amount: string): Promise<void> {
        await this.uiElement.input.setText(this.guestAmountInput, amount)
        await this.page.waitForTimeout(3000)
    }

    async getGuestAmount(): Promise<string> {
        return this.uiElement.getAttribute(this.guestAmountInput, "value")
    }

    async getStartTime(): Promise<string> {
        return this.uiElement.getAttribute("//input[@name='quote-startTime']", "value")
    }

    async setStartTime(time: TimeSlotList): Promise<void> {
        await this.uiElement.clickOnElement("//input[@name='quote-startTime']")
        await this.uiElement.clickOnElement(`//div[text()='${time}']`)
        await this.uiElement.waitForElementVisible(`input[name='quote-startTime'][value='${time}']`)
    }

    async isStartTimeAvailable(startTime: TimeSlotList | { from: TimeSlotList, to: TimeSlotList } = "07:00 PM"):
        Promise<boolean> {
            await this.uiElement.clickOnElement("//input[@name='quote-startTime']")
            if (typeof startTime === "object") {
                const filteredTimeSlots = TimeSlotListArr
                    .filter((el) => TimeSlotListArr.indexOf(el) >= TimeSlotListArr.indexOf(startTime.from))
                    .filter((el) => TimeSlotListArr.indexOf(el) <= TimeSlotListArr.indexOf(startTime.to))
                const result = []
                for (const time of filteredTimeSlots) {
                    result.push(await this.uiElement.isExists(
                        `//div[@data-tid='Dialog']//div[contains(@style, 'cursor: pointer')]/div[text()='${time}']`))
                }

                return result.filter((el) => !el).length === 0
            }

        return this.uiElement.isExists(
            `//div[@data-tid='Dialog']//div[contains(@style, 'cursor: pointer')]/div[text()='${startTime}']`)
    }

    async getServicePrice(): Promise<string> {
        return (await this.uiElement
            .getText("(//div[text()='Service price']/following::span/var)[1]"))
            .replace("£", "")
    }

    async isPriceOptionDisplayed(option: priceOptions): Promise<boolean> {
        await this.uiElement.waitForElementVisible(this.getPriceCalculationSelector(option))

        return true
    }

    async getPriceOptionValue(option: priceOptions): Promise<string> {
        const selector = this.getPriceCalculationSelector(option)
        const value = await this.uiElement.getAttribute(selector, "value")

        return value.replace("£", "")
    }

    async getPriceCalculation(...modifyer: Array<PriveModifyerNameList>): Promise<PriceModifyer> {
        const priceModifyer: PriceModifyer = {}
        if (modifyer.includes("FEE") && !this.isMobile) priceModifyer.fee = await this.getPriceOptionValue("FEE")
        if (modifyer.includes("PRICE") && !this.isMobile) priceModifyer.servicePrice = await this.getPriceOptionValue("SERVICE")
        if (modifyer.includes("TOTAL")) priceModifyer.total = await this.getPriceOptionValue("TOTAL")
        if (modifyer.includes("TRAVEL") && !this.isMobile) priceModifyer.travel = await this.getPriceOptionValue("TRAVEL")

        return priceModifyer
    }

    async setPromoCode(code: string): Promise<void> {
        await this.uiElement.input.setText("[data-tid='PromoCode'] input", code)
        await this.uiElement.button.clickButtonByText("APPLY")
        await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("APPLIED"))
    }

    async setDuration(duration: string): Promise<void> {
        await this.waitFor(2)
        await this.uiElement.clickOnElement("input[data-tid='Input'][placeholder='Select option']", 15000)
        await this.uiElement.waitForElementVisible("//div[@data-tid='Dialog']/div[contains(@style, 'background: rgb(255, 255, 255)')]")
        await this.uiElement.clickOnElement(`//div[@data-tid='Dialog']//div[text()='${duration}']`)
    }

    async isExtraOptions(): Promise<boolean> {
        await this.uiElement.isElementDisplayed("#quote-extraServices")

        return true
    }

    async addExtraOption(): Promise<void> {
        await this.waitFor(1)
        const selector = "//div[@data-tid='Checkbox']/div[contains(@style,'background: rgb(255, 255, 255)')]"
        await this.uiElement.waitForElementVisible(`(${selector})[1]`)
        await this.uiElement.clickOnElement(`(${selector})[1]`)
    }

    async sendMsgWithAttachment(): Promise<CheckoutPage> {
        const text = await this.addMessage()
        await this.openUploadForm()
        await this.uploadImg("test1.jpg")
        await this.uiElement.button.clickButtonByText("SEND MESSAGE")
        await this.isTextPresent(text)

        return this
    }

    async isBookingConfirmed(): Promise<boolean> {
        return this.isTextPresent("Booking Confirmed")
    }

    async cancelBooking(isConfirmed = true): Promise<CheckoutPage> {
        await this.uiElement.button.clickButtonByText("CANCEL BOOKING")
        await this.isTextPresent("Please let us know the reason for the booking cancellation.")
        await this.uiElement.clickOnElement("[data-tid='Input']", 15000)
        await this.uiElement.clickOnElement("//*[@data-tid='Dialog']//div[text()='My event is not going ahead']", 15000)
        await this.uiElement.waitForElementVisible("[data-tid='Input'][value='My event is not going ahead']", 15000)
        await this.uiElement.button.clickButton("//form//button[@data-tid='Button']//span[text()='CANCEL BOOKING']")
        await this.isTextPresent("Request to cancel the booking has been submitted")
        if (isConfirmed) await this.uiElement.button.clickButtonByText("OK")

        return this.pageLoaded()
    }

    async goToEventPage(): Promise<EventDashboard> {
        await this.uiElement.clickOnElement("[data-tid='Breadcrumbs'] a[href*='/e/events']")

        return new EventDashboard(this.page, this.isMobile).pageLoaded()
    }

    private getPriceCalculationSelector(option: priceOptions): string {
        let optionText = ""
        if (option === "SERVICE") optionText = "Service price"
        if (option === "EXTRA") optionText = "Extra options"
        if (option === "TRAVEL") optionText = "Travel expense"
        if (option === "FEE") {
            return `(${this.priceCalculation}/following::div//span[text()='Service fee']/following::data)[1]`
        }
        if (option === "TOTAL") optionText = "Total price"
        if (option === "DEPOSIT") optionText = "Deposit"
        if (option === "DEPOSIT-FEE") {
            return `(${this.priceCalculation}/following::div//div[text()='Service fee']/following::data)[4]`
        }
        if (option === "PAY-AMOUNT") {
            return `${this.priceCalculation}/following::div//span[text()='Pay to book']/following::data`
        }

        return `${this.priceCalculation}/following::div//div[text()='${optionText}']/following-sibling::data`
    }

    private async fillBookingComment(text: string = StringHelper.getRandomText(50)): Promise<PaymentPage> {
        // await this.uiElement
        //     .waitForElementVisible("//div[@data-tid='ProgressHeader']//div[text()='BOOKING COMMENT']", 10000)
        await this.uiElement.input.setText(this.bookingComment, text, 15000)
        await this.waitFor(2)
        await this.uiElement.button.clickButtonByText("SUBMIT")
        await this.waitFor(2)

        return new PaymentPage(this.page, this.isMobile).pageLoaded()
    }

    private async addMessage(text: string = StringHelper.getRandomText(50)): Promise<string> {
        const selector = "[data-tid='MultilineInput']>textarea"
        await this.uiElement.input.setText(selector, text, 15000)

        return text
    }

    private async openUploadForm(): Promise<CheckoutPage> {
        await this.uiElement.clickOnElement("button>.plus.icon")
        await this.uiElement.waitForElementVisible(".ui.modal.transition.visible.active>div", 15000)

        return this
    }

    private async uploadImg(imgName: "test1.jpg" | "test2.jpg" | "test3.jpg" = "test1.jpg"): Promise<CheckoutPage> {
        await this.uiElement.input.uploadFile(`./src/fixtures/${imgName}`)
        await this.uiElement.waitForElementVisible(".ui.green.left.corner.label")
        await this.uiElement.clickOnElement("//button[text()='Done']")

        return this
    }
}
