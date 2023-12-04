# PopTop Automation Test Framework

## Features of **PopTop** Playwright automation project:

-   [x] Typescript
-   [x] TSlint
-   [x] Playwright-test runner
-   [x] Playwright expect assertion library
-   [x] Custom shell runner `run.sh`
-   [x] Docker support
-   [x] Entrypoint for local or docker run
-   [x] Page objects
-   [x] Api controller based on [`GOT`/`native request client`]
-   [x] Natieve test reporter with logs and screenshots
-   [x] Cookie login
-   [x] Visual testing via [VRT](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker#-visual-regression-tracker-)
-   [x] PW fixtures
-   [x] Slack Notification
-   [x] Gitlab CI integration
-   [x] MOON Kubernaties cluster integration
-   [x] Private data hide by GPG engine
-   [x] Abstraction layer by UI Elemnts
-   [x] Test Rail integrations
-   [x] Run with Global or Custom project configs
-   [x] Test Rail reporter
-   [x] Slack generic reporter
-   [x] Flexible test scope orkestration
-   [x] SEO test into `./test/seo`

### Before start check all requirements on your envirinment:

1. `NVM`
2. `NodeJS 16.13.1` or higer LTS version
4. `GPG`
5. `Minikube` and `kubectl`
6. `Docker engine`
7. `VSCode` with main plugins

### Supported CLI parameters:

1. `help` - [-h|--help] options to ream shorm man for `run.sh`;
1. `headless` - [boolean] switch headless mode for the browser; (default `true`)
1. `browser` - [chromium/firefox/webkit], browser for the test run; (default `chromium`)
1. `moon` - [boolean] switch moon mode for the test; (default `false`)
1. `tag` - [string] caseId or caseIds suite or one of defined test scopes, see examples `./run,sh -h` (default `@smoke`)
1. `ci` - [boolean] is CI run mode (default `true`)
1. `workers` - [number] number of workers (default `4`)
1. `retry` - [number] number of retrys after test failed (default `2`)
1. `SRC_BRANCH` - [string] branch to be merged
1. `DST_BRANCH` - [strung] destanation branch for merge
1. `MR_ID` - [number] merge request id
1. `SHA` - [string] commit sha
1. `APPROVER` - [string] commit author
1. `BUILD_ID` - [number] CI build Id
1. `BUILD_URL` - [string] CI url to build result log
1. `RUN_MODE` - [push|merge_request_event|schedule|trigger] run mode
1. `TR` - [boolean] is run triggered from TestRail
1. `TR_DATA` - [string] data or TestRail run
1. `BASE_URL` [string] Base URL for tests

### How to project setup

1. Clone code from REPO;
1. Run `git submodule update --init`
1. Run `npm run decrypt-creds`
1. Install Playwright - `npx playwright install`;
1. Install browsers - `npx playwright install chrome && npx playwright install webkit`;
1. Install other dependencies - `npx playwright install-deps`;
1. Install project dependencies - `npm ci`;

### Run mode

1. Run test local - `tag=@C21 ./run.sh`, if you need run some specific test just replace `@C21` with your tag
1. Run few tests local - `tag='@C21 or @C22' ./run.sh` if you need run some specific test just replace `@C21` and `@C22` with your tags
1. Run test on local Moon service - `moon=true tag=@C21 ./run.sh`
1. Any info about others features you can view by `./run.sh -h`

### Info commands

1. Show All test - `npm run test:list`
1. Show all test CLI commands - `npm run commands`

### Show report

1. After test run all test results stored into `./html-results` folder
1. To open Web report on local pc you need run `npx playwright show-report`
2. HTML report located at `./html-report/index.html`

### Slack report mode

Slack report message depends from `CI_PIPELINE_SOURCE`

1. `push` => BRANCH MERGED
1. `schedule` => SCHEDULED RUN
1. `merge_request_event` => MERGE REQUEST CREATED
1. `trigger` => TestRail run or triggered by API

### Docker

To use docker you need pull exists image from private Docker registry or build it by youeself using `npm npm run docker:build`

### GPG
1. Get `SECRET_PASSWORD` variable from AQA Team
2. Set one as local variable into your CLI shell interpritator
3. To crypt use - `echo "${SECRET_PASSWORD}"| gpg --batch --passphrase-fd 0 --yes -c yourFileName`
4. To decrypt use - `echo "${SECRET_PASSWORD}"| gpg --batch --passphrase-fd 0 --yes -d yourFileName`

### VRT
1. All specs with visual test located `./test/vrt`
1. Strongly recomend to run them by docker to repeat CI logic
1. To run them you need:
    1. `npm run docker:build`
    1. `npm run docker:run`
    1. `npm run docker:test` - to change run scope you need correct `package.json` script
    1. `npm run docker:stop`
    1. All results [here](https://vrt.com/projects), login/password in creds.json
