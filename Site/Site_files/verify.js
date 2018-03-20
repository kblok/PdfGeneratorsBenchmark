setTimeout(function(){
    'use strict';
    try{
        var stringifyFunc = null;
		if(window.JSON){
			stringifyFunc = window.JSON.stringify;
		} else {
			if(window.parent && window.parent.JSON){
				stringifyFunc = window.parent.JSON.stringify;
			}
		}
		if(!stringifyFunc){
			return;
		}
        var msg = {
            action: 'notifyBrandShieldAdEntityInformation',
            bsAdEntityInformation: {
                brandShieldId:'82694301cf684351aab2b18b96ede596',
                comparisonItems:[{name : 'cmp', value : 12069681},{name : 'plmt', value : 12470867}]
            }
        };
        var msgString = stringifyFunc(msg);
        var bst2tWin = null;

        var findAndSendMessage = function() {
            if (!bst2tWin) {
                var frame = document.getElementById('bst2t_569476230631');
                if (frame) {
                    bst2tWin = frame.contentWindow;
                }
            }

            if (bst2tWin) {
                bst2tWin.postMessage(msgString, '*');
            }
        };

        findAndSendMessage();
        setTimeout(findAndSendMessage, 50);
        setTimeout(findAndSendMessage, 500);
    } catch(err){}
}, 10);
(function() {var dvObj = $dvbs;var impId = '82694301cf684351aab2b18b96ede596';var dvParams = {'useDvp': 'false','logRate': '100'};dvObj.pubSub.subscribe(dvObj==window.$dv?"ImpressionServed":"BeforeDecisionRender",impId,"BHL", function() {function f(){var c="true"===dvParams.useDvp?"dvp_":"",d="";this.exec=function(){var a={},b;a:{try{b=history.length;break a}catch(e){d+="|"+e.message}b=void 0}b&&(a[c+"brh"]=b);c&&d&&(a.dvp_brherr=d);try{a&&dvObj.registerEventCall(impId,a)}catch(e){}}}try{(new f).exec()}catch(c){};});})();$dvbs.pubSub.subscribe("AfterDecisionRender",'82694301cf684351aab2b18b96ede596',"PerformanceCollector", 
                function() { 
                    try { 
                        if (typeof(_dv_win) == 'undefined' || typeof($dvbs) == 'undefined' || typeof($dvbs.tags) == 'undefined' || typeof($dvbs.tags['82694301cf684351aab2b18b96ede596']) == 'undefined' || typeof($dvbs.tags['82694301cf684351aab2b18b96ede596'].perf) == 'undefined') return; 
                        var perf = {}; 
                        for (var i = 0; i < $dvbs.tags['82694301cf684351aab2b18b96ede596'].perf.count; i++) { 
                            perf['dvp_r' + i] = $dvbs.tags['82694301cf684351aab2b18b96ede596'].perf['r' + i] 
                        } 

                        var guid = '569476230631'; 
                        if (window.performance && typeof(window.performance.getEntries) === 'function') 
                            var perfEntries = window.performance.getEntries(); 
                        var duration = -1; 
                        if (perfEntries) { 
                            for (var i = 0; i < perfEntries.length; i++) { 
                                var entry = perfEntries[i]; 
                                var regexStr = 'verify\.js.*' + guid; 
                                if ((new RegExp(regexStr, 'i')).test(entry.name)) 
                                    duration = Math.floor(entry.duration); 
                            } 
                        } 
                        perf.dvp_fetchd = duration; 
                        $dvbs.registerEventCall('82694301cf684351aab2b18b96ede596', perf, 0) 
                    } catch (e) {} 
                });(function() {var dvObj = $dvbs;var impId = '82694301cf684351aab2b18b96ede596';dvObj.pubSub.subscribe(dvObj==window.$dv?"ImpressionServed":"BeforeDecisionRender",impId,"CTITS",function(){var a=-1;try{top.frames&&(a=top.frames.length),dvObj.registerEventCall(impId,{fcifrms:a})}catch(b){}});})();var dvObj = $dvbs;function np764531(g,i){function d(){function d(){function f(b,a){b=(i?"dvp_":"")+b;e[b]=a}var e={},a=function(b){for(var a=[],c=0;c<b.length;c+=2)a.push(String.fromCharCode(parseInt(b.charAt(c)+b.charAt(c+1),32)));return a.join("")},h=window[a("3e313m3937313k3f3i")];h&&(a=h[a("3g3c313k363f3i3d")],f("pltfrm",a));(function(){var a=e;e={};dvObj.registerEventCall(g,a,2E3,true)})()}try{d()}catch(f){}}try{dvObj.pubSub.subscribe(dvObj==window.$dv?"ImpressionServed":"BeforeDecisionRender",g,"np764531",d)}catch(f){}}
;np764531("82694301cf684351aab2b18b96ede596",false);


try{__tagObject_callback_569476230631({ImpressionID:"82694301cf684351aab2b18b96ede596", ServerPublicDns:"tps701.doubleverify.com"});}catch(e){}
try{$dvbs.pubSub.publish('BeforeDecisionRender', "82694301cf684351aab2b18b96ede596");}catch(e){}
try{__verify_callback_569476230631({
ResultID:2,
Passback:"",
AdWidth:300,
AdHeight:250});}catch(e){}
try{$dvbs.pubSub.publish('AfterDecisionRender', "82694301cf684351aab2b18b96ede596");}catch(e){}
