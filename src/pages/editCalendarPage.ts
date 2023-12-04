import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { CalendarFeedsPage } from "./calendarFeedsPage"

export class EditCalendar extends BasePage {
    private readonly uiElement: UIElement

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<EditCalendar> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/s\/calendar\/feeds\/edit\/\d+\//g)
        await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("REMOVE FEED"))
        await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("SAVE & SYNC CALENDARS"))

        return this
    }

    async clickToRemove(): Promise<CalendarFeedsPage> {
        await this.uiElement.button.clickButtonByText("REMOVE FEED")

        return new CalendarFeedsPage(this.page).pageLoaded()
    }

}
