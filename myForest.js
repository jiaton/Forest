"auto";
var width = device.width;
var height = device.height;
if(!device.isScreenOn()){
    device.wakeUpIfNeeded()
    device.keepScreenOn(60*3600)
    sleep(1000)
    gesture(200,[600,1640],[600,1000])
    sleep(500)
    gesture( 500, [750, 1390], [560,1632],[320,1656], [530,1437]);
}

// 请求截图权限
if (!requestScreenCapture()) {
    toast("请求截图失败");
}
//打开支付宝App
launch("com.eg.android.AlipayGphone");
waitForPackage("com.eg.android.AlipayGphone", 200);

while (!className("android.widget.TextView").text("蚂蚁森林").exists()) {
    sleep(1000);
}
toast("进入蚂蚁森林");
click("蚂蚁森林");
while (!text("种树").findOnce()) {
    sleep(500);
}
//获取当前能量 新版本没有ID故不可用
// var amountOfE1 = idContains("tree_energy").findOne().text();

// 收集自己能量
log("收集自己能量")
sleep(1000) //能量球生成需要一秒钟时间
while (textStartsWith("收集能量").exists()) {
    var p = textStartsWith("收集能量").findOne().bounds();
    click(p.centerX(), p.centerY());
    sleep(1000);
    click(p.centerX(), p.centerY());
};
// 下滑打开好友列表
while (!text("查看更多好友").exists()) {
    scrollDown();
    sleep(500);
}

while (!text("查看更多好友").findOne().click());
// 等待直到加载完毕再进行下面的操作，不然会出现截图截错的问题
while (textContains("个环保证书").exists());
sleep(1500);
collectInRanklistNew();

//判断时间
if (time()) {
    while(time()){
        log("时间判断符合");
        //先返回再重新进入
        back();
        while (!text("查看更多好友").findOne().click());
        collectInRanklistNew();
    }   
}else{
    log("时间不符合")
}

// 收取完成,回到主界面
toast("收取完成");
back(); //先返回到个人界面获取能量数目
//获取当前能量 新版本没有ID 故不可用
// var amountOfE2 = idContains("tree_energy").findOne().text();
// var amountReg = /.*(?=g)/;
// amountOfE1 = amountOfE1.match(amountReg);
// amountOfE2 = amountOfE2.match(amountReg);
// amountOfE1 = parseInt(amountOfE1);
// amountOfE2 = parseInt(amountOfE2);
// var extra = amountOfE2 - amountOfE1;
// toast("收取了 " + extra + " g能量");
// log("收取了 " + extra + " g能量")
while (!className("android.widget.TextView").text("首页").exists()) {
    back();
    sleep(1000);
};
if (!className("android.widget.TextView").text("蚂蚁森林").exists()) {
    var fresh = className("android.widget.TextView").text("首页").findOne().bounds()
    click(fresh.centerX(), fresh.centerY());
    click(fresh.centerX(), fresh.centerY());
}
device.cancelKeepingAwake()


// 进入并收取
function EnterAndCollect(x, y) {
    log("进入收取！" + x + "," + y);
    sleep(100);
    click(x, y);
    sleep(300)
    textContains("大树养成").findOne(3000);
    if (!text("大树养成").exists()) {
        sleep(1000);
        click(x, y); //再次点击
    }
    textContains("大树养成记录").findOne();
    log("成功打开收取页面");
    sleep(1000); //等待能量球加载
    {
        let i=0;
        while (textStartsWith("收集能量").exists()) {
            log("点击能量球")
            sleep(200);
            var barr = new Array();
            var bs = textStartsWith("收集能量").find().forEach(function(b) {
                barr.push(b.bounds());
            })
            for (let i = 0; i < barr.length; i++) {
                click(barr[i].centerX(), barr[i].centerY() );
            }
            i++;
            if(i>2) break;//防止无限点击能量罩
        };
    }
    log("收取完成，返回");
    idContains("h5_tv_nav_back").findOne().click();
}

// 时间判断
function time() {
    var now = new Date();
    var minutes = now.getMinutes();
    var hours = now.getHours();
    var time = hours * 60 + minutes - 400; //6点50
    if (time >= 0 && time <= 60) { //6点50到7点50
        log('时间符合，再次收取');
        return true
    } else {
        return false
    }
}


//改进方法
function collectInRanklistNew() {
    while (!textContains("没有更多了").exists()) {
        sleep(200); //延时以防止截图错误
        var img = captureScreen();
        var x = width - 5;
        var y = 0;
        var str = ''; //记录颜色判断结果
        while (y < height) {
            if (images.detectsColor(img, "#1DA06D", x, y, 8)) //海洋绿
                str += '1';
            else
                str += '0';
            y++;
        }
        
        // log(str);
        var reg = /1{30,}0{1,13}1/g; //寻找可收取的特征
        var coordinate = new Array(); //记录非绿色区间

        while (true) {
            var arr = reg.exec(str);
            if (arr)
                coordinate.push(arr.index);
            else break;
        }

        log(coordinate);


        for (var i = 0; i < coordinate.length; i++) {
            EnterAndCollect(width / 2, coordinate[i] + 10);
        }


        while (!textContains("kg").exists()) {
            sleep(100);
        }
        scrollDown();
    }
}

//在排行榜中收取方法(旧)
function collectInRanklist() {
    while (!textContains("没有更多了").exists()) {
        sleep(200); //延时以防止截图错误
        var img = captureScreen();
        var x = width - 5;
        var y = 0;
        var str = ''; //记录颜色判断结果
        while (y < height - 100) {
            if (images.detectsColor(img, "#30BF6C", x, y, 8))
                str += '1';
            else
                str += '0';
            y++;
        }


        var reg = /1?0{50,}(?=1)/g;
        var coordinate = new Array(); //记录非绿色区间

        while (true) {
            var arr = reg.exec(str);
            if (arr)
                coordinate.push(arr.index, arr.index + arr[0].length);
            else break;
        }

        log(coordinate);


        var i = 1;
        var selectedArr = new Array(); //记录最后判断成功的纵坐标
        while (i < coordinate.length - 1) {
            // 对i到i+1内进行判断
            var whiteReg = /1{30,}0{1,5}1*/;
            var testResult = whiteReg.test(str.substring(coordinate[i], coordinate[i + 1]));
            if (testResult == true) selectedArr.push(coordinate[i]);
            i += 2;
        }
        // 判断结束，开始依据selectedArr点击收取
        //length先提取，避免因判错造成死循环
        var tmp_length = selectedArr.length;
        for (var j = 0; j < selectedArr.length; j++) {
            EnterAndCollect(width / 2, selectedArr[j] + 10)
        }

        while (!textContains("kg").exists()) {
            sleep(100);
        }
        scrollDown();
    }
}