// 支持开启多个nodejs进程来 处理 client 的消息
const os = require("os");
const path = require("path");

const helper = require("./utils/helper");
const basemgr = require("./src/basemgr");

class chatmgr extends basemgr {

    static getInst(callback) {
        if (helper.isNullOrUndefined(chatmgr.inst)) {
            let cpu_num = os.cpus().length;
            //cpu_num = 1;
            chatmgr.inst = new chatmgr();
        }
        return chatmgr.inst;
    }
    constructor(js, num, domsg) {
        super(js, num, domsg);
    }
    initEvents() {
        // m = {tick, query}
        this.on('message', (m) => {
            helper.log("[chat]", process.pid, "get messsage:", m, ") >>>>>");

            console.time("chat.process.message."+m.tick);

            // 应该做一个 client 的 manager service，用来存储 从各个 client 收到的 data，当一个 client 的累积 data 可以解析成一个 完整的消息的话，再回到这个 process 来处理.
            // 这里使用以下接口代替
            // connection2ClientService
            // data2ClientService
            // end2ClientService
            // error2ClientService

            let event = m.args[0];
            switch (event) {
              case 'connection':
                    connection2ClientService(m.args[1], (e,r)=>{
                        m.reply_msg = "hi,"+r;
                        processMessage(m);
                    });
                    break;
                case "data":
                    data2ClientService(m.args[1], m.args[2], (e, r)=>{
                        m.reply_msg = "get data:"+r.toString();
                        processMessage(m);
                    });
                    break;
                case "end":
                    helper.logYellow("[chat] end at:", m.args[1]);
                    end2ClientService(m.args[1], (e,r)=>{
                        m.reply_msg = null;
                        processMessage(m);
                    });
                    break;
                case "error":
                    helper.logYellow("[chat] error at:", m.args[1]);
                    error2ClientService(m.args[1], (e,r)=>{
                        m.reply_msg = null;
                        processMessage(m);
                    });
                    break;
                default:
                    break;
            }

            helper.logYellow("["+this._name+"]", process.pid, "get messsage:", m);

            console.time(""+this._name+".process.message."+m.tick);

            let sq = JSON.stringify(m);

            m.result = 'ok';
            m.data = {};
            m.data.code = 200;
            m.data.header = {"Content-Type":"text/plain"+";charset=utf-8"};
            m.data.contents = "Helloworld! I got quest:"+sq;

            helper.log("["+this._name+"] process done:", process.pid);

            setTimeout(()=>{
                this.doMsg(m);
            },0);
        });
    }

    processMessage(m) {
        console.timeEnd("chat.process.message."+m.tick);

        helper.logYellow("[chat] m.reply_msg:", m.reply_msg);

        if (false == helper.isNullOrUndefined(m.reply_msg)) {
            //m.reply_msg = "hi,123.";
            m.reply_buf = helper.enpacket(m.reply_msg);

            process.send(m);
        }

        helper.log("[chat] process done:", process.pid);
    }
    connection2ClientService(client, callback) {
        callback(null,client);
    }
    data2ClientService(client, data, callback) {
        // async function return. use setTimeout instead.
        setTimeout(()=>{
            // 为什么要把 data 转成 Buffer，请 参考 start.js 中 worker send时的注释.
            let buf_data = Buffer.from(data);
            let dep_jso = helper.depacket(buf_data);
            let msg = dep_jso.buf;
            let len = dep_jso.len;
            helper.log("[chat] msg:", msg, "len:", len);
            callback(null, msg);
        }, 100);
    }
    end2ClientService(client, callback) {
        callback(null,client);
    }
    error2ClientService(client, callback) {
        callback(null,client);
    }

//helper.log("[chat] completed:", process.pid);
}

module.exports = chatmgr;