import { expect, Page } from "@playwright/test"
import { UIElement } from "../../components/uiElement"
import { Months } from "../../models/months"
import * as DateHelper from "../../utils/dateHelper"
import * as RandomHelper from "../../utils/randomHelper"
import * as StringHelper from "../../utils/stringHelper"

export class SearchFilter {
    readonly dateInput: string = "input[name='serviceRequest-date'],[placeholder='Date']"
    readonly eventTypeDropDown: string = "[name='serviceRequest-eventType'],[placeholder='Event type'],[placeholder='Event/occasion type']"
    readonly guestAmount: string = "input[name='serviceRequest-guestsNumber'],[placeholder='Guests'],[placeholder='Guests (up to)']"
    readonly postcode: string = "input[name='serviceRequest-location'],[placeholder='Postcode'],[placeholder='Event postcode']"
    private readonly monthName: string = "(//div[@data-tid='CalendarHeader']//span)[2]"
    private readonly nextMonth: string = "//div[@data-tid='CalendarHeader']/div[contains(@style,'-90deg')]"
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
    async setDate(eventDate: string, isIos = false): Promise<SearchFilter> {
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

    async setEventType(eventType = "RANDOM"): Promise<SearchFilter> {
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
                "//select[@name='serviceRequest-eventType']|//*[text()='Please, provide your event details' or text()='Get inspired. Book fast. Party on.']/following::select|//*[@data-tid='Dropdown']//option[text()='Event/occasion type']/..",
                eventType)
        }

        return this
    }

    async setGuestAmount(guestAmount = "5"): Promise<SearchFilter> {
        await this.uiElement.input.setText(this.guestAmount, guestAmount)

        return this
    }

    async setPostcode(postcode = "NE11BB"): Promise<SearchFilter> {
        await this.uiElement.input.setText(this.postcode, postcode)
        await this.uiElement.clickOnElement(
            `//div[@data-tid='Dialog']//div[text()='${StringHelper.postCodeNormalizer(postcode)}']`,
            10000)

        return this
    }

    protected async setMonth(monthName: string): Promise<void> {
        while (await this.uiElement.getText(this.monthName) !== monthName) {
            await this.page.waitForTimeout(500)
            await this.uiElement.clickOnElement(this.nextMonth)
        }
    }

    protected async setDay(day: string): Promise<void> {
        await this.uiElement.clickOnElement(this.buildCalendarDaySelector(day))
    }

    private async openDateForm(): Promise<void> {
        await this.uiElement.clickOnElement(this.dateInput)
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
        const actDate = await this.uiElement.getAttribute(this.dateInput, "value")

        return expDate === actDate
    }

    private readonly buildCalendarDaySelector = (dayStr: string): string => {
        return `//div[@data-tid='CalendarMonth']//div[(contains(@style,'rgb(255, 0, 107)') or contains(@style,'rgb(0, 0, 0)')) and text()='${dayStr}']`
    }

    private async openEventTypeDropDown(): Promise<void> {
        await this.uiElement.clickOnElement(this.eventTypeDropDown)
    }
}
