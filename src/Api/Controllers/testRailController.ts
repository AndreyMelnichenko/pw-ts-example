// tslint:disable: no-console
// tslint:disable: no-any
import child_process from "child_process"
import * as creds from "../../../creds.json"
import { GotRequestClient } from "../apiClient/gotClient"

export class TestRailController {
    headers = {
        "Authorization": `Basic ${Buffer.from(`${creds.TestRail["TR-USER"]}:${creds.TestRail["TR-PASSWORD"]}`).toString("base64")}`,
        "Content-Type": "application/json",
    }
    trObj = {
                planId: "no id",
                runId: "no id",
                tr_domain: "no domain",
                tr_plan_name: "no plan name",
            }

    constructor(testRailData: string) {
        this.parseTrDateString(testRailData)
    }

    parseTrDateString = (trDataStr: string) => {
        const parameterArray: Array<string> = trDataStr.split(";")
        let keyValPair: Array<string> = []
        parameterArray.forEach((parameter) => {
            keyValPair = parameter.split("=")
            this.trObj[keyValPair[0]] = keyValPair[1]
        })
    }

    // reportTestStatus(testIds: Array<string>, status: string): void {
    //     const cases: Array<string> = testIds.map((el) => el.replace("@C", ""))
    //     const body = {
    //         comment: `${status}`,
    //         status_id: `${status === "passed" ? "1" : "7"}`,
    //     }
    //     if (cases.length > 0) {
    //         for (const caseId of cases) {
    //             child_process.execSync(`curl --location --request
    // pOST 'https://${this.trObj.tr_domain}/index.php?/api/v2/add_result_for_case/${this.trObj.runId}/${caseId}' \
    //                 --header 'Content-Type: application/json' \
    //                 --header 'Authorization: Basic ${Buffer.from(
        // `${creds.TestRail["TR-USER"]}:${creds.TestRail["TR-PASSWORD"]}`).toString("base64")}' \
    //                 --data-raw '${JSON.stringify(body)}'`, {stdio: "inherit"})
    //             console.log(`\nREPORT CASE: [C${caseId}] STATUS: [${status}]`)
    //         }
    //     }
    // }

    async sendTestStatus(id: string, body: string): Promise<any> {
        const apiClient = new GotRequestClient()

        return apiClient
            .method("POST")
            .url(`https://${this.trObj.tr_domain}/index.php?/api/v2/add_result_for_case/${this.trObj.runId}/${id}`)
            .headers(this.headers)
            .body(body)
            .send()
    }
}
