//C3pool telegram bot v2.5
//https://github.com/wyzda/SerachC3_bot
var token = "2035110096:AAHTWT37Ji_uReYFL2B2ECGZVgTRywHa45k"
var tghost = "https://api.telegram.org/bot" + token + "/";
var inlineKeyboard = [
  [{text: '🔄 刷新',callback_data: '/update'}]
];

function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  if(data.callback_query) {
    var s = String(data.callback_query.message.chat.id)
    var t = data.callback_query.message.reply_to_message.text
    var m = data.callback_query.message.message_id

    if(data.callback_query.data == "/update") {
      if (t == "/price" || t == "/price@SerachC3_bot") {
        pusheditMessage(getMoneroPrice(),s,m)
      } else if (t == "/info" || t == "/info@SerachC3_bot") {
        pusheditMessage(getMoneroinfo(), s,m);
      } else if (t == "/xmrblocks" || t == "/xmrblocks@SerachC3_bot") {
        pusheditMessage(getXMRBlocks(), s,m);
      } else if (t == "/placard" || t == "/placard@SerachC3_bot") {
        pusheditMessage(getPlacard(), s,m);
      } else if (getRegExAddr(t) != null) {
        pusheditMessage(SerachMain(t), s,m);
      }
    }

  } else {
    var uid = data.message.chat.id;
    var message_id = data.message.message_id;
    var message = data.message.text;
    var text = null


    if (message == "/start" || message == "/start@SerachC3_bot"){
      text = "目前功能:\n\n1.查询矿池钱包地址详情\n2.查看当前币价行情\n3.查看XMR区块网络详情\n4.查看矿池XMR出块记录\n5.查看矿池当前公告\n\n如何使用？\n请发送你要查询的XMR地址给机器人"
      pushMessageTxt(text,uid,message_id);
    } else if (message == "/price" || message == "/price@SerachC3_bot") {
      text = getMoneroPrice()
      pushMessage(text,uid,message_id);
    } else if (message == "/info" || message == "/info@SerachC3_bot") {
      text = getMoneroinfo()
      pushMessage(text,uid,message_id);
    } else if (message == "/xmrblocks" || message == "/xmrblocks@SerachC3_bot") {
      text = getXMRBlocks()
      pushMessage(text, uid,message_id);
    } else if (message == "/placard" || message == "/placard@SerachC3_bot") {
      text = getPlacard()
      pushMessage(text, uid,message_id);
    } else if (getRegExAddr(message) != null) {
      text = SerachMain(message)
      pushMessage(text, uid,message_id);
    }
  }

}
function SerachMain(address){
  var addr = "https://api.c3pool.com/miner/" + address + "/stats";
  var response = UrlFetchApp.fetch(addr); //从c3pool接口获得地址数据
  var dataAll = JSON.parse(response.getContentText()); //解析json数据

  var amtDue = String(Number(dataAll.amtDue/1000000000000)).slice(0,6); //待支付
  var amtPaid =String(Number(dataAll.amtPaid/1000000000000)).slice(0,6); //已支付
  var txnCount = dataAll.txnCount //交易计数
  var lastHash = dataAll.lastHash //最后提交时间
  var hash2 = parseInt(dataAll.hash2) //实时算力
  var hash = parseInt(dataAll.hash) //24小时平均
  var invalidShares = dataAll.invalidShares //无效股份
  var validShares = dataAll.validShares //有效股份
  var minerid = getminerint(address) //当前在线矿工数

  var addrurl = "["+address+"](https://c3pool.com/miner?address="+address+")"
  var text = "\n查询钱包地址: " + addrurl + "\n\n⛏ 当前在线矿工数: "+minerid+"\n\n实时算力: "+hash2+" H/s\n24小时平均: "+hash+" H/s\n待支付: "+ amtDue + " XMR \n已支付: " + amtPaid + " XMR" + "\n支付限额: "+getPayout(address)+" XMR\n交易计数: " + txnCount + "\n有效股份:"+validShares+"\n无效股份:"+invalidShares+"\n最后提交时间: " + timetrans(lastHash)


  return text;
}

function pusheditMessage(message,uid, mid) {
  var payload = {
    "chat_id": uid,
    "text": message,
    "parse_mode": "Markdown",
    "message_id": mid,
    reply_markup: {
      inline_keyboard: inlineKeyboard
    }
  }
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  UrlFetchApp.fetch(tghost + "editMessageText", options);
}

function pushMessage(message,uid,mid) {
  var payload = {
    "chat_id": uid,
    "text": message,
    "parse_mode": "Markdown",
    "reply_to_message_id": mid,
    reply_markup: {
      inline_keyboard: inlineKeyboard
    }
  }
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  UrlFetchApp.fetch(tghost + "sendMessage", options);
}

function pushMessageTxt(message,uid,mid) {
  var payload = {
    "chat_id": uid,
    "text": message,
    "reply_to_message_id": mid,
  }
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  UrlFetchApp.fetch(tghost + "sendMessage", options);
}

//从c3pool获取矿池公告
function getPlacard() {
  url = "https://c3pool.com/notice.json";
  var response = UrlFetchApp.fetch(url); // get feed
  var dataAll = JSON.parse(response.getContentText()); //
  var notice = dataAll.notice
  return "矿池公告\n\n" + notice + "\n\n" + getTime();
}

//从c3pool获取门罗币价格
function getMoneroPrice() {
  url = "https://api.c3pool.com/pool/stats";
  var response = UrlFetchApp.fetch(url); // get feed
  var dataAll = JSON.parse(response.getContentText()); //
  var BTC = String(dataAll.pool_statistics.price.btc).slice(0,6)
  var USD = String(dataAll.pool_statistics.price.usd).slice(0,6)
  var EUR = String(dataAll.pool_statistics.price.eur).slice(0,6)
  var CNY = String(dataAll.pool_statistics.price.cny).slice(0,6)
  var text = "当前 Monero(XMR) 币价 \n\n💰 BTC: "+BTC+ "\n💵 美元: "+USD +"\n💶 欧元: "+EUR +"\n💴 人民币: "+CNY +"\n\n"+ getTime()
  return text;
}

//获取北京时间
function getTime() {
  var time = timetrans1((new Date()).valueOf())
  return time;
}

//从minexmr获取门罗币网络详情
function getMoneroinfo() {
  url = "https://minexmr.com/api/main/pool/stats";
  var response = UrlFetchApp.fetch(url); // get feed
  var dataAll = JSON.parse(response.getContentText());
  var netHash = String(dataAll.pool.calcPPS).slice(0,4) //全网算力
  var timestamp = dataAll.network.timestamp     //时间戳
  var height = dataAll.network.height           //区块高度
  var difficulty = dataAll.network.difficulty   //网络难度
  var reward = Number(dataAll.network.reward/1000000000000) //区块奖励
  var text = "当前 Monero(XMR) 网络详情 \n\n全网算力: "+ netHash+" Gh/s\n区块高度: "+ height+ "\n网络难度: "+ difficulty +"\n区块奖励: "+String(reward).slice(0,6) +" XMR\n\n"+ getTime()
  return text;
}

//当前ETH矿池出块记录
function getETHBlocks() {
  url = "https://api.c3pool.com/pool/coin_altblocks/8545?page=0&limit=3";
  var response = UrlFetchApp.fetch(url); // get feed
  var dataAll = JSON.parse(response.getContentText()); //
  var text = ""
  for (var i in dataAll) {
    var ts = dataAll[i].ts
    var height = dataAll[i].height
    var value = String(Number(dataAll[i].value/1000000000000000000)).slice(0,3)
    var pay_value = String(Number(dataAll[i].pay_value/1000000000000)).slice(0,4)
    text = text +"区块高度:"+height +"\n区块奖励:"+value+" ETH \n支付(XMR):"+pay_value+" XMR\n"+"时间: "+timetrans1(ts)+"\n------------------------------\n"
  }

  return "当前矿池 ETH 出块记录\n\n"+text;
}

//当前XMR矿池出块记录
function getXMRBlocks() {
  url = "https://api.c3pool.com/pool/blocks?page=0&limit=4";
  var response = UrlFetchApp.fetch(url); // get feed
  var dataAll = JSON.parse(response.getContentText()); //
  var text = ""
  for (var i in dataAll) {
    var ts = dataAll[i].ts
    var height = dataAll[i].height
    var value = String(Number(dataAll[i].value/1000000000000)).slice(0,5)
    text = text +"区块高度:"+height +"\n区块奖励:"+value+" XMR\n"+"时间: "+timetrans1(ts)+"\n------------------------------\n"
  }

  return "当前矿池 XMR 出块记录\n\n"+text;
}

function timetrans(date){
    var date = new Date(date*1000);//如果date为13位不需要乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
    return Y+M+D+h+m+s;
}

function timetrans1(date){
    var date = new Date(date);//如果date为13位不需要乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y+M+D+h+m+s;
}

//从C3pool获取地址矿工数
function getminerint(address) {
  url = "https://api.c3pool.com/miner/"+address+"/identifiers";
  var response = UrlFetchApp.fetch(url); // get feed
  var dataAll = JSON.parse(response.getContentText()); //
  var jsonLength = 0;
  for (var i in dataAll) {
    jsonLength++;
  }
  return jsonLength;
}

function getRegExAddr(address) {
  var re = /^[4|8]{1}([A-Za-z0-9]{105}|[A-Za-z0-9]{94})$/;
  addres = re.exec(address);
  return addres;
}

function getPayout(address) {
  url = "https://api.c3pool.com/user/"+address;
  var response = UrlFetchApp.fetch(url); // get feed
  var dataAll = JSON.parse(response.getContentText());
  var payout_threshold = Number(dataAll.payout_threshold/1000000000000)    //时间
  return payout_threshold;
}
