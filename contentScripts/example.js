let accountSelector = "#tbLoginName";
let passwordSelector = "#tbPassword";
let submitSelector = "#login > div.login-content > div > div.content-active > div.login-btn";

let accountkey = "example_acc";
let passwdkey = "example_pass";

registerOnLoad(autoLogin(accountSelector, passwordSelector, submitSelector, accountkey, passwdkey), passwordSelector);