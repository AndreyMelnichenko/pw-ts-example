import { Page } from "@playwright/test"
import { ApiServiceController, PackageInfo } from "../Api/Controllers/serviceController"
import { UIElement } from "../components/uiElement"
import { IEventDetails } from "../models/eventDetails"
import * as StringHelper from "../utils/stringHelper"
import { BasePage } from "./basePage"
import { SearchPage } from "./searchPage"

export class EventDashboard extends BasePage {
    private readonly uiElement: UIElement
    private readonly serviceController = new ApiServiceController()

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<EventDashboard> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/e\/events\/\d+\/.*/g)
        await this.uiElement.waitForElementVisible("[data-tid='BackToSearchBanner']")
        await this.uiElement.waitForElementVisible("[data-tid='CardGrid']")

        return this
    }

    async clickOnBannerButton(text: string): Promise<SearchPage> {
        await this.uiElement.button.clickButtonByText(text)

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }

    async isEventDetailsPresent(eventDetails: IEventDetails): Promise<boolean> {
        const isEventType = await this.isTextPresent(eventDetails.eventType)
        const isPostCode = await this.isTextPresent(StringHelper.postCodeNormalizer(eventDetails.postcode))

        return isEventType && isPostCode
    }

    async isServiceTitle(id: string): Promise<boolean> {
        const serviceInfo: PackageInfo = await this.serviceController.getServiceInfo(id)

        return this.uiElement.isElementDisplayed(`//h3[text()='${serviceInfo.title}']`)
    }

    async isEventPrice(id: string, price: string): Promise<boolean> {
        const serviceInfo: PackageInfo = await this.serviceController.getServiceInfo(id)
        const actPrice = await this.uiElement
            .getText(`//h3[text()='${serviceInfo.title}']/..//data[@data-tid="Price"]//var`)

        return actPrice.replace("£", "") === price
    }

    async getShortlistedServices(): Promise<number> {
        const cards = await this.uiElement.waitForArray("[data-tid='Card']")

        return cards.length
    }
}
