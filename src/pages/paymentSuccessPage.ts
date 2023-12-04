import { expect, Page } from "@playwright/test"

import { Button } from "../components/button"
import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { SearchPage } from "./searchPage"

export class PaymentSuccessPage extends BasePage {
    private readonly manageMyBooking: string = "//a[@data-tid='Link' and text()='Manage my bookings']"
    private readonly suppTitle: string = "//h3[text()='%s']"
    private readonly clientName: string = "//h1[text()='%s']"
    private readonly uiElement: UIElement
    private readonly button: Button

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.button = new Button(this.page)
    }

    async pageLoaded(): Promise<PaymentSuccessPage> {
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/e\/payment\/\d+\/.*/g)
        await this.uiElement.waitForElementVisible(this.manageMyBooking, 25000)
        expect(await this.button.isButtonWithTextVisible("EXPLORE OTHER CATEGORIES")).toBeTruthy()

        return this
    }

    async isSuppText(supplier: string): Promise<boolean> {
        return this.uiElement.isElementDisplayed(this.suppTitle.replace("%s", supplier))
    }

    async isClient(client: string): Promise<boolean> {
        return this.uiElement.isElementDisplayed(this.clientName.replace("%s", client))
    }

    async exploreOtherCategories(): Promise<SearchPage> {
        await this.uiElement.button.clickButtonByText("EXPLORE OTHER CATEGORIES")

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }
}
