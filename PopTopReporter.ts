import { Reporter } from '@playwright/test/reporter';
import fs from 'fs';
import { TestRailController } from "./src/Api/Controllers/testRailController"
import * as StringHelper from "./src/utils/stringHelper"
import * as DataHelper from "./src/utils/dataHelper"
import { SlackController } from "./src/Api/Controllers/slackController"



class PopTopReporter implements Reporter {
    private testResults: Array<{ test: string, status: string }> = []
    private slackReporter: SlackController
    private reportStatusList: Promise<any>[] = []
    private incomingTags: Array<string> = (process.env.TAG).split("|")
    private tagsRegexp = /^@(api|vrt|comp|smoke|noSafari|noMobile|email|mobile|ping|seo|prod)$/gm
    private isGlobalTag = this.tagsRegexp.test(process.env.TAG)

    constructor(){
        this.slackReporter = new SlackController(process.env.RUN_MODE || "UNEXPECTED_RUN_MODE")
    }

    onBegin(): void {
        fs.readFileSync('logo', 'utf-8')
            .split(/\r?\n/)
            .forEach(function (line: string) {
                console.log(line)
            });
    }

    onStepEnd(test, result, step): void {
    }

    onTestEnd(test, result): void {
        if (result.status === 'timedOut') { result.status = 'failed' }
        if(result.status !== 'failed' || test.results.length-1 === test.retries){
            const ids = StringHelper.getTestCaseId(test.title)
            if (process.env.TR === "true") {
                const tr = new TestRailController(process.env.TR_DATA)
                // tr.reportTestStatus(ids, result.status)
                const incomingIds = this.incomingTags.map((el) => el.replace("@C", ""))
                const cases: Array<string> = ids.map((el) => el.replace("@C", "")).filter((el) => { return incomingIds.includes(el)})
                let trStatusId = 7
                if (result.status === "passed") trStatusId = 8
                if (result.status === "skipped") trStatusId = 9
                const body = {
                    comment: `${result.status}`,
                    status_id: `${trStatusId}`,
                }
                if (cases.length > 0) {
                    for (const caseId of cases) {
                        console.log(`REPORT TO TR: @C${caseId} ` + JSON.stringify(body))
                        this.reportStatusList.push(tr.sendTestStatus(caseId, JSON.stringify(body)))
                    }
                }

            }

            ids.filter((el) => {
                if(this.isGlobalTag) return true
                return this.incomingTags.includes(el)
            }).forEach((id) => {
                this.testResults.push({ test: id, status: result.status })
            })
            console.log(`${test.title} => ${result.status}`)
        }
    }

    async onEnd(result): Promise<void> {
        console.log(this.testResults);
        const failedTestRow = this.testResults.filter(el => el.status==='failed').map(el => el.test)
        const uniqueFailedTest = Array.from(new Set(failedTestRow)).join(" or ")
        console.log(`Failed test: '${uniqueFailedTest}'`)
        if (process.env.TR === "true") {
            await Promise.all(this.reportStatusList)
        }
        if(process.env.CI === "true" && process.env.BUILD_ID){
            const reporter = await this.slackReporter.initConnection(DataHelper.getTestScopeRun(process.env.TAG))
            await reporter.postMessageToSlack(this.testResults)
        }

    }

    onStdErr(chunk, test, result): void {
    }
}
export default PopTopReporter;
