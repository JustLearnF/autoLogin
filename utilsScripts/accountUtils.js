function getAccountInfo(accountSelector, passwordSelector) {
    let account = document.querySelector(accountSelector);
    let passwd = document.querySelector(passwordSelector);
    return {
        account: account?.value ?? null,
        passwd: passwd?.value ?? null
    };
}

function fillAccountInfo(accountSelector, passwordSelector, accountvalue, passwdvalue) {
    let account = document.querySelector(accountSelector);
    let passwd = document.querySelector(passwordSelector);
    if (!account || !passwd) return;
    account.value = accountvalue;
    passwd.value = passwdvalue;
}

function submitAccountInfo(submitSelector) {
    let submit = document.querySelector(submitSelector);
    if (!submit) return;
    submit.click();
}

function listenSubmit(submitSelector, onListen) {
    let submit = document.querySelector(submitSelector);
    if (!submit) return;
    submit.addEventListener('click', () => {
        onListen();
    });
}

function getAccountInfoFromStorage(accountkey, passwdkey, onResponse) {
    sendPacketToService("getAccountInfo", { accountkey: accountkey, passwdkey: passwdkey }, onResponse);
}