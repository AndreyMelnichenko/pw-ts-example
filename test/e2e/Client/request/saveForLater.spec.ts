import { expect } from "@playwright/test"
import { ApiCalendarController } from "../../../../src/Api/Controllers/calendarController"
import { test } from "../../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../../src/models/eventDetails"
import { ServicePage } from "../../../../src/pages/servicePage"
import * as DataHelper from "../../../../src/utils/dataHelper"
import * as DateHelper from "../../../../src/utils/dateHelper"
import * as RandomHelper from "../../../../src/utils/randomHelper"

test.describe("Request", () => {
    const eventDetails: IEventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(2, "D MMM YYYY")}`,
            eventCategory: "Food & Drinks",
            eventType: "Anniversary",
            guestAmount: "6",
            postcode: "TS225PS",
        }

    test("new save for later for new client @C118 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp118"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const servicePage: ServicePage = await mainPage.openService("23836")
                // await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                await servicePage.newSaveForLater(true, RandomHelper.getSingUpRandomUser("Client"))
                await servicePage.fillSaveForLaterModal(eventDetails, testInfo.project.name === "Mobile Safari")
                expect(await servicePage.isAlreadyQuote()).toBeTruthy()
                expect(await servicePage.isTextPresent("CHECK AVAILABILITY"))
                expect(await servicePage.isSavedEnabled()).toBeFalsy()
            })
        })
})
