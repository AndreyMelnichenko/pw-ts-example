import { ElementHandle, expect, Page } from "@playwright/test"
import * as DateHelper from "../../src/utils/dateHelper"
import { ApiCalendarController } from "../Api/Controllers/calendarController"
import { UIElement } from "../components/uiElement"
import { Dates, Day } from "../models/days"
import { TimeSlot } from "../models/GraphQL/timeSlots"
import { LeftSideBarMenu, LeftSideBarMenuPage } from "../models/leftSideBarMenu"
import { Time, TimeRange } from "../models/timeRange"
import { IUser } from "../models/user"
import { BasePage } from "../pages/basePage"
import * as StringHelper from "../utils/stringHelper"
import { AvailabilitySettingsPage } from "./availabilitySettingsPage"
import { CalendarFeedsPage } from "./calendarFeedsPage"
import { DatePicker } from "./components/datePicker"
import { LeftSideMenu } from "./components/leftMenu"

export class SuppCalendarPage extends BasePage implements LeftSideBarMenu {
    private readonly uiElement: UIElement
    private readonly notice = "//div[@data-tid='Message']"
    private readonly serviceDropdown = "//input[@data-tid='Input' and @placeholder='Select services']"
    private readonly selectAllServices = "//div[@data-tid='Checkbox']//div[text()='Select all services']"
    private readonly timeRangeInput = "//div[@tid='TimeRangeInput']"
    private readonly nextMonthButton = "[title='Click to go to next month']"
    private readonly textArea = "textarea"
    private readonly serviceDropDownList =
        "(//div[@data-tid='Dialog']//div[contains(@style,'user-select: none; cursor: pointer')])[1]"
    private readonly serviceDropDownAreaList =
        "//div[@data-tid='Dialog']/div[contains(@style,'box-shadow: rgba(51, 51, 51, 0.1)')]"
    private readonly lockName = `${StringHelper.getRandomStr(5)} test`
    private readonly sideBarMenu: LeftSideMenu
    private readonly datePicker: DatePicker

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
        this.isMobile = isMobile
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
        this.datePicker = new DatePicker(this.page, this.isMobile)
    }

    async pageLoaded(): Promise<SuppCalendarPage> {
        await this.page.waitForLoadState("domcontentloaded", { timeout: 25000 })
        await this.uiElement.waitForUrl(/.*\/s\/calendar\//g)
        if (!this.isMobile) {
            await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("SYNC MY CALENDARS"))
            await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("HOW TO USE CALENDAR?"))
            await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("AVAILABILITY SETTINGS"))
            await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("BLOCK MULTIPLE DAYS"))
        } else {
            await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("MONTH"))
            expect((await this.uiElement.waitForArray("[data-tid='ClipButton']")).length > 3).toBeTruthy()
        }

        return this
    }

    async openSideBarMenu(itemName: string):
        Promise<LeftSideBarMenuPage> {
        return this.sideBarMenu.openMenuItem(itemName)
    }

    async openDayView(dayOffset: number): Promise<void> {
        if (!DateHelper.isDateInCurrentMonth(DateHelper.getDateWithDayOffset(dayOffset))) {
            await this.nextMonth()
        }
        const day = DateHelper.getDateWithDayOffset(dayOffset)
        const classCurrentMonth =
            await this.uiElement
                .getAttribute("//div[@title='Click to open detailed view']/div[text()='15']/..", "class", 15000)
        const selector = `//div[@class='${classCurrentMonth}']/div[text()='${day.getDate()}']/..`
        await this.uiElement.clickOnLastElement(selector)
        await this.waitDayView()
    }

    async nextMonth(): Promise<void> {
        await this.uiElement.clickOnElement(this.nextMonthButton)
    }

    async lockWholeDay(): Promise<void> {
        await this.openTimeSlotForm()
        await this.setFirstService()
        await this.setWholeDayLock()
        await this.setTextArea(this.lockName)
        await this.applyCreateTimeLock()
    }

    async lockTimeRange(timeRange: TimeRange): Promise<void> {
        await this.openTimeSlotForm()
        await this.setFirstService()
        await this.setTimeRange(timeRange)
        await this.setTextArea(this.lockName)
        await this.applyCreateTimeLock()
    }

    async applyMultiplyDates(): Promise<void> {
        await this.uiElement.checkbox.check("Apply to multiple dates")
    }

    async checkCreatedLock(lockName: string = this.lockName): Promise<boolean> {
        try {
            await this.page.waitForTimeout(2000)
            await this.page.reload()
            await this.uiElement.waitForElementVisible(`div[title='${lockName}']`, 15000)

            return true
        } catch (error) {
            return false
        }
    }

    async checkLockCreated(user: IUser, dayOffset: number): Promise<boolean> {
        const calendarApi = new ApiCalendarController(user)
        const timeSlots: Array<TimeSlot> = await calendarApi
            .getTimeSlots(
                DateHelper.getDateWithDayOffset(0),
                DateHelper.getDateWithDayOffset(dayOffset))

        return timeSlots.map((el) => el.reason).includes(this.lockName)
    }

    async removeTimeSlotsForDay(user: IUser, date: Date): Promise<void> {
        const calendarController = new ApiCalendarController(user)
        await calendarController.removeTimeSlotByDate(date)
        await this.page.reload()
    }

    async removeAllTimeSlots(user: IUser): Promise<void> {
        const calendarController = new ApiCalendarController(user)
        const timeSlots = await calendarController.getTimeSlots(
            DateHelper.getDateWithDayOffset(0),
            DateHelper.getDateWithDayOffset(30))
        for (const timeSlot of timeSlots) {
            await calendarController.deleteTimeSlot(timeSlot.pk)
        }
        await this.page.reload()
    }

    async removeTimeSlotByDate(user: IUser, date: Date): Promise<void> {
        const calendarApi = new ApiCalendarController(user)
        const timeslots: Array<TimeSlot> = await calendarApi.getTimeSlots(date, date)
        timeslots.map((el) => el.pk).forEach(async(el) => calendarApi.deleteTimeSlot(el))
        await this.page.reload()
    }

    async openSyncCalendar(): Promise<CalendarFeedsPage> {
        this.isMobile
            ? await this.uiElement.clickOnElement("(//button[@data-tid='ClipButton'])[1]")
            : await this.uiElement.button.clickButtonByText("SYNC MY CALENDARS")

        return new CalendarFeedsPage(this.page, this.isMobile).pageLoaded()
    }

    async openAvailabilitySettings(): Promise<AvailabilitySettingsPage> {
        this.isMobile
            ?   await this.uiElement.clickOnElement("(//button[@data-tid='ClipButton'])[3]")
            :   await this.uiElement.button.clickButtonByText("AVAILABILITY SETTINGS")

        return new AvailabilitySettingsPage(this.page, this.isMobile).pageLoaded()
    }

    async isNonWorkingDay(dayName: Day): Promise<boolean> {
        const filteredDates = this.getLeftDatesFromMonths(dayName)
        filteredDates.forEach(async (el) =>
            this.uiElement.waitForElementVisible(`//div[text()='${el.day}']/following-sibling::div//div[@title='non-working day']`))

        return true
    }

    async blockMultiplyDays(datesArr: Array<string>): Promise<void> {
        await this.uiElement.button.clickButtonByText("BLOCK MULTIPLE DAYS")
        await this.uiElement.waitForElementVisible("//div[@data-tid='ProgressHeader']//div[text()='BLOCK TIME SLOTS']")
        await this.setFirstService()
        await this.applyMultiplyDates()
        await this.openCalendarPicker()
        for (const day of datesArr) {
            await this.addDate(day)
        }
        await this.setTextArea(StringHelper.getRandomStr(8))
        await this.applyCreateTimeLock()
    }

    getLeftDatesFromMonths = (dayName: Day, dayOffset: number): Dates => {
        let calendarDays = DateHelper.getMonthDays()
        const currentDaysInMonth = calendarDays.length
        const currentDay = DateHelper.getDayOfMonth()
        let filteredMonthDates = calendarDays.filter((el) => el.name === dayName)
            .filter((el) => el.day >= currentDay + dayOffset)
        if (filteredMonthDates.length === 0) {
            calendarDays = DateHelper.getMonthDays(1)
            filteredMonthDates = calendarDays.filter((el) => el.name === dayName)
                .filter((el) => el.day >= currentDaysInMonth - currentDay + dayOffset)
        }

        return filteredMonthDates
    }

    private async waitDayView(): Promise<SuppCalendarPage> {
        await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("BLOCK TIME SLOTS"))
        await this.page.$eval(
            this.uiElement.button.getButtonSelector("MONTH"),
                async (element: ElementHandle<string>) => {
                    (await element.getAttribute("style") || "NO STYLE").includes("background: rgb(255, 0, 107)")})

        return this
    }

    private async openTimeSlotForm(): Promise<void> {
        await this.uiElement.button.clickButtonByText("BLOCK TIME SLOTS")
        await this.waitBlockTimeSlotForm()
    }

    private async waitBlockTimeSlotForm(): Promise<void> {
        await this.uiElement.waitForElementVisible("//div[@data-tid='ProgressHeader']//div[text()='BLOCK TIME SLOTS']")
        await this.uiElement.waitForElementVisible(this.notice)
        await this.uiElement.waitForElementVisible(this.serviceDropdown)
        await this.uiElement.waitForElementVisible(this.selectAllServices)
        await this.uiElement.waitForElementVisible(this.timeRangeInput)
        await this.uiElement.waitForElementVisible(this.textArea)
        await this.uiElement.waitForElementVisible(this.uiElement.button.getButtonSelector("CANCEL"))
    }

    private async applyCreateTimeLock(): Promise<void> {
        await this.uiElement.button.clickButtonByText("APPLY")
        await this.uiElement.button.clickButtonByText("YES, I’M SURE")
    }

    private async setFirstService(): Promise<void> {
        await this.uiElement.clickOnElement(this.serviceDropdown)
        await this.uiElement.waitForElementVisible(this.serviceDropDownAreaList)
        await this.uiElement.clickOnElement(this.serviceDropDownList)
    }

    private async setTextArea(text: string): Promise<void> {
        await this.uiElement.input.setText(this.textArea, text)
    }

    private async setWholeDayLock(): Promise<void> {
        await this.uiElement.checkbox.check("Block the whole day")
    }

    private async setTimeRange(timeRange: TimeRange): Promise<void> {
        if (!this.isMobile) {
            await this.setTimeRangeInput(timeRange.from, "From")
            await this.setTimeRangeInput(timeRange.to, "To")
        }
    }

    private async setTimeRangeInput(timeValue: Time, timeRangePart: "From" | "To"): Promise<void> {
        await this.openTimeRangeInput(timeRangePart)
        await this.uiElement.waitForElementVisible("//div[@tid='TimeRangeInput']//div[@data-tid='TimePicker']")
        const from = this.page.locator(
            "//div[@tid='TimeRangeInput']//div[@data-tid='TimePicker']//input[@data-tid='Input']")
        await from.nth(0).fill(String(timeValue.h))
        if (timeValue.m) await from.nth(1).fill(String(timeValue.m))
        // await from.nth(2).click()
        // await this.uiElement
        //     .clickOnElement(
        //         `//div[@tid='TimeRangeInput']//div[text()='${dayPart}']`)
    }

    private async openTimeRangeInput(inputType: "From" | "To"): Promise<void> {
        await this.uiElement.clickOnElement(`//div[text()='${inputType}']/following-sibling::div//input`)
    }

    private async addDate(day: string): Promise<void> {
        await this.datePicker.addDay(day)
    }

    private async openCalendarPicker(): Promise<void> {
        await this.uiElement.clickOnElement("[data-tid='ClipButton']")
    }
}
