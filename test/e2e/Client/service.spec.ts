import { expect } from "@playwright/test"
import { test } from "../../../src/fixtures/mainPageFixtures"
import { ServicePage } from "../../../src/pages/servicePage"

test.describe.parallel("Client Search", () => {

    test("Check block More services from this supplier @C21 @smoke @mobile ", async ({ mainPage }) => {
        await test.step("Test steps", async() => {
            const servicePage: ServicePage = await mainPage.openService("23564")
            const oldServiceId = servicePage.page.url()
            await servicePage.openRandomOtherService()
            const newServiceId = servicePage.page.url()
            expect(oldServiceId).not.toEqual(newServiceId)
        })
    })

})
