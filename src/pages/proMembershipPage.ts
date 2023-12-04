import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { PackageListPage } from "./packageListPage"
import { StripePaymentPage } from "./stripePaymentPage"

export class ProMembershipPage extends BasePage {
    private readonly uiElement: UIElement

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<ProMembershipPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/membership\/Pro\//g, 15000)
        await this.uiElement.waitForElementVisible("//h1[text()='Membership update checkout']", 15000)

        return this
    }

    async clickOnUpgrade(): Promise<StripePaymentPage> {
        await this.uiElement.button.clickButtonByText("UPGRADE MEMBERSHIP")
        await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("UPGRADE MEMBERSHIP"),
            30000,
            true)

        return new StripePaymentPage(this.page, this.isMobile).pageLoaded()
    }

    async isSubscriptionSuccess(): Promise<boolean> {
        return this.uiElement.textElement
            .isTextPresent("Your payment was successfully accepted.", 25000)
    }

    async goToServiceDashboard(): Promise<PackageListPage> {
        await this.uiElement.button.clickButtonByText("CHECK MY LISTINGS STATS")

        return new PackageListPage(this.page, this.isMobile).pageLoaded()
    }

}
