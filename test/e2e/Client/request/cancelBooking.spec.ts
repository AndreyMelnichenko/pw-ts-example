import { expect } from "@playwright/test"
import { ApiCalendarController } from "../../../../src/Api/Controllers/calendarController"
import { test } from "../../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../../src/models/eventDetails"
import { CheckoutPage } from "../../../../src/pages/checkoutPage"
import { NewContextMainPage } from "../../../../src/pages/newContextMainPage"
import { PaymentSuccessPage } from "../../../../src/pages/paymentSuccessPage"
import { ServicePage } from "../../../../src/pages/servicePage"
import { SuppCheckoutPage } from "../../../../src/pages/suppCheckoutPage"
import { SupplierServicePage } from "../../../../src/pages/supplierServicePage"
import * as DataHelper from "../../../../src/utils/dataHelper"
import * as DateHelper from "../../../../src/utils/dateHelper"

test.use({ video: "on-first-retry" })

test.describe("Booking flow", () => {
    const eventDetails: IEventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(1, "D MMM YYYY")}`,
            eventCategory: "Food & Drinks",
            eventType: "Anniversary",
            guestAmount: "4",
            postcode: "TS225PS",
        }
    let quote = ""
    let checkoutPage: CheckoutPage
    let suppCheckout: SuppCheckoutPage

    test("Cancel booking | Client and Supplier Confirmed Booking @C57 @C83 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Deposit frozen", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp57"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23918")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                quote = await checkoutPage.getQuoteId()
                const paymentPage = await checkoutPage.clickOnBookNow()
                const paymentSuccess: PaymentSuccessPage =
                    await paymentPage.fillPaymentInformation() as PaymentSuccessPage
                await paymentSuccess.goBack()
            })
            await test.step("Supplier confirm", async() => {
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp57")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quote}`)
                suppCheckout = new SuppCheckoutPage(supplierServicePage.page)
                await suppCheckout.pageLoaded()
                await suppCheckout.confirmBooking()
            })
            await test.step("Check booking confirmed", async() => {
                await checkoutPage.page.reload()
                await checkoutPage.pageLoaded()
                expect(await checkoutPage.isBookingConfirmed()).toBeTruthy()
            })
            await test.step("Client cancel booking", async() => {
                await checkoutPage.cancelBooking()
            })
    })

    test("Cancel booking | Client Confirmed Booking @C60 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Make CLIENT CONFIRMED BOOKING", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp57"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23918")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                const paymentPage = await checkoutPage.clickOnBookNow()
                await paymentPage.goBack()
                await checkoutPage.pageLoaded()
                await checkoutPage.cancelBooking(false)
                expect(await checkoutPage.isDeclineLightMessage()).toBeTruthy()
            })
    })

    test("Cancel booking | Deposit Frozen @C56 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Deposit frozen", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp57"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23918")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                quote = await checkoutPage.getQuoteId()
                const paymentPage = await checkoutPage.clickOnBookNow()
                const paymentSuccess: PaymentSuccessPage =
                    await paymentPage.fillPaymentInformation() as PaymentSuccessPage
                await paymentSuccess.goBack()
            })
            await test.step("Check booking confirmed", async() => {
                await checkoutPage.page.reload()
                await checkoutPage.pageLoaded()
                await checkoutPage.cancelBooking(false)
                expect(await checkoutPage.isTextPresent("Booking was cancelled")).toBeTruthy()
            })
    })
})
