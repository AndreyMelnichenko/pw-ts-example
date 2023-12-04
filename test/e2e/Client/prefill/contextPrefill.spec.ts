import { expect } from "@playwright/test"
import { test } from "../../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../../src/models/eventDetails"
import { SearchPage } from "../../../../src/pages/searchPage"
import * as DateHelper from "../../../../src/utils/dateHelper"

test.describe("Client prefill", () => {
    let eventDetails: IEventDetails = {
        }

    test.beforeEach(() => {
        eventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(2, "D MMM YYYY")}`,
            eventCategory: "Food & Drinks",
            eventType: "Anniversary",
            guestAmount: "4",
            postcode: "TS225PS",
        }
    })

    test("Prefill after back from Service page @C103 @smoke @mobile ", async ({ mainPage, isMobile }, testInfo) => {
        await test.step("Test steps", async() => {
            await mainPage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
            const searchPage = await mainPage.clickOnSerachButton()
            const url = searchPage.page.url()
            const newSearchPageTab = await searchPage.openNewTab(url)
            const searchPage2 = await new SearchPage(newSearchPageTab, isMobile).pageLoaded()
            delete eventDetails.eventCategory
            expect(await searchPage2.getPrefill(isMobile)).toEqual(eventDetails)
            const path = `/search/?date=${DateHelper.getDateStringWithOffsetInFormat(4, "YYYY-MM-DD")}`
            await searchPage2.goToPage(path)
            await new SearchPage(searchPage2.page, isMobile).pageLoaded()
            expect((await searchPage2.getPrefill(isMobile)).date)
                .toEqual(DateHelper.getDateStringWithOffsetInFormat(4, "D MMM YYYY"))
            await searchPage2.goToPage(`${path}&location=ts225pp`)
            // await searchPage2.goToPage(`${path}&eventType=Celebration`)
            await new SearchPage(searchPage2.page, isMobile).pageLoaded()
            expect((await searchPage2.getPrefill(isMobile)).postcode).toEqual("ts225pp".toUpperCase())
            await searchPage2.goToPage(`${path}&guestsNumber=10`)
            await new SearchPage(searchPage2.page, isMobile).pageLoaded()
            expect((await searchPage2.getPrefill(isMobile)).guestAmount).toEqual("10")
        })
    })

})
