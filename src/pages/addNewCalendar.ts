import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import * as StringHelper from "../utils/stringHelper"
import { BasePage } from "./basePage"
import { CalendarFeedsPage } from "./calendarFeedsPage"

export class AddNewCalendar extends BasePage {
    private readonly uiElement: UIElement
    private readonly chooseServiceDropdown = "[placeholder='Click here to select services']"
    private readonly serviceDropdownList = "//div[@data-tid='Dialog']/div[2]"
    private readonly serviceDropdownItem = "//div[@data-tid='Dialog']/div[2]/div[1]"
    private readonly calendarLink = "[placeholder='https://calendar.google.com/calendar?cid={id}']"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<AddNewCalendar> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/s\/calendar\/feeds\/edit\//g)
        await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("CANCEL"))
        await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("SAVE & SYNC CALENDARS"))
        await this.uiElement.waitForElementVisible(this.uiElement.input.getInputSelector("Example: Hog Roast services"))

        return this
    }

    async setNewCalendar(name: string, servicesToSync: "allServices" | "firstService"): Promise<CalendarFeedsPage> {
        await this.fillNewFeed(name, servicesToSync)
        await this.saveButton()
        await this.clickToSave()

        return new CalendarFeedsPage(this.page).pageLoaded()
    }

    async fillNewFeed(name: string, servicesToSync: "allServices" | "firstService"): Promise<void> {
        await this.setCalName(name)
        await this.addCalLink(servicesToSync)
        servicesToSync === "allServices"
            ? await this.syncAllServices()
            : await this.syncFirstService()
    }

    async setBadCalendarLink(link: string): Promise<void> {
        await this.setCalName(`Test Calendar ${StringHelper.getRandomStr(10)}`)
        await this.uiElement.input.setText(this.calendarLink, link)
        await this.saveButton()
    }
    async cancelCalendarFeed(): Promise<CalendarFeedsPage> {
        await this.uiElement.button.clickButtonByText("CANCEL")

        return new CalendarFeedsPage(this.page, this.isMobile).pageLoaded()
    }

    private async setCalName(name: string): Promise<void> {
        const selector: string = this.uiElement.input.getInputSelector("Example: Hog Roast services")
        await this.uiElement.input.setText(selector, name)
    }

    private async addCalLink(servicesToSync: string): Promise<void> {
        servicesToSync === "allServices"
            ? await this.uiElement.input.setText(this.calendarLink, "https://calendar.google.com/calendar/ical/nana%40poptop.co.uk/public/basic.ics")
            : await this.uiElement.input.setText(this.calendarLink, "webcal://p41-caldav.icloud.com/published/2/MTY1NTA1MjYyODcxNjU1MOf1R_v9ARnetjoYx_oBWKr1pp8pvknqryTM8VbUROmb")
    }

    private async syncAllServices(): Promise<void> {
        await this.uiElement.checkbox.check("Sync all of my services with this calendar")
    }

    private async syncFirstService(): Promise<void> {
        await this.uiElement.clickOnElement(this.chooseServiceDropdown)
        await this.uiElement.waitForElementVisible(this.serviceDropdownList)
        await this.uiElement.clickOnElement(this.serviceDropdownItem)
    }

    private async saveButton(): Promise <void> {
        await this.uiElement.button.clickButtonByText("SAVE & SYNC CALENDARS")
        await this.waitLoader(25000)
    }

    private async clickToSave(): Promise<void> {
        await this.uiElement.button.clickButtonByText("CONFIRM TIME SLOTS")
        await this.uiElement.waitForElementVisible(
            this.uiElement.button.getButtonSelector("SAVE & SYNC CALENDARS"), 10000, true)

    }
}
