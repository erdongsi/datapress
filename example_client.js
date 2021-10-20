const fs = require("fs");

const helper = require("./utils/helper");
const cmd = require("./utils/cmd");
const comm = require("./utils/comm");

const mycmd = require("./mycmd");

cmd.start(mycmd.doCmd);

let _ip = helper.getLocalIpv4Address();
let _port = 81;

let _comm = new comm();

function connect() {
    _comm.connect(_ip, _port, (b)=>{
        helper.log("[test_data:connect] connect:", b);
    }, (recv)=>{
        helper.log("[test] recv data:", recv.length);
        helper.log("[test] recv data:", recv);

        let jso_dep = helper.depacket(recv);
        jso_dep.buf = jso_dep.buf.toString();
        helper.log("[test_data:recv]", jso_dep);
    });
}
function send(msg) {
    _comm.send(helper.enpacket(msg));
}
function close() {
    _comm.disconnect();
}

console.log("before connect()");
connect();
console.log("after connect()");

exports.connect = connect;
exports.send = send;
exports.close = close;