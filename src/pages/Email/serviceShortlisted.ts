import { Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import { BasePage } from "../basePage"
import { CheckoutPage } from "../checkoutPage"
import { EventDashboard } from "../eventDashboard"

export class ServiceShortlisted extends BasePage {
    private readonly uiElement: UIElement
    private readonly mainText: string = "//h3[text()='Service Shortlisted']"
    private readonly price: string = ".shortListed-package>h4:nth-child(4)"
    private readonly title: string = ".shortListed-package>h4:nth-child(2)"
    private readonly viewService: string = "//a[@class='cta-button primary-cta' and text()='View service']"
    private readonly goToDashboard: string = "//a[@href and text()='Go to dashboard']"
    private readonly saveAndSecure: string = "//h4[text()=' Safe & Secure ']"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<ServiceShortlisted> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/serve\/mailbox\/testinbo\/\d+\/html.*/g)
        await this.uiElement.waitForElementVisible(this.mainText, 5000)
        await this.uiElement.waitForElementVisible(".shortListed-package>img", 5000)
        await this.uiElement.waitForElementVisible(this.price, 5000)
        await this.uiElement.waitForElementVisible(this.viewService)
        await this.uiElement.waitForElementVisible(this.goToDashboard)
        await this.uiElement.waitForElementVisible(this.saveAndSecure)
        await this.uiElement.waitForElementVisible("footer.footer", 5000)

        return this
    }

    async checkPrice(expPrice: string): Promise<boolean> {
        await this.uiElement.waitForElementVisible(this.price)
        const actPrice = await this.uiElement.getText(this.price)

        return actPrice.substring(1) === expPrice
    }

    async checkTitle(expTitle: string): Promise<boolean> {
        await this.uiElement.waitForElementVisible(this.title)
        const actTitle = await this.uiElement.getText(this.title)

        return actTitle === expTitle
    }

    async clickOnViewService(): Promise<CheckoutPage> {
        await this.uiElement.clickOnElement(this.viewService)

        return new CheckoutPage(this.page).pageLoaded()
    }

    async clickOnGoToDashboard(): Promise<EventDashboard> {
        await this.uiElement.clickOnElement(this.goToDashboard)

        return new EventDashboard(this.page).pageLoaded()
    }
}
