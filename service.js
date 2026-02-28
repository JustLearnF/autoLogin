import * as localSecureStorage from './serviceUtilsScripts/localSecureStorage.js';

let encryptpass;

function actionGetAccountInfo(data, sender, sendResponse) {
    localSecureStorage.getAccountInfoFromStorage(data.accountkey, data.passwdkey, encryptpass).then((result) => {
        sendResponse({ accountinfo: result });
    });
}

let wrongAccountFlag = false;
function actionCheckLoginState(data, sender, sendResponse) {
    if (wrongAccountFlag) {
        localSecureStorage.deleteAccountInfoFromStorage(data.accountkey, data.passwdkey).then(() => {
            wrongAccountFlag = false;
        });
    }
    wrongAccountFlag = true;
    let targetTabID = sender.tab.id;
    let previousUrl = sender.tab.url;
    let contextData = data;
    updateCallback = async (tabID, tab) => {
        if (tabID != targetTabID) return;
        if (tab.url != previousUrl) {
            wrongAccountFlag = false;
            if (contextData.actionflag) {
                await localSecureStorage.setAccountInfoToStorage(contextData.accountkey, contextData.passwdkey, contextData.account, contextData.passwd, encryptpass);
            }
        }
        updateCallback = voidUpdateCallback;
    }
    sendResponse("Checking");
}

function actionInjectJsToDomainFrame(data, sender, sendResponse) {
    let jsName = data.js;
    let domainUrl = data.domain;
    completedCallback = async (details) => {
        if (details.url.includes(domainUrl)) {
            await chrome.scripting.executeScript({
                target: { tabId: details.tabId, frameIds: [details.frameId] },
                files: [`injectJsScripts/${jsName}`]
            });
            completedCallback = voidCompletedCallback;
        }
    }
    sendResponse("Injectting");
}

function onReceive(request, sender, sendResponse) {
    switch (request.action) {
        case "ping":
            sendResponse("ping success");
            break;
        case "getAccountInfo":
            actionGetAccountInfo(request.data, sender, sendResponse);
            return true;
            break;
        case "checkLoginState":
            actionCheckLoginState(request.data, sender, sendResponse);
            break;
        case "injectJsToDomainFrame":
            actionInjectJsToDomainFrame(request.data, sender, sendResponse);
            break;
        default:
            sendResponse("unsupported action");
    }
}

function serviceRegisterMessageDealer(onReceive) {
    chrome.runtime.onMessage.addListener(onReceive);
}

function serviceRegisterTabUpdateDealer(onUpdate) {
    chrome.tabs.onUpdated.addListener(onUpdate);
}

function serviceRegisterWebNavigationDealer(onCompleted) {
    chrome.webNavigation.onCompleted.addListener(onCompleted);
}

function voidUpdateCallback(tabID, tab) {
    return;
}
let updateCallback = voidUpdateCallback;

function onUpdate(tabID, changeInfo, tab) {
    if (changeInfo.status !== 'complete') return;
    updateCallback(tabID, tab);
}

function voidCompletedCallback(details) {
    return;
}
let completedCallback = voidCompletedCallback;

function onCompleted(details) {
    if (details.frameId == 0) return;
    completedCallback(details);
}

async function mainFunc() {
    encryptpass = await localSecureStorage.getEncryptPassword();
    serviceRegisterMessageDealer(onReceive);
    serviceRegisterTabUpdateDealer(onUpdate);
    serviceRegisterWebNavigationDealer(onCompleted);
}

mainFunc();