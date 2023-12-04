import { expect } from "@playwright/test"
import { ApiCalendarController } from "../../../src/Api/Controllers/calendarController"
import { test } from "../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../src/models/eventDetails"
import { CheckoutPage } from "../../../src/pages/checkoutPage"
import { NewContextMainPage } from "../../../src/pages/newContextMainPage"
import { PaymentSuccessPage } from "../../../src/pages/paymentSuccessPage"
import { ServicePage } from "../../../src/pages/servicePage"
import { SuppCheckoutPage } from "../../../src/pages/suppCheckoutPage"
import { SupplierServicePage } from "../../../src/pages/supplierServicePage"
import * as DataHelper from "../../../src/utils/dataHelper"
import * as DateHelper from "../../../src/utils/dateHelper"

test.use({ video: "on-first-retry" })

test.describe("Booking flow", () => {
    const eventDetails: IEventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(3, "D MMM YYYY")}`,
            eventCategory: "Food & Drinks",
            eventType: "Anniversary",
            guestAmount: "4",
            postcode: "TS225PS",
        }
    let quote = ""
    let checkoutPage: CheckoutPage
    let suppCheckout: SuppCheckoutPage
    const date = DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY")
    const dateRange = [
        DateHelper.getDateStringWithOffsetInFormat(1, "DD MMM YYYY"),
        DateHelper.getDateStringWithOffsetInFormat(2, "DD MMM YYYY"),
        DateHelper.getDateStringWithOffsetInFormat(3, "DD MMM YYYY"),
        DateHelper.getDateStringWithOffsetInFormat(4, "DD MMM YYYY"),
    ]
    let calendarController: ApiCalendarController

    test.beforeEach(() => {
        calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp53"))
    })

    test("Cancel booking | Client Confirmed Booking @C51 @smoke @mobile ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Make CLIENT CONFIRMED BOOKING", async() => {
                await calendarController.removeTimeSlotByDate(date)
                const servicePage: ServicePage = await mainPage.openService("23739")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                const paymentPage = await checkoutPage.clickOnBookNow()
                await paymentPage.goBack()
                await checkoutPage.pageLoaded()
                quote = await checkoutPage.getQuoteId()
            })
            await test.step("Supplier cancel", async() => {
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp53")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quote}`)
                suppCheckout = new SuppCheckoutPage(supplierServicePage.page, isMobile)
                await suppCheckout.pageLoaded()
                await suppCheckout.cancelUnConfirmedBooking()
                const timeSlots = await calendarController.getTimeSlots(date, date)
                const startDate = DateHelper.getDateWithFormat(new Date(timeSlots[0]?.dtStart || ""), "DD MMM YYYY")
                const endDate = DateHelper.getDateWithFormat(new Date(timeSlots[0]?.dtEnd || ""), "DD MMM YYYY")
                expect(dateRange.includes(startDate), `${startDate} not present in ${dateRange.join(", ")}`)
                    .toBeTruthy()
                expect(dateRange.includes(endDate), `${endDate} not present in ${dateRange.join(", ")}`).toBeTruthy()
            })
            await test.step("Client check canceled booking", async() => {
                await checkoutPage.page.reload()
                await checkoutPage.pageLoaded()
                expect(await checkoutPage.isTextPresent("Booking is removed")).toBeTruthy()
            })
    })

    test("Cancel booking @C52 @C15 @smoke @mobile ",
        async ({ mainPage, isMobile }, testInfo) => {
            let text = ""
            await test.step("Deposit frozen", async() => {
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23739")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage = await servicePage.clickOnRequestToBook(true)
                quote = await checkoutPage.getQuoteId()
                const paymentPage = await checkoutPage.clickOnBookNow()
                const paymentSuccess = await paymentPage.fillPaymentInformation() as PaymentSuccessPage
                await paymentSuccess.goBack()
                checkoutPage = new CheckoutPage(paymentSuccess.page, isMobile)
                await checkoutPage.pageLoaded()
            })
            await test.step("Supplier send message", async() => {
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp53")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quote}`)
                suppCheckout = new SuppCheckoutPage(supplierServicePage.page, isMobile)
                await suppCheckout.pageLoaded()
                text = await suppCheckout.sendMessage()
            })
            await test.step("Client check received message", async() => {
                await checkoutPage.page.reload()
                expect(await checkoutPage.isTextPresent(text)).toBeTruthy()
            })
            await test.step("Client check received message", async() => {
                await suppCheckout.cancelUnConfirmedBooking()
            })
    })

    test("Cancel booking @C53 @smoke @mobile ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Deposit frozen", async() => {
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23739")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                quote = await checkoutPage.getQuoteId()
                const paymentPage = await checkoutPage.clickOnBookNow()
                const paymentSuccess = await paymentPage.fillPaymentInformation() as PaymentSuccessPage
                await paymentSuccess.goBack()
            })
            await test.step("Supplier confirm", async() => {
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp53")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quote}`)
                suppCheckout = new SuppCheckoutPage(supplierServicePage.page, isMobile)
                await suppCheckout.pageLoaded()
                await suppCheckout.confirmBooking()
            })
            await test.step("Check booking confirmed", async() => {
                await checkoutPage.page.reload()
                await checkoutPage.pageLoaded()
                expect(await checkoutPage.isBookingConfirmed()).toBeTruthy()
            })
            await test.step("Supplier cancel booking", async() => {
                await suppCheckout.cancelConfirmedBooking()
            })
    })

    test("Cancel booking | quote submitted @C16 @smoke @mobile ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Quote submitted state", async() => {
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23739")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                quote = await checkoutPage.getQuoteId()
            })
            await test.step("Supplier cancel booking", async() => {
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp53")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quote}`)
                suppCheckout = new SuppCheckoutPage(supplierServicePage.page, isMobile)
                await suppCheckout.pageLoaded()
                await suppCheckout.cancelRequest()
                const timeSlots = await calendarController.getTimeSlots(date, date)
                const startDate = DateHelper.getDateWithFormat(new Date(timeSlots[0]?.dtStart || ""), "DD MMM YYYY")
                const endDate = DateHelper.getDateWithFormat(new Date(timeSlots[0]?.dtEnd || ""), "DD MMM YYYY")
                expect(dateRange.includes(startDate), `${startDate} not present in ${dateRange.join(", ")}`)
                    .toBeTruthy()
                expect(dateRange.includes(endDate), `${endDate} not present in ${dateRange.join(", ")}`).toBeTruthy()
            })
            await test.step("Client check cancel booking", async() => {
                await checkoutPage.page.reload()
                await checkoutPage.pageLoaded()
                expect(await checkoutPage.isTextPresent("Service Removed")).toBeTruthy()
            })
    })
})
