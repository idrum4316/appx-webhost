
/*********************************************************************
 **
 **   public/js/appx-client-utilities.js - Client helper functions
 **
 **   This module contains some helper functions used by the client
 **
 *********************************************************************/

// what_str =  "@(#)Appx $Header: /src/cvs/appxHtml5/public/js/appx-client-utilities.js,v 1.62 2018/10/12 16:01:53 pete Exp $";

var appxPublicClientVersionStr = "6.0.0.19011401";
var appxPublicClientVersionNum = 60000.19011401;

// get's initialization assets from the APPX proxy server to prepare for running an APPX client session
// fired immediately after appx_session object is created and websocket connection is made to APPX proxy server
function initialize_localos_session() {
    var ms = {
        cmd: 'localosinit',
        args: [0, 0],
        handler: 'localos_init_handler',
        data: { languageId: appx_session.language.id }
    };
    localos_session.ws.send(JSON.stringify(ms));
}

// get's initialization assets from the APPX proxy server to prepare for running an APPX client session
// fired immediately after appx_session object is created and websocket connection is made to APPX proxy server
function initialize_appx_session(minified) {

    var ms = {
        cmd: 'appxinit',
        args: [minified, 0],
        handler: 'appx_init_handler',
        data: null
    };
    appx_session.ws.send(JSON.stringify(ms));
}

function appendMessage(message) {
    if (debug) {
        $("#log").prepend(message + "\n\n");
    }
}

/*Create directory folders for appx sessions*/
function initialize_localos_directories(mCachePath) {
    var ms = {
        cmd: 'localoscreatedir',
        args: [mCachePath, 0],
        handler: 'localos_init_handler',
        data: null
    };
    localos_session.ws.send(JSON.stringify(ms));
}



//Injects and Image into the DOM with an Object URL
//(allows server to send binary image data from the server without client saving locally
// or referencing a link to the server)
function inject_image(data) {
    var a = window.URL.createObjectURL(new Blob(data));
    img = new Image();
    img.src = a;
    $("body").prepend(img);
}

function inject_image2(data) {
    var a = window.URL.createObjectURL(new Blob([toArrayBuffer(data)]));
    img = new Image();
    img.src = a;
    $("body").prepend(img);
}

//Inject Javascript code into the header(for processes that need not be included in all clients)
function inject_script(data) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.text = data;
    document.head.appendChild(script);
}

//Injects a CSS Style sheet into the DOM header
//(allows server to send css file data from the server without client saving locally
// or referencing a link to the server)
// can be used to setup default style for APPX
function inject_style(data) {
    $("head").append($("<style>").attr("type", "text/css").text(data));
    $("body").change();
}

//Client Utility Functions
function logactivity(msg) {
    if (debug) {
        console.log(msg);
    }
}

var testca = 0;

function logca(msg) {
    if (debug) {
        console.log(++testca + "\t" + msg);
    }
}

//Convert Raw(Image) Data to Buffer
function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

function localos_enviro_handler(data) {
    logactivity("localos_enviro_handler() called...");
    appx_session.setProp("clientPublicVersionStr", appxPublicClientVersionStr);
    appx_session.setProp("clientPublicVersionNum", appxPublicClientVersionNum);

    appx_session.local_environment = data;

    if( ! appx_session.local_environment.authTokenValid ) {
	var accessCode = Math.floor(100000 + Math.random() * 900000); // 6 digit random number never starting with zero
	localos_session.ws.send(JSON.stringify({cmd:'auth',args:[],handler:'',data:{appName:'FIMMAS', accessCode: accessCode}}));
    }

    try {
        //may need to adjust for latency in appxConnector(appx_session)
        setTimeout(function () {
            appx_session.userhome = data[(appx_session.globals.os.indexOf("Win") > -1) ? 'USERPROFILE' : 'HOME'];
            appx_session.setProp("userHome", appx_session.userhome);

            if (data["localConnectorVersionStr"]) {
                appx_session.setProp("localConnectorVersionStr", data["localConnectorVersionStr"]);
            }
            else {
                appx_session.setProp("localConnectorVersionStr", "Unknown");
            }

            if (data["localConnectorVersionNum"]) {
                appx_session.setProp("localConnectorVersionNum", data["localConnectorVersionNum"]);
            }
            else {
                appx_session.setProp("localConnectorVersionNum", 99999.999);
            }
            $("#localos_access").prop('title', appx_session.language.tooltips.localVersion + appx_session.getProp("localConnectorVersionStr")); // <-- does not support HTML tags in tooltip

            if (appx_session.getProp("localConnectorVersionNum") < appxServerClientVersionNum) {
                $("#localos_access").html("Local-").css({
                    "color": "#FF7",
                    "font-weight": "bold"
                });

                if (appx_session.getProp("localConnectorVersionNum") > 50402.009 && localos_session.isUpdating == null) {
                    var ms = {
                        cmd: 'updatelocal',
                        args: [],
                        handler: 'appx_updatelocal_handler',
                        data: null
                    };
                    appx_session.ws.send(JSON.stringify(ms));
                }
            }

        }, 1000);
    }
    catch (e) {
        console.log("localos_enviro_handler: can't set home - " + e);
        console.log(e.stack);
    }
}

function appxupdatelocalhandler(x) {
    if (appxIsLocalReady()) {

        var filecopy = {};
        filecopy.filename = "localConnectorUpdate.zip";
        filecopy.filedata = x;

        ms = {
            cmd: 'update',
            args: [filecopy],
            handler: 'localos_update_handler',
            data: null
        };
        $("#localos_access").html("Updating").css({
            "color": "#F77",
            "font-weight": "bold"
        });
        localos_session.isUpdating = true;
        localos_session.ws.send(JSON.stringify(ms));
    }
}

/*
**Function that parses the query string and puts values into object
**
**@return qVars: Object containing parsed query string name/value pairs
*/
function parseQueryString() {
    var qVars = {};
    var qTempArray = [];
    var qStringArray = window.location.href.substring(window.location.href.indexOf("?") + 1).split("&");
    for (var i = 0; i < qStringArray.length; i++) {
        qTempArray = qStringArray[i].split("=");
        qVars[decodeURI(qTempArray[0])] = decodeURI(qTempArray[1]);
    }
    return qVars
}
