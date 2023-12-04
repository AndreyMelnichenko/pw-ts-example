import { expect } from "@playwright/test"
import { test } from "../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../src/models/eventDetails"
import { IUser } from "../../src/models/user"
import { ConfirmPhonePage } from "../../src/pages/confirmPhonePage"
import { MembershipPage } from "../../src/pages/membershipPage"
import { ServicePage } from "../../src/pages/servicePage"
import { SignUpPage } from "../../src/pages/signUpPage"
import { StripePaymentPage } from "../../src/pages/stripePaymentPage"
import * as DateHelper from "../../src/utils/dateHelper"
import * as RandomHelper from "../../src/utils/randomHelper"

test.describe.parallel("SingUp", () => {
    let newUser: IUser
    const eventDetails: IEventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(2, "D MMM YYYY")}`,
            eventCategory: "Party Transport",
            eventType: RandomHelper.getRandomArrayElement(["Anniversary", "Wedding"]),
            guestAmount: "6",
            postcode: "NE11BB",
        }

    test("as Supplier @C1 @C45 @smoke @mobile ", async ({ mainPage }) => {
        await test.step("Test steps", async() => {
            const user = RandomHelper.getSingUpRandomUser("Supplier")
            const singUpPage: SignUpPage = await mainPage.openSupplierSingUp()
            await singUpPage.pageLoaded()
            await singUpPage.fillSingUpForm(user)
            const confirmPhonePage: ConfirmPhonePage = await singUpPage.submitSingUpForm()
            const packListPage = await confirmPhonePage.confirmPhone(user)
            const membershipPage = await packListPage.openSideBarMenu("Membership") as MembershipPage
            let proMembershipPage = await membershipPage.joinOnProMember()
            const stripePayment: StripePaymentPage = await proMembershipPage.clickOnUpgrade()
            proMembershipPage = await stripePayment.fillPaymentData()
            expect(await proMembershipPage.isSubscriptionSuccess(), "text not visible").toBeTruthy()
            await proMembershipPage.goToServiceDashboard()
        })
    })

    test("singup as Client and Prefill from light message on Quote Request Declined @C38 @C17 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const servicePage: ServicePage = await mainPage.openService("20853")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                const checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                await checkoutPage.declineQuoteWithReason("Other")
                const searchPage = await checkoutPage.clickOnLightMessageLink()
                expect(await searchPage.isPrefill()).toBeTruthy()
            })
    })

    test("and save for later service @C119 @smoke @mobile ", async ({ mainPage }, testInfo) => {
        await test.step("Test steps", async() => {
            const servicePage: ServicePage = await mainPage.openService("20853")
            newUser = RandomHelper.getSingUpRandomUser("Client")
            await servicePage.clickOnSaveForLater(true, newUser)
            await servicePage.fillSaveForLaterModal(eventDetails, testInfo.project.name === "Mobile Safari")
            await servicePage.pageLoaded()
            expect(await servicePage.isAlreadyQuote()).toBeTruthy()
            expect(await servicePage.isTextPresent("CHECK AVAILABILITY"))
            expect(await servicePage.isSavedEnabled()).toBeFalsy()
        })
    })

    test("singUp as Client @C6 @C116 @smoke ", async ({ mainPage }) => {
        await test.step("Test steps", async() => {
            const loginPage = await mainPage.openLoginForm()
            const clientMainPage = await loginPage.singUpAsClient(RandomHelper.getSingUpRandomUser("Client"))
            await clientMainPage.header.exitPopTop()
        })
    })
})
