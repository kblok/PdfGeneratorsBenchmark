
function dv_rolloutManager(handlersDefsArray, baseHandler) {
    this.handle = function () {
        var errorsArr = [];

        var handler = chooseEvaluationHandler(handlersDefsArray);
        if (handler) {
            var errorObj = handleSpecificHandler(handler);
            if (errorObj === null) {
                return errorsArr;
            }
            else {
                var debugInfo = handler.onFailure();
                if (debugInfo) {
                    for (var key in debugInfo) {
                        if (debugInfo.hasOwnProperty(key)) {
                            if (debugInfo[key] !== undefined || debugInfo[key] !== null) {
                                errorObj[key] = encodeURIComponent(debugInfo[key]);
                            }
                        }
                    }
                }
                errorsArr.push(errorObj);
            }
        }

        var errorObjHandler = handleSpecificHandler(baseHandler);
        if (errorObjHandler) {
            errorObjHandler['dvp_isLostImp'] = 1;
            errorsArr.push(errorObjHandler);
        }
        return errorsArr;
    };

    function handleSpecificHandler(handler) {
        var request;
        var errorObj = null;

        try {
            request = handler.createRequest();
            if (request && !request.isSev1) {
                var url = request.url || request;
                if (url) {
                    if (!handler.sendRequest(url)) {
                        errorObj = createAndGetError('sendRequest failed.',
                            url,
                            handler.getVersion(),
                            handler.getVersionParamName(),
                            handler.dv_script);
                    }
                } else {
                    errorObj = createAndGetError('createRequest failed.',
                        url,
                        handler.getVersion(),
                        handler.getVersionParamName(),
                        handler.dv_script,
                        handler.dvScripts,
                        handler.dvStep,
                        handler.dvOther
                    );
                }
            }
        }
        catch (e) {
            errorObj = createAndGetError(e.name + ': ' + e.message, request ? (request.url || request) : null, handler.getVersion(), handler.getVersionParamName(), (handler ? handler.dv_script : null));
        }

        return errorObj;
    }

    function createAndGetError(error, url, ver, versionParamName, dv_script, dvScripts, dvStep, dvOther) {
        var errorObj = {};
        errorObj[versionParamName] = ver;
        errorObj['dvp_jsErrMsg'] = encodeURIComponent(error);
        if (dv_script && dv_script.parentElement && dv_script.parentElement.tagName && dv_script.parentElement.tagName == 'HEAD') {
            errorObj['dvp_isOnHead'] = '1';
        }
        if (url) {
            errorObj['dvp_jsErrUrl'] = url;
        }
        if (dvScripts) {
            var dvScriptsResult = '';
            for (var id in dvScripts) {
                if (dvScripts[id] && dvScripts[id].src) {
                    dvScriptsResult += encodeURIComponent(dvScripts[id].src) + ":" + dvScripts[id].isContain + ",";
                }
            }
            
            
            
        }
        return errorObj;
    }

    function chooseEvaluationHandler(handlersArray) {
        var config = window._dv_win.dv_config;
        var index = 0;
        var isEvaluationVersionChosen = false;
        if (config.handlerVersionSpecific) {
            for (var i = 0; i < handlersArray.length; i++) {
                if (handlersArray[i].handler.getVersion() == config.handlerVersionSpecific) {
                    isEvaluationVersionChosen = true;
                    index = i;
                    break;
                }
            }
        }
        else if (config.handlerVersionByTimeIntervalMinutes) {
            var date = config.handlerVersionByTimeInputDate || new Date();
            var hour = date.getUTCHours();
            var minutes = date.getUTCMinutes();
            index = Math.floor(((hour * 60) + minutes) / config.handlerVersionByTimeIntervalMinutes) % (handlersArray.length + 1);
            if (index != handlersArray.length) { 
                isEvaluationVersionChosen = true;
            }
        }
        else {
            var rand = config.handlerVersionRandom || (Math.random() * 100);
            for (var i = 0; i < handlersArray.length; i++) {
                if (rand >= handlersArray[i].minRate && rand < handlersArray[i].maxRate) {
                    isEvaluationVersionChosen = true;
                    index = i;
                    break;
                }
            }
        }

        if (isEvaluationVersionChosen == true && handlersArray[index].handler.isApplicable()) {
            return handlersArray[index].handler;
        }
        else {
            return null;
        }
    }
}

function doesBrowserSupportHTML5Push() {
    "use strict";
    return typeof window.parent.postMessage === 'function' && window.JSON;
}

function dv_GetParam(url, name, checkFromStart) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = (checkFromStart ? "(?:\\?|&|^)" : "[\\?&]") + name + "=([^&#]*)";
    var regex = new RegExp(regexS, 'i');
    var results = regex.exec(url);
    if (results == null)
        return null;
    else
        return results[1];
}

function dv_Contains(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

function dv_GetDynamicParams(url) {
    try {
        var regex = new RegExp("[\\?&](dvp_[^&]*=[^&#]*)", "gi");
        var dvParams = regex.exec(url);

        var results = new Array();
        while (dvParams != null) {
            results.push(dvParams[1]);
            dvParams = regex.exec(url);
        }
        return results;
    }
    catch (e) {
        return [];
    }
}

function dv_createIframe() {
    var iframe;
    if (document.createElement && (iframe = document.createElement('iframe'))) {
        iframe.name = iframe.id = 'iframe_' + Math.floor((Math.random() + "") * 1000000000000);
        iframe.width = 0;
        iframe.height = 0;
        iframe.style.display = 'none';
        iframe.src = 'about:blank';
    }

    return iframe;
}

function dv_GetRnd() {
    return ((new Date()).getTime() + "" + Math.floor(Math.random() * 1000000)).substr(0, 16);
}

function dv_SendErrorImp(serverUrl, errorsArr) {

    for (var j = 0; j < errorsArr.length; j++) {
        var errorObj = errorsArr[j];
        var errorImp = dv_CreateAndGetErrorImp(serverUrl, errorObj);
        dv_sendImgImp(errorImp);
    }
}

function dv_CreateAndGetErrorImp(serverUrl, errorObj) {
    var errorQueryString = '';
    for (key in errorObj) {
        if (errorObj.hasOwnProperty(key)) {
            if (key.indexOf('dvp_jsErrUrl') == -1) {
                errorQueryString += '&' + key + '=' + errorObj[key];
            }
            else {
                var params = ['ctx', 'cmp', 'plc', 'sid'];
                for (var i = 0; i < params.length; i++) {
                    var pvalue = dv_GetParam(errorObj[key], params[i]);
                    if (pvalue) {
                        errorQueryString += '&dvp_js' + params[i] + '=' + pvalue;
                    }
                }
            }
        }
    }

    var windowProtocol = 'https:';
    var sslFlag = '&ssl=1';

    var errorImp = windowProtocol + '//' + serverUrl + sslFlag + errorQueryString;
    return errorImp;
}

function dv_sendImgImp(url) {
    (new Image()).src = url;
}

function dv_sendScriptRequest(url) {
    document.write('<scr' + 'ipt type="text/javascript" src="' + url + '"></scr' + 'ipt>');
}

function dv_getPropSafe(obj, propName) {
    try {
        if (obj)
            return obj[propName];
    } catch (e) {
    }
}

function dvBsType() {
    var that = this;
    var eventsForDispatch = {};
    this.t2tEventDataZombie = {};

    this.processT2TEvent = function (data, tag) {
        try {
            if (tag.ServerPublicDns) {
                data.timeStampCollection.push({"beginProcessT2TEvent": getCurrentTime()});
                data.timeStampCollection.push({'beginVisitCallback': tag.beginVisitCallbackTS});
                var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;

                if (!tag.uniquePageViewId) {
                    tag.uniquePageViewId = data.uniquePageViewId;
                }

                tpsServerUrl += '&dvp_upvid=' + tag.uniquePageViewId;
                tpsServerUrl += '&dvp_numFrames=' + data.totalIframeCount;
                tpsServerUrl += '&dvp_numt2t=' + data.totalT2TiframeCount;
                tpsServerUrl += '&dvp_frameScanDuration=' + data.scanAllFramesDuration;
                tpsServerUrl += '&dvp_scene=' + tag.adServingScenario;
                tpsServerUrl += '&dvp_ist2twin=' + (data.isWinner ? '1' : '0');
                tpsServerUrl += '&dvp_numTags=' + Object.keys($dvbs.tags).length;
                tpsServerUrl += '&dvp_isInSample=' + data.isInSample;
                tpsServerUrl += (data.wasZombie) ? '&dvp_wasZombie=1' : '&dvp_wasZombie=0';
                tpsServerUrl += '&dvp_ts_t2tCreatedOn=' + data.creationTime;
                if (data.timeStampCollection) {
                    if (window._dv_win.t2tTimestampData) {
                        for (var tsI = 0; tsI < window._dv_win.t2tTimestampData.length; tsI++) {
                            data.timeStampCollection.push(window._dv_win.t2tTimestampData[tsI]);
                        }
                    }

                    for (var i = 0; i < data.timeStampCollection.length; i++) {
                        var item = data.timeStampCollection[i];
                        for (var propName in item) {
                            if (item.hasOwnProperty(propName)) {
                                tpsServerUrl += '&dvp_ts_' + propName + '=' + item[propName];
                            }
                        }
                    }
                }
                $dvbs.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
            }
        } catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_ist2tProcess=1', {dvp_jsErrMsg: encodeURIComponent(e)});
            } catch (ex) {
            }
        }
    };

    this.processTagToTagCollision = function (collision, tag) {
        var i;
        var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;
        var additions = [
            '&dvp_collisionReasons=' + collision.reasonBitFlag,
            '&dvp_ts_reporterDvTagCreated=' + collision.thisTag.dvTagCreatedTS,
            '&dvp_ts_reporterVisitJSMessagePosted=' + collision.thisTag.visitJSPostMessageTS,
            '&dvp_ts_reporterReceivedByT2T=' + collision.thisTag.receivedByT2TTS,
            '&dvp_ts_collisionPostedFromT2T=' + collision.postedFromT2TTS,
            '&dvp_ts_collisionReceivedByCommon=' + collision.commonRecievedTS,
            '&dvp_collisionTypeId=' + collision.allReasonsForTagBitFlag
        ];
        tpsServerUrl += additions.join("");

        for (i = 0; i < collision.reasons.length; i++) {
            var reason = collision.reasons[i];
            tpsServerUrl += '&dvp_' + reason + "MS=" + collision[reason + "MS"];
        }

        if (tag.uniquePageViewId) {
            tpsServerUrl += '&dvp_upvid=' + tag.uniquePageViewId;
        }
        $dvbs.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
    };

    var messageEventListener = function (event) {
        try {
            var timeCalled = getCurrentTime();
            var data = window.JSON.parse(event.data);
            if (!data.action) {
                data = window.JSON.parse(data);
            }
            if (data.timeStampCollection) {
                data.timeStampCollection.push({messageEventListenerCalled: timeCalled});
            }
            var myUID;
            var visitJSHasBeenCalledForThisTag = false;
            if ($dvbs.tags) {
                for (var uid in $dvbs.tags) {
                    if ($dvbs.tags.hasOwnProperty(uid) && $dvbs.tags[uid] && $dvbs.tags[uid].t2tIframeId === data.iFrameId) {
                        myUID = uid;
                        visitJSHasBeenCalledForThisTag = true;
                        break;
                    }
                }
            }

            switch (data.action) {
                case 'uniquePageViewIdDetermination' :
                    if (visitJSHasBeenCalledForThisTag) {
                        $dvbs.processT2TEvent(data, $dvbs.tags[myUID]);
                        $dvbs.t2tEventDataZombie[data.iFrameId] = undefined;
                    }
                    else {
                        data.wasZombie = 1;
                        $dvbs.t2tEventDataZombie[data.iFrameId] = data;
                    }
                    break;
                case 'maColl':
                    var tag = $dvbs.tags[myUID];
                    
                    tag.AdCollisionMessageRecieved = true;
                    if (!tag.uniquePageViewId) {
                        tag.uniquePageViewId = data.uniquePageViewId;
                    }
                    data.collision.commonRecievedTS = timeCalled;
                    $dvbs.processTagToTagCollision(data.collision, tag);
                    break;
            }

        } catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_ist2tListener=1', {dvp_jsErrMsg: encodeURIComponent(e)});
            } catch (ex) {
            }
        }
    };

    if (window.addEventListener)
        addEventListener("message", messageEventListener, false);
    else
        attachEvent("onmessage", messageEventListener);

    this.pubSub = new function () {

        var subscribers = [];

        this.subscribe = function (eventName, uid, actionName, func) {
            if (!subscribers[eventName + uid])
                subscribers[eventName + uid] = [];
            subscribers[eventName + uid].push({Func: func, ActionName: actionName});
        };

        this.publish = function (eventName, uid) {
            var actionsResults = [];
            if (eventName && uid && subscribers[eventName + uid] instanceof Array)
                for (var i = 0; i < subscribers[eventName + uid].length; i++) {
                    var funcObject = subscribers[eventName + uid][i];
                    if (funcObject && funcObject.Func && typeof funcObject.Func == "function" && funcObject.ActionName) {
                        var isSucceeded = runSafely(function () {
                            return funcObject.Func(uid);
                        });
                        actionsResults.push(encodeURIComponent(funcObject.ActionName) + '=' + (isSucceeded ? '1' : '0'));
                    }
                }
            return actionsResults.join('&');
        };
    };

    this.domUtilities = new function () {

        this.addImage = function (url, parentElement, trackingPixelCompleteCallbackName) {
            var image = parentElement.ownerDocument.createElement("img");
            image.width = 0;
            image.height = 0;
            image.style.display = 'none';
            if (trackingPixelCompleteCallbackName && typeof window[trackingPixelCompleteCallbackName] === "function") {
                image.addEventListener("load", window[trackingPixelCompleteCallbackName]);
            }
            image.src = appendCacheBuster(url);
            parentElement.insertBefore(image, parentElement.firstChild);
        };

        this.addScriptResource = function (url, parentElement) {
            if (parentElement) {
                var scriptElem = parentElement.ownerDocument.createElement("script");
                scriptElem.type = 'text/javascript';
                scriptElem.src = appendCacheBuster(url);
                parentElement.insertBefore(scriptElem, parentElement.firstChild);
            }
            else {
                addScriptResourceFallBack(url);
            }
        };

        function addScriptResourceFallBack(url) {
            var scriptElem = document.createElement('script');
            scriptElem.type = "text/javascript";
            scriptElem.src = appendCacheBuster(url);
            var firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(scriptElem, firstScript);
        }

        this.addScriptCode = function (srcCode, parentElement) {
            var scriptElem = parentElement.ownerDocument.createElement("script");
            scriptElem.type = 'text/javascript';
            scriptElem.innerHTML = srcCode;
            parentElement.insertBefore(scriptElem, parentElement.firstChild);
        };

        this.addHtml = function (srcHtml, parentElement) {
            var divElem = parentElement.ownerDocument.createElement("div");
            divElem.style = "display: inline";
            divElem.innerHTML = srcHtml;
            parentElement.insertBefore(divElem, parentElement.firstChild);
        };
    };

    this.resolveMacros = function (str, tag) {
        var viewabilityData = tag.getViewabilityData();
        var viewabilityBuckets = viewabilityData && viewabilityData.buckets ? viewabilityData.buckets : {};
        var upperCaseObj = objectsToUpperCase(tag, viewabilityData, viewabilityBuckets);
        var newStr = str.replace('[DV_PROTOCOL]', upperCaseObj.DV_PROTOCOL);
        newStr = newStr.replace('[PROTOCOL]', upperCaseObj.PROTOCOL);
        newStr = newStr.replace(/\[(.*?)\]/g, function (match, p1) {
            var value = upperCaseObj[p1];
            if (value === undefined || value === null)
                value = '[' + p1 + ']';
            return encodeURIComponent(value);
        });
        return newStr;
    };

    this.settings = new function () {
    };

    this.tagsType = function () {
    };

    this.tagsPrototype = function () {
        this.add = function (tagKey, obj) {
            if (!that.tags[tagKey])
                that.tags[tagKey] = new that.tag();
            for (var key in obj)
                that.tags[tagKey][key] = obj[key];
        };
    };

    this.tagsType.prototype = new this.tagsPrototype();
    this.tagsType.prototype.constructor = this.tags;
    this.tags = new this.tagsType();

    this.tag = function () {
    };
    this.tagPrototype = function () {
        this.set = function (obj) {
            for (var key in obj)
                this[key] = obj[key];
        };

        this.getViewabilityData = function () {
        };
    };

    this.tag.prototype = new this.tagPrototype();
    this.tag.prototype.constructor = this.tag;

    this.getTagObjectByService = function (serviceName) {

        for (var impressionId in this.tags) {
            if (typeof this.tags[impressionId] === 'object'
                && this.tags[impressionId].services
                && this.tags[impressionId].services[serviceName]
                && !this.tags[impressionId].services[serviceName].isProcessed) {
                this.tags[impressionId].services[serviceName].isProcessed = true;
                return this.tags[impressionId];
            }
        }


        return null;
    };

    this.addService = function (impressionId, serviceName, paramsObject) {

        if (!impressionId || !serviceName)
            return;

        if (!this.tags[impressionId])
            return;
        else {
            if (!this.tags[impressionId].services)
                this.tags[impressionId].services = {};

            this.tags[impressionId].services[serviceName] = {
                params: paramsObject,
                isProcessed: false
            };
        }
    };

    this.Enums = {
        BrowserId: {Others: 0, IE: 1, Firefox: 2, Chrome: 3, Opera: 4, Safari: 5},
        TrafficScenario: {OnPage: 1, SameDomain: 2, CrossDomain: 128}
    };

    this.CommonData = {};

    var runSafely = function (action) {
        try {
            var ret = action();
            return ret !== undefined ? ret : true;
        } catch (e) {
            return false;
        }
    };

    var objectsToUpperCase = function () {
        var upperCaseObj = {};
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    upperCaseObj[key.toUpperCase()] = obj[key];
                }
            }
        }
        return upperCaseObj;
    };

    var appendCacheBuster = function (url) {
        if (url !== undefined && url !== null && url.match("^http") == "http") {
            if (url.indexOf('?') !== -1) {
                if (url.slice(-1) == '&')
                    url += 'cbust=' + dv_GetRnd();
                else
                    url += '&cbust=' + dv_GetRnd();
            }
            else
                url += '?cbust=' + dv_GetRnd();
        }
        return url;
    };

    
    var messagesClass = function () {
        var waitingMessages = [];

        this.registerMsg = function(dvFrame, data) {
            if (!waitingMessages[dvFrame.$frmId]) {
                waitingMessages[dvFrame.$frmId] = [];
            }

            waitingMessages[dvFrame.$frmId].push(data);

            if (dvFrame.$uid) {
                sendWaitingEventsForFrame(dvFrame, dvFrame.$uid);
            }
        };

        this.startSendingEvents = function(dvFrame, impID) {
            sendWaitingEventsForFrame(dvFrame, impID);
            
        };

        function sendWaitingEventsForFrame(dvFrame, impID) {
            if (waitingMessages[dvFrame.$frmId]) {
                var eventObject = {};
                for (var i = 0; i < waitingMessages[dvFrame.$frmId].length; i++) {
                    var obj = waitingMessages[dvFrame.$frmId].pop();
                    for (var key in obj) {
                        if (typeof obj[key] !== 'function' && obj.hasOwnProperty(key)) {
                            eventObject[key] = obj[key];
                        }
                    }
                }
                that.registerEventCall(impID, eventObject);
            }
        }

        function startMessageManager() {
            for (var frm in waitingMessages) {
                if (frm && frm.$uid) {
                    sendWaitingEventsForFrame(frm, frm.$uid);
                }
            }
            setTimeout(startMessageManager, 10);
        }
    };
    this.messages = new messagesClass();

    this.dispatchRegisteredEventsFromAllTags = function () {
        for (var impressionId in this.tags) {
            if (typeof this.tags[impressionId] !== 'function' && typeof this.tags[impressionId] !== 'undefined')
                dispatchEventCalls(impressionId, this);
        }
    };

    var dispatchEventCalls = function (impressionId, dvObj) {
        var tag = dvObj.tags[impressionId];
        var eventObj = eventsForDispatch[impressionId];
        if (typeof eventObj !== 'undefined' && eventObj != null) {
            var url = tag.protocol + '//' + tag.ServerPublicDns + "/bsevent.gif?impid=" + impressionId + '&' + createQueryStringParams(eventObj);
            dvObj.domUtilities.addImage(url, tag.tagElement.parentElement);
            eventsForDispatch[impressionId] = null;
        }
    };

    this.registerEventCall = function (impressionId, eventObject, timeoutMs) {
        addEventCallForDispatch(impressionId, eventObject);

        if (typeof timeoutMs === 'undefined' || timeoutMs == 0 || isNaN(timeoutMs))
            dispatchEventCallsNow(this, impressionId, eventObject);
        else {
            if (timeoutMs > 2000)
                timeoutMs = 2000;

            var dvObj = this;
            setTimeout(function () {
                dispatchEventCalls(impressionId, dvObj);
            }, timeoutMs);
        }
    };

    var dispatchEventCallsNow = function (dvObj, impressionId, eventObject) {
        addEventCallForDispatch(impressionId, eventObject);
        dispatchEventCalls(impressionId, dvObj);
    };

    var addEventCallForDispatch = function (impressionId, eventObject) {
        for (var key in eventObject) {
            if (typeof eventObject[key] !== 'function' && eventObject.hasOwnProperty(key)) {
                if (!eventsForDispatch[impressionId])
                    eventsForDispatch[impressionId] = {};
                eventsForDispatch[impressionId][key] = eventObject[key];
            }
        }
    };

    if (window.addEventListener) {
        window.addEventListener('unload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
        window.addEventListener('beforeunload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
    }
    else if (window.attachEvent) {
        window.attachEvent('onunload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
        window.attachEvent('onbeforeunload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
    }
    else {
        window.document.body.onunload = function () {
            that.dispatchRegisteredEventsFromAllTags();
        };
        window.document.body.onbeforeunload = function () {
            that.dispatchRegisteredEventsFromAllTags();
        };
    }

    var createQueryStringParams = function (values) {
        var params = '';
        for (var key in values) {
            if (typeof values[key] !== 'function') {
                var value = encodeURIComponent(values[key]);
                if (params === '')
                    params += key + '=' + value;
                else
                    params += '&' + key + '=' + value;
            }
        }

        return params;
    };
}

function dv_baseHandler(){function M(){var b="http:";"http:"!=window._dv_win.location.protocol&&(b="https:");return b}function I(b,c){var e=document.createElement("iframe");e.name=window._dv_win.dv_config.emptyIframeID||"iframe_"+F();e.width=0;e.height=0;e.id=c;e.style.display="none";e.src=b;return e}function G(b,c,e){e=e||150;var f=window._dv_win||window;if(f.document&&f.document.body)return c&&c.parentNode?c.parentNode.insertBefore(b,c):f.document.body.insertBefore(b,f.document.body.firstChild),
!0;if(0<e)setTimeout(function(){G(b,c,--e)},20);else return!1}function N(b){var c=window._dv_win.dv_config=window._dv_win.dv_config||{};c.cdnAddress=c.cdnAddress||"cdn.doubleverify.com";return'<html><head><script type="text/javascript">('+function(){try{window.$dv=window.$dvbs||parent.$dvbs,window.$dv.dvObjType="dvbs"}catch(e){}}.toString()+')();\x3c/script></head><body><script type="text/javascript">('+(b||"function() {}")+')("'+c.cdnAddress+'");\x3c/script><script type="text/javascript">setTimeout(function() {document.close();}, 0);\x3c/script></body></html>'}
function O(b){var c=null;try{if(c=b&&b.contentDocument)return c}catch(e){}try{if(c=b.contentWindow&&b.contentWindow.document)return c}catch(e){}try{if(c=window._dv_win.frames&&window._dv_win.frames[b.name]&&window._dv_win.frames[b.name].document)return c}catch(e){}return null}function J(b){var c=0,e;for(e in b)b.hasOwnProperty(e)&&++c;return c}function P(b,c){a:{var e={};try{if(b&&b.performance&&b.performance.getEntries){var f=b.performance.getEntries();for(b=0;b<f.length;b++){var d=f[b],g=d.name.match(/.*\/(.+?)\./);
if(g&&g[1]){var m=g[1].replace(/\d+$/,""),h=c[m];if(h){for(var u=0;u<h.stats.length;u++){var v=h.stats[u];e[h.prefix+v.prefix]=Math.round(d[v.name])}delete c[m];if(!J(c))break}}}}var l=e;break a}catch(n){}l=void 0}if(l&&J(l))return l}function Q(b,c){var e,f=window._dv_win.document.visibilityState;window[b.tagObjectCallbackName]=function(d){var g=window._dv_win.$dvbs;if(g){var m=c?"https:":M();e=d.ImpressionID;g.tags.add(d.ImpressionID,b);g.tags[d.ImpressionID].set({tagElement:b.script,impressionId:d.ImpressionID,
dv_protocol:b.protocol,protocol:m,uid:b.uid,serverPublicDns:d.ServerPublicDns,ServerPublicDns:d.ServerPublicDns});b.script&&b.script.dvFrmWin&&(b.script.dvFrmWin.$uid=d.ImpressionID,g.messages&&g.messages.startSendingEvents&&g.messages.startSendingEvents(b.script.dvFrmWin,d.ImpressionID));(function(){function g(){var c=window._dv_win.document.visibilityState;"prerender"===f&&"prerender"!==c&&"unloaded"!==c&&(f=c,window._dv_win.$dvbs.registerEventCall(d.ImpressionID,{prndr:0}),window._dv_win.document.removeEventListener(b,
g))}if("prerender"===f)if("prerender"!==window._dv_win.document.visibilityState&&"unloaded"!==visibilityStateLocal)window._dv_win.$dvbs.registerEventCall(d.ImpressionID,{prndr:0});else{var b;"undefined"!==typeof window._dv_win.document.hidden?b="visibilitychange":"undefined"!==typeof window._dv_win.document.mozHidden?b="mozvisibilitychange":"undefined"!==typeof window._dv_win.document.msHidden?b="msvisibilitychange":"undefined"!==typeof window._dv_win.document.webkitHidden&&(b="webkitvisibilitychange");
window._dv_win.document.addEventListener(b,g,!1)}})()}try{var h=P(window,{verify:{prefix:"vf",stats:[{name:"duration",prefix:"dur"}]}});h&&window._dv_win.$dvbs.registerEventCall(d.ImpressionID,h)}catch(u){}};window[b.callbackName]=function(d){var g=window._dv_win.$dvbs&&"object"==typeof window._dv_win.$dvbs.tags[e]?window._dv_win.$dvbs.tags[e]:b;var c=window._dv_win.dv_config.bs_renderingMethod||function(b){document.write(b)};switch(d.ResultID){case 1:g.tagPassback?c(g.tagPassback):d.Passback?c(decodeURIComponent(d.Passback)):
d.AdWidth&&d.AdHeight&&c(decodeURIComponent("%3Cstyle%3E%0A.dvbs_container%20%7B%0A%09border%3A%201px%20solid%20%233b599e%3B%0A%09overflow%3A%20hidden%3B%0A%09filter%3A%20progid%3ADXImageTransform.Microsoft.gradient(startColorstr%3D%27%23315d8c%27%2C%20endColorstr%3D%27%2384aace%27)%3B%0A%09%2F*%20for%20IE%20*%2F%0A%09background%3A%20-webkit-gradient(linear%2C%20left%20top%2C%20left%20bottom%2C%20from(%23315d8c)%2C%20to(%2384aace))%3B%0A%09%2F*%20for%20webkit%20browsers%20*%2F%0A%09background%3A%20-moz-linear-gradient(top%2C%20%23315d8c%2C%20%2384aace)%3B%0A%09%2F*%20for%20firefox%203.6%2B%20*%2F%0A%7D%0A.dvbs_cloud%20%7B%0A%09color%3A%20%23fff%3B%0A%09position%3A%20relative%3B%0A%09font%3A%20100%25%22Times%20New%20Roman%22%2C%20Times%2C%20serif%3B%0A%09text-shadow%3A%200px%200px%2010px%20%23fff%3B%0A%09line-height%3A%200%3B%0A%7D%0A%3C%2Fstyle%3E%0A%3Cscript%20type%3D%22text%2Fjavascript%22%3E%0A%09function%0A%20%20%20%20cloud()%7B%0A%09%09var%20b1%20%3D%20%22%3Cdiv%20class%3D%5C%22dvbs_cloud%5C%22%20style%3D%5C%22font-size%3A%22%3B%0A%09%09var%20b2%3D%22px%3B%20position%3A%20absolute%3B%20top%3A%20%22%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2234px%3B%20left%3A%2028px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2246px%3B%20left%3A%2010px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2246px%3B%20left%3A50px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%09%09document.write(b1%20%2B%20%22400px%3B%20width%3A%20400px%3B%20height%3A%20400%22%20%2B%20b2%20%2B%20%2224px%3B%20left%3A20px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%20%20%20%20%7D%0A%20%20%20%20%0A%09function%20clouds()%7B%0A%20%20%20%20%20%20%20%20var%20top%20%3D%20%5B%27-80%27%2C%2780%27%2C%27240%27%2C%27400%27%5D%3B%0A%09%09var%20left%20%3D%20-10%3B%0A%20%20%20%20%20%20%20%20var%20a1%20%3D%20%22%3Cdiv%20style%3D%5C%22position%3A%20relative%3B%20top%3A%20%22%3B%0A%09%09var%20a2%20%3D%20%22px%3B%20left%3A%20%22%3B%0A%20%20%20%20%20%20%20%20var%20a3%3D%20%22px%3B%5C%22%3E%3Cscr%22%2B%22ipt%20type%3D%5C%22text%5C%2Fjavascr%22%2B%22ipt%5C%22%3Ecloud()%3B%3C%5C%2Fscr%22%2B%22ipt%3E%3C%5C%2Fdiv%3E%22%3B%0A%20%20%20%20%20%20%20%20for(i%3D0%3B%20i%20%3C%208%3B%20i%2B%2B)%20%7B%0A%09%09%09document.write(a1%2Btop%5B0%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B1%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B2%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B3%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09if(i%3D%3D4)%0A%09%09%09%7B%0A%09%09%09%09left%20%3D-%2090%3B%0A%09%09%09%09top%20%3D%20%5B%270%27%2C%27160%27%2C%27320%27%2C%27480%27%5D%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%20%0A%09%09%09%09left%20%2B%3D%20160%3B%0A%09%09%7D%0A%09%7D%0A%0A%3C%2Fscript%3E%0A%3Cdiv%20class%3D%22dvbs_container%22%20style%3D%22width%3A%20"+
d.AdWidth+"px%3B%20height%3A%20"+d.AdHeight+"px%3B%22%3E%0A%09%3Cscript%20type%3D%22text%2Fjavascript%22%3Eclouds()%3B%3C%2Fscript%3E%0A%3C%2Fdiv%3E"));break;case 2:case 3:g.tagAdtag&&c(g.tagAdtag);break;case 4:d.AdWidth&&d.AdHeight&&c(decodeURIComponent("%3Cstyle%3E%0A.dvbs_container%20%7B%0A%09border%3A%201px%20solid%20%233b599e%3B%0A%09overflow%3A%20hidden%3B%0A%09filter%3A%20progid%3ADXImageTransform.Microsoft.gradient(startColorstr%3D%27%23315d8c%27%2C%20endColorstr%3D%27%2384aace%27)%3B%0A%7D%0A%3C%2Fstyle%3E%0A%3Cdiv%20class%3D%22dvbs_container%22%20style%3D%22width%3A%20"+
d.AdWidth+"px%3B%20height%3A%20"+d.AdHeight+"px%3B%22%3E%09%0A%3C%2Fdiv%3E"))}}}function R(b){var c=null,e=null,f=function(b){var g=dv_GetParam(b,"cmp");b=dv_GetParam(b,"ctx");return"919838"==b&&"7951767"==g||"919839"==b&&"7939985"==g||"971108"==b&&"7900229"==g||"971108"==b&&"7951940"==g?"</scr'+'ipt>":/<\/scr\+ipt>/g}(b.src);"function"!==typeof String.prototype.trim&&(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")});var d=function(b){!(b=b.previousSibling)||"#text"!=b.nodeName||
null!=b.nodeValue&&void 0!=b.nodeValue&&0!=b.nodeValue.trim().length||(b=b.previousSibling);if(b&&"SCRIPT"==b.tagName&&b.getAttribute("type")&&("text/adtag"==b.getAttribute("type").toLowerCase()||"text/passback"==b.getAttribute("type").toLowerCase())&&""!=b.innerHTML.trim()){if("text/adtag"==b.getAttribute("type").toLowerCase())return c=b.innerHTML.replace(f,"\x3c/script>"),{isBadImp:!1,hasPassback:!1,tagAdTag:c,tagPassback:e};if(null!=e)return{isBadImp:!0,hasPassback:!1,tagAdTag:c,tagPassback:e};
e=b.innerHTML.replace(f,"\x3c/script>");b=d(b);b.hasPassback=!0;return b}return{isBadImp:!0,hasPassback:!1,tagAdTag:c,tagPassback:e}};return d(b)}function K(b,c,e,f,d,g,m,h,u,v){var l;void 0==c.dvregion&&(c.dvregion=0);try{var n=f;for(l=0;10>l&&n!=window._dv_win.top;)l++,n=n.parent;f.depth=l;var k=S(f);var r="&aUrl="+encodeURIComponent(k.url);var A="&aUrlD="+k.depth;var C=f.depth+d;g&&f.depth--}catch(D){A=r=C=f.depth=""}void 0!=c.aUrl&&(r="&aUrl="+c.aUrl);a:{try{if("object"==typeof window.$ovv||"object"==
typeof window.parent.$ovv){var t=1;break a}}catch(D){}t=0}d=c.script.src;t="&ctx="+(dv_GetParam(d,"ctx")||"")+"&cmp="+(dv_GetParam(d,"cmp")||"")+"&plc="+(dv_GetParam(d,"plc")||"")+"&sid="+(dv_GetParam(d,"sid")||"")+"&advid="+(dv_GetParam(d,"advid")||"")+"&adsrv="+(dv_GetParam(d,"adsrv")||"")+"&unit="+(dv_GetParam(d,"unit")||"")+"&isdvvid="+(dv_GetParam(d,"isdvvid")||"")+"&uid="+c.uid+"&tagtype="+(dv_GetParam(d,"tagtype")||"")+"&adID="+(dv_GetParam(d,"adID")||"")+"&app="+(dv_GetParam(d,"app")||"")+
"&sup="+(dv_GetParam(d,"sup")||"")+"&isovv="+t+"&gmnpo="+(dv_GetParam(d,"gmnpo")||"")+"&crt="+(dv_GetParam(d,"crt")||"");(g=dv_GetParam(d,"xff"))&&(t+="&xff="+g);(g=dv_GetParam(d,"useragent"))&&(t+="&useragent="+g);t+="&dup="+dv_GetParam(d,"dup");if(void 0!=window._dv_win.$dvbs.CommonData.BrowserId&&void 0!=window._dv_win.$dvbs.CommonData.BrowserVersion&&void 0!=window._dv_win.$dvbs.CommonData.BrowserIdFromUserAgent)l=window._dv_win.$dvbs.CommonData.BrowserId,n=window._dv_win.$dvbs.CommonData.BrowserVersion,
g=window._dv_win.$dvbs.CommonData.BrowserIdFromUserAgent;else{var p=g?decodeURIComponent(g):navigator.userAgent;l=[{id:4,brRegex:"OPR|Opera",verRegex:"(OPR/|Version/)"},{id:1,brRegex:"MSIE|Trident/7.*rv:11|rv:11.*Trident/7|Edge/",verRegex:"(MSIE |rv:| Edge/)"},{id:2,brRegex:"Firefox",verRegex:"Firefox/"},{id:0,brRegex:"Mozilla.*Android.*AppleWebKit(?!.*Chrome.*)|Linux.*Android.*AppleWebKit.* Version/.*Chrome",verRegex:null},{id:0,brRegex:"AOL/.*AOLBuild/|AOLBuild/.*AOL/|Puffin|Maxthon|Valve|Silk|PLAYSTATION|PlayStation|Nintendo|wOSBrowser",
verRegex:null},{id:3,brRegex:"Chrome",verRegex:"Chrome/"},{id:5,brRegex:"Safari|(OS |OS X )[0-9].*AppleWebKit",verRegex:"Version/"}];g=0;n="";for(k=0;k<l.length;k++)if(null!=p.match(new RegExp(l[k].brRegex))){g=l[k].id;if(null==l[k].verRegex)break;p=p.match(new RegExp(l[k].verRegex+"[0-9]*"));null!=p&&(n=p[0].match(new RegExp(l[k].verRegex)),n=p[0].replace(n[0],""));break}l=k=T();n=k===g?n:"";window._dv_win.$dvbs.CommonData.BrowserId=l;window._dv_win.$dvbs.CommonData.BrowserVersion=n;window._dv_win.$dvbs.CommonData.BrowserIdFromUserAgent=
g}t+="&brid="+l+"&brver="+n+"&bridua="+g;(g=dv_GetParam(d,"turl"))&&(t+="&turl="+g);(g=dv_GetParam(d,"tagformat"))&&(t+="&tagformat="+g);g="";try{var w=window._dv_win.parent;g+="&chro="+(void 0===w.chrome?"0":"1");g+="&hist="+(w.history?w.history.length:"");g+="&winh="+w.innerHeight;g+="&winw="+w.innerWidth;g+="&wouh="+w.outerHeight;g+="&wouw="+w.outerWidth;w.screen&&(g+="&scah="+w.screen.availHeight,g+="&scaw="+w.screen.availWidth)}catch(D){}t+=g;w=U();a:{g=window._dv_win;n=0;try{for(;10>n;){if(g.maple&&
"object"===typeof g.maple){var y=!0;break a}if(g==g.parent)break;n++;g=g.parent}}catch(D){}y=!1}c=(window._dv_win.dv_config.verifyJSURL||c.protocol+"//"+(window._dv_win.dv_config.bsAddress||"rtb"+c.dvregion+".doubleverify.com")+"/verify.js")+"?jsCallback="+c.callbackName+"&jsTagObjCallback="+c.tagObjectCallbackName+"&num=6"+t+"&srcurlD="+f.depth+"&ssl="+c.ssl+(v?"&dvf=0":"")+(y?"&dvf=1":"")+"&refD="+C+c.tagIntegrityFlag+c.tagHasPassbackFlag+"&htmlmsging="+(m?"1":"0")+(null!=w?"&aadid="+w:"");(f=dv_GetDynamicParams(d).join("&"))&&
(c+="&"+f);if(!1===h||u)c=c+("&dvp_isBodyExistOnLoad="+(h?"1":"0"))+("&dvp_isOnHead="+(u?"1":"0"));e="srcurl="+encodeURIComponent(e);if((h=window._dv_win[H("=@42E:@?")][H("2?46DE@C~C:8:?D")])&&0<h.length){u=[];u[0]=window._dv_win.location.protocol+"//"+window._dv_win.location.hostname;for(f=0;f<h.length;f++)u[f+1]=h[f];h=u.reverse().join(",")}else h=null;h&&(e+="&ancChain="+encodeURIComponent(h));h=4E3;/MSIE (\d+\.\d+);/.test(navigator.userAgent)&&7>=new Number(RegExp.$1)&&(h=2E3);if(d=dv_GetParam(d,
"referrer"))d="&referrer="+d,c.length+d.length<=h&&(c+=d);r.length+A.length+c.length<=h&&(c+=A,e+=r);(r=V())&&(c+="&m1="+r);(r=W())&&0<r.f&&(c+="&bsig="+r.f,c+="&usig="+r.s);r=c;try{var x="&fcifrms="+window.top.length;window.history&&(x+="&brh="+window.history.length);var q=L(),B=q.document;if(q==window.top){x+="&fwc="+((q.FB?1:0)+(q.twttr?2:0)+(q.outbrain?4:0)+(q._taboola?8:0));try{B.cookie&&(x+="&fcl="+B.cookie.length)}catch(D){}q.performance&&q.performance.timing&&0<q.performance.timing.domainLookupStart&&
0<q.performance.timing.domainLookupEnd&&(x+="&flt="+(q.performance.timing.domainLookupEnd-q.performance.timing.domainLookupStart));B.querySelectorAll&&(x+="&fec="+B.querySelectorAll("*").length)}var z=x}catch(D){z=""}c=r+z;z=X();c+="&vavbkt="+z.vdcd;c+="&lvvn="+z.vdcv;""!=z.err&&(c+="&dvp_idcerr="+encodeURIComponent(z.err));"prerender"===window._dv_win.document.visibilityState&&(c+="&prndr=1");c+="&eparams="+encodeURIComponent(H(e))+"&"+b.getVersionParamName()+"="+b.getVersion();return{isSev1:!1,
url:c}}function X(){var b="";try{var c=eval(function(b,c,d,g,m,h){m=function(b){return(b<c?"":m(parseInt(b/c)))+(35<(b%=c)?String.fromCharCode(b+29):b.toString(36))};if(!"".replace(/^/,String)){for(;d--;)h[m(d)]=g[d]||m(d);g=[function(b){return h[b]}];m=function(){return"\\w+"};d=1}for(;d--;)g[d]&&(b=b.replace(new RegExp("\\b"+m(d)+"\\b","g"),g[d]));return b}("(13(){1C{1C{2m('1a?1x:1Y')}1v(e){y{m:\"-99\"}}13 3r(21,2J,1V){10(d 1S 3T 21){G(1S.3u(2J)>-1&&(!1V||1V(21[1S])))y 1x}y 1Y}13 g(s){d h=\"\",t=\"6s.;j&6w}6u/0:6l'6d=B(6c-5E!,5c)5r\\\\{ >4Y+4W\\\"5w<\";10(i=0;i<s.1c;i++)f=s.3l(i),e=t.3u(f),0<=e&&(f=t.3l((e+41)%82)),h+=f;y h}13 1X(34,1m){1C{G(34())m.1B((1a==1a.2z?-1:1)*1m)}1v(e){m.1B(-5z*1m);V.1B(1m+\"=\"+(e.5A||\"5s\"))}}d c=['5q\"1u-5f\"5o\"2O','p','l','60&p','p','{','\\\\<}4\\\\5n-5S<\"5m\\\\<}4\\\\5p<Z?\"6','e','5l','-5,!u<}\"5k}\"','p','J','-5g}\"<5h','p','=o','\\\\<}4\\\\35\"2f\"w\\\\<}4\\\\35\"2f\"5i}2\"<,u\"<5}?\"6','e','J=',':<5j}T}<\"','p','h','\\\\<}4\\\\8-2}\"E(n\"18}9?\\\\<}4\\\\8-2}\"E(n\"2p<N\"[1p*1t\\\\\\\\2V-5B<25\"24\"5C]1i}C\"12','e','5D','\\\\<}4\\\\5y;5u||\\\\<}4\\\\5t?\"6','e','+o','\"1l\\\\<}4\\\\3w\"I<-5v\"2h\"5\"5x}2k<}5e\"1l\\\\<}4\\\\1D}1Q>1I-1N}2}\"2h\"5\"5d}2k<}4V','e','=J','17}U\"<5}4X\"7}F\\\\<}4\\\\[4Z}4U:4T]k}b\\\\<}4\\\\[t:33\"4P]k}b\\\\<}4\\\\[4O})5-u<}t]k}b\\\\<}4\\\\[4Q]k}b\\\\<}4\\\\[4R}4S]k}50','e','51',':59}<\"K-1J/2M','p','5a','\\\\<}4\\\\1d<U/1s}b\\\\<}4\\\\1d<U/!k}9','e','=l','14\\\\<}4\\\\5b}/58}U\"<5}57\"7}53<2n}52\\\\54\"55}/k}2o','e','=S=','\\\\<}4\\\\E-56\\\\<}4\\\\E-5F\"5\\\\U?\"6','e','+J','\\\\<}4\\\\22!6g\\\\<}4\\\\22!6h)p?\"6','e','6i','-}\"6j','p','x{','\\\\<}4\\\\E<23-6f}6e\\\\<}4\\\\6a\"69-6b\\\\<}4\\\\6k.42-2}\"6t\\\\<}4\\\\6v<N\"K}6r?\"6','e','+S','17}U\"<5}Q\"1g\"7}F\\\\<}4\\\\v<1E\"1l\\\\<}4\\\\v<2t}U\"<5}1j\\\\<}4\\\\1o-2.42-2}\"w\\\\<}4\\\\1o-2.42-2}\"1q\"L\"\"M<38\"39\"3a<\"<5}2X\"3h\\\\<Z\"3z<X\"3y{3B:3s\\\\36<1r}3v-3x<}3g\"2Y\"1w%3f<X\"1w%3e?\"3d\"16\"7}2W','e','6n','6m:,','p','6o','\\\\<}4\\\\6p\\\\<}4\\\\2I\"2H\\\\<}4\\\\2I\"2G,T}2R+++++1j\\\\<}4\\\\6q\\\\<}4\\\\2q\"2H\\\\<}4\\\\2q\"2G,T}2R+++++t','e','68','\\\\<}4\\\\67\"1J\"5P}b\\\\<}4\\\\E\\\\5O<M?\"6','e','5Q','17}U\"<5}Q:5R\\\\<}4\\\\8-2}\"1q\".42-2}\"4N-5N<N\"5L<5H<5G}C\"3H<5I<5J[<]E\"27\"1u}\"2}\"5K[<]E\"27\"1u}\"2}\"E<}1h&5T\"1\\\\<}4\\\\2u\\\\5U\\\\<}4\\\\2u\\\\1D}1Q>1I-1N}2}\"z<63-2}\"64\"2.42-2}\"65=66\"7}62\"7}P=61','e','x','5W)','p','+','\\\\<}4\\\\2B:5V<5}5X\\\\<}4\\\\2B\"5Y?\"6','e','5Z','L!!6x.3Q.K 3R','p','x=','\\\\<}4\\\\3O}3N)u\"3K\\\\<}4\\\\3Z-2?\"6','e','+=','\\\\<}4\\\\2r\"40\\\\<}4\\\\2r\"3Y--3X<\"2f?\"6','e','x+','\\\\<}4\\\\8-2}\"2v}\"2w<N\"w\\\\<}4\\\\8-2}\"2v}\"2w<N\"3U\")3V\"<:3W\"44}9?\"6','e','+x','\\\\<}4\\\\2F)u\"3C\\\\<}4\\\\2F)u\"3I?\"6','e','3G','\\\\<}4\\\\2P}s<3F\\\\<}4\\\\2P}s<3D\" 4M-4z?\"6','e','4B','\\\\<}4\\\\E\"4y-2}\"E(n\"4x<N\"[1p*45\"4t<4u]4v?\"6','e','+e','\\\\<}4\\\\8-2}\"E(n\"18}9?\\\\<}4\\\\8-2}\"E(n\"4w<:[\\\\4C}}2M][\\\\4D,5}2]4J}C\"12','e','4K','14\\\\<}4\\\\4L}4H\\\\<}4\\\\4F$4G','e','4s',':4r<Z','p','4c','\\\\<}4\\\\E-4d\\\\<}4\\\\E-4e}4b\\\\<}4\\\\E-47<48?\"6','e','49','$K:4g}Z!4h','p','+h','\\\\<}4\\\\E\"1K\\\\<}4\\\\E\"1O-4o?\"6','e','4p','14\\\\<}4\\\\4q:,2j}U\"<5}1A\"7}4n<4m<2n}2o','e','4j','\\\\<}4\\\\1d<U/4k&2i\"E/30\\\\<}4\\\\1d<U/4l}C\"3b\\\\<}4\\\\1d<U/f[&2i\"E/30\\\\<}4\\\\1d<U/4i[S]]3w\"46}9?\"6','e','4a','4E}4I}4A>2s','p','3E','\\\\<}4\\\\1e:<1G}s<3J}b\\\\<}4\\\\1e:<1G}s<43<}f\"u}2g\\\\<}4\\\\2e\\\\<}4\\\\1e:<1G}s<C[S]E:33\"1s}9','e','l{','3S\\'<}4\\\\T}3M','p','==','\\\\<}4\\\\v<1E\\\\<}4\\\\v<2C\\\\<Z\"2y\\\\<}4\\\\v<2x<X\"?\"6','e','3L','\\\\<}4\\\\3k}3j-3p\"}2b<3P\\\\<}4\\\\3k}3j-3p\"}2b/2Q?\"6','e','=8q','\\\\<}4\\\\E\"2f\"8r\\\\<}4\\\\8s<8p?\"6','e','o{','\\\\<}4\\\\8o-)2\"2U\"w\\\\<}4\\\\1e-8k\\\\1u}s<C?\"6','e','+l','\\\\<}4\\\\31-2\"8l\\\\<}4\\\\31-2\"8m<Z?\"6','e','+{','\\\\<}4\\\\E:8n}b\\\\<}4\\\\8t-8u}b\\\\<}4\\\\E:8B\"<8C\\\\}k}9?\"6','e','{S','\\\\<}4\\\\1f}\"11}8D\"-8A\"2f\"q\\\\<}4\\\\r\"<5}8z?\"6','e','o+',' &K)&8v','p','8w','\\\\<}4\\\\E.:2}\"c\"<8x}b\\\\<}4\\\\8y}b\\\\<}4\\\\8j<}f\"u}2g\\\\<}4\\\\2e\\\\<}4\\\\1D:}\"k}9','e','8i','83\"5-\\'2d:2M','p','J{','\\\\<}4\\\\85\"5-\\'2d:86}81=80:D|q=2l|7W-5|7X--1J/2\"|2N-2l|7Z\"=87\"2f\"q\\\\<}4\\\\1R\"2c:2a<1r}D?\"6','e','=88','\\\\<}4\\\\8-2}\"E(n\"18}9?\\\\<}4\\\\8-2}\"E(n\"2p<N\"[1p*1t\\\\\\\\2V-25\"24/8f<8g]1i}C\"12','e','8h',')8e!8d}s<C','p','8F','\\\\<}4\\\\26<<8a\\\\<}4\\\\26<<8b<}f\"u}8c?\"6','e','{l','\\\\<}4\\\\28.L>g;K\\'T)Y.8E\\\\<}4\\\\28.L>g;6y&&92>K\\'T)Y.I?\"6','e','l=','14\\\\<}4\\\\8X\\\\95>8Z}U\"<5}1A\"7}F\"2T}U\"<5}94\\\\<}4\\\\9a<23-20\"u\"97}U\"<5}1A\"7}F\"2T}U\"<5}96','e','{J','K:<Z<:5','p','8W','\\\\<}4\\\\k\\\\<}4\\\\E\"8V\\\\<}4\\\\r\"<5}3A\"3c}/1j\\\\<}4\\\\8-2}\"37<}1h&8L\\\\<}4\\\\r\"<5}1k\"}u-8K=?17}U\"<5}Q\"8J:8H\\\\<}4\\\\1f}\"r\"<5}8N\"7}8O\"16\"7}F\"8U','e','8S','\\\\<}4\\\\1L-U\\\\w\\\\<}4\\\\1L-8R\\\\<}4\\\\1L-\\\\<}?\"6','e','8P','8Q-N:8T','p','8G','\\\\<}4\\\\1M\"8M\\\\<}4\\\\1M\"98\"<5}8Y\\\\<}4\\\\1M\"90||\\\\<}4\\\\91?\"6','e','h+','89<u-7U/','p','{=','\\\\<}4\\\\r\"<5}1k\"}u-70\\\\<}4\\\\1D}1Q>1I-1N}2}\"q\\\\<}4\\\\r\"<5}1k\"}u-2D','e','=S','\\\\<}4\\\\71\"1l\\\\<}4\\\\72}U\"<5}1j\\\\<}4\\\\6Z?\"6','e','{o','\\\\<}4\\\\7V}<6Y\\\\<}4\\\\6U}?\"6','e','=6W','\\\\<}4\\\\v<1E\\\\<}4\\\\v<2C\\\\<Z\"2y\\\\<}4\\\\v<2x<X\"w\"1l\\\\<}4\\\\v<2t}U\"<5}t?\"6','e','J+','c>A','p','=','17}U\"<5}Q\"1g\"7}F\\\\<}4\\\\E\"73\"74:7a}7b^[7c,][79+]78\\'<}4\\\\75\"2f\"q\\\\<}4\\\\E}u-77\"16\"7}6T=6S','e','6F','\\\\<}4\\\\1P:!32\\\\<}4\\\\8-2}\"E(n\"18}9?\\\\<}4\\\\8-2}\"E(n\"1H<:[f\"2O*6G<X\"6H]6E<:[<Z*1t:Z,1F]1i}C\"12','e','=6D','\\\\<}4\\\\2S\"<2L-2K-u}6z\\\\<}4\\\\2S\"<2L-2K-u}6A?\"6','e','{x','6B}7K','p','6C','\\\\<}4\\\\8-2}\"E(n\"18}9?\\\\<}4\\\\8-2}\"E(n\"1H<:[<Z*1t:Z,1F]F:<6J[<Z*6P]1i}C\"12','e','h=','6Q-2}\"r\"<5}k}9','e','6R','\\\\<}4\\\\8-2}\"E(n\"18}9?\\\\<}4\\\\8-2}\"E(n\"1H<:[<Z*6O}1F]R<-C[1p*6K]1i}C\"12','e','6L','14\\\\<}4\\\\29\"\\\\6M\\\\<}4\\\\29\"\\\\7d','e','7e','\\\\<}4\\\\1R\"w\\\\<}4\\\\1R\"2c:2a<1r}?\"6','e','{e','\\\\<}4\\\\7G}Z<}7H}b\\\\<}4\\\\7I<f\"k}b\\\\<}4\\\\7F/<}C!!7E<\"42.42-2}\"1s}b\\\\<}4\\\\7A\"<5}k}9?\"6','e','7B','T>;7C\"<4f','p','h{','\\\\<}4\\\\7J<u-7L\\\\7R}b\\\\<}4\\\\1e<}7S}9?\"6','e','7T','\\\\<}4\\\\E\"1K\\\\<}4\\\\E\"1O-3o}U\"<5}Q\"1g\"7}F\\\\<}4\\\\1f}\"r\"<5}1k\"E<}1h&3n}3m=w\\\\<}4\\\\1f}\"8-2}\"1q\".42-2}\"7Q}\"u<}7P}7M\"16\"7}F\"3t?\"6','e','{h','\\\\<}4\\\\7N\\\\<}4\\\\7O}<(7z?\"6','e','7y','\\\\<}4\\\\7l<U-2Z<7m&p?14\\\\<}4\\\\7n<U-2Z<7k/2j}U\"<5}1A\"7}F\"7j','e','=7f','7g\\'<7h\"','p','{{','\\\\<}4\\\\E\"1K\\\\<}4\\\\E\"1O-3o}U\"<5}Q\"1g\"7}F\\\\<}4\\\\1f}\"r\"<5}1k\"E<}1h&3n}3m=7i\"16\"7}F\"3t?\"6','e','7o','17}U\"<5}Q\"1g\"7}F\\\\<}4\\\\1P:!32\\\\<}4\\\\1o-2.42-2}\"w\\\\<}4\\\\1o-2.42-2}\"1q\"L\"\"M<38\"39\"3a<\"<5}2X\"3h\\\\<Z\"3z<X\"3y{3B:3s\\\\36<1r}3v-3x<}3g\"2Y\"1w%3f<X\"1w%3e?\"3d\"16\"7}2W','e','{+','\\\\<}4\\\\7t<7q a}7s}b\\\\<}4\\\\E}7r\"7u 7x- 1s}9','e','7w','7v\\\\<}4\\\\r\"<5}1P}7p\"5M&M<C<}7D}C\"3b\\\\<}4\\\\r\"<5}3A\"3c}/1j\\\\<}4\\\\8-2}\"6N\\\\<}4\\\\8-2}\"37<}1h&6I[S]76=?\"6','e','l+'];d 1y='(13(){d m=[],V=[];'+3r.3q()+1X.3q()+'';10(d j=0;j<c.1c;j+=3){1y+='1X(13(){y '+(c[j+1]=='p'?'1a[\"'+g(c[j])+'\"]!=6X':g(c[j]))+'}, '+6V(g(c[j+2]))+');'}1y+='y {m:m,V:V}})();';d H=[];d 1W=[];d 1b=1a;10(d i=0;i<93;i++){d O=1b.2m(1y);G(O.V.1c>15){y{m:O.V[0]}}10(d 19=0;19<O.m.1c;19++){d 1z=1Y;10(d W=0;W<H.1c;W++){G(H[W]==O.m[19]){1z=1x;1n}2A G(1Z.1T(H[W])==1Z.1T(O.m[19])){H[W]=1Z.1T(H[W]);1z=1x;1n}}G(!1z)H.1B(O.m[19])}G(1b==1a.2z){1n}2A{1C{G(1b.2E.7Y.84)1b=1b.2E}1v(e){1n}}}d 1U={m:H.3i(\",\")};G(1W.1c>0)1U.V=1W.3i(\"&\");y 1U}1v(e){y{m:\"-8I\"}}})()",
62,569,"    Z5  Ma2vsu4f2 aM EZ5Ua a44  a44OO  var       P1  res a2MQ0242U    E45Uu    E3 OO  return        if results   _    currentResults  qD8     err ri C3   for  3RSvsu4f2 function U5q  U3q2D8M2 qsa 5ML44P1 cri window currWindow length EBM E_ ENuM2 MQ8M2 Z27 WDE42 tOO E35f QN25sF ci break EsMu fMU EC2 ZZ2 fP1  g5 catch vFoS true fc exists q5D8M2 push try E2 M5OO _t ZU5 5ML44qWZ Tg5 uM UIuCTZOO Euf EuZ N5 UT Eu U5Z2c EfaNN_uZf_35f prop abs response func errors ei false Math  wnd E_Y sMu MuU kN7 E__  EcIT_0 zt__ 2MM 2M_ _5 ALZ02M ELMMuQOO  U25sF ENM5 BV2U tzsa Z2s uZf eval ZP1 a44nD 5ML44qWfUM EuZ_lEf EU  M511tsa z5 E_UaMM2 0UM M5E32 3OO top else E27 M5E  parent EufB Q42E Q42OO EuZ_hEf str fC_ _7Z   Q42 ELZg5  Z2711t Ea QN25sF511tsa  BuZfEU5 Fsu4f2HnnDqD vFuBf54a vFmheSN7HF42s  2Qfq E__N 4uQ2MOO uf fu Ef35M vF3 EM2s2MM2ME Ba 2qtf Q42tD11tN5f 3RSOO vB4u Ma2vsu4f2nUu Ht HFM m42s 2HFB5MZ2MvFSN7HF join 5Mu ENu charAt uNfQftD11m sqtfQ NTZOOqsa _NuM toString co 2Ms45 Ma2HnnDqD indexOf HF Ef2 uMC vFl 3vFJlSN7HF32 E3M2sP1tuB5a SN7HF5 u_Z2U5Z2OO CEC2 hx COO oo  ujuM CP1 uOO Jh s5 Z42 EA5Cba ZOO A_pLr cAA_cg UufUuZ2 in EZ5p5 2s2MI5pu 2r2 MU0 7__E2U EuZZTsMu 7__OO   CF 35ZP1 1tk27 aNP1 2MUaMQE NLZZM2ff Je ox sOO hJ 2MUaMQOO 2MUaMQEU5  V0 7A5C fD lJ fOO fDE42 f32M_faB F5ENaB4 NTZ oJ zt_M u_faB Jl kC5 UEVft WD 5ML44qtZ 5MqWfUM uCUuZ2OOZ5Ua 2cM4 fY45 JJ UmBu Um M2 zt_ _tD f_tDOOU5q 5IMu tDE42 eS zt__uZ_M Mu fbQIuCpu tUZ r5Z2t tUBt tB LMMt 24t ZA2 2Zt lkSvfxWX qD8M2 NhCZ tf5a a44nDqD ee a44OO5BVEu445 F5BVEa IuMC2 b4u UCMOO q5BVD8M2 Mtzsa u_a ho zt_4 LnG QN2P1ta 2ZtOO Na fgM2Z2 u4f r5 ZBu g5a xh QOO ENaBf_uZ_uZ 2Z0 ENaBf_uZ_faB C2  unknown E7GXLss0aBTZIuC 24N2MTZ 25a 1bqyJIma QN211ta E7LZfKrA 1000 message kUM EVft eo uic2EHVO UCME i2E42 1SH 99D sq2 OO2 tDHs5Mq  2qtfUM 2BfM2Z aM4P1 xo uMF21 5Zu4 sqt E2fUuN2z21 2Mf Ld0 _V5V5OO IQN2 xJ  HnDqD PSHM2 1Z5Ua EUM2u tDRm DM2 Ef xl 2TsMu EaNZu 2OO Q6T Kt U2OO 2_M2s2M2 AOO AEBuf2g lS M__ EuZZ s7 _M xx he EuZ_hOO EuZ_lOO 5Z2f Ue I5b5ZQOO YDoMw8FRp3gd94 EfUM PzA _ALb _I uC2MOO uC2MEUB B24 xS So FZ xe 1t32 vFSN7t squ Z25 1tNk4CEN3Nt oe B__tDOOU5q EM2s2MM2MOO 1tB2uU5 1tfMmN4uQ2Mt Z5Ua eh HnnDqD FP EuZfBQuZf parseInt Sh null N2MOO E5U4U5qDEN4uQ 2P1 E5U4U5OO E5U4U511tsa 5NENM5U2ff_ uC_ kE D11m 2DnUu 8lzn Sm uMfP1 a44OOk um B_UB_tD lh Sl LZZ035NN2Mf ZC2 HnUu Ma2nDvsu4f2 ubuf2b45U EIMuss u60 ztIMuss Jx U2f 4Zf _f UP1 EUuU 5M2f u1 lx M5 ol a2TZ Eu445Uu lo _c fzuOOuE42 gI ENuM E4u CcM4P1 Ef2A ENM  bM5 a44HnUu E_NUCOO E_NUCEYp_c 2MtD11 bQTZqtMffmU5 f2MP1 N4uU2_faUU2ffP1 Jo _uZB45U ELZ0 UUUN 2N5 location uZf35f zlnuZf2M wZ8  gaf href Egaf 2MOOkq DkE SS _NM ZfOO ZfF U25sFLMMuQ 4Qg5 2u4 kZ fN4uQLZfEVft eJ ll ErF fN uCOO uCEa u_uZ_M2saf2_M2sM2f3P1 E_Vu u4buf2Jl Se fNNOO E0N2U ENuMu fC532M2P1 rLTp hl 4P1 ErP1 E3M2sD 4kE u_ 2M_f35 a44OOkuZwkwZ8ezhn7wZ8ezhnwE3 IOO oh le uMFN1 999 MQ8 2DRm sq CfOO E3M2sHM2 Fsu4f2nUu JS ___U M2sOO oS _ZBf Ma2nnDqDvsu4f2 5NOO hh ztBM5 OOq A_tzsa CfE35aMfUuN E35aMfUuND AbL 100 tnDOOU5q f2Mc tnD af_tzsa CfEf2U  zt".split(" "),
0,{}));c.hasOwnProperty("err")&&(b=c.err);return{vdcv:26,vdcd:c.res,err:b}}catch(e){return{vdcv:26,vdcd:"0",err:b}}}function S(b){try{if(1>=b.depth)return{url:"",depth:""};var c=[];c.push({win:window._dv_win.top,depth:0});for(var e,f=1,d=0;0<f&&100>d;){try{if(d++,e=c.shift(),f--,0<e.win.location.toString().length&&e.win!=b)return 0==e.win.document.referrer.length||0==e.depth?{url:e.win.location,depth:e.depth}:{url:e.win.document.referrer,depth:e.depth-1}}catch(h){}var g=e.win.frames.length;for(var m=
0;m<g;m++)c.push({win:e.win.frames[m],depth:e.depth+1}),f++}return{url:"",depth:""}}catch(h){return{url:"",depth:""}}}function H(b){new String;var c=new String,e;for(e=0;e<b.length;e++){var f=b.charAt(e);var d="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(f);0<=d&&(f="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((d+47)%94));c+=f}return c}function F(){return Math.floor(1E12*(Math.random()+
""))}function T(){try{if(null!=window._phantom||null!=window.callPhantom)return 99;if(document.documentElement.hasAttribute&&document.documentElement.hasAttribute("webdriver")||null!=window.domAutomation||null!=window.domAutomationController||null!=window._WEBDRIVER_ELEM_CACHE)return 98;if(void 0!=window.opera&&void 0!=window.history.navigationMode||void 0!=window.opr&&void 0!=window.opr.addons&&"function"==typeof window.opr.addons.installExtension)return 4;if(void 0!=window.chrome&&"function"==typeof window.chrome.csi&&
"function"==typeof window.chrome.loadTimes&&void 0!=document.webkitHidden&&(1==document.webkitHidden||0==document.webkitHidden))return 3;if(void 0!=window.mozInnerScreenY&&"number"==typeof window.mozInnerScreenY&&void 0!=window.mozPaintCount&&0<=window.mozPaintCount&&void 0!=window.InstallTrigger&&void 0!=window.InstallTrigger.install)return 2;if(void 0!=document.uniqueID&&"string"==typeof document.uniqueID&&(void 0!=document.documentMode&&0<=document.documentMode||void 0!=document.all&&"object"==
typeof document.all||void 0!=window.ActiveXObject&&"function"==typeof window.ActiveXObject)||window.document&&window.document.updateSettings&&"function"==typeof window.document.updateSettings)return 1;var b=!1;try{var c=document.createElement("p");c.innerText=".";c.style="text-shadow: rgb(99, 116, 171) 20px -12px 2px";b=void 0!=c.style.textShadow}catch(e){}return(0<Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")||window.webkitAudioPannerNode&&window.webkitConvertPointFromNodeToPage)&&
b&&void 0!=window.innerWidth&&void 0!=window.innerHeight?5:0}catch(e){return 0}}function V(){try{var b=0,c=function(c,d){d&&32>c&&(b=(b|1<<c)>>>0)},e=function(b,c){return function(){return b.apply(c,arguments)}},f="svg"===document.documentElement.nodeName.toLowerCase(),d=function(){return"function"!==typeof document.createElement?document.createElement(arguments[0]):f?document.createElementNS.call(document,"http://www.w3.org/2000/svg",arguments[0]):document.createElement.apply(document,arguments)},
g=["Moz","O","ms","Webkit"],m=["moz","o","ms","webkit"],h={style:d("modernizr").style},u=function(b,c){function g(){f&&(delete h.style,delete h.modElem)}var e;for(e=["modernizr","tspan","samp"];!h.style&&e.length;){var f=!0;h.modElem=d(e.shift());h.style=h.modElem.style}var l=b.length;for(e=0;e<l;e++){var m=b[e];~(""+m).indexOf("-")&&(m=cssToDOM(m));if(void 0!==h.style[m])return g(),"pfx"==c?m:!0}g();return!1},v=function(b,c,d){var f=b.charAt(0).toUpperCase()+b.slice(1),h=(b+" "+g.join(f+" ")+f).split(" ");
if("string"===typeof c||"undefined"===typeof c)return u(h,c);h=(b+" "+m.join(f+" ")+f).split(" ");for(var l in h)if(h[l]in c){if(!1===d)return h[l];b=c[h[l]];return"function"===typeof b?e(b,d||c):b}return!1};c(0,!0);c(1,v("requestFileSystem",window));c(2,window.CSS?"function"==typeof window.CSS.escape:!1);c(3,v("shapeOutside","content-box",!0));return b}catch(l){return 0}}function L(){var b=window,c=0;try{for(;b.parent&&b!=b.parent&&b.parent.document&&!(b=b.parent,10<c++););}catch(e){}return b}function W(){try{var b=
L(),c=0,e=0,f=function(b,d,f){f&&(c=(c|1<<b)>>>0,e=(e|1<<d)>>>0)},d=b.document;f(14,0,b.playerInstance&&d.querySelector('script[src*="ads-player.com"]'));f(14,1,(b.CustomWLAdServer||b.DbcbdConfig)&&(a=d.querySelector('p[class="footerCopyright"]'),a&&a.textContent.match(/ MangaLife 2016/)));f(15,2,b.zpz&&b.zpz.createPlayer);f(15,3,b.vdApp&&b.vdApp.createPlayer);f(15,4,d.querySelector('body>div[class="z-z-z"]'));f(16,5,b.xy_checksum&&b.place_player&&(b.logjwonready&&b.logContentPauseRequested||b.jwplayer));
f(17,6,b==b.top&&""==d.title?(a=d.querySelector('body>object[id="player"]'),a&&a.data&&1<a.data.indexOf("jwplayer")&&"visibility: visible;"==a.getAttribute("style")):!1);f(17,7,d.querySelector('script[src*="sitewebvideo.com"]'));f(17,8,b.InitPage&&b.cef&&b.InitAd);f(17,9,b==b.top&&""==d.title?(a=d.querySelector("body>#player"),null!=a&&null!=(null!=a.querySelector('div[id*="opti-ad"]')||a.querySelector('iframe[src="about:blank"]'))):!1);f(17,10,b==b.top&&""==d.title&&b.InitAdPlayer?(a=d.querySelector('body>div[id="kt_player"]'),
null!=a&&null!=a.querySelector('div[class="flash-blocker"]')):!1);f(17,11,null!=b.clickplayer&&null!=b.checkRdy2);f(19,12,b.instance&&b.inject&&d.querySelector('path[id="cp-search-0"]'));return{f:c,s:e}}catch(g){return null}}function U(){function b(b){if(null==b||""==b)return"";var c=function(b,c){return b<<c|b>>>32-c},d=function(b){for(var c="",d,e=7;0<=e;e--)d=b>>>4*e&15,c+=d.toString(16);return c},g=[1518500249,1859775393,2400959708,3395469782];b+=String.fromCharCode(128);for(var e=Math.ceil((b.length/
4+2)/16),f=Array(e),n=0;n<e;n++){f[n]=Array(16);for(var k=0;16>k;k++)f[n][k]=b.charCodeAt(64*n+4*k)<<24|b.charCodeAt(64*n+4*k+1)<<16|b.charCodeAt(64*n+4*k+2)<<8|b.charCodeAt(64*n+4*k+3)}f[e-1][14]=8*(b.length-1)/Math.pow(2,32);f[e-1][14]=Math.floor(f[e-1][14]);f[e-1][15]=8*(b.length-1)&4294967295;b=1732584193;k=4023233417;var r=2562383102,A=271733878,C=3285377520,t=Array(80);for(n=0;n<e;n++){for(var p=0;16>p;p++)t[p]=f[n][p];for(p=16;80>p;p++)t[p]=c(t[p-3]^t[p-8]^t[p-14]^t[p-16],1);var w=b;var y=
k;var x=r;var q=A;var B=C;for(p=0;80>p;p++){var z=Math.floor(p/20),D=c(w,5);a:{switch(z){case 0:var E=y&x^~y&q;break a;case 1:E=y^x^q;break a;case 2:E=y&x^y&q^x&q;break a;case 3:E=y^x^q;break a}E=void 0}z=D+E+B+g[z]+t[p]&4294967295;B=q;q=x;x=c(y,30);y=w;w=z}b=b+w&4294967295;k=k+y&4294967295;r=r+x&4294967295;A=A+q&4294967295;C=C+B&4294967295}return d(b)+d(k)+d(r)+d(A)+d(C)}function c(){try{return!!window.sessionStorage}catch(g){return!0}}function e(){try{return!!window.localStorage}catch(g){return!0}}
function f(){try{var b=document.createElement("canvas");if(b.getContext&&b.getContext("2d")){var c=b.getContext("2d");c.textBaseline="top";c.font="14px 'Arial'";c.textBaseline="alphabetic";c.fillStyle="#f60";c.fillRect(0,0,62,20);c.fillStyle="#069";c.fillText("!image!",2,15);c.fillStyle="rgba(102, 204, 0, 0.7)";c.fillText("!image!",4,17);return b.toDataURL()}}catch(h){}return null}try{var d=[];d.push(["lang",navigator.language||navigator.browserLanguage]);d.push(["tz",(new Date).getTimezoneOffset()]);
d.push(["hss",c()?"1":"0"]);d.push(["hls",e()?"1":"0"]);d.push(["odb",typeof window.openDatabase||""]);d.push(["cpu",navigator.cpuClass||""]);d.push(["pf",navigator.platform||""]);d.push(["dnt",navigator.doNotTrack||""]);d.push(["canv",f()]);return b(d.join("=!!!="))}catch(g){return null}}this.createRequest=function(){var b=!1,c=window._dv_win,e=0,f=!1,d;try{for(d=0;10>=d;d++)if(null!=c.parent&&c.parent!=c)if(0<c.parent.location.toString().length)c=c.parent,e++,b=!0;else{b=!1;break}else{0==d&&(b=
!0);break}}catch(r){b=!1}0==c.document.referrer.length?b=c.location:b?b=c.location:(b=c.document.referrer,f=!0);if(!window._dv_win.dvbsScriptsInternal||!window._dv_win.dvbsProcessed||0==window._dv_win.dvbsScriptsInternal.length)return{isSev1:!1,url:null};var g=window._dv_win.dv_config&&window._dv_win.dv_config.isUT?window._dv_win.dvbsScriptsInternal[window._dv_win.dvbsScriptsInternal.length-1]:window._dv_win.dvbsScriptsInternal.pop();d=g.script;this.dv_script_obj=g;this.dv_script=d;window._dv_win.dvbsProcessed.push(g);
window._dv_win._dvScripts.push(d);var m=d.src;this.dvOther=0;this.dvStep=1;var h=window._dv_win.dv_config?window._dv_win.dv_config.bst2tid?window._dv_win.dv_config.bst2tid:window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():F():F();g=window.parent.postMessage&&window.JSON;var u=!0,v=!1;if("0"==dv_GetParam(m,"t2te")||window._dv_win.dv_config&&1==window._dv_win.dv_config.supressT2T)v=!0;if(g&&0==v)try{var l=I(window._dv_win.dv_config.bst2turl||"https://cdn3.doubleverify.com/bst2tv3.html",
"bst2t_"+h);u=G(l)}catch(r){}l={};try{v=/[\?&]([^&]*)=([^&#]*)/gi;for(var n=v.exec(m);null!=n;)"eparams"!==n[1]&&(l[n[1]]=n[2]),n=v.exec(m);var k=l}catch(r){k=l}k.perf=this.perf;k.uid=h;k.script=this.dv_script;k.callbackName="__verify_callback_"+k.uid;k.tagObjectCallbackName="__tagObject_callback_"+k.uid;k.tagAdtag=null;k.tagPassback=null;k.tagIntegrityFlag="";k.tagHasPassbackFlag="";0==(null!=k.tagformat&&"2"==k.tagformat)&&(n=R(k.script),k.tagAdtag=n.tagAdTag,k.tagPassback=n.tagPassback,n.isBadImp?
k.tagIntegrityFlag="&isbadimp=1":n.hasPassback&&(k.tagHasPassbackFlag="&tagpb=1"));(n=(/iPhone|iPad|iPod|\(Apple TV|iOS|Coremedia|CFNetwork\/.*Darwin/i.test(navigator.userAgent)||navigator.vendor&&"apple, inc."===navigator.vendor.toLowerCase())&&!window.MSStream)?l="https:":(l=k.script.src,m="http:",h=window._dv_win.location.toString().match("^http(?:s)?"),"https"!=l.match("^https")||"https"!=h&&"http"==h||(m="https:"),l=m);k.protocol=l;k.ssl="0";"https:"===k.protocol&&(k.ssl="1");l=k;(m=window._dv_win.dvRecoveryObj)?
("2"!=l.tagformat&&(m=m[l.ctx]?m[l.ctx].RecoveryTagID:m._fallback_?m._fallback_.RecoveryTagID:1,1===m&&l.tagAdtag?document.write(l.tagAdtag):2===m&&l.tagPassback&&document.write(l.tagPassback)),l=!0):l=!1;if(l)return{isSev1:!0};this.dvStep=2;Q(k,n);d=d&&d.parentElement&&d.parentElement.tagName&&"HEAD"===d.parentElement.tagName;this.dvStep=3;return K(this,k,b,c,e,f,g,u,d,n)};this.sendRequest=function(b){var c=dv_GetParam(b,"tagformat");c&&"2"==c?$dvbs.domUtilities.addScriptResource(b,document.body):
dv_sendScriptRequest(b);try{var e=N(this.dv_script_obj&&this.dv_script_obj.injScripts),f=I("about:blank");f.id=f.name;var d=f.id.replace("iframe_","");f.setAttribute&&f.setAttribute("data-dv-frm",d);G(f,this.dv_script);if(this.dv_script){var g=this.dv_script;a:{b=null;try{if(b=f.contentWindow){var m=b;break a}}catch(v){}try{if(b=window._dv_win.frames&&window._dv_win.frames[f.name]){m=b;break a}}catch(v){}m=null}g.dvFrmWin=m}var h=O(f);if(h)h.open(),h.write(e);else{try{document.domain=document.domain}catch(v){}var u=
encodeURIComponent(e.replace(/'/g,"\\'").replace(/\n|\r\n|\r/g,""));f.src='javascript: (function(){document.open();document.domain="'+window.document.domain+"\";document.write('"+u+"');})()"}}catch(v){e=(window._dv_win.dv_config=window._dv_win.dv_config||{}).tpsAddress||"tps30.doubleverify.com",dv_SendErrorImp(e+"/verify.js?ctx=818052&cmp=1619415",[{dvp_jsErrMsg:"DvFrame: "+encodeURIComponent(v)}])}return!0};this.isApplicable=function(){return!0};this.onFailure=function(){};window.debugScript&&(window.CreateUrl=
K);this.getVersionParamName=function(){return"ver"};this.getVersion=function(){return"99"}};


function dvbs_src_main(dvbs_baseHandlerIns, dvbs_handlersDefs) {

    this.bs_baseHandlerIns = dvbs_baseHandlerIns;
    this.bs_handlersDefs = dvbs_handlersDefs;

    this.exec = function () {
        try {
            window._dv_win = (window._dv_win || window);
            window._dv_win.$dvbs = (window._dv_win.$dvbs || new dvBsType());

            window._dv_win.dv_config = window._dv_win.dv_config || {};
            window._dv_win.dv_config.bsErrAddress = window._dv_win.dv_config.bsAddress || 'rtb0.doubleverify.com';

            var errorsArr = (new dv_rolloutManager(this.bs_handlersDefs, this.bs_baseHandlerIns)).handle();
            if (errorsArr && errorsArr.length > 0)
                dv_SendErrorImp(window._dv_win.dv_config.bsErrAddress + '/verify.js?ctx=818052&cmp=1619415&num=6', errorsArr);
        }
        catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.bsErrAddress + '/verify.js?ctx=818052&cmp=1619415&num=6&dvp_isLostImp=1', {dvp_jsErrMsg: encodeURIComponent(e)});
            } catch (e) {
            }
        }
    };
};

try {
    window._dv_win = window._dv_win || window;
    var dv_baseHandlerIns = new dv_baseHandler();
	

    var dv_handlersDefs = [];
    (new dvbs_src_main(dv_baseHandlerIns, dv_handlersDefs)).exec();
} catch (e) { }