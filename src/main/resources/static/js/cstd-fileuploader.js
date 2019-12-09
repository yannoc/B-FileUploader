(function(global, factory){
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
        typeof define === 'function' && define.amd ? define(['jquery'], factory) :
            (global = global || self, global.CSTDuploader = factory(global.jQuery));
})(this,function($){
    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    var CSTDuploader =
        function(){
            function CSTDuploader(opts){
                var params = {
                    dbName: '',
                    className: '',
                    oid: ''
                };
                this.setParams = function(args){
                    params = args
                }
                this.getParams = function(){
                    return params;
                }

                this.loadFileList = function (args) {
                    var options = {
                        url: this.server + "/app/main/getFiles",
                        silent: true,
                        query: args
                    }
                    $('#attrTable' + this.id + '').bootstrapTable('refresh', options);
                }
                var def = {
                    // 文件服务器地址：协议+IP+端口，如http://192.168.0.100：8080， 不可为空
                    server:	'http://localhost:8080/',
                    // 加载上传插件的容器id，不可为空
                    picker: 'cstd-uploader',
                    // 上传控件只读则不允许上传文件，默认为false
                    readOnly: false
                }
                def = util.extend(def, opts, true);
                if (typeof def.readOnly === "string") {
                    if (def.readOnly === "true") {
                        def.readOnly = true
                    } else {
                        def.readOnly = false;
                    }
                }
                this.init(def);
            }
            CSTDuploader.prototype = {
                constructor: this,    //构造器指向构造函数 ,防止构造器指向Object的情况；
                init: function(opts){
                    var id = util.getGUID();	// 当前文件上传实例的ID标识
                    this.server = opts.server;
                    this.id = opts.id = id;
                    this.initUI(opts)
                    this.initUploader(opts)
                    this.initEvent(opts);
                },
                // 初始化UI
                initUI: function(opts){
                    var area = $(opts.picker);
                    var dom = {
                        id: opts.id,
                        area: area,
                        readOnly: opts.readOnly
                    }
                    var config = {
                        id: opts.id,
                        server: opts.server,
                        readOnly: opts.readOnly
                    };
                    // create基础Html
                    this.createDom(dom);
                    // create附件列表
                    this.loadAttrTable(config)
                    // create上传列表
                    this.loadUploadTable(config);
                },
                // 初始化uploader
                initUploader:function(opts){
                    var _id = opts.id
                    var _self = this;
                    var _server = opts.server;
                    var uploader = WebUploader.create({
                        //swf: '/cloud/js/webuploader-0.1.5/Uploader.swf',	// swf文件路径
                        server: _server + '/app/main/upload',	// 文件接收服务端。
                        // 选择文件的按钮。可选。
                        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                        pick: '#selectPicker'+_id+'',
                        chunked : true, 	// 分片处理
                        chunkSize : 50 * 1024 * 1024,	// 分片大小，默认设置为50M
                        chunkRetry : false,	// 如果失败，则不重试
                        threads : 5,// 上传并发数。允许同时最大上传进程数。
                        fileNumLimit: 10,  //文件总数量只能选择10个
                        fileSizeLimit: 6 * 1024 * 1024 * 1024,	//加入的所有文件总大小不超过6G
                        fileSingleSizeLimit: 5 * 1024 * 1024 * 1024,	//加入的单个文件不超过5G
                        resize: false	// 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
                    })

                    //当有文件被添加进队列之后
                    uploader.on('fileQueued', function (file) {
                        // 在附件列表的行内添加一组数据
                        var guid = WebUploader.Base.guid();
                        file.guid = guid;
                        var data = {
                            fileId: file.id,
                            fileName: file.name,
                            fileExt: file.ext,
                            fileSize: file.size,
                            process:'<i class="text-primary"><small>等待上传</small></i>',
                        }
                        $('#uploadTable'+_id+'').bootstrapTable('append', data);
                        _self.btnDisabledRule(_id, 'waiting');
                    });
                    // 当开始上传流程时
                    uploader.on('startUpload',function(a,b,c){
                        _self.btnDisabledRule(_id, 'uploading');
                    })
                    // 当停止上传流程时
                    uploader.on('stopUpload',function(a,b,c){
                        _self.btnDisabledRule(_id, 'stoping');
                    })
                    // 所有文件上传完毕
                    uploader.on('uploadFinished', function (file) {
                        _self.btnDisabledRule(_id, 'finished');
                    });


                    // 当前文件开始上传流程时
                    uploader.on("uploadStart", function (file) {
                        // 更新表单的进度状态
                        var data = {
                            id: file.id,
                            field: 'process',
                            value: '<div class="upload-progress upload-progress-moved">'+
                            '<div class="upload-progress-bar" style="width: 0%; float:left;" ></div>'+
                            '</div>'+
                            '<span>0%</span>'
                        }
                        $('#uploadTable' + _id + '').bootstrapTable('updateByUniqueId', data);
                        uploader.options.formData.guid = file.guid;
                    });

                    //文件上传过程中创建进度条实时显示。
                    uploader.on('uploadProgress', function (file, percentage) {
                        var data={
                            id: file.id,
                            field: 'process',
                            value: '<div class="upload-progress upload-progress-moved">'+
                            '<div class="upload-progress-bar" style="width: '+percentage*100+'%;" ></div>'+
                            '</div>'+
                            '<span>'+Math.round(percentage*100)+'%</span>'
                        }
                        $('#uploadTable' + _id + '').bootstrapTable('updateCellByUniqueId', data);
                    });

                    //文件成功、失败处理
                    uploader.on('uploadSuccess', function (file) {
                        // 保存文件信息
                        var id = file.id;
                        // 文件的guid
                        var guid = file.guid
                        var params = _self.getParams();
                        var data = {
                            guid: guid,
                            id: file.id,
                            fileName: file.name,
                            fileSize: file.size,
                            ext: file.ext,
                            dbName: params.dbName,
                            className: params.className,
                            oid: params.oid
                        }
                        $.post(_server + '/app/main/save',data,function(data){
                            var result = JSON.parse(data);
                            if(result.success){
                                // 更新数据
                                var data={
                                    id: id,
                                    field: 'process',
                                    value: '<small class="text-success">上传完成</small>'
                                }
                                $('#uploadTable'+_id+'').bootstrapTable('updateCellByUniqueId', data);
                                var options={
                                    url : _server +"/app/main/getFiles",
                                    silent: true,
                                    query: params,
                                }
                                $('#attrTable'+_id+'').bootstrapTable('refresh', options);
                            }
                        })

                    });

                    uploader.on('uploadError', function (file) {
                        // 上传错误更新页面显示
                        var id = file.id;
                        var row = {
                            process: '<small class="text-danger">上传出错</small>',
                            action: '<button id="repeatUploadBtn'+_id+'" type="button" class="btn btn-link attr-file-btn 	glyphicon glyphicon-repeat" data-toggle="tooltip" data-placement="top" title="重试"></button>'
                        }
                        $('#uploadTable'+_id+'').bootstrapTable('updateByUniqueId', {id: id,row:row});
                    });

                    uploader.on('uploadComplete', function (file) {
                        console.info('uploadComplete');
                    });
                    uploader.on('reset', function () {
                        // 移除队列中所有文件
                        $('#uploadTable'+_id+'').bootstrapTable('removeAll');
                    });

                    // 文件加入队列出错处理
                    uploader.on('error', function (handler) {
                        var handlers = {
                            Q_EXCEED_NUM_LIMIT: '上传文件数量已到上限!',
                            Q_EXCEED_SIZE_LIMIT: '上传文件大小已到上限!',
                            Q_TYPE_DENIED: '选择的文件类型不符!'
                        }
                        console.info(handlers[handler])
                    });
                    this.uploader = uploader;
                },

                initEvent: function(config){
                    var me = this;
                    var _id = config.id;
                    $('#uploaderModal'+_id+'').on('shown.bs.modal',function(){
                        me.uploader.refresh();
                    })

                    $('#uploadStartBtn'+_id+'').on('click',function(e){
                        me.uploader.upload();
                    })
                    $('#uploadCleanBtn'+_id+'').on('click', function(e){
                        // 移除队列中的所有文件
                        me.uploader.reset();
                    })

                    // 暂停上传
                    $('#uploadPauseBtn'+_id+'').on('click', function(e){
                        // 暂停上传
                        me.uploader.stop(true);
                    })

                    // 恢复上传
                    $('#uploadResumeBtn'+_id+'').on('click', function(e){
                        // 移除队列中的所有文件
                        me.uploader.upload();
                    })
                    // $('#uploadFileBtn').on('click',function(){

                    // })
                },

                createDom : function(dom){
                    var id = dom.id;
                    var component = dom.area;
                    var readOnly = dom.readOnly;
                    // 后续编写dom生成函数，用专门控制组件权限，或者直接操作Dom
                    var context;
                    if(readOnly || "true"===readOnly){
                        context = $('<table id="attrTable'+id+'"></table>');
                    } else {
                        context = $('<div id="attrToolbar'+id+'"> <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#uploaderModal'+id+'">上传附件</button></div>'+
                            '<table id="attrTable'+id+'"></table>'+
                            '<div id="uploaderModal'+id+'" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'+
                            '<div class="modal-dialog upload-modal-dialog">'+
                            '<div id="upload-content'+id+'" class="modal-content">'+
                            '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>附件上传</div>'+
                            '<div class="modal-body upload-modal-body">'+
                            '<div id="uploadToolbar'+id+'" class="text-right">'+
                            '<div id="selectPicker'+id+'">选择文件</div>'+
                            '<button id="uploadStartBtn'+id+'" type="button" class="btn btn-primary btn-margin" disabled=true><span class="glyphicon glyphicon-open icon-margin"></span>上传</button>'+
                            '<button id="uploadResumeBtn'+id+'" type="button" class="btn btn-primary btn-margin" style="display:none"><span class="glyphicon glyphicon-play icon-margin"></span>开始</button>'+
                            '<button id="uploadPauseBtn'+id+'" type="button" class="btn btn-primary btn-margin" disabled=true><span class="glyphicon glyphicon-pause icon-margin"></span>暂停</button>'+
                            '<button id="uploadCleanBtn'+id+'" type="button" class="btn btn-danger btn-margin" disabled=true><span class="glyphicon glyphicon-trash icon-margin"></span>清空</button>'+
                            '</div>'+
                            '<table id="uploadTable'+id+'"></table>'+
                            '</div>'+
                            '</div>'+
                            '</div>'+
                            '</div>'
                        )
                    }
                    component.append(context);
                },

                btnDisabledRule:function(id ,state){
                    const btnRules = {
                        // 队列中,等待上传的状态
                        'waiting':{
                            startBtn: {disabled: false},
                            pauseBtn: {},
                            resumeBtn: {},
                            //retryBtn:{},
                            cleanBtn: {disabled: false},
                        },
                        'uploading': {
                            startBtn: {disabled: true},
                            pauseBtn: {disabled: false, style: 'display:inline-block'},
                            resumeBtn: {disabled: true, style: 'display:none'},
                            //retryBtn:{},
                            cleanBtn: {disabled: true},
                        },
                        'stoping': {
                            startBtn: {disabled: true},
                            pauseBtn: {style: 'display:none'},
                            resumeBtn: {disabled: false, style: 'display:inline-block'},
                            //retryBtn:{},
                            cleanBtn: {disabled: false},
                        },
                        'finished': {
                            startBtn: {disabled: true},
                            pauseBtn: {disabled: true, style: 'display:inline-block'},
                            resumeBtn:{disabled: true, style: 'display:none'},
                            //retryBtn:{},
                            cleanBtn: {disabled: false},
                        },
                        'cleared': {
                            startBtn: {disabled: true},
                            pauseBtn: {disabled: true, style: 'display:inline-block'},
                            resumeBtn:{disabled: true, style: 'display:none'},
                            //retryBtn: {style: 'display:none'},
                            cleanBtn: {disabled: true},
                        }
                    }
                    /** 所有控制按钮 */
                    var startBtn = $('#uploadStartBtn'+id+'');
                    var pauseBtn =	$('#uploadPauseBtn'+id+'');
                    var resumeBtn = $('#uploadResumeBtn'+id+'');
                    //var retryBtn = $("#uploadRetryBtn");
                    var cleanBtn = $('#uploadCleanBtn'+id+'');
                    /** 按钮设置控制样式 */
                    var btnState = btnRules[state];
                    startBtn.attr(btnState['startBtn']);
                    pauseBtn.attr(btnState['pauseBtn']);
                    resumeBtn.attr(btnState['resumeBtn']);
                    //retryBtn.attr(btnState['retryBtn']);
                    cleanBtn.attr(btnState['cleanBtn']);

                },

                loadAttrTable: function(config){
                    var me = this
                    var _server = config.server;
                    var _readOnly = config.readOnly;
                    var _id = config.id;
                    var tableOpts = {
                        // 数据获取路径
                        method: 'post',

                        url: _server + "/app/main/getFiles",
                        queryParams: me.getParams,
                        //Bstable工具导航条
                        toolbar: '#attrToolbar'+_id+'',
                        //浏览器缓存，默认为true，设置为false避免页面刷新调用浏览器缓存
                        cache: false,
                        //是否显示行间隔色
                        striped: true,
                        responseHandler: function (res) {	//处理服务器返回的数据
                            return typeof(eval(res.data)) == undefined ? [] : eval(res.data)
                        },
                        uniqueId:'guid',
                        columns: [
                            {
                                field: 'index',
                                title: '序号',
                                align: 'center',
                                width: 50,
                                formatter: function (value, row, index) {
                                    return index+1;
                                }
                            },
                            { field: 'guid', title: 'ID',visible: false },
                            { field: 'fileName', title: '名称',  width: 380 },
                            { field: 'fileSize', title: '大小',  width: 80,
                                formatter(value, row, index){
                                    var sizes = ['Bytes','KB','MB','GB','TB'];
                                    if (value== 0) return 'n/a';
                                    var i = parseInt(Math.floor(Math.log(value) / Math.log(1024)));
                                    return (value/ Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
                                }
                            },
                            { field: 'createTime', title: '创建时间',  width: 100,
                                formatter(value, row, index) {
                                    var date = new Date(value)
                                    return date.toLocaleString();
                                }
                            },
                            { field: 'action', title: '操作', align:'center', width: 100,
                                events: window.operatEvents = {
                                    'click .btn': function(e,value,row,index){
                                        var guid = row.guid;
                                        if(e.target.id==='downloadAttrBtn'+_id+''){
                                            // 创建隐藏的可下载链接
                                            var src = _server+'/app/main/download?guid='+guid
                                            var eleLink = document.createElement('a');
                                            eleLink.download = src;
                                            eleLink.style.display = 'none';
                                            // // 字符内容转变成blob地址
                                            eleLink.href = src;
                                            // // 触发点击
                                            document.body.appendChild(eleLink);
                                            eleLink.click();
                                            // // 然后移除
                                            document.body.removeChild(eleLink);
                                        } else if(e.target.id==='deleteAttrBtn'+_id+''){
                                            $.post(_server + '/app/main/deleteFile',
                                                { guid: guid },
                                                function(response){
                                                    var result = JSON.parse(response);
                                                    if(result.success){
                                                        $('#attrTable'+_id+'').bootstrapTable("removeByUniqueId", guid);
                                                    }
                                                });
                                        }

                                    }
                                },
                                formatter(value, row, index){
                                    //'<button id="previewAttrBtn" type="button" class="btn btn-link attr-file-btn glyphicon glyphicon-file" data-toggle="tooltip" data-placement="top" title="预览"></button>'+
                                    var context = '<button id="downloadAttrBtn' + _id + '" type="button" class="btn btn-link attr-file-btn glyphicon glyphicon-download-alt" data-toggle="tooltip" data-placement="top" title="下载"></button>';
                                    if (!_readOnly) {
                                        context += '<button id="deleteAttrBtn' + _id + '" type="button" class="btn btn-link attr-file-btn glyphicon glyphicon-remove" style="color:#a94442 !important;" data-toggle="tooltip" data-placement="top" title="删除"></button>';
                                    }
                                    return context;
                                }
                            }
                        ]
                    }
                    $('#attrTable'+_id+'').bootstrapTable(tableOpts);
                },
                loadUploadTable: function(config){
                    var me = this;
                    var _id = config.id;
                    var tableOpts = {
                        classes: 'table table-hover',
                        //得到的json数据，会根据columns参数进行对应赋值配置
                        //Bstable工具导航条
                        toolbar: '#uploadToolbar'+_id+'',
                        //浏览器缓存，默认为true，设置为false避免页面刷新调用浏览器缓存
                        cache: false,
                        // //是否显示行间隔色
                        // striped: true,
                        // 虚拟滚动条
                        //virtualScroll: true,
                        // 设置表格的初始初始高度
                        height: 375,
                        // 设置单元格的uniqueId
                        uniqueId:'fileId',
                        columns: [
                            {
                                field: 'index',
                                title: '序号',
                                align: 'center',
                                width: 50,
                                formatter: function (value, row, index) {
                                    return index+1;
                                }
                            },
                            { field: 'fileId', title: 'ID', visible: false},
                            { field: 'fileName', title: '文件名', width:280},
                            { field: 'fileExt', title: '类型', align: 'center',  width: 80 },
                            { field: 'fileSize', title: '大小', align: 'center', width: 80,
                                formatter(value, row, index){
                                    var sizes = ['Bytes','KB','MB','GB','TB'];
                                    if (value== 0) return 'n/a';
                                    var i = parseInt(Math.floor(Math.log(value) / Math.log(1024)));
                                    return (value/ Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
                                }
                            },
                            { field: 'process', title: '进度',  width: 150 },
                            { field: 'action', align: 'right', title: '',  width: 80,
                                events: window.operatEvents = {
                                    'click .btn': function(e,value,row,index){
                                        var guid = row.guid;
                                        // 上传失败重试当前文件
                                        if(e.target.id==='repeatUploadBtn'+_id+''){
                                            me.uploader.retry(row.fileId);
                                        }
                                        return;
                                    }
                                },
                            }
                        ]
                    }
                    $('#uploadTable'+_id+'').bootstrapTable(tableOpts);
                },
            }
            CSTDuploader.create = function(opts){
                return new CSTDuploader(opts);
            }
            return CSTDuploader;
        }();
    return CSTDuploader
});(function(global){
    "use strict"
    var _global;

    var util = {
        // 对象合并
        extend: function (o,n,override) {
            for(var key in n){
                if(n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)){
                    o[key]=n[key];
                }
            }
            return o;
        },
        getGUID: function(randomLength){
            return Number(Math.random().toString().substr(3,randomLength) + Date.now()).toString(36)
        }
    }
    _global = (function(){ return this || (0, eval)('this'); }());
    !('util' in _global) && (_global.util = util);
}())