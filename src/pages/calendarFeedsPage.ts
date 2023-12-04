import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { AddNewCalendar } from "./addNewCalendar"
import { BasePage } from "./basePage"
import { EditCalendar } from "./editCalendarPage"

export class CalendarFeedsPage extends BasePage {
    private readonly uiElement: UIElement

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<CalendarFeedsPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/s\/calendar\/feeds\//g)
        await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("ADD NEW CALENDAR"))
        await this.uiElement.textElement.isTextPresent("Sync your calendar with Poptop")
        await this.uiElement.textElement.isTextPresent("Your connected calendars:")

        return this
    }

    async addNewCalendar(): Promise<AddNewCalendar> {
        await this.uiElement.button.clickButtonByText("ADD NEW CALENDAR")

        return new AddNewCalendar(this.page).pageLoaded()
    }

    async removeFeed(): Promise<void> {
        const selector = this.uiElement.button.getButtonSelector("EDIT")
        if (await this.uiElement.isElementDisplayed(selector)) {
            await this.uiElement.button.clickButtonByText("EDIT")
            const removeCalendar = new EditCalendar(this.page)
            await removeCalendar.pageLoaded()
            await removeCalendar.clickToRemove()
        }
    }

    async isCalendarExist(name: string): Promise<boolean> {
        return this.uiElement.textElement.isTextPresent(name)
    }

}
