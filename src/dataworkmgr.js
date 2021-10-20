const os = require("os");
const url = require("url");
const zlib = require("zlib");

const helper = require("./helper");
const workmgr = require("./workmgr");

class dataworkmgr extends workmgr {

    constructor(js, num, domsg) {
        super(js, num, domsg);
    }
    static doMsg (w, m) {
        let tick = m.tick;
        let reply_msg = m.reply_msg;
        let reply_buf = m.reply_buf;

        if (false == helper.isNullOrUndefined(w.jobs[tick])) {
            let client = w.jobs[tick].args[1];
            //helper.log("[dataworkmgr:doMsg] client:", client);
            let buf_data = Buffer.from(reply_buf);
            helper.log("buf_data:", buf_data);
            client.write(buf_data);
        } else {
            helper.logRed("[dataworkmgr:doMsg] worker.jobs["+tick+"] not exists.");
        }
    }
    handle(args) {
        this.getFreeWorker(delay_ms_if_new_worker, (worker)=>{
            // make a unique tick for jobs.
            let tick = (new Date()).getTime() + "." + helper.randomNum(0,100);
            if (helper.isNullOrUndefined(worker.jobs)) {
                worker.jobs = {};
            }
            worker.jobs[tick] = {args};
            
            // send msg to worker.
            args = Array.from(args);
            args[1] = args[1].name; // fix: TypeError: Converting circular structure to Json.
            let _msg = {tick, args};
            //helper.log("_msg:", _msg);
            setTimeout(()=>{ worker.send(_msg); }, 0);
        });
    }
}

module.exports = dataworkmgr;