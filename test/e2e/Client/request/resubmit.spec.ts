import { expect } from "@playwright/test"
import { ApiCalendarController } from "../../../../src/Api/Controllers/calendarController"
import { test } from "../../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../../src/models/eventDetails"
import { CheckoutPage } from "../../../../src/pages/checkoutPage"
import { NewContextMainPage } from "../../../../src/pages/newContextMainPage"
import { PaymentPage } from "../../../../src/pages/paymentPage"
import { PaymentSuccessPage } from "../../../../src/pages/paymentSuccessPage"
import { ServicePage } from "../../../../src/pages/servicePage"
import { SuppCalendarPage } from "../../../../src/pages/suppCalendarPage"
import { SuppCheckoutPage } from "../../../../src/pages/suppCheckoutPage"
import { SupplierServicePage } from "../../../../src/pages/supplierServicePage"
import * as DataHelper from "../../../../src/utils/dataHelper"
import * as DateHelper from "../../../../src/utils/dateHelper"

test.describe("Request", () => {
    let quote = ""
    let checkoutPage: CheckoutPage
    let suppCheckout: SuppCheckoutPage
    let suppCalendarPage: SuppCalendarPage
    let calendarController: ApiCalendarController
    let paymentPage: PaymentPage

    const eventDetails: IEventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(1, "D MMM YYYY")}`,
            eventCategory: "Food & Drinks",
            eventType: "Anniversary",
            guestAmount: "6",
            postcode: "TS225PS",
        }
    const date = DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY")

    test.beforeEach(() => {
        calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp50"))
    })

    test("Resubmit quote @C50 @smoke ",
        async ({ mainPage }, testInfo) => {
            const resubmitValues = {
                deposit: "11",
                service: "22",
                travel: "40",
            }
            await test.step("Deposit frozen", async() => {
                await calendarController.removeTimeSlotByDate(
                    DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23791")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                quote = await checkoutPage.getQuoteId()
                paymentPage = await checkoutPage.clickOnBookNow()
                const paymentSuccess = await paymentPage.fillPaymentInformation() as PaymentSuccessPage
                await paymentSuccess.goBack()
            })
            await test.step("Quote request declined", async() => {
                await checkoutPage.page.reload()
                await checkoutPage.pageLoaded()
                await checkoutPage.cancelBooking(false)
            })
            await test.step("Supplier re-submit quotes", async() => {
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp50")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quote}`)
                suppCheckout = new SuppCheckoutPage(supplierServicePage.page)

                await suppCheckout.reSubmitQuote(resubmitValues)
                expect(await suppCheckout.getPriceOptionValue("SERVICE")).toEqual(resubmitValues.service)
                expect(await suppCheckout.getPriceOptionValue("TRAVEL")).toEqual(resubmitValues.travel)
                expect(await suppCheckout.getPriceOptionValue("DEPOSIT")).toEqual(resubmitValues.deposit)
            })
            await test.step("Client apply booking", async() => {
                await checkoutPage.page.reload()
                await checkoutPage.pageLoaded()
                paymentPage = await checkoutPage.clickOnBookNow()
            })
            await test.step("Cient confirmed booking", async () => {
                expect(await paymentPage.getPriceOptionValue("SERVICE")).toEqual(resubmitValues.service)
                expect(await paymentPage.getPriceOptionValue("TRAVEL")).toEqual(resubmitValues.travel)
            })
    })

    test("Resubmit quote for state QUOTE_DECLINED @C131 @smoke ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Make CLIENT CONFIRMED BOOKING", async() => {
                await calendarController.removeTimeSlotByDate(date)
                const servicePage: ServicePage = await mainPage.openService("23791")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage = await servicePage.clickOnRequestToBook(true)
                paymentPage = await checkoutPage.clickOnBookNow()
                await paymentPage.goBack()
                await checkoutPage.pageLoaded()
                quote = await checkoutPage.getQuoteId()
            })
            await test.step("QUOTE_DECLINED", async() => {
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp50")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quote}`)
                suppCheckout = new SuppCheckoutPage(supplierServicePage.page, isMobile)
                await suppCheckout.pageLoaded()
                suppCalendarPage = await suppCheckout.cancelUnConfirmedBooking()
            })
            await test.step("Client check canceled booking", async() => {
                await checkoutPage.page.reload()
                await checkoutPage.pageLoaded()
                expect(await checkoutPage.isTextPresent("Booking is removed")).toBeTruthy()
            })
            await test.step("Supp re-submit", async() => {
                await suppCalendarPage.page.goto(`/s/inbox/${quote}`)
                suppCheckout = new SuppCheckoutPage(suppCalendarPage.page, isMobile)
                await suppCheckout.pageLoaded()
                await suppCheckout.reSubmitQuote()
                await suppCheckout.pageLoaded()
            })
            await test.step("Client apply booking", async() => {
                await checkoutPage.page.reload()
                await checkoutPage.pageLoaded()
                await checkoutPage.clickOnBookNow()
            })
    })

    test("Resubmit quote for state QUOTE_REMOVED @C132 @smoke ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Make CLIENT CONFIRMED BOOKING", async() => {
                await calendarController.removeTimeSlotByDate(date)
                const servicePage: ServicePage = await mainPage.openService("23791")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage = await servicePage.clickOnRequestToBook(true)
                quote = await checkoutPage.getQuoteId()
            })
            await test.step("QUOTE_DECLINED", async() => {
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp50")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quote}`)
                suppCheckout = new SuppCheckoutPage(supplierServicePage.page, isMobile)
                await suppCheckout.pageLoaded()
                await suppCheckout.cancelRequest()
            })
            await test.step("Client check canceled booking", async() => {
                await checkoutPage.page.reload()
                await checkoutPage.pageLoaded()
                expect(await checkoutPage.isTextPresent("Quote removed")).toBeTruthy()
            })
            await test.step("Supp re-submit", async() => {
                await suppCheckout.pageLoaded()
                await suppCheckout.reSubmitQuote()
                await suppCheckout.pageLoaded()
            })
            await test.step("Client apply booking", async() => {
                    await checkoutPage.page.reload()
                    await checkoutPage.pageLoaded()
                    await checkoutPage.clickOnBookNow()
            })
    })
})
