var PopFrame = {
	//新建窗体
	open: function(params){
		var param_type = typeof(params);
		var handle = new Pop_Handle();
		if(param_type == "object"){
			handle.loadParams(params);
		}else if(param_type == "string"){
			handle.href = params;
		}else{
			handle = null;
		}
		if(handle){
			this.pool.push(handle);
			handle.initial();
		}
		$(".pop_main").parents("body").bind('keydown',function(e){
			if (e.keyCode == 9) {
		    	if (e.preventDefault) { e.preventDefault(); }
		        else { e.returnValue = false; }
		    }
		});
	},
	//弹出确认框
	confirm:function(content, title, callback){
		this.open({
			width:300,
			height:100,
			zindex:90000,
			title:title?title:"提示",
			html:"<table style='font-size:12px'><tr><td><div class='pop_confirm'></div></td><td>" + content + "</td></tr></table>",
			action:true,
			btnText:["确定", "取消"],
			coverColor:"#666",
			useShadow:false,
			border:"1px solid #AAA",
			callback:callback,
			actionBack:false
		});
	},
	alert:function(content, title, isClose, btnText, callback){
		PopFrame.close("loading");
		this.open({
			width:300,
			height:100,
			zindex:90000,
			title:title?title:"提示",
			html:"<table style='font-size:12px'><tr><td><div class='pop_alert'></div></td><td>" + content + "</td></tr></table>",
			action:true,
			btnText:btnText?[btnText]:["确定"],
			coverColor:"#666",
			useShadow:false,
			border:"1px solid #AAA",
			callback:callback,
			actionBack:false,
			draggable:false,
			isClose:isClose===true?true:false,
		});
		$(".pop_main .pop_foot").children("a[class='ok']").focus();
	},
	showTip:function(content, title, callback){
		PopFrame.close("loading");
		this.open({
			width:450,
			height:100,
			zindex:90000,
			title:title?title:"提示",
			html:"<table style='font-size:12px'><tr><td><div class='pop_alert'></div></td><td>" + content + "</td></tr></table>",
			action:true,
			btnText:["确定"],
			coverColor:"#666",
			useShadow:false,
			border:"1px solid #AAA",
			callback:callback,
			actionBack:false
		});
	},
	popup:function(content, left, top, callback){
		var id = "popup_" + String(Math.random()).replace("0.", "");
		var cnt = jQuery("<span style='visibility:hidden'>" + content + "</span>");
		jQuery(document.body).append(cnt);
		var width = cnt.width();
		cnt.remove();
		this.open({
			id:id,
			html:content,
			width:width,
			left:left,
			top:top,
			hasHeader:false,
			nopadding:true,
			useCover:false,
			useShadow:false,
			fixed:false,
			border:"none",
			init:function(){
				PopFrame.hide(id);
			},
			callback:callback
		});
		return id;
	},
	loading:function(title, noCover){
		PopFrame.open({
			id:"loading",
			hasHeader:false,
			useShadow:false,
			useCover:noCover?false:true,
			border:"1px solid #A5C5F5",
			html:"<table width='140' height='30'><tr><td><div class='loading'></div></td><td style='font-size:13px'>&nbsp;" + title + "...</td></tr></table>",
			width:140
		});
	},
	tip:function(title, type, timeout){
		if(this.getHandle("tipWin") != null) return;
		var timeout = timeout || 2000;
		var type = type || "success";
		var cnt = jQuery("<span class='tipBody' style='display:inline-block;visibility:hidden;'><span class='tipCont'>&nbsp;" + title + "&nbsp;</span></span>");
		jQuery(document.body).append(cnt);
		var width = cnt.width();
		cnt.remove();
		var html = "<span class='tipBody' style='width:" + (width + 61) + "px'><span class='tipLeft " + type + "'></span><span class='tipCont' style='width:" + (width+2) + "px'>&nbsp;" + title + "&nbsp;</span><span class='tipRight'></span></span>";
		PopFrame.open({
			id:"tipWin",
			width:width + 61,
			html:html,
			zindex:this.tipIndex,
			hasHeader:false,
			useShadow:false,
			useCover:false,
			draggable:false,
			border:"none",
			transparent:true,
			nopadding:true
		});
		setTimeout(function(){
			PopFrame.close("tipWin");
		}, timeout);
	},
	//显示窗体(仅singleon)
	show:function(id){
		var obj = this.getHandle(id);
		obj.handle.show();
		obj.handle.next(".pop_cover").show();
	},
	//关闭窗体
	close:function(id){
		var obj = this.getHandle(id);
		if(!obj) return;
		if(obj.href){
			$("body").css("overflow","auto");
		}
		if(obj.singleon){
			obj.handle.hide();
			obj.handle.next(".pop_cover").hide();
			return;
		}
		obj.handle.next(".pop_cover").remove();
		obj.handle.remove();
		for(var i=0;i<this.pool.length;i++){
			if(this.pool[i] && this.pool[i].id == id){
				window.clearInterval(this.pool[i].timer);
				this.pool[i] = null;
			}
		}
	},
	//只适用popup
	hide:function(id){
		jQuery("#" + id).hide();
	},
	//获取窗体对象
	getHandle:function(id){
		for(var i=0;i<this.pool.length;i++){
			if(this.pool[i] && this.pool[i].id == id){
				return this.pool[i];
			}
		}
		return null;
	},
	//使窗体浮到最上
	toTop:function(id){
		var pop = this.getHandle(id);
		if(!pop) return;
		pop.zindex = this.getMaxZindex() + 1;
		pop.handle.css("z-index", pop.zindex);
	},
	//获取最大zindex
	getMaxZindex:function(){
		var maxZ = 11000;
		for(var i=0;i<this.pool.length;i++){
			if(this.pool[i] && this.pool[i].zindex > maxZ && this.pool[i].zindex != this.tipIndex){
				maxZ = this.pool[i].zindex;
			}
		}
		return maxZ;
	},
	//注销功能
	o_confirm: function (){
		PopFrame.confirm("确定要退出吗?","确认提示 ",function(a){
			if(a=="ok"){
				window.location.href="/logout.html_";
			}
		});
	},
	//窗体对象数组
	pool:[],
	tipIndex:99999,
	//常用工具
	utils:{
		ie:/Internet Explorer/i.test(navigator.appName),
		ie6:/Internet Explorer/i.test(navigator.appName) && /MSIE 6\.0/i.test(navigator.appVersion)
	}
};
//IE6下只能用其他方法使其锁定位置
if(PopFrame.utils.ie6){
	jQuery(window).bind("scroll", function(){
		for(var i=0;i<PopFrame.pool.length;i++){
			if(PopFrame.pool[i] && PopFrame.pool[i].fixed){
				PopFrame.pool[i].ie6fixed();
			}
		}
	});
}

function Pop_Handle(){
	this.width = 600;	//窗体宽度
	this.height = 310;	//窗体高度
	this.full = false;	//全屏(宽高设置无效)
	this.top;			//留空为自动居中
	this.left;			//留空为自动居中
	this.href;		//窗体内容网页地址(与html不能共有)
	this.html;		//窗体内容(与href不能共有)
	this.id = "pop_main_" + String(Math.random()).replace("0.", "");
	this.title = "新窗口";//主窗体标题
	this.isClose = true;//是否显示关闭按钮
	this.handle;	//主窗体句柄
	this.iframe;	//窗内框架句柄
	this.zindex;	//默认层序
	this.border;	//边框样式
	this.nopadding = false;	//内容div是否有默认padding
	this.hasHeader = true;	//是否有头部
	this.headerStyle;	//标题栏样式
	this.useCover = true;	//是否有遮罩层
	this.coverColor;		//遮罩层颜色
	this.coverAlpha = 0.4;	//遮罩层透明度
	this.useShadow = true; //是否有阴影层
	this.transparent = false;	//设置背景透明
	this.cover;		//遮罩层句柄
	this.action;	//是否有按钮区域
	this.actionBack = true;	//按钮区域是否有背景及边框
	this.btnText = ["确定", "取消"];	//按钮文本
	this.draggable = true;	//能否被拖拽
	this.fixed = true;		//是否锁定位置
	this.init;	//窗体初始化回调函数
	this.callback;		//窗体回调函数
	this.crossDomain;	//框架内是否跨域
	this.singleon = false;	//是否单例模式,关闭时不remove
	this.timer;			//计时器
	this.scroll = "no";	//是否滚动
	//加载传入参数
	this.loadParams = function(param) {
		for(var p in param){
			if(typeof(param[p]) == "string"){
				eval("this." + p + "=param[p]");
			}else{
				eval("this." + p + "=param[p]");
			}
		}
	}
	//加载Pop窗体
	this.initial = function(){
		var dw = jQuery(document).width();
		var dh = document.documentElement.clientHeight;
		var dh_ = document.body.clientHeight == 0 ? document.documentElement.clientHeight:document.body.clientHeight;
		if(dh_ < dh){
			dh = dh_;
		}
		if(this.full){
			this.width = dw;
			this.height = dh;
		}
		var t = (dh - this.height) / 2 - 5;
		if(!this.fixed || PopFrame.utils.ie6){
			t += document.documentElement.scrollTop;
		}
		if(this.top){
			t = this.top;
		}
		var l = (dw - this.width) / 2 - 5;
		if(this.left){
			l = this.left;
		}
		var id = this.id;
		var cb = this.callback;
		var ifr;
		var contentStr = "<div id='" + this.id + "' class='pop_main' style='width:" + this.width + 
			"px;height:auto;top:" + t + "px;left:" + l + "px;'><div class='pop_body'><iframe width='100%' height='300' class='pop_backfrm'></iframe>" + (this.hasHeader ? ("<div class='pop_header'><span>" + this.title + 
			"</span>"+(this.isClose?"<a href='' class='close' title='关闭'>关闭</a>":"")+"</div>") : "") + "<div class='pop_content'></div>";
		if(this.action){
			contentStr += "<div class='pop_foot'" + (this.actionBack?"":"style='background-color:#fff;border-top:none'") + "><a hidefocus href='#' class='ok'>" + this.btnText[0] + "</a>";
			if(this.btnText.length == 2){
				contentStr += "<a hidefocus href='#' class='cancel'>" + this.btnText[1] + "</a>";
			}
			contentStr += "</div>";
		}
		contentStr += "</div></div>";
		this.handle = jQuery(contentStr);
		if(this.html){
			this.handle.css("visibility", "hidden");
		}
		//设置zindex
		var max_index = PopFrame.getMaxZindex();
		if(!this.zindex){
			this.zindex = max_index + 2;
		}
		this.handle.css("z-index", this.zindex);
		if(!this.fixed){ //如果不锁定位置
			this.handle.css("position", "absolute");
		}
		if(!this.useShadow){
			this.handle.css("padding", "0").css("border-radius", "0");
		}
		if(this.border){
			jQuery(".pop_body", this.handle).css("border", this.border);
		}
		if(this.headerStyle){
			if(this.headerStyle.size) jQuery(".pop_header span", this.handle).css("font-size", this.headerStyle.size);
			if(this.headerStyle.color) jQuery(".pop_header span", this.handle).css("color", this.headerStyle.color);
			if(this.headerStyle.weight) jQuery(".pop_header span", this.handle).css("font-weight", this.headerStyle.weight);
			if(this.headerStyle.borderWidth || this.headerStyle.borderWidth == 0) jQuery(".pop_header", this.handle).css("border-bottom-width", this.headerStyle.borderWidth);
			if(this.headerStyle.align == "center"){
				jQuery(".pop_header", this.handle).css("text-align", this.headerStyle.align);
				jQuery(".pop_header span", this.handle).css("margin-left", "30px");
			}
		}
		//加载主窗体
		jQuery(document.body).append(this.handle);
		//判断是否跨域并加载框架
		if(this.href){
			var dm = location.host;
			if(/http:\/\//.test(this.href) && this.href.indexOf(dm) == -1){
				this.crossDomain = true;
			}
			var cdm = this.crossDomain;
			this.iframe = jQuery("<iframe id='if" + this.id + "' width='100%' height='" + (this.height - (this.action ? 66 : 28)) + 
			"' scrolling='"+this.scroll+"' " + (this.html ? "" : ("src='" + this.href + "'")) + " frameborder='0'></iframe>");
			$("body").css("overflow","hidden");
			this.iframe.bind("load", function(){
				jQuery(this).unbind("load");
				if(cdm) return;
				try{
					ifr = this.contentWindow;
					//定义子页面的通信函数(非跨域)
					ifr.returnVal = function(o, close){
						if(cb) cb(o, ifr);
						if(close) {
							PopFrame.close(id);
						}
					}
				}catch(e){
					ifr = null;
				}
			});
			//加载内容框架
			jQuery("#" + this.id + " .pop_body .pop_content").append(this.iframe);
		}else{  //加载html内容
			jQuery(".pop_content", this.handle).append(jQuery("<div class='html_body'>" + this.html + "</div>"));
			if(this.fixed) this.fitSelf();
			this.handle.css("visibility", "visible");
			if(this.nopadding){
				jQuery(".html_body", this.handle).css("padding", 0);
			}
			if(this.transparent){
				this.handle.css("background", "transparent");
				if(PopFrame.utils.ie){
					this.handle.get(0).style.filter = "";
				}
				jQuery(".pop_content", this.handle).css("background", "transparent");
				//jQuery(".pop_body", this.handle).css("background", "transparent");
				jQuery("iframe", this.handle).remove();
			}
			if(this.init) this.init(jQuery(".html_body", this.handle));  //加载完毕执行初始化回调函数
		}
		
		//加载遮盖层
		if(this.useCover){
			this.cover = jQuery("<div class='pop_cover' style='z-index:" + (this.zindex - 1) + ";background:" + (this.coverColor ? this.coverColor : "#CCC") + "'>" + (PopFrame.utils.ie6?"<iframe class='pop_backfrm'></iframe><div class='pop_backfrm' style='z-index:1;'></div>":"") + "</div>").css("opacity", this.coverAlpha).height(Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight));
			jQuery(document.body).append(this.cover);
			this.cover.show();
		}
		//窗体内各点击事件
		var hdl = this.handle;
		jQuery("#" + this.id + " .pop_body .pop_header .close").bind("click", function(){
			if(ifr) $(ifr.document.body).remove();
			$("#" +id).parents("body").unbind("keydown");
			PopFrame.close(id);
			if(cb) cb("cancel");
			return false;
		});
		jQuery("#" + this.id + " .pop_body .pop_foot .ok").bind("click", function(){
			if(cb){
				var r = cb("ok", ifr);
				if(r===false) return false;
			}
			if(ifr) $(ifr.document.body).remove();
			$("#" +id).parents("body").unbind("keydown");
			PopFrame.close(id);
			return false;
		});
		jQuery("#" + this.id + " .pop_body .pop_foot .cancel").bind("click", function(){
			if(ifr) $(ifr.document.body).remove();
			$("#" +id).parents("body").unbind("keydown");
			PopFrame.close(id);
			if(cb) cb("cancel");
			return false;
		});
		//点击标题栏使窗体浮到最上
		/*this.handle.bind("mousedown", function(){
			PopFrame.toTop(id);
		});*/
		//IE6锁定窗体位置
		(function(ob){
			if(PopFrame.utils.ie6 && ob.fixed){
				ob.timer = window.setInterval(function(){
					ob.top = parseInt(jQuery(ob.handle).css("top")) - document.documentElement.scrollTop;
				}, 50);
			}
		})(this);
		
		//屏蔽页面点击事件
		if(this.singleon){
			this.handle.click(function(e){
				e.stopPropagation();
			});
		}
		
		//加入拖动效果
		if(this.draggable){
			jQuery(".pop_header", this.handle).css("cursor", "move");
			this.handle.easydrag(true);
			this.handle.setHandler(".pop_header");
			//jQuery(this.handle).draggable({handle:".pop_header",cancel:".close",containment:"document",iframeFix:true,cursorAt:{top:18}});
			//jQuery(".pop_body", this.handle).disableSelection();
		}
	}
	//自适应高度并居中
	this.fitSelf = function(){
		this.height = this.handle.height();
		var dh = document.documentElement.clientHeight;
		var dh_ = document.body.clientHeight == 0 ? document.documentElement.clientHeight:document.body.clientHeight;
		if(dh_ < dh){
			dh = dh_;
		}
		var t = (dh - this.height) / 2 - 5;
		if(PopFrame.utils.ie6){
			this.top = t;
			this.ie6fixed();
		}else{
			this.handle.css("top", t + "px");
		}
	}
	//IE6下锁定位置
	this.ie6fixed = function(){
		var t = this.top + document.documentElement.scrollTop;
		this.handle.css("top", t + "px");
	}
}

//拖动代码
(function($){
// to track if the mouse button is pressed
var isMouseDown = false;
// to track the current element being dragged
var currentElement = null;
// callback holders
var dropCallbacks = {};
var dragCallbacks = {};
// bubbling status
var bubblings = {};
// global position records
var lastMouseX;
var lastMouseY;
var lastElemTop;
var lastElemLeft;
// track element dragStatus
var dragStatus = {};
// if user is holding any handle or not
var holdingHandler = false;
// returns the mouse (cursor) current position
$.getMousePosition = function(e){
var posx = 0;
var posy = 0;
if (!e) var e = window.event;
if (e.pageX || e.pageY) {
posx = e.pageX;
posy = e.pageY;
}
else if (e.clientX || e.clientY) {
posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
}
return { 'x': posx, 'y': posy };
};
// updates the position of the current element being dragged
$.updatePosition = function(e) {
var pos = $.getMousePosition(e);
var spanX = (pos.x - lastMouseX);
var spanY = (pos.y - lastMouseY);
$(currentElement).css("top", (lastElemTop + spanY));
$(currentElement).css("left", (lastElemLeft + spanX));
};
// when the mouse is moved while the mouse button is pressed
$(document).mousemove(function(e){
if(isMouseDown && dragStatus[currentElement.id] != 'false'){
// update the position and call the registered function
$.updatePosition(e);
if(dragCallbacks[currentElement.id] != undefined){
dragCallbacks[currentElement.id](e, currentElement);
}
return false;
}
});
// when the mouse button is released
$(document).mouseup(function(e){
if(isMouseDown && dragStatus[currentElement.id] != 'false'){
isMouseDown = false;
if(dropCallbacks[currentElement.id] != undefined){
dropCallbacks[currentElement.id](e, currentElement);
}
return false;
}
});
/*
// register the function to be called while an element is being dragged
$.fn.ondrag = function(callback){
return this.each(function(){
dragCallbacks[this.id] = callback;
});
};
// register the function to be called when an element is dropped
$.fn.ondrop = function(callback){
return this.each(function(){
dropCallbacks[this.id] = callback;
});
};
*/
/*
// disable the dragging feature for the element
$.fn.dragOff = function(){
return this.each(function(){
dragStatus[this.id] = 'off';
});
};
// enable the dragging feature for the element
$.fn.dragOn = function(){
return this.each(function(){
dragStatus[this.id] = 'on';
});
};
*/
// set a child element as a handler
$.fn.setHandler = function(handler){
return this.each(function(){
var draggable = this;
// enable event bubbling so the user can reach the handle
bubblings[this.id] = true;
// reset cursor style
$(draggable).css("cursor", "");
// set current drag status
dragStatus[draggable.id] = "handler";
// change handle cursor type
$(handler, this).css("cursor", "move");
// bind event handler
$(handler, this).mousedown(function(e){
holdingHandler = true;
$(draggable).trigger('mousedown', e);
});
// bind event handler
$(handler, this).mouseup(function(e){
holdingHandler = false;
});
});
}
// set an element as draggable - allowBubbling enables/disables event bubbling
$.fn.easydrag = function(allowBubbling){
return this.each(function(){
// if no id is defined assign a unique one
if(undefined == this.id || !this.id.length) this.id = "easydrag"+(new Date().getTime());
// save event bubbling status
bubblings[this.id] = allowBubbling ? true : false;
// set dragStatus
dragStatus[this.id] = "on";
// change the mouse pointer
$(this).css("cursor", "move");
// when an element receives a mouse press
$(this).mousedown(function(e){
// just when "on" or "handler"
if((dragStatus[this.id] == "off") || (dragStatus[this.id] == "handler" && !holdingHandler))
return bubblings[this.id];
// set it as absolute positioned
//$(this).css("position", "absolute");
// set z-index
// $(this).css("z-index", parseInt( new Date().getTime()/1000 ));
// update track variables
isMouseDown = true;
currentElement = this;
// retrieve positioning properties
var pos = $.getMousePosition(e);
lastMouseX = pos.x;
lastMouseY = pos.y;
lastElemTop = this.offsetTop;
lastElemLeft = this.offsetLeft;
return bubblings[this.id];
});
});
};
})(jQuery);
