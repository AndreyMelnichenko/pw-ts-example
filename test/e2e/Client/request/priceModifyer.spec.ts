import { expect } from "@playwright/test"
import * as creds from "../../../../creds.json"
import { ApiCalendarController } from "../../../../src/Api/Controllers/calendarController"
import { test } from "../../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../../src/models/eventDetails"
import { Months } from "../../../../src/models/months"
import { NewContextMainPage } from "../../../../src/pages/newContextMainPage"
import { ServicePage } from "../../../../src/pages/servicePage"
import { SuppCheckoutPage } from "../../../../src/pages/suppCheckoutPage"
import { SupplierServicePage } from "../../../../src/pages/supplierServicePage"
import * as DataHelper from "../../../../src/utils/dataHelper"
import * as DateHelper from "../../../../src/utils/dateHelper"

test.describe("Request", () => {
    const eventDetails: IEventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(1, "D MMM YYYY")}`,
            eventCategory: "Food & Drinks",
            eventType: "Anniversary",
            guestAmount: "4",
            postcode: "TS225PS",
        }

    test("Check catering and price modifier for different number of guest @C105 @C59 @smoke @mobile ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp105"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                let servicePage: ServicePage = await mainPage.openService("23614")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                let checkoutPage = await servicePage.clickOnRequestToBook(true)
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                const modifyers = await servicePage.getPriceCalculation("TOTAL")
                expect(207).toEqual(Number(modifyers.total))
                await servicePage.clickOnViewQuote()
                const checkoutPriceOptions = await checkoutPage.getPriceCalculation("TOTAL")
                expect(checkoutPriceOptions.total).toEqual(modifyers.total)
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                expect(await servicePage.getTotalPriceLightMessage()).toEqual(checkoutPriceOptions.total)
                checkoutPage = await servicePage.clickOnViewQuote()
                const quoteId = await checkoutPage.getQuoteId()
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp105")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quoteId}`)
                const suppCheckout = new SuppCheckoutPage(supplierServicePage.page)
                await suppCheckout.pageLoaded()
                expect(String(checkoutPriceOptions.total)).toEqual(await suppCheckout.getPriceOptionValue("TOTAL"))
                const newGuestAmount = 22
                await checkoutPage.setGuestAmount(String(newGuestAmount))
                checkoutPriceOptions.total = await checkoutPage.getPriceOptionValue("TOTAL")
                if (!isMobile) {
                    checkoutPriceOptions.servicePrice = await checkoutPage.getPriceOptionValue("SERVICE")
                }
                expect(modifyers.total).not.toEqual(checkoutPriceOptions.total)
                const paymentPage = await checkoutPage.clickOnBookNow()
                expect(Number(await paymentPage.getPriceOptionValue("TOTAL")).toFixed(0))
                    .toEqual(checkoutPriceOptions.total)
                await suppCheckout.page.reload()
                await suppCheckout.pageLoaded()
                if (!isMobile) {
                    expect(String(checkoutPriceOptions.servicePrice))
                        .toEqual(await suppCheckout.getPriceOptionValue("SERVICE"))
                }
            })
    })

    test("Check entertainment and apply discount / edit start time on service page @C134 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp106"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                let servicePage: ServicePage = await mainPage.openService("23619")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                let checkoutPage = await servicePage.clickOnRequestToBook(true)
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                const modifyers = await servicePage.getPriceCalculation("TOTAL")
                expect(modifyers.total).toEqual("705")
                checkoutPage = await servicePage.clickOnViewQuote()
                const checkoutPriceOptions = await checkoutPage.getPriceCalculation("FEE", "PRICE", "TRAVEL", "TOTAL")
                expect(checkoutPriceOptions.total).toEqual(modifyers.total)
                await checkoutPage.setStartTime("12:30 PM")
                const quoteId = await checkoutPage.getQuoteId()
                const payBeforeDiscount = await checkoutPage.getPriceOptionValue("PAY-AMOUNT")
                await checkoutPage.setPromoCode("PROMO1")
                const payAfterDiscount = await checkoutPage.getPriceOptionValue("PAY-AMOUNT")
                expect(Number(payAfterDiscount)).toEqual((Number(payBeforeDiscount) - Number(checkoutPriceOptions.fee)))
                const paymentPage = await checkoutPage.clickOnBookNow()
                expect(await paymentPage.getPriceOptionValue("PAY-AMOUNT")).toEqual(payAfterDiscount)
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp106")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quoteId}`)
                const suppCheckout = new SuppCheckoutPage(supplierServicePage.page)
                await suppCheckout.pageLoaded()
                expect(suppCheckout.isTextPresent("12:30 PM")).toBeTruthy()
                expect(await suppCheckout.getPriceOptionValue("TOTAL")).toEqual(checkoutPriceOptions.total)
            })
    })

    test("Check music with travel expenses and edit duration on service page / event type modifier @C107 @smoke @mobile ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp107"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                let servicePage: ServicePage = await mainPage.openService("23645")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                let checkoutPage = await servicePage.clickOnRequestToBook(true)
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                const modifyers = await servicePage.getPriceCalculation("PRICE", "FEE", "TRAVEL", "TOTAL")
                checkoutPage = await servicePage.clickOnViewQuote()
                const checkoutTotal = await checkoutPage.getPriceOptionValue("TOTAL")
                if (!isMobile) {
                    const checkoutTravel = await checkoutPage.getPriceOptionValue("TRAVEL")
                    expect(modifyers.travel).toEqual(checkoutTravel)
                    expect(modifyers.travel).not.toEqual("0")
                }
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                expect(await servicePage.getTotalPriceLightMessage()).toEqual(checkoutTotal)
                checkoutPage = await servicePage.clickOnViewQuote()
                const quoteId = await checkoutPage.getQuoteId()
                const totalBeforeCharge = await checkoutPage.getPriceOptionValue("TOTAL")
                await checkoutPage.setDuration("2 x 40 mins sets")
                const totalAfterCharge = await checkoutPage.getPriceOptionValue("TOTAL")
                expect(totalAfterCharge !== totalBeforeCharge).toBeTruthy()
                const fee = await checkoutPage.getPriceOptionValue("FEE")
                const travel = await checkoutPage.getPriceOptionValue("TRAVEL")
                const servicePrice = await checkoutPage.getPriceOptionValue("SERVICE")
                expect(Number(totalAfterCharge)).toEqual(Number(servicePrice) + Number(fee) + Number(travel))
                const paymentPage = await checkoutPage.clickOnBookNow()
                expect(servicePrice).toEqual(await paymentPage.getPriceOptionValue("SERVICE"))
                expect(fee).toEqual(Number(await paymentPage.getPriceOptionValue("FEE")).toFixed(0))
                expect(travel).toEqual(await paymentPage.getPriceOptionValue("TRAVEL"))
                await paymentPage.goBack()
                await checkoutPage.pageLoaded()
                expect(await checkoutPage.getPriceOptionValue("TOTAL")).toEqual(totalAfterCharge)
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                expect(await servicePage.getTotalPriceLightMessage()).toEqual(totalAfterCharge)
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp107")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quoteId}`)
                const suppCheckout = new SuppCheckoutPage(supplierServicePage.page)
                await suppCheckout.pageLoaded()
                expect(suppCheckout.isTextPresent("2 x 40 mins sets")).toBeTruthy()
                expect(await suppCheckout.getPriceOptionValue("TOTAL")).toEqual(totalAfterCharge)
            })
    })

    test("Check transport with extra update @C108 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("melnichenko.andrey"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                let servicePage: ServicePage = await mainPage.openService("23564")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                let checkoutPage = await servicePage.clickOnRequestToBook(true)
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                const modifyers = await servicePage.getPriceCalculation("TOTAL")
                checkoutPage = await servicePage.clickOnViewQuote()
                const checkoutPriceOptions = await checkoutPage.getPriceCalculation("FEE", "PRICE", "TRAVEL", "TOTAL")
                expect(checkoutPriceOptions.total).toEqual(modifyers.total)
                expect(await checkoutPage.isExtraOptions()).toBeTruthy()
                await checkoutPage.addExtraOption()
                const totalPriceAfter = await checkoutPage.getPriceOptionValue("TOTAL")
                expect(Number(totalPriceAfter) > Number(checkoutPriceOptions.total)).toBeTruthy()
                const baseExtra = await checkoutPage.getPriceOptionValue("SERVICE")
                const quoteId = await checkoutPage.getQuoteId()
                const paymentPage = await checkoutPage.clickOnBookNow()
                const paymentTravel = await paymentPage.getPriceOptionValue("TRAVEL")
                expect(paymentTravel).toEqual(checkoutPriceOptions.travel)
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                await suppMainPage.pageLoaded()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = (await loginPage.loginAs(creds.supplier[0])) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quoteId}`)
                const suppCheckout = new SuppCheckoutPage(supplierServicePage.page)
                await suppCheckout.pageLoaded()
                expect(await suppCheckout.getPriceOptionValue("TRAVEL")).toEqual(checkoutPriceOptions.travel)
                expect(await suppCheckout.getPriceOptionValue("SERVICE")).toEqual(baseExtra)
                expect(await suppCheckout.getPriceOptionValue("TOTAL")).toEqual(totalPriceAfter)
            })
    })

    test("Check event service with month modifier @C109 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                eventDetails.postcode = "NE11BB"
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp43"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const expDate: Date = DateHelper.getDateFrom(eventDetails.date, "D MMM YYYY")
                const basePrice = DataHelper.monthCharge(50, Months[expDate.getMonth()] || "")
                let servicePage: ServicePage = await mainPage.openService("24281")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                let checkoutPage = await servicePage.clickOnRequestToBook(true)
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                const serviceModifyers = await servicePage.getPriceCalculation("TOTAL")
                const totalLightMsg = await servicePage.getTotalPriceLightMessage()
                checkoutPage = await servicePage.clickOnViewQuote()
                const checkoutPriceOptions = await checkoutPage.getPriceCalculation("FEE", "PRICE", "TRAVEL", "TOTAL")
                expect(String(basePrice)).toEqual(checkoutPriceOptions.servicePrice)
                expect(serviceModifyers.total).toEqual(checkoutPriceOptions.total)
                const quoteId = await checkoutPage.getQuoteId()
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = (await loginPage.loginAs(DataHelper
                    .getSuppByName("testSupp43"))) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quoteId}`)
                const suppCheckout = new SuppCheckoutPage(supplierServicePage.page)
                await suppCheckout.pageLoaded()
                expect(String(basePrice)).toEqual(await suppCheckout.getPriceOptionValue("SERVICE"))
                expect(await suppCheckout.getPriceOptionValue("TOTAL")).toEqual(serviceModifyers.total)
                // https://gitlab.com/poptop/poptop/-/issues/3980
                expect(serviceModifyers.total,
                    `Total price in light message = ${totalLightMsg}, but at service page = ${serviceModifyers.total}`)
                    .toEqual(totalLightMsg)
            })
    })

    test("Check event staff with day modifier @C110 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("melnichenko.andrey"))
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const basePrice = DataHelper.dayCharge(
                    20,
                    DateHelper.getFullDay(
                        DateHelper.getDateFrom(eventDetails.date, "D MMM YYYY"),
                         "D MMM YYYY",
                    ),
                )
                let servicePage: ServicePage = await mainPage.openService("23570")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                let checkoutPage = await servicePage.clickOnRequestToBook(true)
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                const modifyers = await servicePage.getPriceCalculation("TOTAL")
                const totalLightMsg = await servicePage.getTotalPriceLightMessage()
                checkoutPage = await servicePage.clickOnViewQuote()
                const checkoutPriceOptions = await checkoutPage.getPriceCalculation("PRICE", "TOTAL")
                expect(String(basePrice)).toEqual(checkoutPriceOptions.servicePrice)
                expect(modifyers.total).toEqual(totalLightMsg)
                expect(modifyers.total).toEqual(checkoutPriceOptions.total)
                const quoteId = await checkoutPage.getQuoteId()
                const paymentPage = await checkoutPage.clickOnBookNow()
                const paymentTotal = await paymentPage.getPriceOptionValue("TOTAL")
                expect(checkoutPriceOptions.total).toEqual(paymentTotal)
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = (await loginPage.loginAs(creds.supplier[0])) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quoteId}`)
                const suppCheckout = new SuppCheckoutPage(supplierServicePage.page)
                await suppCheckout.pageLoaded()
                expect(String(basePrice)).toEqual(await suppCheckout.getPriceOptionValue("SERVICE"))
                expect(await suppCheckout.getPriceOptionValue("TOTAL")).toEqual(modifyers.total)
            })
    })

    test("Check photo and video with special date modifier @C112 @C106 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const calendarController = new ApiCalendarController(DataHelper.getSuppByName("testSupp"))
                const chrgeDate = "24 Aug"
                eventDetails.date = DateHelper.getDateString(
                                        DateHelper.getNearFutureDate(
                                            DateHelper.getDateFrom(chrgeDate, "DD MMM")), "DD MMM YYYY")
                await calendarController.removeTimeSlotByDate(DateHelper.getDateFrom(eventDetails.date, "DD MMM YYYY"))
                const basePrice = 400
                let servicePage: ServicePage = await mainPage.openService("23604")
                await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                let checkoutPage = await servicePage.clickOnRequestToBook(true)
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                const modifyers = await servicePage.getPriceCalculation("TOTAL")
                const priceLightMsg = await servicePage.getTotalPriceLightMessage()
                checkoutPage = await servicePage.clickOnViewQuote()
                expect(priceLightMsg).toEqual(modifyers.total)
                const checkoutPriceOptions = await checkoutPage.getPriceCalculation("TOTAL")
                expect(String(basePrice)).toEqual(await checkoutPage.getPriceOptionValue("SERVICE"))
                const quoteId = await checkoutPage.getQuoteId()
                const paymentPage = await checkoutPage.clickOnBookNow()
                expect(await paymentPage.getPriceOptionValue("TOTAL")).toEqual(checkoutPriceOptions.total)
                const suppMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
                const loginPage = await suppMainPage.openLoginForm()
                const supplierServicePage = await loginPage
                    .loginAs(DataHelper.getSuppByName("testSupp")) as SupplierServicePage
                await supplierServicePage.page.goto(`/s/inbox/${quoteId}`)
                const suppCheckout = new SuppCheckoutPage(supplierServicePage.page)
                await suppCheckout.pageLoaded()
                expect(String(basePrice)).toEqual(await suppCheckout.getPriceOptionValue("SERVICE"))
            })
    })
})
