import { test } from "../../src/fixtures/mainPageFixtures"
import * as DataHelper from "../../src/utils/dataHelper"

test.describe("Password recovery", () => {
    const users = [DataHelper.getClientByName("TestClient130"), DataHelper.getSuppByName("testSupp43")]
    for (const user of users) {
        test(`as ${user.role} @C130 @smoke @mobile `, async ({ mainPage, isMobile }) => {
            await test.step("Test steps", async() => {
                const loginPage = await mainPage.openLoginForm(isMobile)
                const recoveryPass =
                    await loginPage.recoverPasswordFor(user)
                await loginPage.setRecoveryForm(recoveryPass, user)
            })
        })
    }

})
