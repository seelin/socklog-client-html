var websocket=null;
var websocket_timeout=0;
function ws_init()
{
    if(websocket)
    {
        //避免重复监听
        websocket.onclose=function(){};//onclose 函数置空，防止重复链接
        websocket.close(); 
    }
	req=GetRequest();
    var client_id=req.client_id;
    var address='';

	if(req.host){
	   address='ws://'+decodeURIComponent(req.host);
	}else{
	  var daddress=localStorage.getItem('address');
	  if(daddress){
	      address=daddress;
	  }else{
	      address="ws://dev.zlo2o.cn:1229"; 
	  }
	}
	
    if(client_id)
    {
        //client_id作为地址
        address+='/'+client_id;     
    }else{
	    var dclient_id=localStorage.getItem('client_id');
		if(dclient_id){
		  address+='/'+dclient_id;
		}
	}
	console.log('address:'+address);
    websocket=new WebSocket(address);
    websocket.onerror=function(msg)
    {
        clearTimeout(websocket_timeout);
        websocket_timeout=setTimeout(ws_init,2000);
        localStorage.setItem('status','error');
        disable_icon();

    };

    websocket.onclose=function()
    {
        setTimeout(function(){
            clearTimeout(websocket_timeout);
            websocket_timeout=setTimeout(ws_init,2000);
        },1000);
        localStorage.setItem('status','close');
        disable_icon();
    }

    websocket.onopen=function()
    {
        localStorage.setItem('status','open');
        enable_icon(); 
		console.log('status:open');
    }

    websocket.onmessage=function(event){
        var check_error=function()
        {
            if(event.data.indexOf('SocketLog error handler')!='-1')
            {
               var opt = {
                  type: "basic",
                  title: "注意",
                  message: "有异常报错，请注意查看console 控制台中的日志",
                  iconUrl: "logo.png"
                };
                console.log(opt);
            }


            if(event.data.indexOf('[NO WHERE]')!='-1')
            {
                var opt = {
                  type: "basic",
                  title: "注意",
                  message: "存在没有WHERE语句的操作sql语句",
                  iconUrl: "logo.png"
                };
                console.log(opt);
            }

        };
       
        try
        {
          var data=JSON.parse(event.data);	
        }
        catch(e)
        {
           if(0==event.data.indexOf('close:')){
             websocket.onclose=function(){};//onclose 函数置空，防止重复链接
             alert('此client_id不允许连接服务');
           }else{
             alert('日志格式错误，'+event.data);
           }
           return ; 
        }
		finally{ 
		   if(req.console&&req.console=='1')
			{
		       console.log(data.logs);
			} else {
			  write_log(data);
			}
		} 
    };
}


function write_log(data){
   logs=data.logs;
   for(i in data.logs){
		  obj=logs[i];
		  if(obj.type=='log'){ 
			  if(typeof obj.msg == 'object')
			  {
			     write_obj(i,obj.msg);
			  }else{
			     log.info(obj.msg);
			  }
		  }else if(obj.type=='group'){
		       log.group(obj.msg);
		  }if(obj.type=='groupEnd'){
		       log.groupEnd();
		  }
   }
}

function write_obj(k,obj){
	if(typeof(k)=='number'){
	 log.group(k,false);
	}else{
	  log.group('"'+k+'"',false);
	}
  for(i in obj){
      l=obj[i];
	   if(l == null){
	       log.info('['+i+':null]');
	   }else if(typeof(l)=='undefined'){
           log.info('['+i+':undefined]');
       }else if(typeof(l)=='number'){
           log.info('['+i+':'+l+']');
	    }else if(typeof(l)=='boolean'){
			if(l){
               log.info('['+i+':true]');
			}else{
			   log.info('['+i+':false]');
			}
	   }else if(typeof(l) == 'object'){
	       write_obj2(i,l); 
	    }else{
	      log.info('['+i+':"'+l+'"]');
	  }  
  }
 log.groupEnd();
}

function write_obj2(k,obj){
	if(typeof(k)=='number'){
	 log.group(k,false);
	}else{
	  log.group('"'+k+'"',false);
	}
  for(i in obj){
      l=obj[i];
      if(l == null){
	       log.info('['+i+':null]');
	   }else if(typeof(l)=='undefined'){
           log.info('['+i+':undefined]');
       }else if(typeof(l)=='number'){
           log.info('['+i+':'+l+']');
	    }else if(typeof(l)=='boolean'){
			if(l){
               log.info('['+i+':true]');
			}else{
			   log.info('['+i+':false]');
			}
	   }else if(typeof(l) == 'object'){
	        log.info(JSON.stringify(l));
	    }else{
	      log.info('['+i+':"'+l+'"]');
	  }
  }
 log.groupEnd();
}

function ws_restart()
{
    ws_init();
}


function enable_icon() {
    //chrome.browserAction.setIcon({
    //    path: "logo.png"
   // });
}

function disable_icon() {
    //chrome.browserAction.setIcon({
    //    path: "logo_disabled.png"
    //});
}
ws_init();

function url_exp(url)
{
    var splatParam    = /\*/g;
    var escapeRegExp  = /[-[\]{}()+?.,\\^$#\s]/g;
    url = url.replace(escapeRegExp, '\\$&')
        .replace(splatParam, '(.*?)');
    return new RegExp(url, 'i');
} 

 
 