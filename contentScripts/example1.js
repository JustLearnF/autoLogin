let accountSelector = "#userNameInput";
let passwordSelector = "#passwordInput";
let submitSelector = "#submitButton";

let accountkey = "example1_acc";
let passwdkey = "example1_pass";

let userTypeButtonSelector = "#bySelection > div:nth-child(4) > div";

let duoFrameSelector = "iframe#duo_iframe";

function mainFunc() {
    let userTypeButton = document.querySelector(userTypeButtonSelector);
    if (userTypeButton) {
        userTypeButton.click();
        return;
    }
    let duoFrame = document.querySelector(duoFrameSelector);
    if (duoFrame) {
        injectJSToDomainFrame("injectexample1.js", "duosecurity.com");
        return;
    }
    autoLogin(accountSelector, passwordSelector, submitSelector, accountkey, passwdkey)();
}

registerOnLoad(mainFunc);