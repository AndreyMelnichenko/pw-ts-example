import { BillingPage } from "../pages/billingPage"
import { EventListPage } from "../pages/eventListPage"
import { HealthAndSafetyPage } from "../pages/healthAndSafetyPage"
import { MembershipPage } from "../pages/membershipPage"
import { PackageListPage } from "../pages/packageListPage"
import { SuppCalendarPage } from "../pages/suppCalendarPage"
import { SuppDashboardPage } from "../pages/suppDashboardPage"
import { SuppProfilePage } from "../pages/suppProfilePage"

export type LeftSideBarMenuPage = SuppDashboardPage |
        SuppProfilePage |
        EventListPage |
        SuppCalendarPage |
        MembershipPage |
        HealthAndSafetyPage |
        PackageListPage |
        BillingPage

export type LeftSideBarMenu = {
    openSideBarMenu(itemName: string): Promise<LeftSideBarMenuPage>
}
