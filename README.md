# Telegram C3pool 机器人

![logo](https://github.com/wyzda/SerachC3_bot/blob/main/res/c3pool_logo.png?raw=true)  

使用XMR捐助该项目: 

47Br6v6A2JzJ3TAfwj9QT2PaJ6hVkruMYFz3vUfNN5TpahFBeAuXcA1iS2KcmiFRSqKtaJBzdVFiRcxyT9EdkJ31HYzR6x3

当前功能
--------
* 1.查询矿池钱包地址详情
* 2.查看当前币价行情
* 3.查看XMR区块网络详情
* 4.查看XMR出块记录
* 5.查看矿池当前公告
### 待办事项
- [x] 查看ETH出块记录 #已完成 2021-10-4
- [x] 查看XMR出块记录 #已完成 2021-10-7
- [x] 查看矿池当前公告 #已完成 2021-10-21
- [x] 添加刷新按扭，可以刷新查询的地址等 #已完成 2021-10-9
- [ ] 添加查看C3pool的池状态，算力等 #未完成
- [ ] 查询创新区帐号详情，矿机数，算力等 #未完成
- [ ] 添加可开启矿机上线下线提醒，当矿机器上线或掉线时机器人会发送消息提示 #未完成
- [ ] 添加可开启公告提醒，当矿池有新公告时机器人发送消息提示 #未完成

### 如何部署？

使用编辑工具打开 SerachC3.gs，将第一行改成你的Telegram机器人Token，然后放Google App script里部署，之后把部署得到的url传给telegram Api的 webhook 即可

### 可以兼容其他矿池吗？

目前的机器人功能已知可以在 MoneroOcean 池上兼容运行，只需将矿池接口域名修改即可
