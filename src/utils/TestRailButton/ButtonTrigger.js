name: Trigger tests on CI
description: Triggers automated tests for a test run
author: Andrii Melnychenko<melnichecnko.andrey@gmail.com>
version: 4.0
includes: ^runs/view
excludes:

js:
$(document).ready(() => {
    /* Get run ids */
    const planId = uiscripts.context.plan.id;
    const runId = uiscripts.context.run.id;
    const projId = uiscripts.context.project.id;
    const environment = uiscripts.context.run.config;
    const user = uiscripts.context.user.name;
    let branch;
    const planName = uiscripts.context.plan.name;
    const source = 'TestRail';
    /* Set trigger url */
    let ciURL;
    let casesOnPage = '';
    let tr_comment;

    /* Create the button */
    const button = $(
        '<div class="toolbar content-header-toolbar" style="background-color: coral;"><a class="toolbar-button toolbar-button-last toolbar-button-first content-header-button button-start" href="javascript:void(0)">Start Playwright</a></div>',
    );

    /* Add it to the toolbar */
    $('#content-header .content-header-inner').prepend(button);

    /* Add Message Button event listener */
    $('#messageDialog').on('click', () => location.reload());

    console.log(
        JSON.stringify(
            {
                author: user,
                environment: environment,
                tags: 'not provided yet',
                source: source,
                planId: uiscripts.context.plan.id,
                runId: uiscripts.context.run.id,
                projId: uiscripts.context.project.id,
                environment: uiscripts.context.run.config,
                user: uiscripts.context.user.name,
                planName: uiscripts.context.plan.name,
                source: 'TestRail',
            },
            null,
            2,
        ),
    );

    /* SET CUSTOM IN PROGRESS STATUS */
    const addResultsForCases = async(cases, customStatus) => {
        const results = cases.map(x => ({ "case_id": x.case_id, "status_id": customStatus }));
        return fetch(`index.php?/api/v2/add_results_for_cases/${runId}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ results })
        });
    }

    /* GET CASES FROM PAGE */
    const getCasesList = async () => {
        const cases = [];
        let tests = [];
        let data = null;
        data = await (
                await fetch(`index.php?/api/v2/get_tests/${runId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                })
            ).json();
        tests = Array.prototype.concat(tests, data);
        const checkedTests = Array.from(document.querySelectorAll(".row [type='checkbox']"))
            .filter((tk) => tk.checked)
            .map((a) => a.getAttribute('value'));
        console.log('NUMBER OF FETCHED TESTS: ' + tests.length);
        tests.forEach((a) => {
            if (checkedTests.includes(a.id.toString())) {
                cases.push({ case_id: a.case_id });
            }
        });
        await addResultsForCases(cases, "6")
        casesOnPage = cases.map((x, i, ar) => (i < ar.length - 1 ? `@C${x.case_id} or` : `@C${x.case_id}`)).join(' ');
    };

    /* GET BRANCH FROM PROMPT */
    const getBranch = async () => {
        branch = window.prompt(
            'NOTE:\n\n* Are you sure you selected test cases? if yes:\n\n* Please notify AQA about issue\n',
        );
    };

    /* CHECK WE HAVE ALL NECESSARY PARAMETERS TO TRIGGER CI*/
    const isReady = () => {
        console.log(`PRINT BRANCH: ${branch}`);
        console.log(`PRINT CASES: ${JSON.stringify(casesOnPage, null, 2)}`);
        if (branch === null || branch === '' || JSON.stringify(casesOnPage) === '[]' || casesOnPage === '') {
            console.log('RUN SHOULD BE CANCELED');
            return false;
        } else {
            console.log('RUN SHOULD BE RUN');
            return true;
        }
    };

    /* TRIGGER CI WITH EXIST PARAMETERS */
    const triggerCi = async (cases) => {
        const ciRequestBody = Object.assign(
            {
                author: user,
                tags: cases,
                environment: environment,
                source: source,
            },
            { comment: tr_comment },
        );
        var formdata = new FormData();
        formdata.append("token", "4add7af0e8fc0e8e059fb59b1c7c15");
        formdata.append("ref", "main");
        formdata.append("variables[TAG]", ciRequestBody.tags);
        formdata.append("variables[TR]", "true");
        formdata.append("variables[TR_DATA]", `planId=${planId};runId=${runId};tr_domain=${document.location.hostname};tr_plan_name=${planName}`);

        var requestOptions = {
            method: 'POST',
            body: formdata,
            redirect: 'follow',
            mode: 'no-cors'
        };
        console.log('URL: ' + ciURL);
        console.log(JSON.stringify(requestOptions, null, 2));
        for (var pair of formdata.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }
        return fetch(ciURL, requestOptions);
    };

    /* Bind the click event to trigger the automated tests */
    $('a', button).click(async () => {
        try {
            /* Ask for test branch */
            ciURL = `https://gitlab.com/api/v4/projects/29126991/trigger/pipeline`
            await getCasesList();
            /*await getBranch();*/
            if (isReady()) {
                await triggerCi(casesOnPage);
                App.Dialogs.message(
                    'The tests are being processed in the background and the results are automatically posted back to TestRail.',
                    'CONFIRMATION',
                );
            } else {
                App.Dialogs.message('Looks like you forgot to provide BRANCH or TEST CASE IDs', 'CANCELED !!!');
            }
        } catch (e) {
            console.error(e);
            App.Dialogs.error('An error occurred while trying to trigger the automated tests.');
        }
    });
});
