// tslint:disable: object-literal-sort-keys
import * as creds from "../../../creds.json"
import * as DateHelper from "../../utils/dateHelper"
import * as SlackHelper from "../../utils/slackHelper"
import { TestRailController } from "./testRailController"

export class SlackMessageBuilder {
    private readonly srcBranch = process.env.SRC_BRANCH || "NO_SRC_BRANCH"
    private readonly dstBranch = process.env.DST_BRANCH || "NO_DST_BRANCH"
    private readonly mrId = process.env.MR_ID || "NO_MR_ID"
    private readonly sha = process.env.SHA || "NO_SHA"
    private readonly approver = process.env.APPROVER || "NO_APPROVER"
    private readonly buildId = process.env.BUILD_ID || "NO_BUILD_ID"
    private readonly buildUrl = process.env.BUILD_URL || "NO_BUILD_URL"
    private readonly runStart = SlackHelper
            .getMessageField("Run start", DateHelper.getDateWithFormat(new Date(), "YYYY-MM-DD HH:mm:ss"))
    private readonly runMode: string

    constructor(runMode: string) {
        this.runMode = runMode
    }

    makeMergeRequestMessage(isFailed: boolean): SlackHelper.Attachments {
        const author = SlackHelper.getMessageField("MR Author", this.approver)
        const srcBranch = SlackHelper.getMessageField("Source branch", this.srcBranch)
        const dstBranch = SlackHelper.getMessageField("Target branch", this.dstBranch)
        const sha = SlackHelper.getMessageField("COMMIT SHA", this.sha)
        const linkToMr: SlackHelper.Action = this.makeActionButton(
            "View MR",
            `https://gitlab.com/poptop/tests/-/merge_requests/${this.mrId}`)
        const linktToReport: SlackHelper.Action = this.makeActionButton(
            "View Report",
            `https://poptop.gitlab.io/-/tests/-/jobs/${this.buildId}/artifacts/html-report/index.html`)

        const attachments: SlackHelper.Attachments = {
            color: isFailed ? "danger" : "good",
            text: `Merge Request <${this.buildUrl}|Build> ${isFailed ? "FAILED" : "SUCCESS"}`,
            fields: [this.runStart, author, srcBranch, dstBranch, sha],
            actions: [linkToMr, linktToReport],
        }

        return attachments
    }

    makeMergeMessage(isFailed: boolean): SlackHelper.Attachments {
        const author = SlackHelper.getMessageField("MERGE Author", this.approver)
        const sha = SlackHelper.getMessageField("COMMIT SHA", this.sha)
        const linktToReport: SlackHelper.Action = this.makeActionButton(
            "View Report",
            `https://poptop.gitlab.io/-/tests/-/jobs/${this.buildId}/artifacts/html-report/index.html`)

        const attachments: SlackHelper.Attachments = {
            color: isFailed ? "danger" : "good",
            text: `Merge <${this.buildUrl}|Build> ${isFailed ? "FAILED" : "SUCCESS"}`,
            fields: [this.runStart, author, sha],
            actions: [linktToReport],
        }

        return attachments
    }

    makeScheduleMessage(isFailed: boolean): SlackHelper.Attachments {
        const linktToReport: SlackHelper.Action = this.makeActionButton(
            "View Report",
            `https://poptop.gitlab.io/-/tests/-/jobs/${this.buildId}/artifacts/html-report/index.html`)

        const attachments: SlackHelper.Attachments = {
            color: isFailed ? "danger" : "good",
            text: `Schedule <${this.buildUrl}|Build> ${isFailed ? "FAILED" : "SUCCESS"}`,
            fields: [this.runStart],
            actions: [linktToReport],
        }

        return attachments
    }

    makeTriggerMessage(isFailed: boolean,
        testResults: Array<{ test: string, status: string }>): SlackHelper.Attachments {
        const fields = [this.runStart]
        if (isFailed) {
            const failsedCases = testResults.filter((el) => el.status === "failed").map((el) => el.test).join(", ")
            const casesBlock = SlackHelper.getMessageField("Failed tests", failsedCases)
            fields.push(casesBlock)
        }
        const tr = new TestRailController(process.env.TR_DATA || "NO_TR_DATA")
        const linktToReport: SlackHelper.Action = this.makeActionButton(
            "View Report",
            `https://poptop.gitlab.io/-/tests/-/jobs/${this.buildId}/artifacts/html-report/index.html`)
        const trLinkReport = this.makeActionButton(
            "View TestRail",
            `${creds.TestRail.URL}/index.php?/runs/view/${tr.trObj.runId}`,
        )
        const actions: Array<SlackHelper.Action> = [linktToReport, trLinkReport]
        const attachments: SlackHelper.Attachments = {
            color: isFailed ? "danger" : "good",
            text: `TestRail run: <${this.buildUrl}|Build> ${isFailed ? "FAILED" : "SUCCESS"}`,
            fields,
            actions,
        }

        return attachments
    }

    buildAttschments(isFailed: boolean,
        testResults?: Array<{ test: string, status: string }>): SlackHelper.Attachments {
        switch (this.runMode) {
            case "merge_request_event":
                return this.makeMergeRequestMessage(isFailed)
            case "push":
                return this.makeMergeMessage(isFailed)
            case "schedule":
                return this.makeScheduleMessage(isFailed)
            case "trigger":
                return this.makeTriggerMessage(isFailed, testResults)
            default:
                throw new Error("UNEXPECTED RUN MODE")
        }

    }

    makeActionButton = (textButton: string, urlLink: string): SlackHelper.Action => {
        return SlackHelper.getActionButton(textButton, urlLink)
    }

}
