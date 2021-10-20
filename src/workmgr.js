// 创建 多子进程 的管理模块。 例如 可以利用 cpu num 来创建 多个子进程。

const child_process = require("child_process");
//const url = require("url");

const helper = require("./helper");

class workmgr {
    constructor(js, num, domsg) {
        this._workers = [];     // 线程 worker 列表
        //this._cur_worker = 0;   // 可以使用哪个 worker index
        this._js = js;          // the js file
        this._num = num;        // max num worker
        this._domsg = domsg;    // the function to handle message (m)=>{}
    }
    getFreeWorker(delay_ms_if_new_worker, callback) {
        let ret = null;

        // 找到 jobs 数量最少的 worker 
        this._workers.forEach((wk)=>{
            if (helper.isNullOrUndefined(ret)) {
                ret = wk;
            } else {
                if (Object.keys(wk.jobs).length < Object.keys(ret.jobs).length) {
                    ret = wk;
                }
            }
        });
        //helper.log("[workmgr:getFreeWorker] find ret:", ret);

        // 判断是否需要创建新的 worker
        let need_create_worker = false;
        if (helper.isNullOrUndefined(ret) || 0<Object.keys(ret.jobs).length) {
            need_create_worker = true;
        }

        // create new worker
        if (need_create_worker) {
            helper.logGreen("[workmgr:getFreeWorker] need_create_worker:", need_create_worker);

            helper.log("[workmgr:getFreeWorker] this._workers:", this._workers.length, "this._num:", this._num);
            if (this._workers.length < this._num) {
                let w = child_process.fork(this._js);
                //helper.log("[workmgr:getFreeWorker] w:", w);
                w.worker_name = (new Date()).getTime()+"."+helper.randomNum(1,100);
                w.jobs = {};

                w.on('message', (m)=>{
                    this._domsg(w,m);
                });

                this._workers.push(w);

                ret = w;

                if (helper.isNullOrUndefined(delay_ms_if_new_worker)) {
                    delay_ms_if_new_worker = 0;
                }
                setTimeout(()=>{ callback(ret); }, delay_ms_if_new_worker);
            } else {
                callback(ret);
            }
        } else {
            callback(ret);
        }
    }
    allWorkers() {
        return this._workers;
    }
}

module.exports = workmgr;

