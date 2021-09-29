//C3pool 机器人

var TelegramBotToken = "改成你的Telegram机器人Token";
var TelegramBotAPI = "https://api.telegram.org/bot" + TelegramBotToken + "/";


function doPost(e) {
  var userData = JSON.parse(e.postData.contents);
  var clientID = userData.message.chat.id;
  var message_id = userData.message.message_id;
  if (!userData.message.text) {return;}
  var searchContent = userData.message.text;
  if (searchContent == "/start" || searchContent == "/start@SerachC3_bot"){
    searchContent = "目前功能:\n\n1.查询矿池钱包地址详情\n2.查看当前币价行情\n3.查看XMR区块网络详情\n\n如何使用？\n请发送你要查询的地址给机器人"
    pushTelegramBotMessage(searchContent, clientID,message_id);
  } else if (searchContent == "/price" || searchContent == "/price@SerachC3_bot") {
    searchContent = getMoneroPrice()
    pushTelegramBotMessage(searchContent, clientID,message_id);
  } else if (searchContent == "/info" || searchContent == "/info@SerachC3_bot") {
    searchContent = getMoneroinfo()
    pushTelegramBotMessage(searchContent, clientID,message_id);
  } else if (getRegExAddr(searchContent) != null) {
    var addr = "https://api.c3pool.com/miner/" + searchContent + "/stats";
    var response = UrlFetchApp.fetch(addr); //从c3pool接口获得地址数据
    var dataAll = JSON.parse(response.getContentText()); //解析json数据
    var amtDue = Number(dataAll.amtDue/1000000000000); //待支付
    var amtPaid = Number(dataAll.amtPaid/1000000000000); //已支付
    var txnCount = dataAll.txnCount //交易计数
    var lastHash = dataAll.lastHash //最后提交时间
    var hash2 = parseInt(dataAll.hash2) //实时算力
    var hash = parseInt(dataAll.hash) //24小时平均
    var invalidShares = dataAll.invalidShares //无效股份
    var validShares = dataAll.validShares //有效股份
    var minerid = getminerint(searchContent) //当前在线矿工数
    var addrurl = "["+searchContent+"](https://c3pool.com/miner?address="+searchContent+")"

    searchContent = "\n查询钱包地址: " + addrurl + "\n\n当前在线矿工数:"+minerid+"\n\n实时算力: "+hash2+" H/s\n24小时平均: "+hash+" H/s\n待支付: "+ amtDue + " XMR \n已支付: " + amtPaid + " XMR" + "\n交易计数: " + txnCount + "\n有效股份:"+validShares+"\n无效股份:"+invalidShares+"\n最后提交时间UTC: " + new Date(Number(lastHash) * 1000).toISOString().replace('T', ' ').replace('.000Z', '')

    pushTelegramBotMessage(searchContent, clientID,message_id);
  }


  
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

//从c3pool获取门罗币价格
function getMoneroPrice() {
  url = "https://api.c3pool.com/pool/stats";
  var response = UrlFetchApp.fetch(url); // get feed
  var dataAll = JSON.parse(response.getContentText()); //
  var BTC = String(dataAll.pool_statistics.price.btc).slice(0,6)
  var USD = String(dataAll.pool_statistics.price.usd).slice(0,6)
  var EUR = String(dataAll.pool_statistics.price.eur).slice(0,6)
  var CNY = String(dataAll.pool_statistics.price.cny).slice(0,6)
  var text = "当前 Monero(XMR) 币价 \n\n人民币: "+CNY +"\nBTC: "+BTC+ "\n美元: "+USD +"\n欧元: "+EUR +"\n\n"+ getTime()
  return text;
}

//从minexmr获取门罗币网络详情
function getMoneroinfo() {
  url = "https://minexmr.com/api/main/pool/stats";
  var response = UrlFetchApp.fetch(url); // get feed
  var dataAll = JSON.parse(response.getContentText());
  var timestamp = dataAll.network.timestamp     //时间戳
  var height = dataAll.network.height           //区块高度
  var difficulty = dataAll.network.difficulty   //网络难度
  var reward = Number(dataAll.network.reward/1000000000000) //区块奖励
  var text = "当前 Monero(XMR) 网络详情 \n\n区块高度: "+ height+ "\n网络难度: "+ difficulty +"\n区块奖励: "+String(reward).slice(0,6) +" XMR"
  return text;
}

function getRegExAddr(address) {
  var re = /^[4|8]{1}([A-Za-z0-9]{105}|[A-Za-z0-9]{94})$/;
  addres = re.exec(address);
  return addres;
}

//从苏宁API获取北京时间
function getTime() {
  url = "http://quan.suning.com/getSysTime.do";
  var response = UrlFetchApp.fetch(url); // get feed
  var dataAll = JSON.parse(response.getContentText());
  var time = dataAll.sysTime2    //时间
  return time;
}

function pushTelegramBotMessage(message, clientID,mid) {
  var payload = {
    "chat_id": clientID,
    "text": message,
    "parse_mode": "Markdown",
    "reply_to_message_id": mid,
  }
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  UrlFetchApp.fetch(TelegramBotAPI + "sendMessage", options);
}
