import { test } from "../../../src/fixtures/mainPageFixtures"
import { LoginPage } from "../../../src/pages/loginPage"
import { SupplierServicePage } from "../../../src/pages/supplierServicePage"
import { SuppRankingPage } from "../../../src/pages/suppRankingPage"
import * as DataHelper from "../../../src/utils/dataHelper"

test.describe("Supplier ranking", () => {
    let loginPage: LoginPage

    test("Check ranking page @C120 ", async ({ mainPage, isMobile }) => {
        await test.step("Test steps", async() => {
            loginPage = await mainPage.openLoginForm(isMobile)
            const supplierServicePage =
                await loginPage.loginAs(DataHelper.getSuppByName("melnichenko.andrey")) as SupplierServicePage
            const page = await supplierServicePage.goToPage("/ranking")
            await new SuppRankingPage(page, isMobile).pageLoaded()
        })
    })
})
