#!/bin/bash

# Define default parameters
version="0.0.3"
tagPatternValidation='^@(api|dev|vrt|comp|smoke|email|mobile|seo|ping|prod|[C,c][0-9]+.*)$'
urlPatternValidation='^(https?|ftp|file)://[-A-Za-z0-9\+&@#/%?=~_|!:,.;]*[-A-Za-z0-9\+&@#/%=~_|]$'
browserPatternValidation='^(chrome|firefox|safari|iphone|android)$'
numberPattern='^([0-9]+)$'
boolPattern='^(true|false)$'
isMoon="false"
baseUrl="https://www.stage.gigmngr.com"
isCi="true"
workerAmountDefault=4

function getProjectName() {
    case $browser in
        "chrome")
            echo "--project='Desktop Chrome'"
            ;;
        "firefox")
            echo "--project='Desktop Firefox'"
            ;;
        "safari")
            echo "--project='Desktop Safari'"
            ;;
        "iphone")
            echo "--project='Mobile Safari'"
            ;;
        "android")
            echo "--project='Mobile Chrome'"
            ;;
    esac
}

#Check TestRail mode
if ! [ "$tr" == "" ]; then
    if ! [[ "$tr" =~ $boolPattern ]]; then
        echo "Wrong TestRail state.
        Use: ./run.sh -h"
        exit 1
    elif ! [ "$tr" == "true" ]; then
        tr="false"
    else
        tr="true"
    fi
else
    tr="false"
fi

#PASS TestRail DATA
if [ "$tr_data" == "" ]; then
    tr_data="NO_TR_DATA"
fi

#PASS SRC BRANCH
if [ "$srcBranch" == "" ]; then
    srcBranch="NO_SRC_BRANCH"
fi

#PASS DST BRANCH
if [ "$dstBranch" == "" ]; then
    dstBranch="NO_DST_BRANCH"
fi

#PASS MR ID
if [ "$mrId" == "" ]; then
    mrId="NO_MR_ID"
fi

#PASS SHA
if [ "$sha" == "" ]; then
    sha="NO_SHA"
fi

#PASS APPROVER
if [ "$approver" == "" ]; then
    approver="NO_APPROVER"
fi

#PASS BUILD_URL
if [ "$buildUrl" == "" ]; then
    buildUrl="NO_BUILD_URL"
fi

#Check retry parameter
if ! [ "$retry" == "" ]; then
    if ! [[ "$retry" =~ $numberPattern ]]; then
        echo "Wrong Retry parameter.
        Use: ./run.sh -h"
        exit 1
    fi
else
    retry=2
fi

#Check workers parameter
if ! [ "$workers" == "" ]; then
    if ! [[ "$workers" =~ $numberPattern ]]; then
        echo "Wrong Worker parameter.
        Use: ./run.sh -h"
        exit 1
    elif ! [ "$workers" == "$workerAmountDefault" ]; then
        workerAmount=$workers
    else
        workerAmount=$workerAmountDefault
    fi
else
    workerAmount=$workerAmountDefault
fi

#Check moon parameter
if ! [ "$moon" == "" ]; then
    if ! [[ "$moon" =~ $boolPattern ]]; then
        echo "Wrong Moon state.
        Use: ./run.sh -h"
        exit 1
    elif ! [ "$moon" == "$isMoon" ]; then
        isMoon=$moon
    fi
fi

#Check headless parameter
if ! [ "$headless" == "" ]; then
    if ! [[ "$headless" =~ $boolPattern ]]; then
        echo "Wrong headless state.
        Use: ./run.sh -h"
        exit 1
    elif ! [ "$headless" == "true" ]; then
        isHeadless="--headed"
    fi
fi

#Check CI parameter
if ! [ "$ci" == "" ]; then
    if ! [[ "$ci" =~ $boolPattern ]]; then
        echo "Wrong CI state.
        Use: ./run.sh -h"
        exit 1
    elif ! [ "$ci" == "$isCi" ]; then
        isCi=$ci
    fi
fi

#Check URL
if ! [ "$url" == "" ]; then
    if ! [[ "$url" =~ $urlPatternValidation ]]; then
        echo "Wrong incomming URL string.
        Use: ./run.sh -h"
        exit 1
    elif ! [ "$url" == "$baseUrl" ]; then
        baseUrl="$url"
    fi
fi

#Check browser parameters
if ! [ "$browser" == "" ]; then
    browserStr=""
    echo "Parse browser parameters"
    if ! [[ "$browser" == *"+"* ]]; then
        if ! [[ "$browser" =~ $browserPatternValidation ]]; then
            echo "Wrong incomming BROWSER type [$element]
            Use: ./run.sh -h"
            exit 1
        else
            browserStr="$browserStr $(getProjectName $browser)"
        fi
    else
        IFS='+' read -r -a array <<< "$browser"
        browserArrLenght=${#array[@]}
        for element in "${array[@]}"
        do
            if ! [[ "$element" =~ $browserPatternValidation ]]; then
                echo "Wrong incomming BROWSER type [$element]
                Use: ./run.sh -h"
                exit 1
            else
                browser=$element
                browserStr="$browserStr $(getProjectName $browser)"
            fi
        done
    fi
    browserStr="${browserStr:1}"
else
    browserStr="--project='Desktop Chrome'"
fi

#Check tags parameters
if ! [ "$tag" == "" ]; then
    if ! [[ "$tag" =~ $tagPatternValidation ]]; then
        echo "Wrong incomming tags.
        Use: ./run.sh -h"
        exit 1
    elif [[ "$tag" == "@email" ]]; then
        retry="1"
        workerAmount="1"
        tags="@email"
    elif [[ "$tag" == "@vrt" ]]; then
        retry="0"
        workerAmount="4"
        tags="@vrt"
        browserStr="--project='Desktop Chrome'"
    else
        tags="'${tag//[[:space:]]or[[:space:]]/|}'"
    fi
else
    tags="@smoke"
fi

#Check INFO parameters
if ! [[ "$1" == "" ]]; then
    if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
        echo "
        ======================================================================
        Options:

        -h, --help                   Something something something help
        -v, --version                Something something something version
        ======================================================================
        Parameters:

        tag = @api | @dev | @vrt | @comp | @smoke | @email | @mobile | @C[0-9] | @C[0-9] or @C[0-9]... (default @smoke)
        url = [string] (default value 'https://www.stage.gigmngr.com')
        ci = true/false (default false)
        moon = true/false (default false)
        browser = chrome|safari|iphone|android
        headless = true/false (default true)
        workers = [1-10] (default 4)
        retry = 0,1,2 (default 2)
        ======================================================================
        Examples:

        ci=false moon=false tag='@C21 or @C22' url=https://www.stage.qa.com ./run.sh
        ci=true moon=true tag=@C21 url=https://www.prod.qa.com ./run.sh
        tag=@email browser=chrome ./run.sh
        ci=true moon=true tag=@C21 url=https://www.prod.qa.com headless=false ./run.sh
        tag=@C27 headless=false workers=1 retry=0 ./run.sh
        browser=chrome+android tag=@mobile ./run.sh
        ======================================================================
        "
        exit 1
    elif [ "$1" == "-v" ] || [ "$1" == "--version" ]; then
        echo "Playwright console runner! Verson ${version}"
        exit 1
    else
        echo "Wrong run parameters, left only run [parameters] or info [options].
        Use: ./run.sh -h"
        exit 1
    fi
fi

run_command="\
SRC_BRANCH=$srcBranch \
DST_BRANCH=$dstBranch \
MR_ID=$mrId \
SHA=$sha \
APPROVER=$approver \
BUILD_ID=$buildId \
BUILD_URL=$buildUrl \
RUN_MODE=$run \
TAG=$tags \
CI=$isCi \
TR=$tr \
MOON=$isMoon \
TR_DATA='$tr_data' \
BASE_URL=$baseUrl \
./node_modules/.bin/playwright test --config=playwright.config.ts $browserStr --workers $workerAmount --retries=$retry $isHeadless --grep-invert @noMobile --grep-invert @noSafari"
echo "

===$(date +%F_%H-%M-%S)===

"
echo " Command run: [$run_command]"
eval $run_command
