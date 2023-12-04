import { expect, Page } from "@playwright/test"
import { UIElement } from "../../components/uiElement"
import { IEventDetails } from "../../models/eventDetails"
import { Months } from "../../models/months"
import * as DateHelper from "../../utils/dateHelper"
import * as RandomHelper from "../../utils/randomHelper"
import * as StringHelper from "../../utils/stringHelper"

export class MessageSupplierFilter {
    private readonly dateInput: string = "[name='serviceAcquisition-date']"
    private readonly calendarDatesView: string = "[data-tid='Calendar']"
    private readonly activeDates: string = "//div[@data-tid='CalendarMonth']//div[contains(@style,'rgb(0, 0, 0)') and text()='%s']"
    private readonly monthName: string = "(//div[@data-tid='CalendarHeader']//span)[2]"
    private readonly year: string = "//div[@data-tid='CalendarHeader']/span/span[not(contains(@style,'margin'))]"
    private readonly nextMonth: string = "//div[@data-tid='CalendarHeader']/div[contains(@style,'-90deg')]"
    private readonly eventTypeDropDown: string = "[name='serviceAcquisition-eventType']"
    private readonly guestAmount: string = "[name='serviceAcquisition-guestsNumber']"
    private readonly postcode: string = "[name='serviceAcquisition-location']"
    private readonly page: Page
    private readonly uiElement: UIElement
    private readonly isMobile: boolean

    constructor(page: Page, isMobile = false) {
        this.page = page
        this.uiElement = new UIElement(this.page)
        this.isMobile = isMobile
    }

    /**
     * @param eventDate format ["D MMM YYYY"] example: "24 Jul 2021"
     * @returns SearchFilter
     */
    async setDate(eventDate: string, isIos = false): Promise<MessageSupplierFilter> {
        const expDate: Date = DateHelper.getDateFrom(eventDate, "D MMM YYYY")
        if (!this.isMobile) {
            await this.openDateForm()
            const availableDays: Array<string> = this.getAvailableDays()
            await this.setMonth(Months[expDate.getMonth()].toUpperCase())
            await this.setDay(expDate.getUTCDate().toString())
            expect(await this.isActualDate(eventDate)).toBeTruthy()
        } else {
            await this.uiElement.clickOnElement(this.dateInput)
            await this.page.waitForTimeout(2000)
            await this.uiElement.clickOnElement(this.dateInput)
            if (isIos) {
                await this.setMobileDateInput(DateHelper.getDateWithFormat(expDate, "MM"))
                await this.page.keyboard.press("ArrowRight")
                await this.setMobileDateInput(DateHelper.getDateWithFormat(expDate, "DD"))
                await this.page.keyboard.press("ArrowRight")
                await this.setMobileDateInput(DateHelper.getDateWithFormat(expDate, "YYYY"))
            } else {
                await this.page.keyboard.press("ArrowRight")
                await this.page.keyboard.press("ArrowRight")

                await this.setMobileDateInput(DateHelper.getDateWithFormat(expDate, "YYYY"))
                await this.page.keyboard.press("ArrowLeft")
                await this.setMobileDateInput(DateHelper.getDateWithFormat(expDate, "DD"))
                await this.page.keyboard.press("ArrowLeft")
                await this.page.keyboard.press("ArrowLeft")
                await this.setMobileDateInput(DateHelper.getDateWithFormat(expDate, "MM"))
            }
        }

        return this
    }

    async setMobileDateInput(text: string): Promise<void> {
        for (const character of text) {
            await this.page.keyboard.press(character)
        }
        await this.page.waitForTimeout(300)
    }

    async setEventType(eventType = "RANDOM"): Promise<MessageSupplierFilter> {
        if (!this.isMobile) {
            await this.openEventTypeDropDown()
            const baseEventTypeSelector = "//div[@data-tid='Dialog']//div[contains(@style,'user-select')]/div"
            let selector: string
            if (eventType === "RANDOM") {
                const typesArr = await this.page.$$(baseEventTypeSelector)
                const randIndex = RandomHelper.getRandomArrayElementIndex(typesArr) + 1
                selector = `(${baseEventTypeSelector})[${randIndex}]`
            } else {
                selector = `${baseEventTypeSelector}[text()='${eventType}']`
            }
            await this.uiElement.waitForElementVisible(selector)
            await this.uiElement.clickOnElement(selector)
        } else {
            await this.uiElement.dropDownSelect.setValue(
                "//*[@id='serviceAcquisition-eventType']//*[@data-tid='Dropdown']/select",
                eventType)
        }

        return this
    }

    async setGuestAmount(guestAmount = "5"): Promise<MessageSupplierFilter> {
        await this.uiElement.input.setText(this.guestAmount, guestAmount)

        return this
    }

    async setPostcode(postcode = "NE11BB"): Promise<MessageSupplierFilter> {
        await this.uiElement.input.setText(this.postcode, postcode)
        const normalizedPostcode = `${postcode.substring(0, postcode.length - 3)} ${postcode.slice(postcode.length - 3, postcode.length)}`
        await this.uiElement.clickOnElement(
            `//div[@data-tid='Dialog']//div[text()='${normalizedPostcode}']`,
            10000)

        return this
    }

    async isEventDetails(): Promise<boolean> {
        const isDate = await this.uiElement.getAttribute(this.dateInput, "value") !== ""

        return true
    }

    async getPrefillEventDetail(): Promise<IEventDetails> {
        const eventDetail: IEventDetails = {}
        if (this.isMobile) {
            const value = await this.uiElement.getAttribute("[name='serviceAcquisition-date']", "value")
            value === ""
                ? eventDetail.date = ""
                : eventDetail.date = DateHelper.getDateWithFormat(new Date(value), "D MMM YYYY")
        } else {
            eventDetail.date = await this.uiElement.getAttribute("[name='serviceAcquisition-date']", "value")
        }
        this.isMobile
            ? eventDetail.eventType =  StringHelper.capitalizerFirstLetter(await this.page
                .evaluate("document.querySelector(\"[name='serviceAcquisition-eventType']\").value"))
            : eventDetail.eventType = await this.uiElement
                .getAttribute("[name='serviceAcquisition-eventType']", "value")
        eventDetail.guestAmount =
            await this.uiElement.getAttribute("[name='serviceAcquisition-guestsNumber']", "value")
        eventDetail.postcode =
            (await this.uiElement.getAttribute("[name='serviceAcquisition-location']", "value"))
                .replace(" ", "").trim().toUpperCase()

        return eventDetail
    }

    private async openDateForm(): Promise<void> {
        await this.uiElement.clickOnElement(this.dateInput)
    }

    private async setMonth(monthName: string): Promise<void> {
        while (await this.uiElement.getText(this.monthName) !== monthName) {
            await this.page.waitForTimeout(500)
            await this.uiElement.clickOnElement(this.nextMonth)
        }
    }

    private readonly getAvailableDays = (): Array<string> => {
        const days: Array<string> = []
        const currentDay: number = DateHelper.getDayOfMonth()
        const daysOfMonth: number = DateHelper.getDaysInMonth()
        for (let i = currentDay + 1; i <= daysOfMonth; i = i + 1) {
            days.push(i.toString())
        }

        return days
    }

    private async isActualDate(expDate: string): Promise<boolean> {
        const actDate = await this.uiElement.getAttribute("input[name='serviceAcquisition-date']", "value")

        return expDate === actDate
    }

    private async setDay(day: string): Promise<void> {
        await this.uiElement.clickOnElement(this.buildCalendarDaySelector(day))
    }

    private readonly getRandomAvaliableDay = (days: Array<string>): string => {
        const randIndex: number = RandomHelper.getRandomArrayElementIndex(days)

        return days[randIndex]
    }

    private readonly buildCalendarDaySelector = (dayStr: string): string => {
        return `//div[@data-tid='CalendarMonth']//div[(contains(@style,'rgb(255, 0, 107)') or contains(@style,'rgb(0, 0, 0)')) and text()='${dayStr}']`
    }

    private async openEventTypeDropDown(): Promise<void> {
        await this.uiElement.clickOnElement(this.eventTypeDropDown)
    }
}
