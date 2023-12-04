import { expect } from "@playwright/test"
import * as creds from "../../../creds.json"
import { test } from "../../../src/fixtures/mainPageFixtures"
import { LoginPage } from "../../../src/pages/loginPage"
import { SupplierServicePage } from "../../../src/pages/supplierServicePage"
import { SuppProfilePage } from "../../../src/pages/suppProfilePage"
import * as RandomHelper from "../../../src/utils/randomHelper"

test.describe("Supplier calendar", () => {
    let loginPage: LoginPage

    test("Update Contact information @C46 @smoke @mobile ", async ({ mainPage, isMobile }) => {
        await test.step("Test steps", async() => {
            loginPage = await mainPage.openLoginForm(isMobile)
            const supplierServicePage = (await loginPage.loginAs(creds.supplier[0])) as SupplierServicePage
            let supplierProfile: SuppProfilePage =
                await supplierServicePage.openSideBarMenu("Profile") as SuppProfilePage
            let suppCredPage = await supplierProfile.openCredentialsPage()
            const oldSuppName = await suppCredPage.getSuppName()
            const newSuppName = RandomHelper.getSingUpRandomUser("Supplier").businessName
            await suppCredPage.setSuppName(newSuppName)
            supplierProfile = await suppCredPage.openSideBarMenu("Profile") as SuppProfilePage
            suppCredPage = await supplierProfile.openCredentialsPage()
            const actSuppName = await suppCredPage.getSuppName()
            expect(oldSuppName, `${oldSuppName} equals with ${actSuppName}`).not.toEqual(actSuppName)
            expect(newSuppName, `${newSuppName} mot equals with ${actSuppName}`).toEqual(actSuppName)
        })
    })
})
