import { expect } from "@playwright/test"
import { ApiCalendarController } from "../../../../src/Api/Controllers/calendarController"
import { test } from "../../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../../src/models/eventDetails"
import * as DataHelper from "../../../../src/utils/dataHelper"
import * as DateHelper from "../../../../src/utils/dateHelper"

test.describe("Request", () => {
    const eventDetails: IEventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(2, "D MMM YYYY")}`,
            eventCategory: "Food & Drinks",
            eventType: "Anniversary",
            guestAmount: "6",
            postcode: "TS225PS",
        }

    test("Request to book for new event | Logged-in Client by @C13 @mobile @smoke ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const serviceId = "23649"
                await mainPage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                const searchPage = await mainPage.clickOnSerachButton()
                let servicePage = await searchPage.clickOnRandomService()
                let checkoutPage = await servicePage.clickOnRequestToBook(true, false)
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                servicePage = await servicePage.openService(serviceId)
                eventDetails.date = `${DateHelper.getDateStringWithOffsetInFormat(3, "D MMM YYYY")}`
                const modifyers = await servicePage.getPriceCalculation("TOTAL")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                checkoutPage = await servicePage.clickOnRequestToBook(false, false)
                const eventDashboard = await checkoutPage.goToEventPage()
                expect(eventDashboard.isEventDetailsPresent(eventDetails)).toBeTruthy()
                expect(await eventDashboard.isServiceTitle(serviceId)).toBeTruthy()
                expect(await eventDashboard.isEventPrice(serviceId, modifyers.total || "none"))
                expect(await eventDashboard.getShortlistedServices()).toEqual(1)
            })
        })

    test("Request to book as Logged-in Client for created event @C12 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const serviceId = "23649"
                await mainPage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                const searchPage = await mainPage.clickOnSerachButton()
                let servicePage = await searchPage.clickOnRandomService()
                await servicePage.clickOnRequestToBook(true, false)
                servicePage = await servicePage.openService(serviceId)
                const modifyers = await servicePage.getPriceCalculation("TOTAL")
                const checkoutPage = await servicePage.clickOnRequestToBook(false, false)
                const eventDashboard = await checkoutPage.goToEventPage()
                expect(eventDashboard.isEventDetailsPresent(eventDetails)).toBeTruthy()
                expect(await eventDashboard.isServiceTitle(serviceId)).toBeTruthy()
                expect(await eventDashboard.isEventPrice(serviceId, modifyers.total || "none"))
            })
        })

    test("Apply discount After adding details | Quote Submitted state @C93 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp93"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage = await mainPage.openService("24391")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                const checkoutPage = await servicePage.clickOnRequestToBook(true)
                await checkoutPage.setDuration("2 hours")
                await checkoutPage.addExtraOption()
                await checkoutPage.setPromoCode("PROMO1")
                expect(await checkoutPage.getPriceOptionValue("TOTAL")).toEqual("160")
                const paymentPage = await checkoutPage.clickOnBookNow()
                expect(await paymentPage.getPriceOptionValue("TOTAL")).toEqual("160")
        })
    })

})
