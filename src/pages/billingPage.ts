import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { BillingDetailsPage } from "./billingDetailsPage"

export class BillingPage extends BasePage {
    private readonly uiElement: UIElement

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<BillingPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/s\/billing\//g)
        await this.uiElement.waitForElementVisible("//h2[text()='Invoices']")
        await this.uiElement.waitForElementVisible("//h2[text()='Bank details']")

        return this
    }

    async viewBillingDeatails(): Promise<BillingDetailsPage> {
        await this.uiElement.clickOnElement("//a[text()='View']")

        return new BillingDetailsPage(this.page, this.isMobile).pageLoaded()
    }

    async isTextPresent(text: string): Promise<boolean> {
        return this.uiElement.isElementDisplayed(`//*[text()='${text}']`)
    }
}
