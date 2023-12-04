import { expect } from "@playwright/test"
import { ApiCalendarController } from "../../../../src/Api/Controllers/calendarController"
import { test } from "../../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../../src/models/eventDetails"
import { PaymentFailedPage } from "../../../../src/pages/paymentFailedPage"
import { PaymentPage } from "../../../../src/pages/paymentPage"
import { ServicePage } from "../../../../src/pages/servicePage"
import * as DataHelper from "../../../../src/utils/dataHelper"
import * as DateHelper from "../../../../src/utils/dateHelper"

test.describe("Payment", () => {
    const eventDetails: IEventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(1, "D MMM YYYY")}`,
            eventCategory: "Food & Drinks",
            eventType: "Anniversary",
            guestAmount: "4",
            postcode: "TS225PS",
        }

    test("Payment with 3D secure @C114 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp57"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23918")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                const checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                const paymentPage = await checkoutPage.clickOnBookNow()
                await paymentPage.fillPaymentInformation({ cardNumber: "4000002760003184" })
            })
    })

    test("Insufficient funds decline on payment page @C129 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp57"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23918")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                const checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                const paymentPage = await checkoutPage.clickOnBookNow()
                const paymentFailed =
                    await paymentPage.fillPaymentInformation({ cardNumber: "4000000000009995" }) as PaymentFailedPage
                expect(await paymentFailed.isTextPresent("Form submission failed :(")).toBeTruthy()
                expect(await paymentFailed.isTextPresent("Your card has insufficient funds.")).toBeTruthy()
                await paymentFailed.fillPaymentInformation()
            })
    })

    test("Failed payment with 3d secure card @C122 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp57"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23918")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                const checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                let paymentPage = await checkoutPage.clickOnBookNow()
                paymentPage = await paymentPage
                    .fillPaymentInformation({ cardNumber: "4000002760003184", isFail: true }) as PaymentPage
                await paymentPage.fillPaymentInformation()
            })
    })
})
