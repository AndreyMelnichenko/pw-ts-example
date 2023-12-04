import { expect } from "@playwright/test"
import { ApiCalendarController } from "../../../src/Api/Controllers/calendarController"
import { test } from "../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../src/models/eventDetails"
import { ServicePage } from "../../../src/pages/servicePage"
import * as DataHelper from "../../../src/utils/dataHelper"
import * as DateHelper from "../../../src/utils/dateHelper"

test.describe.parallel("Client", () => {
    const eventDetails: IEventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(2, "D MMM YYYY")}`,
            eventCategory: "Catering",
            eventType: "Anniversary",
            guestAmount: "6",
            postcode: "TS225PS",
        }

    test("Message Supplier without event details for new client @C43 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp43"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                let servicePage: ServicePage = await mainPage.openService("23938")
                await servicePage.clickOnMessageSupplier(true)
                expect(await servicePage.getMessageEventDetails())
                    .toEqual({date: "", eventType: "", guestAmount: "", postcode: ""})
                const checkoutPage = await servicePage
                    .fillMessageModal(eventDetails, testInfo.project.name === "Mobile Safari")
                await checkoutPage.sendMsgWithAttachment()
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                await servicePage.clickOnMessageSuppBooked()
            })
    })

    test("Message Supplier with event details for new client @C117 @smoke @mobile ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp43"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                await mainPage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                const searchPage = await mainPage.clickOnSerachButton()
                delete eventDetails.eventCategory
                expect(eventDetails).toEqual(await searchPage.getPrefill(isMobile))
                const page = await searchPage.goToPage("/services/23938/")
                const servicePage = await new ServicePage(page, isMobile).pageLoaded()
                expect(eventDetails).toEqual(await servicePage.getPrefillEventDetail())
                await servicePage.clickOnMessageSupplier(true)
                expect(await servicePage.getMessageEventDetails())
                    .toEqual(eventDetails)
                const checkoutPage = await servicePage.fillMessageModal({}, testInfo.project.name === "Mobile Safari")
                expect(await checkoutPage.isTextPresent("Test text message")).toBeTruthy()
            })
    })

    test("Message Supplier without event details for exist client @C20 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp43"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23938")
                await servicePage.clickOnMessageSupplier(false, false, DataHelper.getClientByName("melnichenko.andrey"))
                expect(await servicePage.getMessageEventDetails())
                        .toEqual({date: "", eventType: "", guestAmount: "", postcode: ""})
                await servicePage.fillMessageModal(eventDetails, testInfo.project.name === "Mobile Safari")
            })
    })

    test("Message Supplier with event details for exist client @C14 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const serviceId = "23938"
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp43"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                await mainPage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                const searchPage = await mainPage.clickOnSerachButton()
                let servicePage = await searchPage.clickOnRandomService()
                await servicePage.clickOnRequestToBook(true, false)
                servicePage = await servicePage.openService(serviceId)
                delete eventDetails.eventCategory
                expect(eventDetails).toEqual(await servicePage.getPrefillEventDetail())
                await servicePage.clickOnMessageSupplier(false, true)
                expect(await servicePage.getMessageEventDetails())
                    .toEqual(eventDetails)
                const checkoutPage = await servicePage.fillMessageModal({}, testInfo.project.name === "Mobile Safari")
                await checkoutPage.sendMsgWithAttachment()
            })
    })
})
