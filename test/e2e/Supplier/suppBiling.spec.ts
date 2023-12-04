import { expect } from "@playwright/test"
import * as creds from "../../../creds.json"
import { test } from "../../../src/fixtures/mainPageFixtures"
import { BillingPage } from "../../../src/pages/billingPage"
import { SupplierServicePage } from "../../../src/pages/supplierServicePage"
import * as StringHelper from "../../../src/utils/stringHelper"

test.describe("Supplier", () => {
    test.skip("update billing details @C4 @smoke @mobile ", async ({ mainPage, isMobile }) => {
        await test.step("Test steps", async() => {
            const loginPage = await mainPage.openLoginForm(isMobile)
            const supplierServicePage = (await loginPage.loginAs(creds.supplier[0])) as SupplierServicePage
            let billing = await supplierServicePage.openSideBarMenu("Billing") as BillingPage
            const billingDetails = await billing.viewBillingDeatails()
            await billingDetails.fillPassword(creds.supplier[0]?.password)
            const newAddress = StringHelper.getRandomStr(20)
            await billingDetails.changeAdress(newAddress)
            expect(await billingDetails.isTextPresent(newAddress)).toBeTruthy()
            billing = await billingDetails.clickContinue()
            expect(await billing.isTextPresent(newAddress)).toBeTruthy()
        })
    })
})
