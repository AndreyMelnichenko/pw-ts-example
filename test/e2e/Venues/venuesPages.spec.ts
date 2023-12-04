import { expect } from "@playwright/test"
import { test } from "../../../src/fixtures/mainPageFixtures"
import { VenuePage } from "../../../src/pages/venuePage"
import * as StringHelper from "../../../src/utils/stringHelper"

test.describe("Venues page", () => {
    test("should open correct @C7 @smoke @mobile ", async ({ mainPage }) => {
        await test.step("Test steps", async() => {
            await mainPage.scrollToVenues()
            const venueName: string = await mainPage.getRandomVenueName()
            const venuePage: VenuePage = await mainPage.openVenue(venueName)
            const actualVenueMainText = (await venuePage.getMainPageText()).toLocaleLowerCase()
            const expectedText = `Hire ${venueName.substring(0, venueName.length - 1)} Near You`.toLocaleLowerCase()
            expect(actualVenueMainText).toEqual(expectedText)
            const venuesSubCatNormalizedName = StringHelper.stringCapitalizer(venueName)
            expect(await venuePage.isH2Text(`${venuesSubCatNormalizedName } in UK cities`))
            expect(await venuePage.isH2Text(`${venuesSubCatNormalizedName} in UK counties`))
        })
    })
})
