import * as creds from "../../../creds.json"
import { test } from "../../../src/fixtures/mainPageFixtures"
import { LoginPage } from "../../../src/pages/loginPage"
import { SuppDashboardPage } from "../../../src/pages/suppDashboardPage"
import { SupplierServicePage } from "../../../src/pages/supplierServicePage"

test.describe("Supplier could", () => {
    let loginPage: LoginPage

    test.beforeEach(async ({ mainPage, isMobile }) => {
        loginPage = await mainPage.openLoginForm(isMobile)
    })

    test("update own profile @smoke @C25 @C5 @mobile ", async ({ context }) => {
        await test.step("Test steps", async() => {
            const supplierServicePage = (await loginPage.loginAs(creds.supplier[0])) as SupplierServicePage
            const supplierDashboard: SuppDashboardPage =
                await supplierServicePage.openSideBarMenu("Dashboard") as SuppDashboardPage
            await supplierDashboard.openEditProfilePage()
            await supplierServicePage.openSideBarMenu("Dashboard")
            await supplierDashboard.openSeeAsClientPage(context)
            await supplierDashboard.openPopBlog(context)
            await supplierDashboard.openSeeReviews()
            await supplierDashboard.exitPopTop()
        })
    })
})
