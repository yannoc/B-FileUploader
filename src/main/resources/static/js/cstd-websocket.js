;(function (undefined) {
	"use strict" 
	
	var _global;

	function FileServer(opts){
		/**
         * opts 
         *      url         string  //链接的url
         *      host        string  //主机名   有url则不传，url需要有主机名
         *      protocols   string  //链接使用的协议 ws wss 默认根据location进行判断 http ws or htps wss   
         *                              有url则不传，url需要有协议
         *      port        string  //例 ':8080' 端口号 有url则不传，url需要有端口
         *      message     string  //连接成功后默认发送的数据，并且在执行send如果没有传递参数，则默认发送该值

         * 
         */
        // 默认配置参数        
        var def = {
        	// url : "ws://39.106.92.135:9100/app/fileServer/123",
            url : "ws://localhost:8081/app/fileServer/123",
        	message: "message",
        	connectTimeout: 1000,		// 超时时长
			limitReConnectNum : 3,		// 重连次数限定
			onopen: function () { },
            onmessage: function () { },
            onclose: function () { },
            onerror: function () { },
            onbeforeclose: function () { }
        }    

        this.ws;       	
	    this.isHeartflag = false;	 //心跳状态  为false时不能执行操作 等待重连	   
	   	this.isReconnect = false;	//重连状态  避免不间断的重连操作        
        this.reConnectNum = 1;	

        // 配置参数
        this.config = extend(def, opts, true);
		this.init();
	}

	FileServer.prototype = {
		constructor : this,
		init : function(){	
			var me = this;	 	
		 	//检测浏览器是否支持Socket
            window.WebSocket = window.WebSocket || window.MozWebSocket;	
            if (!window.WebSocket) {
                console.error("浏览器不支持WebSocket");
                return;
            };                   		               
            // 创建WebSocket并声明监听函数
            var ws = new WebSocket(this.config.url);
            ws.open = function (e) {
            	me.opened(e);
            	heartCheck.start();	//后启动心跳检测机制
            };
            ws.onmessage = function (e) {
            	me.received(e);
            	heartCheck.reset();
            };
            ws.onclose = function (e) {
            	me.closed(e);
            };
            ws.onerror = function (e) {
            	me.errored(e);
            }

            // 心跳检测
        	var heartCheck  = {
	            timeout: 1000,		   //心跳检测时间默认1分钟
	            timeoutObj: null,
	            reset: function(){     //接收成功一次推送，就将心跳检测的倒计时重置为30秒
	                clearTimeout(this.timeoutObj);//重置倒计时
	                this.start();
	            },
	            start: function(){     //启动心跳检测机制，设置倒计时30秒一次
	                this.timeoutObj = setTimeout(function(){
	                    ws.send(JSON.stringify(new Date()));   //启动心跳
                        console.info("发送心跳信息")
	                },this.timeout)
	            }
	        }	        

            this.ws = ws;
            //发送消息函数
	        this.send = function (message) {
	            if (!this.ws) {
	                console.error("websocket链接已关闭", this);
	                return;
	            }
	            //判断心跳检测，连接是否存在或已连接
	            if (!this.isHeartFlat) {
                	console.error("websocket未连接或出现故障");
                	return;
                }
                try{
					this.ws.send(message);
                }catch(e){
                	console.info("服务器异常，数据发送失败！");
                }
	                
	        }

	        //关闭连接接口
	        this.close = function () {
	            if (!this.ws) {
	                console.error("链接已关闭");
	                return;
	            }
	           	this.onbeforeclose(this.config, this.ws);
	            this.ws.close();
	        }
	        return;
		},

		// 连接成功回调函数
		opened : function(e){
			var me = this;
			me.isHeartFlat = true;
            me.config.onopen(e);  
            console.info("WebSocket已连接！")                                   
        },

        // 接收消息回调函数
        received : function (e) {
            this.config.onmessage(e); 
            console.info("收到WebSocket消息！")               
        },

        // 连接错误回调函数
        errored : function (e) {   
        	var me = this;                 
            me.isHeartFlat = false;		// 连接错误心跳值为false            
            me.config.onerror(e);		// 自定义连接错误时执行函数           
            console.info("WebSocket服务被关闭!")                       
        },

        // socket关闭回调函数
        closed : function (e) {
        	var me = this;
            me.isHeartFlat = false;
            me.config.onclose(e);
            me.reConnect();
        },

        // 重连
        reConnect: function(){
        	var me = this;
            if (me.isReconnect) return;	//如果没有触发重连操作，则不执行
            me.isReconnect = true;
            if(me.reConnectNum <= me.config.limitReConnectNum){	// 
            	var reConnectTimer = setTimeout(function () {
            		console.info('正在进行第'+me.reConnectNum+'次重连...');
			        me.init()
			        me.isReconnect = false;
			        me.reConnectNum++; 		// 重连次数加1
			         //如果心跳值为true，则重连成功
                    if (me.isHeartFlat) {
                        clearTimeout(reConnectTimer);
                        reConnectTimer = null;
                    }
			  	 }, me.config.connectTimeout);
            } else {
            	console.error('重连次数超出设定值，不再重连，请检查配置项');
            }
        }
    }

   	 _global = (function(){ return this || (0, eval)('this'); }());
    !('FileServer' in _global) && (_global.FileServer = FileServer);
}());