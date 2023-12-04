import { Browser, BrowserContext, chromium, expect, Page, test } from "@playwright/test"
import * as creds from "../../creds.json"
import { InbucketController } from "../../src/Api/Controllers/inbucketController"
import { MailingController } from "../../src/Api/Controllers/mailingController"
import { EmailContext } from "../../src/models/GraphQL/EmailContext/emailContext"
import { ISearchPrefill } from "../../src/models/searchPrefill"
import { CheckoutPage } from "../../src/pages/checkoutPage"
import { BookingFinalConfirm } from "../../src/pages/Email/bookingFinalConfirm"
import { CartAbandonment } from "../../src/pages/Email/cartAbandonment"
import { CrossSaleEmailPage } from "../../src/pages/Email/crossSale2EmailPage"
import { DepozitFrozen } from "../../src/pages/Email/depozitFrozen"
import { EventSummary1 } from "../../src/pages/Email/eventSummary1"
import { EventSummary2 } from "../../src/pages/Email/eventSummary2"
import { EventSummary3 } from "../../src/pages/Email/eventSummary3"
import { NewBooking } from "../../src/pages/Email/newBooking"
import { NewMessage } from "../../src/pages/Email/newMessage"
import { PaymentReminder2 } from "../../src/pages/Email/paymentReminder2"
import { ServiceShortlisted } from "../../src/pages/Email/serviceShortlisted"
import { Upsell1 } from "../../src/pages/Email/upsell1"
import { Upsell2 } from "../../src/pages/Email/upsell2"
import { Upsell3 } from "../../src/pages/Email/upsell3"
import { WelcomeEmailPage } from "../../src/pages/Email/welcomeEmailPage"
import { EventDashboard } from "../../src/pages/eventDashboard"
import { LoginPage } from "../../src/pages/loginPage"
import { MainPage } from "../../src/pages/mainPage"
import { PaymentSuccessPage } from "../../src/pages/paymentSuccessPage"
import { SearchPage } from "../../src/pages/searchPage"
import { ServicePage } from "../../src/pages/servicePage"
import { SupplierServicePage } from "../../src/pages/supplierServicePage"
import * as StringHelper from "../../src/utils/stringHelper"

test.describe("Mailing", () => {
    const browserType = chromium
    let browser: Browser
    let context: BrowserContext
    let customPage: Page
    let mainPage: MainPage
    let loginPage: LoginPage
    let loginedPage: SupplierServicePage

    test.beforeAll(async () => {
        browser = await browserType.launch({ headless: true })
        context = await browser.newContext()
        customPage = await context.newPage()
        await customPage.goto("/")
        mainPage = new MainPage(customPage)
        await mainPage.pageLoaded()
        loginPage = await mainPage.openLoginForm()
        await loginPage.pageLoaded()
        loginedPage = await loginPage.loginAs(creds.admin) as SupplierServicePage
        const inbuket = new InbucketController(customPage)
        await inbuket.cleanMailBox()
    })

    test("Client - Welcome Email @C28 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext =
                await mailing.triggerTemplate(
                    "client-registration",
                    ["501080"])
            const prefillObj: ISearchPrefill =
                StringHelper.queryparamsParser(
                    mailContext.prefill_event_details)
            const subject = `${mailContext.client_first_name}, Welcome To Poptop!`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const welcomeEmail = new WelcomeEmailPage(loginedPage.page)
            await welcomeEmail.pageLoaded()
            const eventDashboard: EventDashboard = await welcomeEmail.openEventDashboard()
            await eventDashboard.goBack()
            await welcomeEmail.pageLoaded()
            const searchPage: SearchPage = await welcomeEmail.openRandomLink()
            const isPrefill = await searchPage.isPrefillEmailFollow(prefillObj)
            expect(isPrefill).toBeTruthy()
        })
    })

    test("Client - Event Summary 1 @C29 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext = await mailing.triggerTemplate(
                "client-instant-quote-submitted",
                [
                    "583302",
                    "12026",
                ])
            const subject = `Latest Update on Your ${mailContext.event_type} Shortlisted Services`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const eventSummary = new EventSummary1(loginedPage.page)
            await eventSummary.pageLoaded()
            const checkout: CheckoutPage = await eventSummary.checkViewDetailsLink()
            await checkout.goBack()
            await eventSummary.pageLoaded()
            const eventDashboard: EventDashboard = await eventSummary.openEventDashboard()
            await eventDashboard.goBack()
            await eventSummary.pageLoaded()
            const searchPage: SearchPage = await eventSummary.openRandomLink()
            const isPrefill = await searchPage.isPrefill()
            expect(isPrefill).toBeTruthy()
        })
    })

    test("Client - Event Summary 2 @C33 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext = await mailing.triggerTemplate(
                "clients-inactive-email", ["459567"])
            const prefillObj: ISearchPrefill = StringHelper.queryparamsParser(mailContext.prefill_event_details)
            const subject = `Don't Miss A Chance To Book The Best Services For ${mailContext.event_date}`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const eventSummary = new EventSummary2(loginedPage.page)
            await eventSummary.pageLoaded()
            const checkout: CheckoutPage = await eventSummary.checkViewDetailsLink()
            await checkout.goBack()
            await eventSummary.pageLoaded()
            const eventDashboard: EventDashboard = await eventSummary.openEventDashboard()
            await eventDashboard.goBack()
            await eventSummary.pageLoaded()
            const searchPage: SearchPage = await eventSummary.openRandomLink()
            const isPrefill = await searchPage.isPrefillEmailFollow(prefillObj)
            expect(isPrefill).toBeTruthy()
        })
    })

    test("Client - Event Summary 3 @C34 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext = await mailing.triggerTemplate(
                "client-poor-detailed-vacancy", ["550108"])
            const prefillObj: ISearchPrefill = StringHelper.queryparamsParser(mailContext.prefill_event_details)
            const subject = `Your Shortlisted Services For ${mailContext.event_date}`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const eventSummary = new EventSummary3(loginedPage.page)
            await eventSummary.pageLoaded()
            const checkout: CheckoutPage = await eventSummary.checkViewDetailsLink()
            await checkout.goBack()
            await eventSummary.pageLoaded()
            const eventDashboard: EventDashboard = await eventSummary.openEventDashboard()
            await eventDashboard.goBack()
            await eventSummary.pageLoaded()
            const searchPage: SearchPage = await eventSummary.openRandomLink()
            const isPrefill = await searchPage.isPrefillEmailFollow(prefillObj)
            expect(isPrefill).toBeTruthy()
        })
    })

    test.skip("Client - Upsell 1 @C30 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext = await mailing.triggerTemplate(
                "client-instant-quotes-invitations-notify", ["560498"])
            const subject = `Explore more ${mailContext.titled_categories.root} ideas for your ${mailContext.event_type}`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const upsell1Email = new Upsell1(loginedPage.page)
            await upsell1Email.pageLoaded()
            const servicePage: ServicePage = await upsell1Email.openRandomAlternativeServece()
            const isEventDetailPrefill = await servicePage.isEventDetailPrefill()
            // uncomment after https://gitlab.com/poptop/poptop/-/issues/3400
            // https://gitlab.com/poptop/poptop/-/issues/3488
            // expect(isEventDetailPrefill).toBeTruthy();
            await servicePage.goBack()
            await upsell1Email.pageLoaded()
            const searchPage: SearchPage = await upsell1Email.checkExploreMoreLink()
            const isPrefill = await searchPage.isPrefill()
            expect(isPrefill).toBeTruthy()
        })
    })

    test.skip("Client - Upsell 3 @C35 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext = await mailing.triggerTemplate(
                "client-main-event-email2", ["382707"])
            const subject = `Review Your Shortlisted Services For ${mailContext.event_date}`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const upsell3 = new Upsell3(loginedPage.page)
            await upsell3.pageLoaded()
            let servicePage: ServicePage = await upsell3.clickOnViewDetails()
            const isEventDetailPrefill = await servicePage.isEventDetailPrefill()
            // uncomment after https://gitlab.com/poptop/poptop/-/issues/3400
            expect(isEventDetailPrefill).toBeTruthy()
            await servicePage.goBack()
            await upsell3.pageLoaded()
            servicePage = await upsell3.clickOnRandomCategory()
            let isPrefill = await servicePage.isEventDetailPrefill()
            expect(isPrefill).toBeTruthy()
            await upsell3.goBack()
            const searchPage: SearchPage = await upsell3.clickOnShowMore()
            isPrefill = searchPage.isPrefill()
            expect(isPrefill).toBeTruthy()
        })
    })

    test("Client - Cart Abandonment @C31 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext = await mailing.triggerTemplate(
                "client-no-quotes-reminder", ["668040"])
            const subject = `Event Services You Shortlisted For ${mailContext.event_type} Are About To Expire`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const cartAbandonment = new CartAbandonment(loginedPage.page)
            await cartAbandonment.pageLoaded()
            const checkout: CheckoutPage = await cartAbandonment.clickOnCardViewDetails()
            await checkout.goBack()
            await cartAbandonment.pageLoaded()
            const eventDashboard: EventDashboard = await cartAbandonment.clickOnGoToShortList()
            await eventDashboard.goBack()
            await cartAbandonment.pageLoaded()
            await cartAbandonment.clickOnGoToDashboard()
            await eventDashboard.goBack()
            await cartAbandonment.pageLoaded()
        })
    })

    test("Client - Cross Sale 1 @C32 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext = await mailing.triggerTemplate(
                "client-main-event-email3", ["449988"])
            const prefillObj: ISearchPrefill = StringHelper.queryparamsParser(mailContext.prefill_event_details)
            const subject = `Some Inspiration For Your ${mailContext.event_type}`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const crosSale1 = new Upsell2(loginedPage.page)
            await crosSale1.pageLoaded()
            const searchPage: SearchPage = await crosSale1.clickOnRandomCategory()
            await searchPage.isPrefillEmailFollow(prefillObj)
        })
    })

    test("Client - Cross Sale 2 @C27 @email", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext = await mailing.triggerTemplate("client-main-event-email4", ["356045"])
            const subject = `Extra Services for your ${mailContext.event_type} on ${mailContext.event_date}`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const crossSail2Email = new CrossSaleEmailPage(loginedPage.page)
            await crossSail2Email.pageLoaded()
            const servicePage: ServicePage = await crossSail2Email.openRandomLink()
            await servicePage.pageLoaded()
        })
    })

    test("Client - Shortlisted Service @C36 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext = await mailing.triggerTemplate("client-new-quote", ["3896945"])
            const subject = `Ready To Book: ${mailContext.service.name}`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const serviceShortlisted = new ServiceShortlisted(loginedPage.page)
            await serviceShortlisted.pageLoaded()
            expect(await serviceShortlisted.checkPrice(mailContext.price)).toBeTruthy()
            expect(await serviceShortlisted.checkTitle(mailContext.service.name)).toBeTruthy()
            const checkout: CheckoutPage = await serviceShortlisted.clickOnViewService()
            await checkout.pageLoaded()
            await checkout.checkQuoteId(mailContext.quote_id.toString())
            await checkout.goBack()
            await serviceShortlisted.pageLoaded()
            const eventDashboard: EventDashboard = await serviceShortlisted.clickOnGoToDashboard()
            await eventDashboard.pageLoaded()
        })
    })

    test("Client - New Message From Supplier @C37 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext = await mailing.triggerTemplate("client-thread-msg", ["3837031"])
            const subject = `New message from ${mailContext.supplier_name} About ${mailContext.service_name}`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const newMessage = new NewMessage(loginedPage.page)
            await newMessage.pageLoaded()
            const checkout: CheckoutPage = await newMessage.clickOnReadAndReplay()
            await checkout.goBack()
            await newMessage.clickOnGoToDashboard()
        })
    })

    test("Client - Payment Reminder 2 @C39 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext =
                await mailing.triggerTemplate("client-weekly-deposit-reminder2", ["69650"])
            const subject = `Deposit Is Needed To Secure ${mailContext.supplier_name} for ${mailContext.event_date}`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const paymentReminder2 = new PaymentReminder2(loginedPage.page)
            await paymentReminder2.pageLoaded()
            const checkout: CheckoutPage = await paymentReminder2.clickOnViewDetails()
            expect(await checkout.getPriceOptionValue("BASE")).toEqual(mailContext.price.replace(".00", ""))
            expect(await checkout.getServiceTitle()).toEqual(mailContext.service.name)
            await checkout.goBack()
            await paymentReminder2.pageLoaded()
            const paymentSuccess: PaymentSuccessPage = await paymentReminder2.clickOnPayDeposit()
            expect(await paymentSuccess.isSuppText(mailContext.supplier_name)).toBeTruthy()
            expect(await paymentSuccess.isClient(mailContext.client_name)).toBeTruthy()
        })
    })

    test.skip("Client - Deposit Frozen @C40 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext = await mailing.triggerTemplate("client-deposit-frozen", ["3901310"])
            const subject = `You’ve Paid Your Deposit For ${mailContext.supplier_name}, ${mailContext.event_date}`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const prefillObj: ISearchPrefill = StringHelper.queryparamsParser(mailContext.prefill_event_details)
            const depozitFrozen = new DepozitFrozen(loginedPage.page)
            await depozitFrozen.pageLoaded()
            let searchPage = await depozitFrozen.clickOnRandomCategory()
            // https://gitlab.com/poptop/poptop/-/issues/3489
            expect(await searchPage.isPrefillEmailFollow(prefillObj)).toBeTruthy()
            await searchPage.goBack()
            await depozitFrozen.pageLoaded()
            searchPage = await depozitFrozen.clickOnSearchNow()
            expect(await searchPage.isPrefillEmailFollow(prefillObj)).toBeTruthy()
        })
    })

    test.skip("Client - Booking Final Confirmation @C41 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            // https://gitlab.com/poptop/poptop/-/issues/3490
            const mailContext: EmailContext =
                await mailing.triggerTemplate("client-booking-final-confirmation", ["72241"])
            const subject = `Your Booking for ${mailContext.event_date} is finalised!`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const bookingFinal = new BookingFinalConfirm(loginedPage.page)
            await bookingFinal.pageLoaded()
            expect(await bookingFinal.isUserName(mailContext.client_name)).toBeTruthy()
            expect(
                await bookingFinal.isNoticeText(
                    mailContext.supplier_name,
                    mailContext.event_date,
                ),
            ).toBeTruthy()
            expect(await bookingFinal.isServiceFee(mailContext.client_service_fee)).toBeTruthy()
            expect(await bookingFinal.isDepositAmount(mailContext.deposit)).toBeTruthy()
            expect(await bookingFinal.isBalance(mailContext.remaining_sum)).toBeTruthy()
        })
    })

    test("Client - New Booking @C42 @email ", async () => {
        await test.step("Test steps", async() => {
            const inbuket = new InbucketController(loginedPage.page)
            const mailing = new MailingController(loginedPage.page)
            const mailContext: EmailContext =
                await mailing.triggerTemplate("client-new-booking-latest", ["3884168"])
            const subject = `Let’s Secure Your Booking For ${mailContext.event_date}`
            const message = await inbuket.getMessage(subject)
            await loginedPage.page.goto(`https://inbucket.stage.gigmngr.com/serve/mailbox/testinbo/${message.id}/html`)
            const prefillObj: ISearchPrefill = StringHelper.queryparamsParser(mailContext.prefill_event_details)
            const newBooking = new NewBooking(loginedPage.page)
            await newBooking.pageLoaded()
            await newBooking.clickOnPayDeposit()
            await newBooking.goBack()
            await newBooking.pageLoaded()
            const seachPage: SearchPage = await newBooking.clickOnRandomCategory()
            expect(seachPage.isPrefillEmailFollow(prefillObj))
        })
    })
})
