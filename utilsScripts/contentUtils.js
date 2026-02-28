function waitForLoaded(itemSelector, funcCallback) {
    let intervalId = 0;
    intervalId = setInterval(() => {
        let item = document.querySelector(itemSelector);
        if (item) {
            clearInterval(intervalId);
            funcCallback();
        }
    }, 500);
}

function registerOnLoad(voidFunction, itemSelector = null) {
    if (itemSelector) {
        window.onload = waitForLoaded(itemSelector, voidFunction);
        return;
    }
    window.onload = voidFunction;
}

function autoLogin(accountSelector, passwordSelector, submitSelector, accountkey, passwdkey) {
    return function () {
        let actionFlag = true;
        listenSubmit(submitSelector, async () => {
            let accountinfo = getAccountInfo(accountSelector, passwordSelector);
            sendPacketToService("checkLoginState", { actionflag: actionFlag, accountkey: accountkey, passwdkey: passwdkey, account: accountinfo.account, passwd: accountinfo.passwd });
        });
        sendPacketToService("ping", null, (response) => {
            console.log(response);
        });
        getAccountInfoFromStorage(accountkey, passwdkey, (response) => {
            let accountInfo = response.accountinfo;
            if (accountInfo.account && accountInfo.password) {
                actionFlag = false;
                fillAccountInfo(accountSelector, passwordSelector, accountInfo.account, accountInfo.password);
                submitAccountInfo(submitSelector);
            }
        });
    };
}

function injectJSToDomainFrame(jsName, domainUrl) {
    sendPacketToService("injectJsToDomainFrame", { js: jsName, domain: domainUrl });
}