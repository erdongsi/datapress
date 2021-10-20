// 可以 和 dataserver 配合使用 创建 数据流（tcp） 长连接 服务器。

const events = require("events");

const helper = require("../utils/helper");

class datarouter extends events {
    constructor() {
        super();

        this.routers = {};

        this.on('data.server.to.router.event', (...args)=>{
            //helper.log("args[0]:", args[0]);
            //helper.log("args.slice(1):", args.slice(1).length);
            this.eventNames().forEach((v,i,a)=>{
                this.emit(v, args);
            });
//            if (this.eventIndex(args[0]) >= 0) {
//                this.emit(args[0], args.slice(1));
//            } else {
//                helper.logYellow("[datarouter:constructor] no emit:", args[0]);
//            }
        });
    }
//    eventIndex(name) {
//        let ret = -1;
//        this.eventNames().forEach((v,i,a)=>{
//            //helper.log(i, v);
//            if (v == name) {
//                ret = i;
//            }
//        });
//        //helper.log("[datarouter:eventIndex] ret:", ret);
//        return ret;
    }

}

module.exports = datarouter;