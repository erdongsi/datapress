// 可以 和 datarouter 配合使用 创建 数据流（tcp） 长连接 服务器。

const net = require("net");

const helper = require("../utils/helper");


class dataserver {
    constructor() {
        this.router = null;
        this.lst_clients = [];
        this.hb_timeout = 10000;
    }

    create(ip, port, router) {
        helper.log("[dataserver:create] (", ip+",", port+",", "router) >>>>>");

        this.router = router;

        let _server = net.createServer();

        _server.on("connection", (c)=>{
            c.name = c.remoteAddress + ":" + c.remotePort;
            helper.log("[dataserver:create] new client:", c.name);
            //c.write("hello, client:"+c.name);

            router.emit('data.server.to.router.event', 'connection', c);
            helper.log("[dataserver:create] after emit connection");

            this.lst_clients.push(c);

            c.on("data", (dat)=>{
                helper.log("[dataserver:create] client.event(data) len=", dat.length);
                //helper.log("[dataserver:create] dataCallback:",dataCallback);
                router.emit('data.server.to.router.event','data', c, dat);
            });

            c.on("end", ()=>{
                helper.log("[dataserver:create] client.event(end):", c.name);
                let i = this.lst_clients.indexOf(c);
                if (i >= 0) {
                    this.lst_clients.splice(this.lst_clients.indexOf(c), 1);
                }
                router.emit('data.server.to.router.event','end', c);
            });

            c.on("error", (e)=>{
                helper.log("[dataserver:create] client.event(error):", e.message);
                let i = this.lst_clients.indexOf(c);
                if (i >= 0) {
                    this.lst_clients.splice(this.lst_clients.indexOf(c), 1);
                }
                router.emit('data.server.to.router.event','error', c, e);
            });
        });

        _server.listen(port);

        _server.on("error", (e)=>{
            helper.logRed("[dataserver:create] error:",e.message);
            this.router.emit('data.server.to.router.event','error', null, e);
        });

        setTimeout(()=>{ this.heartbeatClients(); }, this.hb_timeout);
    }

    heartbeatClients() {
        //helper.log("[dataserver:heartbeatClients] () >>>>>");
        let ary_deads = [];
        //helper.log(this.lst_clients);
        for (let i = this.lst_clients.length-1; i >= 0; i--) {
            let one = this.lst_clients[i];
            if (one.writable) {
                one.write("");    // hearbeat
            } else {
                ary_deads.push(one);
                one.destroy();
            }
        }

        ary_deads.forEach((dead)=>{
            this.lst_clients.splice(this.lst_clients.indexOf(dead), 1);
        });

        setTimeout(()=>{ this.heartbeatClients(); }, this.hb_timeout);
    }
}

module.exports = dataserver;

