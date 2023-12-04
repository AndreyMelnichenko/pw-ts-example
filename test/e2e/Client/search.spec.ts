import { expect } from "@playwright/test"
import { test } from "../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../src/models/eventDetails"
import * as DateHelper from "../../../src/utils/dateHelper"

test.describe.parallel("Client Search", () => {
    let eventDetails: IEventDetails = {
        }

    test.beforeEach(() => {
        eventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(2, "D MMM YYYY")}`,
            eventCategory: "DJ",
            eventType: "Anniversary",
            guestAmount: "4",
            postcode: "TS225PS",
        }
    })

    test("Price range filters @C82 @smoke @mobile ", async ({ mainPage }) => {
        await test.step("Test steps", async() => {
            const searchPage = await mainPage.clickOnSerachButton()
            await searchPage.setPriceRange("Affordable")
            expect((searchPage.page.url()).includes("normalized_price_from=0&normalized_price_to=0.4&page=1"))
                .toBeTruthy()
            await searchPage.setPriceRange("Mid Range")
            expect((searchPage.page.url()).includes("normalized_price_from=0.3&normalized_price_to=0.7&page=1"))
                .toBeTruthy()
            await searchPage.setPriceRange("Premium")
            expect((searchPage.page.url()).includes("normalized_price_from=0.6&normalized_price_to=1&page=1"))
                .toBeTruthy()
        })
    })

    test("Alternative block displaying @C62 @smoke @mobile ", async ({ mainPage }) => {
        await test.step("Test steps", async() => {
            const searchPage = await mainPage.clickOnSerachButton()
            await searchPage.setEventCategory(eventDetails.eventCategory || "NO CATEGORY")
            await searchPage.goToPaginationPage("2")
            expect(await searchPage.isAlternativeBlocks()).toBeTruthy()
        })
    })

    test("Base price calculation and event type search @C63 @C58 @smoke @mobile ", async ({ mainPage }, testInfo) => {
        await test.step("Test steps", async() => {
            const guestAmount = 6
            const serviceName = "Delicious Chinese Style Bubble Tea Bar"
            eventDetails.eventCategory = "Mobile Bar"
            const searchPage = await mainPage.clickOnSerachButton()
            await searchPage.setEventCategory(eventDetails.eventCategory || "NO-CATEGORY")
            const basePrice = 10
            eventDetails = { guestAmount: `${guestAmount}` }
            await searchPage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
            await searchPage.clickOnSerachButton()
            const servicePrice = await searchPage.getServicePrice(serviceName)
            expect(((basePrice * guestAmount)) === (Number(servicePrice))).toBeTruthy()
        })
    })

})
