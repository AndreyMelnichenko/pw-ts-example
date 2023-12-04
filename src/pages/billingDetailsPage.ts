import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { BillingPage } from "./billingPage"
import { SuppCheckoutPage } from "./suppCheckoutPage"

export class BillingDetailsPage extends BasePage {
    private readonly uiElement: UIElement

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<BillingDetailsPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/s\/billing-details\//g)

        return this
    }

    async fillBankDetails(): Promise<SuppCheckoutPage> {
        await this.uiElement.input.setText("[name='accountNo']", "12121212")
        await this.uiElement.input.setText("[name='sortCode']", "121212")
        await this.uiElement.input.setText("[name='address']", "Heroiv Mariupola str")
        await this.uiElement.input.setText("[name='city']", "Kyiv")
        await this.uiElement.input.setText("[name='county']", "Ukraine")
        await this.uiElement.input.setText("[name='postalCode']", "TS225PS")
        await this.uiElement.input.setText("textarea", "Test text")
        await this.uiElement.clickOnElement("//button[text()='Save']")
        await this.uiElement.clickOnElement("//button[text()='Continue ']")

        return new SuppCheckoutPage(this.page, this.isMobile).pageLoaded()
    }

    async fillPassword(password: string): Promise<void> {
        await this.uiElement.waitForElementVisible("//h2[text()='Security check']")
        await this.uiElement.input.setText("[placeholder='Password']", password)
        await this.uiElement.button.clickButtonByText("CONTINUE")
    }

    async changeAdress(address: string): Promise<void> {
        await this.uiElement.input.setText("[placeholder='Address']", address)
        await this.uiElement.clickOnElement("//button[text()='Save']")
        await this.waitLoader(25000)
    }

    async clickEdit(): Promise<void> {
        await this.uiElement.clickOnElement("//button[text()='Edit']")
    }

    async clickContinue(): Promise<BillingPage> {
        await this.uiElement.clickOnElement("//button[text()='Continue ']")

        return new BillingPage(this.page, this.isMobile).pageLoaded()
    }

    override async isTextPresent(text: string): Promise<boolean> {
        return this.uiElement.isElementDisplayed(`//*[text()='${text}']`, 25000)
    }

}
