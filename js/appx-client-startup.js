
/*********************************************************************
 **
 **   public/js/appx-client-startup.js - Client entry point code
 **
 **   This module is the main entry point into the client.  It also
 **   has some initial startup helper code.
 **
 *********************************************************************/

// what_str =  "@(#)Appx $Header: /src/cvs/appxHtml5/public/js/appx-client-startup.js,v 1.87 2018/09/05 20:03:40 jnelson Exp $";

function urlParam(name) {
    var result = urlParamEx(window.location.href, name);
    if (!result) {
        if (urlParamEx(window.location.href, "payload")) {
            var padlen = 4 - urlParamEx(window.location.href, "payload") % 4;
            var pad = "";
            if (padlen)
                pad = "===".substring(0, padlen);
            result = urlParamEx(atob(urlParamEx(window.location.href, "payload").split('').reverse().join('').concat(pad)), name);
        }
    }
    return result;
}

function urlParamEx(str, name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(str);
    if (results) {
        return decodeURIComponent(results[1]) || null;
    }
    return null;
}
function checkLogin() {
    var qLog = parseQueryString();
    if ($('meta[name=appx-allow-noLogin]').attr("content") === "true") {
        if (qLog.hasOwnProperty("requireLogin")) {
            $($('meta[name=appx-use-noLogin]')[0]).attr("content", qLog.requireLogin === "false");
        }
        if ($('meta[name=appx-use-noLogin]').attr("content") === "true" || qLog.requireLogin === "false") {

            if (qLog.hasOwnProperty("user")) {
                $($('meta[name=appx-auto-user]')[0]).attr("content", qLog.user);
            }
            if (qLog.hasOwnProperty("password")) {
                $($('meta[name=appx-auto-pswd]')[0]).attr("content", qLog.password);
            }
            if (qLog.hasOwnProperty("host")) {
                $($('meta[name=appx-auto-host]')[0]).attr("content", qLog.host);
            }
            if (qLog.hasOwnProperty("port")) {
                $($('meta[name=appx-auto-port]')[0]).attr("content", qLog.port);
            }
            if (qLog.hasOwnProperty("specific")) {
                $($('meta[name=appx-use-specific]')[0]).attr("content", qLog.specific);
            }
            if (qLog.hasOwnProperty("application")) {
                $($('meta[name=appx-application]')[0]).attr("content", qLog.application);
            }
            if (qLog.hasOwnProperty("database")) {
                $($('meta[name=appx-database]')[0]).attr("content", qLog.database);
            }
            if (qLog.hasOwnProperty("procType")) {
                $($('meta[name=appx-ProcType]')[0]).attr("content", qLog.procType);
            }
            if (qLog.hasOwnProperty("process")) {
                $($('meta[name=appx-process]')[0]).attr("content", qLog.process);
            }
            startSpecificProcess(false);
        }
    }
}
var appxLoginFormHost = $('meta[name=appx-login-host]').attr("content");
var appxLoginFormPort = $('meta[name=appx-login-port]').attr("content");
var appxLoginFormUser = $('meta[name=appx-login-user]').attr("content");
var appxLoginFormPswd = $('meta[name=appx-login-pswd]').attr("content");
var appxLoginFormRows = $('meta[name=appx-login-rows]').attr("content");
var appxLoginFormCols = $('meta[name=appx-login-cols]').attr("content");

var appxLoginFormHostHide = ($('meta[name=appx-login-host]').attr("hide") == "true");
var appxLoginFormPortHide = ($('meta[name=appx-login-port]').attr("hide") == "true");
var appxLoginFormUserHide = ($('meta[name=appx-login-user]').attr("hide") == "true");
var appxLoginFormPswdHide = ($('meta[name=appx-login-pswd]').attr("hide") == "true");
var appxLoginFormRowsHide = ($('meta[name=appx-login-rows]').attr("hide") == "true");
var appxLoginFormColsHide = ($('meta[name=appx-login-cols]').attr("hide") == "true");
var appxLoginFormMinified = ($('meta[name=appx-login-cols]').attr("content") == "min");

var appxConnectorHost = $('meta[name=appx-proxy-host]').attr("content");
var appxConnectorPort = $('meta[name=appx-proxy-port]').attr("content");
var appxConnectorMongoPort = $('meta[name=appx-mongo-port]').attr("content");
var appxConnectorPath = $('meta[name=appx-proxy-path]').attr("content");
var appxConnectorPathHttp;
var appxProtocol;
if (appxConnectorMongoPort === undefined) {
    appxConnectorMongoPort = 3015;
}
if (appxConnectorPath.indexOf("wss") != -1) {
    appxProtocol = "https";
    appxConnectorPathHttp = appxConnectorPath.substring(0, (appxConnectorPath.length - 4)) + appxProtocol;
} else {
    appxProtocol = "http";
    appxConnectorPathHttp = appxConnectorPath.substring(0, (appxConnectorPath.length - 3)) + appxProtocol;
}

var appxClientRoot = $('meta[name=appx-client-root]').attr("content");
var appxUseSoftkeys = $('meta[name=appx-use-softkeys]').attr("content") == "true";
var appxLoginAutoConnect = $('meta[name=appx-auto-connect]').attr("content") == "true";
var appxLocalRequired = $('meta[name=appx-local-required]').attr("content");
var appxStaticTools = $('meta[name=appx-static-tools]').attr("content");
var appxFillWindow = $('meta[name=appx-fill-window]').attr("content");
var appxCloseOnExit = $('meta[name=appx-close-on-exit]').attr("content");

var appxNewSession = false;

var appxEncryption = $('meta[name=appx-encryption]').attr("content");


if (urlParam("acon")) {
    appxLoginAutoConnect = urlParam("acon") == "true";
    if (appxLoginAutoConnect)
        appxCloseOnExit = "back";
}

if (urlParam("localRequired")) {
    appxLocalRequired = urlParam("localRequired") == "true";
}

if (urlParam("user")) appxLoginFormUser = urlParam("user", appxLoginFormUser);
if (urlParam("port")) appxLoginFormPort = urlParam("port", appxLoginFormPort);
if (urlParam("host")) appxLoginFormHost = urlParam("host", appxLoginFormHost);
if (urlParam("rows")) appxLoginFormRows = urlParam("rows", appxLoginFormRows);
if (urlParam("cols")) appxLoginFormCols = urlParam("cols", appxLoginFormCols);
if (urlParam("pswd")) appxLoginFormPswd = urlParam("pswd");

if (appxLoginFormUser.length > 0)
    $("#appx_username").val(appxLoginFormUser);

if (appxLoginFormPswd.length > 0)
    $("#appx_password").val(appxLoginFormPswd);

if (appxLoginFormHost.length > 0)
    $("#appx_server").val(appxLoginFormHost);

if (appxLoginFormPort.length > 0)
    $("#appx_port").val(appxLoginFormPort);

if (appxLoginFormRows.length > 0)
    $("#appx_rows").val(appxLoginFormRows);

if (appxLoginFormCols.length > 0)
    $("#appx_cols").val(appxLoginFormCols);

var focusElem = null;

if (appxLoginFormColsHide)
    $("#appxLoginFormCols").attr("style", "display: none;");
else
    focusElem = $("#appx_cols");

if (appxLoginFormRowsHide)
    $("#appxLoginFormRows").attr("style", "display: none;");
else
    focusElem = $("#appx_rows");

if (appxLoginFormPortHide)
    $("#appxLoginFormPort").attr("style", "display: none;");
else
    focusElem = $("#appx_port");

if (appxLoginFormHostHide)
    $("#appxLoginFormHost").attr("style", "display: none;");
else
    focusElem = $("#appx_host");

if (appxLoginFormPswdHide)
    $("#appxLoginFormPswd").attr("style", "display: none;");
else
    focusElem = $("#appx_password");

if (appxLoginFormUserHide)
    $("#appxLoginFormUser").attr("style", "display: none;");
else
    focusElem = $("#appx_username");

if (focusElem)
    focusElem.attr("autofocus", "true");

var appxZoom = 1.0;
var appxOffsetTop = null;

function adjustZoom(scale) {
    var newCss = {
        "transform": "scale(" + scale + ")",
        "-webkit-transform": "scale(" + scale + ")",
        "-moz-transform": "scale(" + scale + ")",
        "-moz-transform-origin": "left top"
    };
    $("#appx_main_container_wrapper").css(newCss);
}

$("#appx_zoom_in").click(function () {
    appxZoomAuto = false;
    $("#appx_zoom_auto").css({
        "color": "initial"
    });
    appxZoom += .1;
    adjustZoom(appxZoom);
    boxResize();
});

$("#appx_zoom_out").click(function () {
    appxZoomAuto = false;
    $("#appx_zoom_auto").css({
        "color": "initial"
    });
    appxZoom -= .1;
    adjustZoom(appxZoom);
    boxResize();
});

$("#appx_zoom_dflt").click(function () {
    appxZoomAuto = false;
    $("#appx_zoom_auto").css({
        "color": "initial"
    });
    appxZoom = 1.0;
    adjustZoom(appxZoom);
    boxResize();
});

$("#appx_zoom_max").click(function () {
    appxZoomAuto = false;
    $("#appx_zoom_auto").css({
        "color": "initial"
    });
    zoomMax();
    boxResize();
});

$("#appx_zoom_full").click(function () {
    if (appxFullscreen) {
        appxFullscreen = false;
        exitFullscreen();
    }
    else {
        appxFullscreen = true;
        launchIntoFullscreen(document.documentElement);
    }
});

$("#appx_zoom_auto").click(function () {
    if (appxZoomAuto) {
        appxZoomAuto = false;
        appxZoom = appxZoomSave;
        $("#appx_zoom_auto").css({
            "color": "initial"
        });
    }
    else {
        appxZoomAuto = true;
        appxZoomSave = appxZoom;
        $("#appx_zoom_auto").css({
            "color": "red"
        });
    }
    zoomAuto();
    adjustZoom(appxZoom);
    boxResize();
});

function zoomMax() {
    if (!appx_session)
        return;
    if (appxOffsetTop === null) {
        getOriginalTop();
    }
    var appxZoomW = $("#appx_main_container_wrapper").width() / (appx_session.colWidthPx * appx_session.screencols + 18);
    var appxZoomH = appxOffsetTop / (appx_session.rowHeightPx * appx_session.screenrows);
    appxZoom = Math.min(appxZoomW, appxZoomH);
    adjustZoom(appxZoom);
}

function zoomAuto() {
    if (!appxZoomAuto)
        return;
    if (!appx_session)
        return;
    if (appxOffsetTop === null) {
        getOriginalTop();
    }
    var appxZoomW = $("#appx_main_container_wrapper").width() / (appx_session.colWidthPx * appx_session.screencols + 18);
    var appxZoomH = appxOffsetTop / (appx_session.rowHeightPx * appx_session.screenrows);
    appxZoom = Math.min(appxZoomW, appxZoomH);
    adjustZoom(appxZoom);
}

var appxFullscreen = false;
var appxZoomAuto = false;
var appxZoomSave = 1.0;

$(window).on('scroll', zoomAuto);
$(window).on('resize', function () { zoomAuto(); boxResize(); });

function getVisibleOld(id) {
    var $el = $('#' + id),
        scrollTop = $(this).scrollTop(),
        scrollBot = scrollTop + $(this).height(),
        elTop = $el.offset().top,
        elBottom = elTop + $el.outerHeight(),
        visibleTop = elTop < scrollTop ? scrollTop : elTop,
        visibleBottom = elBottom > scrollBot ? scrollBot : elBottom;
    return visibleBottom - visibleTop;
}

function getVisible(id) {
    var $el = $('#' + id),
        elTop = $el.offset().top,
        elBottom = elTop + $("#status_bar").height(),
        winHeight = $(window).height();
    return winHeight - elBottom - elTop;
}



/*
**Function to get original top of appx container and store it for any future use.
**Needed this because Chrome changed value after zoom
**
*/
function getOriginalTop() {
    appxOffsetTop = getVisible("appx_main_container_wrapper");
}


//Global setup variables
var debug = false;
var loggedin = false;
var appxclientversion = [03, 04];
var appxserverversion = null;
var client_init_sent = false;
var appx_session;
var localos_session;
var localos_access = false;
var appx_access = false;

// for handling Function keys and Option Codes
var xTriggered = 0;
var optionTriggered = 0;
var digits = [];
var basefontsize = 14.0;

// Allow page to load before calling any functions that depend on the DOM
$(document).ready(function () {

    // show/hide logging
    if (debug) {
        $("#log").show();
    }
    else {
        $("#log").hide();
    }
    $(document.body).append(
        $('<span>').attr("id", "fontcheck")
            .css({
                "display": "none",
                "font-family": "courier",
                "font-size": "14px",
                "padding": "0px",
                "margin": "0px",
                "box-sizing": "border-box"
            })
            .text("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    );

    if ($("#fontcheck").width() > 800) {
        basefontsize = (1.0 - (($("#fontcheck").width() - 800) / $("#fontcheck").width())) * 14.0;
    }

    $("#fontcheck").remove();

    // check websocket support
    var support = "MozWebSocket" in window ? 'MozWebSocket' : ("WebSocket" in window ? 'WebSocket' : null);

    // start session if websockets are supported, log support
    if (support != null) {
        appendMessage("WebSockets --  are fully supported in this browser.");

        // creates a global APPX Session object
        // NOTE: this object is destroyed on refresh, may need a work-around to prevent user to accidentally restarting a session
        if (localStorage["newsession"]) {
            appxNewSession = true;
            var si = JSON.parse(localStorage["newsession"]);
            delete (localStorage["newsession"]);
            appx_session = new APPX(appxConnectorHost, appxConnectorPort, appxConnectorMongoPort, appxConnectorPath, appxEncryption, basefontsize, appxLoginFormMinified);
            appx_session.startupinfo = si;
            setTimeout(function () {
                sendappxnewsessionlogin(si.remoteHost, si.remotePort, si.remoteUser, si.remotePassword, si);
            }, 1500);
        }
        else {
            appx_session = new APPX(appxConnectorHost, appxConnectorPort, appxConnectorMongoPort, appxConnectorPath, appxEncryption, basefontsize, appxLoginFormMinified);
        }
    }
    else {
        appendMessage(webSocketError);
    }
    $("#localos_access").removeClass().html("<a href='" + appxClientRoot + "/" + appx_session.localInstaller + "'>Local</a>");
    loadLanguage();
    /*Checks if user has appx-client-root meta tag in their page. If not throws 
    **alert. Not having metatag can hinder page displaying correctly.*/
    if (appxClientRoot == undefined) {
        alert(appx_session.language.alerts.rootError);
    }
});

$(function () {
    window.onbeforeunload = function (e) {
        if (appx_session.connected) {
            /*13 June 2016 - Custom leave page messages have been deprecated. 
            **Leaving this in for older browsers that still allow custom message*/
            e.returnValue = 'This will end your Appx session!';
            return 'This will end your Appx session!';
        }
    }
    window.onunload = function (e) {
        if (appx_session.connected) {
            appxwidgetcallback(356);
        }
        closeSession();
    }
    console.log('%cYou should only be here under the direction of APPX Technical Support. Please contact your System Administrator if this is not the case.', 'background-color: black; color: yellow; font-size: large');
});

/**
 * Function to close the web socket session
 */
function closeSession() {
    if (wss !== "undefined" && wss !== null) {
        wss.close();
    }
    if (ws) {
        ws.close();
    }
    if (appx_session.wss) {
        appx_session.wss.close();
    }
    if (appx_session.ws) {
        appx_session.ws.close();
    }
}

function launchIntoFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullscreen) {
        element.mozRequestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullscreen) {
        document.mozCancelFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

/*
**Function that changes the left position of all appx boxes when the browser window 
**is resized to keep boxes centered
*/
function boxResize() {
    var mainWidth = $("#appx_main_container").width();
    var prevOffset = appx_session.centerHorizontalOffset;
    /*Run through each box on the screen and change the left position so it remains
    **centered*/
    $("#appx_main_container").children().each(function () {
        var $id = $(this).attr("id");
        var tempOffset = ((mainWidth - $(this).width()) / 2);
        if (tempOffset < 0) {
            tempOffset = 0;
        }
        if ($id === undefined) {
            return;
        }

        var boxNo = (parseInt($id.substring($id.lastIndexOf("_") + 1)));

        if (((boxNo === 0) || tempOffset <= appx_session.centerHorizontalOffset) &&
            appx_session.getProp("centerAppx")) {
            var curOffset = appx_session.centerHorizontalOffset;
            appx_session.centerHorizontalOffset = tempOffset;
            /*If we change the offset based on box that is not the first box
            **then we go back and change the left position for all previous boxes*/
            for (var i = 0; i < boxNo; i++) {
                var $tempBox = $("#box_" + i);
                if ($tempBox.length) {
                    var tempBoxLeft = ($tempBox.position().left - curOffset);
                    $tempBox.css({
                        "left": ((tempBoxLeft + appx_session.centerHorizontalOffset) + "px")
                    });
                }
            }
        }
        var curLeft = $(this).position().left;

        var left = ((curLeft - prevOffset) + appx_session.centerHorizontalOffset);
        if (left < 0) {
            left = 0;
        }
        var childLeftOffset = curLeft - left;
        $(this).css({
            "left": left + "px"
        });

        /*Sometimes we have an empty box 0 that doesn't get positioned properly when screen is resized.
        **This code should fix that problem*/
        if (boxNo === 1) {
            var $box0 = $("#box_0");
            var $box1 = $(this);

            if ($box0.children().length <= 1 && $box0.position().top === $box1.position().top &&
                $box0.width === $box1.width && $box0.height === $box1.height) {
                $box0.css({
                    "left": left + "px"
                });
            }
        }
    });
}