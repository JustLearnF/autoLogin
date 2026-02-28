# 功能
主要是为了自动登录一些常用但是无法保持登录状态的网站，避免每次使用网站都要手动点击登录，减少重复操作。
# 使用
主要需要修改的地方有两个:  
1. `manifest.json`
2. `contentScripts/`

比如你想要自动登录网站login.example.com，你只需要在`contentScripts/`目录下添加一个文件`example.js`并通过浏览器的开发者工具抓取账号输入框和密码输入框还有登录按钮的JS Selector，然后参照以下代码进行定义:
```Javascript
let accountSelector = "#tbLoginName";
let passwordSelector = "#tbPassword";
let submitSelector = "#login > div.login-content > div > div.content-active > div.login-btn";
```
然后定义用于加密保存账号密码的key:  
```Javascript
let accountkey = "example_acc";
let passwdkey = "example_pass";
```
最后调用预定义在`utilsScripts/`中的`registerOnload`和`autoLogin`函数:  
```Javascript
registerOnLoad(autoLogin(accountSelector, passwordSelector, submitSelector, accountkey, passwdkey), passwordSelector);
```
做完这些后还需要修改`manifest.json`文件，在"host_permissions"和"content_scripts"属性中添加"login.example.com"以及与之对应的`contentScripts/`下的脚本，这样做完后，将拓展打包并加载进浏览器。当你成功登录过一次网站后，拓展就会记住你的账号密码，并在下一次自动登录。  

# 定制
遇到一些登录行为比较特殊的网站，可以参考`contentScripts/`下的example1.js来进行定制。

# 注意
当前的登录成功检测方法为检测到点击登录按钮后，当前页面的域名是否发生变化，如果发生变化才会去存储账号密码并在下次自动登录。所以如果遇到成功登录后，页面域名不发生变化的网站，需要修改登录成功检测方法。代码位于`service.js`的`actionCheckLoginState`函数中。
