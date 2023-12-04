import { expect } from "@playwright/test"
import * as creds from "../../../creds.json"
import { test } from "../../../src/fixtures/mainPageFixtures"
import { CalendarFeedsPage } from "../../../src/pages/calendarFeedsPage"
import { LoginPage } from "../../../src/pages/loginPage"
import { NewContextMainPage } from "../../../src/pages/newContextMainPage"
import { SuppCalendarPage } from "../../../src/pages/suppCalendarPage"
import { SupplierServicePage } from "../../../src/pages/supplierServicePage"
import * as DataHelper from "../../../src/utils/dataHelper"
import * as DateHelper from "../../../src/utils/dateHelper"
import * as RandomHelper from "../../../src/utils/randomHelper"
import * as StringHelper from "../../../src/utils/stringHelper"

test.describe("Supplier calendar", () => {
    let loginPage: LoginPage
    const calendarSyncMode = ["allServices"]
    for (const syncMode of calendarSyncMode) {
        test(`sync ${syncMode} external calendar link with all services @C47 @smoke `,
            async ({ mainPage, isMobile }) => {
                await test.step("Test steps", async() => {
                    loginPage = await mainPage.openLoginForm(isMobile)
                    const supplierServicePage = (await loginPage.loginAs(creds.supplier[0])) as SupplierServicePage
                    const suppCalendarPage: SuppCalendarPage =
                        (await supplierServicePage.openSideBarMenu("Calendar")) as SuppCalendarPage
                    let feeds: CalendarFeedsPage = await suppCalendarPage.openSyncCalendar()
                    await feeds.removeFeed()
                    const addNewCalendar = await feeds.addNewCalendar()
                    const calendarName = `Test Calendar ${StringHelper.getRandomStr(10)}`
                    feeds = await addNewCalendar.setNewCalendar(calendarName, syncMode)
                    expect(await feeds.isCalendarExist(calendarName)).toBeTruthy()
                })
        })
    }

    test("Availability settings @C48 @smoke ", async ({ mainPage, isMobile }, testInfo) => {
        await test.step("Test steps", async() => {
        const notificationPeriod = "5"
        const randDayNumber = RandomHelper.getRandomInt(1, 7)
        const eventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(4, "D MMM YYYY")}`,
            eventCategory: "Catering",
            eventType: "Anniversary",
            guestAmount: "4",
            postcode: "TS225PS",
        }
        const user = DataHelper.getSuppByName("testSupp112")
        const login = await mainPage.openLoginForm(isMobile)
        const suppService = await login.loginAs(user) as SupplierServicePage
        let suppCalendarPage = await suppService.openSideBarMenu("Calendar") as SuppCalendarPage
        const avalibilityPage = await suppCalendarPage.openAvailabilitySettings()
        const days = await avalibilityPage.getNoticePeriod()
        expect(days).toEqual(notificationPeriod)
        suppCalendarPage = await avalibilityPage.chooseRestrictedDay(DateHelper.getDayName(randDayNumber))
        const randRestrictDate = suppCalendarPage
            .getLeftDatesFromMonths(DateHelper.getDayName(randDayNumber), Number(notificationPeriod))[0]
        const currMonth = DateHelper.getDateWithFormat(new Date(), "M")
        const availableMonth = DateHelper.getDateWithFormat(
            DateHelper.getDateFrom(randRestrictDate.date, "YYYY-MM-DD"), "M")
        if (Number(currMonth) < Number(availableMonth)) {
            await suppCalendarPage.nextMonth()
        }
        expect(await suppCalendarPage.isNonWorkingDay(DateHelper.getDayName(randDayNumber))).toBeTruthy()
        const clientMainPage = await new NewContextMainPage(testInfo).getNewContextPage(isMobile)
        const servicePage = await clientMainPage.openService("24170")
        await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
        expect(await servicePage
            .isTextPresent(`testSupp112 only accepts bookings ${notificationPeriod} days before the event date`))
                .toBeTruthy()
        eventDetails.date = DateHelper.convertDateFromTo(randRestrictDate.date, "YYYY-MM-DD", "D MMM YYYY")
        await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
        expect(await servicePage
            .isTextPresent("Sorry, there are no available time slots for the date"))
                .toBeTruthy()
        eventDetails.date = DateHelper.getDateString(DateHelper.getDateWithDayOffset(1,
                DateHelper.getDateFrom(eventDetails.date, "D MMM YYYY")), "D MMM YYYY")
        await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
        expect(await servicePage
            .isTextPresent("Sorry, there are no available time slots for the date"))
                .toBeFalsy()
        })
    })

     test("Check errors messages for wrong links used for calendar sync @C99 @smoke ",
        async ({ mainPage, isMobile }) => {
            loginPage = await mainPage.openLoginForm(isMobile)
            const supplierServicePage = (await loginPage.loginAs(creds.supplier[0])) as SupplierServicePage
            const suppCalendarPage: SuppCalendarPage =
                (await supplierServicePage.openSideBarMenu("Calendar")) as SuppCalendarPage
            let feeds: CalendarFeedsPage = await suppCalendarPage.openSyncCalendar()
            await feeds.removeFeed()
            let addNewCalendar = await feeds.addNewCalendar()
            await addNewCalendar.setBadCalendarLink("https://www.stage.gigmngr.com/s")
            expect(
                await addNewCalendar.isTextPresent("Sorry, something went wrong with syncing your calendar. Our development team is notified and will investigate the issue. Please try to sync your calendar later. Visit Help Center for more information about the calendar sync."),
                    ).toBeTruthy()
            feeds = await addNewCalendar.cancelCalendarFeed()
            addNewCalendar = await feeds.addNewCalendar()
            await addNewCalendar.setBadCalendarLink("https://www.stage.gigmngr.com/s")
            expect(
                await addNewCalendar.isTextContains("ve already created a feed with this calendar link. Please use another link for the calendar sync feed creation. Visit "),
                    ).toBeTruthy()
            await addNewCalendar.setBadCalendarLink("https://calendar.google.com/calendar/ical/39dejqbqq20rc0op166j2ksve8%40group.calendar.google.com/private-01170d4e1c851bae89f2f8e6df842010/basic.ics")
            expect(
                await addNewCalendar.isTextContains("The link to the calendar is incorrect. To sync your events, please paste the correct link and try again."),
                    ).toBeTruthy()
            await addNewCalendar.cancelCalendarFeed()
     })
})
