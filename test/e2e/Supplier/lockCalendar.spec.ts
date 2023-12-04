import { expect } from "@playwright/test"
import { ApiCalendarController } from "../../../src/Api/Controllers/calendarController"
import { test } from "../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../src/models/eventDetails"
import { CheckoutPage } from "../../../src/pages/checkoutPage"
import { ClientMainPage } from "../../../src/pages/clientMainPage"
import { NewContextMainPage } from "../../../src/pages/newContextMainPage"
import { ServicePage } from "../../../src/pages/servicePage"
import { SuppCalendarPage } from "../../../src/pages/suppCalendarPage"
import { SupplierServicePage } from "../../../src/pages/supplierServicePage"
import * as DataHelper from "../../../src/utils/dataHelper"
import * as DateHelper from "../../../src/utils/dateHelper"
import * as RandomHelper from "../../../src/utils/randomHelper"

test.describe("Calendar lock", () => {
    let checkoutPage: CheckoutPage
    let quoteId = ""
    const eventDetails: IEventDetails = {
        date: `${DateHelper.getDateStringWithOffsetInFormat(1, "D MMM YYYY")}`,
        eventCategory: "Food & Drinks",
        eventType: "Anniversary",
        guestAmount: "4",
        postcode: "TS225PS",
    }

    test("whole day @smoke @C49 @mobile ", async ({ mainPage, isMobile }, testInfo) => {
        await test.step("Test steps", async() => {
            const dayOffset = 1
            const date = DateHelper.getDateWithDayOffset(dayOffset)
            eventDetails.date = `${DateHelper.getDateStringWithOffsetInFormat(dayOffset, "D MMM YYYY")}`
            const suppLoginPage = await mainPage.openLoginForm(isMobile)
            const supplierServicePage = (await suppLoginPage.loginAs(
                DataHelper.getSuppByName("testSupp49"))) as SupplierServicePage
            const supplierCalendar = await supplierServicePage.openSideBarMenu("Calendar") as SuppCalendarPage
            await supplierCalendar.removeTimeSlotsForDay(DataHelper.getSuppByName("testSupp49"), date)
            await supplierCalendar.openDayView(dayOffset)
            await supplierCalendar.lockWholeDay()
            expect(await supplierCalendar.checkCreatedLock()).toBeTruthy()
            expect(await supplierCalendar.checkLockCreated(
                DataHelper.getSuppByName("testSupp49"), dayOffset)).toBeTruthy()
            const clientPage = await new NewContextMainPage(testInfo).getNewContextPage(isMobile)
            const loginPage = await clientPage.openLoginForm(isMobile)
            const clientLoginPage = await loginPage.loginAs(
                DataHelper.getClientByName("melnichenko.andrey")) as ClientMainPage
            const clientMainPage = await clientLoginPage.header.clickOnHeaderLogo()
            const servicePage = await clientMainPage.openService("24257")
            await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
            expect(await servicePage.isTextPresent("Sorry, there are no available time slots for the date"))
                .toBeTruthy()
        })
    })

    test("timeslot lock @smoke @C77 ", async ({ mainPage, isMobile }, testInfo) => {
        await test.step("Test steps", async() => {
            const dayOffset = 2
            const supp = DataHelper.getSuppByName("testSupp77")
            eventDetails.date = `${DateHelper.getDateStringWithOffsetInFormat(dayOffset, "D MMM YYYY")}`
            const calendarController = new ApiCalendarController(supp)
            await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
            const suppLoginPage = await mainPage.openLoginForm(isMobile)
            const supplierServicePage = (await suppLoginPage.loginAs(supp)) as SupplierServicePage
            const supplierCalendar: SuppCalendarPage =
                await supplierServicePage.openSideBarMenu("Calendar") as SuppCalendarPage
            await supplierCalendar.removeAllTimeSlots(supp)
            await supplierCalendar.openDayView(dayOffset)
            await supplierCalendar.lockTimeRange({ from: { h: 19 }, to: { h: 21 }})
            expect(await supplierCalendar.checkCreatedLock()).toBeTruthy()
            expect(await supplierCalendar.checkLockCreated(supp, dayOffset))
                .toBeTruthy()
            const clientPage = await new NewContextMainPage(testInfo).getNewContextPage(isMobile)
            const servicePage = await clientPage.openService("24266")
            await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
            expect(await servicePage.isTextPresent("8:00 am - 5:00 pm"), "Time slot available to book")
                .toBeTruthy()
            const viewPortSize = servicePage.page.viewportSize()
            await servicePage.page.setViewportSize({ height: 669, width: 390 })
            await servicePage.openEventDetailsModal()
            expect(await servicePage.isTextPresent("8:00 am - 5:00 pm"), "Time slot available to book")
                .toBeTruthy()
            await servicePage.page.setViewportSize(viewPortSize)
            checkoutPage = await servicePage.clickOnRequestToBook(true)
            expect(await checkoutPage.getStartTime()).toEqual("05:00 PM")
            expect(await checkoutPage.isTextPresent("8:00 am - 5:00 pm")).toBeTruthy()
        })
    })

    test("Lock manually multiple days in calendar @smoke @C133 ", async ({ mainPage, isMobile }, testInfo) => {
        await test.step("Test steps", async() => {
            const lockArr = DateHelper.getDatesArray(5, 2)
            const randLockedDate = RandomHelper.getRandomArrayElement(lockArr)
            eventDetails.date = randLockedDate
            const supplier = DataHelper.getSuppByName("testSupp133")
            const suppLoginPage = await mainPage.openLoginForm(isMobile)
            const supplierServicePage = (await suppLoginPage.loginAs(supplier)) as SupplierServicePage
            const supplierCalendar = await supplierServicePage.openSideBarMenu("Calendar") as SuppCalendarPage
            await supplierCalendar.removeAllTimeSlots(supplier)
            await supplierCalendar.blockMultiplyDays(lockArr)
            const clientPage = await new NewContextMainPage(testInfo).getNewContextPage(isMobile)
            const servicePage = await clientPage.openService("24273")
            await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
            expect(await servicePage.isTextPresent("Sorry, there are no available time slots for the date"))
                .toBeTruthy()
        })
    })

    test("Lock manually time slot in the morning | catering @smoke @C135 ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Test steps", async() => {
                const dayOffset = 2
                eventDetails.date = DateHelper.getDateStringWithOffsetInFormat(dayOffset, "D MMM YYYY")
                const supplier = DataHelper.getSuppByName("testSupp135")
                const suppLoginPage = await mainPage.openLoginForm(isMobile)
                const supplierServicePage = (await suppLoginPage.loginAs(supplier)) as SupplierServicePage
                const supplierCalendar = await supplierServicePage.openSideBarMenu("Calendar") as SuppCalendarPage
                await supplierCalendar.removeAllTimeSlots(supplier)
                await supplierCalendar.openDayView(dayOffset)
                await supplierCalendar.lockTimeRange({ from: { h: 10 }, to: { h: 13 }})
                expect(await supplierCalendar.checkCreatedLock()).toBeTruthy()
                expect(await supplierCalendar.checkLockCreated(supplier, dayOffset))
                    .toBeTruthy()
                const clientPage = await new NewContextMainPage(testInfo).getNewContextPage(isMobile)
                const servicePage = await clientPage.openService("24449")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                expect(await servicePage.isTextPresent("2:00 pm - 11:00 pm"), "Time slot available to book")
                    .toBeTruthy()
                checkoutPage = await servicePage.clickOnRequestToBook(true)
                expect(await checkoutPage.getStartTime()).toEqual("07:00 PM")
                expect(await checkoutPage.isStartTimeAvailable({ from: "02:00 PM", to: "09:30 PM" })).toBeTruthy()
                expect(await checkoutPage.isStartTimeAvailable({ from: "08:00 AM", to: "01:30 PM" })).toBeFalsy()
            })
    })

    test("Check timeslot lock on checkout > lock at the next day | event service @smoke @C139 ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Test steps", async() => {
                const eventDayOffset = 3
                eventDetails.date = DateHelper.getDateStringWithOffsetInFormat(eventDayOffset, "D MMM YYYY")
                const supplier = DataHelper.getSuppByName("testSupp139")
                const suppLoginPage = await mainPage.openLoginForm(isMobile)
                const supplierServicePage = (await suppLoginPage.loginAs(supplier)) as SupplierServicePage
                const supplierCalendar = await supplierServicePage.openSideBarMenu("Calendar") as SuppCalendarPage
                await supplierCalendar.removeAllTimeSlots(supplier)
                await supplierCalendar.openDayView(eventDayOffset)
                await supplierCalendar.lockWholeDay()
                expect(await supplierCalendar.checkCreatedLock()).toBeTruthy()
                expect(await supplierCalendar.checkLockCreated(supplier, eventDayOffset))
                    .toBeTruthy()
                const clientPage = await new NewContextMainPage(testInfo).getNewContextPage(isMobile)
                const servicePage = await clientPage.openService("24495")
                eventDetails.date = DateHelper.getDateStringWithOffsetInFormat(eventDayOffset - 1, "D MMM YYYY")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                await servicePage.isTextPresent("Sorry, there are no available time slots for the date")
            })
    })

    test("Lock manually timeslot in the evening | catering @smoke @C136 ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Test steps", async() => {
                const eventDayOffset = 3
                eventDetails.date = DateHelper.getDateStringWithOffsetInFormat(eventDayOffset, "D MMM YYYY")
                const supplier = DataHelper.getSuppByName("testSupp136")
                const suppLoginPage = await mainPage.openLoginForm(isMobile)
                const supplierServicePage = (await suppLoginPage.loginAs(supplier)) as SupplierServicePage
                const supplierCalendar = await supplierServicePage.openSideBarMenu("Calendar") as SuppCalendarPage
                await supplierCalendar.removeAllTimeSlots(supplier)
                await supplierCalendar.openDayView(eventDayOffset)
                await supplierCalendar.lockTimeRange({ from: { h: 19 }, to: { h: 22 }})
                expect(await supplierCalendar.checkCreatedLock()).toBeTruthy()
                expect(await supplierCalendar.checkLockCreated(supplier, eventDayOffset))
                    .toBeTruthy()
                const clientPage = await new NewContextMainPage(testInfo).getNewContextPage(isMobile)
                const servicePage = await clientPage.openService("24501")
                eventDetails.date = DateHelper.getDateStringWithOffsetInFormat(eventDayOffset, "D MMM YYYY")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                await servicePage.isTextPresent("Sorry, there are no available time slots for the date")
            })
    })

    test("Lock manually lock for next day > duration test | event service @smoke @C137 ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Test steps", async() => {
                const eventDayOffset = 2
                eventDetails.date = DateHelper.getDateStringWithOffsetInFormat(eventDayOffset, "D MMM YYYY")
                const supplier = DataHelper.getSuppByName("testSupp137")
                const suppLoginPage = await mainPage.openLoginForm(isMobile)
                const supplierServicePage = (await suppLoginPage.loginAs(supplier)) as SupplierServicePage
                const supplierCalendar = await supplierServicePage.openSideBarMenu("Calendar") as SuppCalendarPage
                await supplierCalendar.removeAllTimeSlots(supplier)
                await supplierCalendar.openDayView(eventDayOffset)
                await supplierCalendar.lockWholeDay()
                expect(await supplierCalendar.checkCreatedLock()).toBeTruthy()
                expect(await supplierCalendar.checkLockCreated(supplier, eventDayOffset))
                    .toBeTruthy()
                const clientPage = await new NewContextMainPage(testInfo).getNewContextPage(isMobile)
                const servicePage = await clientPage.openService("24541")
                eventDetails.date = DateHelper.getDateStringWithOffsetInFormat(eventDayOffset, "D MMM YYYY")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                await servicePage.isTextPresent("Sorry, there are no available time slots for the date")
                eventDetails.date = DateHelper.getDateStringWithOffsetInFormat(eventDayOffset - 1, "D MMM YYYY")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                await servicePage.isTextPresent("Sorry, there are no available time slots for the date")
            })
    })

    test("Removed quote after calendar whole day lock on quote submitted state @smoke @C113 ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Quote submitted state", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp113"))
                await calendarController.removeTimeSlotByDate(
                    DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("24282")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage = await servicePage.clickOnRequestToBook(true)
                quoteId = await checkoutPage.getQuoteId()
            })
            await test.step("Supp calendar", async() => {
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const supplier = DataHelper.getSuppByName("testSupp113")
                const suppLoginPage = await suppMainPage.openLoginForm(isMobile)
                const supplierServicePage = (await suppLoginPage.loginAs(supplier)) as SupplierServicePage
                const supplierCalendar = await supplierServicePage.openSideBarMenu("Calendar") as SuppCalendarPage
                await supplierCalendar.openDayView(1)
                await supplierCalendar.lockWholeDay()
                await supplierCalendar.page.goto(`/s/inbox/${quoteId}`)
                expect(await supplierCalendar.isTextPresent("Your quote was removed")).toBeTruthy()
            })
    })

    test("Created time slot on confirmed booking quote state | hours duration @C75 @smoke @mobile ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Make CLIENT CONFIRMED BOOKING", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp75"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("24292")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage = await servicePage.clickOnRequestToBook(true)
                const paymentPage = await checkoutPage.clickOnBookNow()
                await paymentPage.goBack()
                await checkoutPage.pageLoaded()
            })
            await test.step("Supp calendar", async() => {
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const supplier = DataHelper.getSuppByName("testSupp75")
                const suppLoginPage = await suppMainPage.openLoginForm(isMobile)
                const supplierServicePage = (await suppLoginPage.loginAs(supplier)) as SupplierServicePage
                const supplierCalendar = await supplierServicePage.openSideBarMenu("Calendar") as SuppCalendarPage
                expect(await supplierCalendar
                        .checkCreatedLock("Test Service C75 Please, select a good quality photo which")).toBeTruthy()
            })
    })
})
