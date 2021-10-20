
const helper = require("./utils/helper");
const cmd = require("./utils/cmd");
const logs = require("./utils/logs");

//const workmgr = require("./src/common/workmgr");

const datarouter = require("./src/datarouter");
const dataserver = require("./src/dataserver");

const mycmd = require("./mycmd");

const chatmgr = require("./chatmgr");

logs.getInst().setID("example_data_server",2);

// 0.make mycmd
cmd.start(mycmd.doCmd);

// 1.create data router.
let _data_router = new datarouter();

// n.register routers for modules.
chatmgr.getInst().registerRouter(_data_router, "chatmgr.123456");

// 2.create data server.
let _ip = helper.getLocalIpv4Address();
let _port = 81;

let _data_server = new dataserver();
_data_server.create(_ip, _port, _data_router);

helper.log("[example_data_server] running");
