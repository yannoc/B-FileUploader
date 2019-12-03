/*
 * 自定义的文件上传插件
 * yannobai 2019-11-26
 */
;(function(undefined) {
    "use strict"     

    // 构造函数
    function Uploader(opt) {
    	var me = this;
        this.init(opt);     
    }

    Uploader.prototype = {
		constructor: this,    //构造器指向构造函数 ,防止构造器指向Object的情况；
		init: function(opt){  //初始化	
			var __self = this;
			var uploader = WebUploader.create({			    
			    //swf: '/cloud/js/webuploader-0.1.5/Uploader.swf',	// swf文件路径			    
			    server: 'http://localhost:8081/app/main/upload',	// 文件接收服务端。
			    // 选择文件的按钮。可选。
			    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
			    pick: '#picker',
			   	chunked : true, 	// 分片处理
			   	chunkSize : 50 * 1024 * 1024,	// 分片大小，默认设置为50M
			   	chunkRetry : false,	// 如果失败，则不重试
			   	threads : 3,// 上传并发数。允许同时最大上传进程数。
			   					
			    resize: false	// 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
			})
			//点击上传之前调用的方法
			uploader.uploadStart = function (file) {
				console.info("要上传了!")
				__self.uploadStart(file);
			};
 
			//当有文件被添加进队列的时候
			uploader.beforeFileQueued = function(file) {	
				// 用于文件格式过滤		
				console.info("要加入文件了!")	 
				__self.beforeFileQueued(file);			    
			};

			//当有文件被添加进队列的时候
			uploader.fileQueued = function (file) {
				// 将文件信息加入ui列表
				console.info("加入了文件!")	 
			   __self.fileQueued(file);
			};
 
			//文件上传过程中创建进度条实时显示。
			uploader.uploadProgress = function (file, percentage) {
				// 将进度信息加入到对一个文件的列表
				console.info("文件上传了.."+percentage);	
			    __self.uploadProgress
			};

			// 文件上传成功，给item添加成功class, 用样式标记上传成功。
			uploader.uploadSuccess = function(file) {
				console.info("文件上传成功！");
				__self.uploadSuccess(file);
			    $( '#'+file.id ).addClass('upload-state-done');
			};

			// 文件上传失败，显示上传出错。
			uploader.uploadError = function(file) {
				console.info("文件上传失败！");
				__self.uploadError(file);
			    var $li = $( '#'+file.id ),
			        $error = $li.find('div.error');

			    // 避免重复创建
			    if ( !$error.length ) {
			        $error = $('<div class="error"></div>').appendTo( $li );
			    }

			    $error.text('上传失败');
			};

			// 完成上传完了，成功或者失败，先删除进度条。
			uploader.uploadComplete = function( file ) {
				console.info("文件上传完毕！");
				__self.uploadComplete(file);
			    $( '#'+file.id ).find('.progress').remove();
			};

			this.upload = function(){
				// 操作一些button的enable
				this.uploader.upload();
			}

			this.uploader = uploader;
			this.initUI(el,param)
		},

		// 当开始上传流程时触发。
		uploadStart: function(){
				GUID = WebUploader.Base.guid();
			    var paramOb = {"guid": GUID, "filedId": file.source.ruid}
			    uploader.options.formData.guid = GUID;
			    fileArray.push(paramOb);
		}

		// 文件加入队列之前触发
		beforeFileQueued: function(file){
			// 用来过滤文件格式
		}

		// 文件加入队列后触发
		fileQueued: function(file){
			// 列表中添加文件信息
			$list.append('<div id="' + file.id + '" class="item">' +
	        '<h4 class="info">' + file.name + '</h4>' +
	        '<p class="state">等待上传...</p>' +
	        '</div>');
		}

		// 文件移除队列时触发
		fileDequeued: function(file){
			 
		}

		// 上传实时进度
		uploadProgress: function(file, percentage){
			var $li = $('#' + file.id),
	        $percent = $li.find('.progress .progress-bar');
		    // 避免重复创建
		    if (!$percent.length) {
		        $percent = $('<div class="progress progress-striped active">' +
		            '<div class="progress-bar" role="progressbar" style="width: 0%">' +
		            '</div>' +
		            '</div>').appendTo($li).find('.progress-bar');
		    }
		    $li.find('p.state').text('上传中');
		    $percent.css('width', percentage * 100 + '%');
		}


		initUI: function(el, eOpts){
			// 创建HTML上传控件
			if(!eOpts.isSupport){
				el.innerHTML="<span>浏览器不支持该插件！</span>";
			}
			el.innerHTML="<span>上传文件</span>";
		},

  };

    //最后将插件对象暴露给全局对象
    (function(){ 
    	return this.CSTDuploader = {
    		init:function(opts){
    			return new Uploader(opts);
    		}
    	}
    }());
    
}());