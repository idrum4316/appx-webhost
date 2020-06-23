
/*********************************************************************
 **
 **   public/js/appx-client-utilities.js - Client helper functions
 **
 **   This module contains some helper functions used by the client
 **
 *********************************************************************/

// what_str =  "@(#)Appx $Header: /src/cvs/appxHtml5/public/js/appx-client-utilities.js,v 1.65 2019/02/21 20:13:19 pete Exp $";

var appxPublicClientVersionStr = "6.0.0.20040817";
var appxPublicClientVersionNum = 60000.20040817;

// get's initialization assets from the APPX proxy server to prepare for running an APPX client session
// fired immediately after appx_session object is created and websocket connection is made to APPX proxy server
function initialize_localos_session() {
    var ms = {
        cmd: 'localosinit',
        args: [0, 0],
        handler: 'localos_init_handler',
        data: { languageId: appx_session.language.id },
	authToken: localStorage.authToken
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
        data: null,
	authToken: localStorage.authToken
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

    appx_session.local_environment = data;

    if( appx_session.getProp("localConnectorVersionNum") >= 60000.19022101 && ! appx_session.local_environment.authTokenValid ) {
	var accessCode = Math.floor(100000 + Math.random() * 900000); // 6 digit random number never starting with zero
	localos_session.ws.send(JSON.stringify(
				    {
				        cmd: 'auth',
					args: [],
					handler: '',
					data: {
					    appName: $('meta[name=appx-app-name]').attr("content"), 
					    accessCode: accessCode
					}
				    }
				));

	$("#appx-status-msg").html("<span class='status-msg-error'>&nbsp;" + "Local Connector Access Code: " + accessCode + "&nbsp;</span>");
    }

    try {
        //may need to adjust for latency in appxConnector(appx_session)
        setTimeout(function () {
            appx_session.userhome = data[(appx_session.globals.os.indexOf("Win") > -1) ? 'USERPROFILE' : 'HOME'];
            appx_session.setProp("userHome", appx_session.userhome);

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
            data: null,
	    authToken: localStorage.authToken
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
﻿/*********************************************************************
 **
 **   public/js/appx-client-local.js - Client Local connection code
 **
 **   This module handles the connection and data traffic between the
 **   Appx Client running in the browser and the appx connector code
 **   running on the desktop.  The local connector is our proxy into
 **   the desktop OS.
 **
 *********************************************************************/

// what_str =  "@(#)Appx $Header: /src/cvs/appxHtml5/public/js/appx-client-local.js,v 1.39 2019/02/07 15:25:23 pete Exp $";

/*********************************************************************
 ** showLocalMissing() displays a popup to install the local connector
 *********************************************************************/

function showLocalMissing() {
    var prefs =
        "<h1>Local Desktop Access</h1>" +
        "<p>This application requires local access to your desktop to perform certain functions.  This is a one time activity that does not require any Administrator privileges.</p>" +
        "<p>To allow this access please perform the following steps:" +
        "<ol>" +
        "<li>Click this link to download the local connector. (<a href='" + appxClientRoot + "/" + appx_session.localInstaller + "'>Download Local Connector</a>)</li>" +
        "<li>Run the downloaded file and follow the prompts.</li>" +
        "<li>Close this popup window to retry local desktop access.</li>" +
        "</p>";

    var d = $("<div id='appx_prefs'>")
        .css({
            "background": "rgba(50, 50, 50, 0.7)",
            "width": "100%",
            "height": "100%",
            "min-height": "220px",
            "z-index": "10000000",
            "display": "none",
            "position": "absolute",
            "top": "0px",
            "left": "0px",
            "font-family": "verdana",
            "font-size": "11px"
        })
        .appendTo("body");

    var prefwrap = $("<div style='border: 10px solid #333;'>")
        .css({
            "width": "550px",
            "height": "220px",
            "background": "#fff"
        })
        .appendTo("#appx_prefs")
        .position({
            "my": "center",
            "at": "center",
            "of": window
        })
        .draggable();

    var prefsdiv = $("<div>")
        .css({
            "margin": "0px 10px",
            "width": "550px",
            "height": "220px"
        });

    var closer = $("<div>")
        .css({
            "background": "#333",
            "text-align": "right",
            "padding": "5px",
            "color": "#F5F539",
            "font-weight": "bold",
            "padding-bottom": "10px"
        })
        .append($("<span>close(X)</span>")
            .click(function () {
                $("#appx_prefs").hide();
                $("#appx_prefs").remove();
                localos_session = new LOCALOS();
            }));

    $(prefwrap).prepend($("<div>").append(closer));

    $(prefsdiv).append($("<div>").append(prefs));

    $(prefsdiv).appendTo(prefwrap);

    $("#appx_prefs").show();

    $(prefs).find("input").change(function () {
        appx_session.setProp($(this).attr("id"), $(this).val());
        if (appx_session.getRawProp($(this).attr("id")) != null)
            $(this).css({
                "background": "#ff0"
            });
        else
            $(this).css({
                "background": "#fff"
            });
    });
}

/*********************************************************************
 ** LOCALOS() function to interact with local connector
 *********************************************************************/

// Local OS session object
// Contain websocket setup fuctions, and handler mapping
function LOCALOS() {
    this.message = new message();
    this.ws = connectToServer(this.message);
    this.current_msg = {
        "header": []
    };
    this.isUpdating = null;

    function connectToServer(ms) {
        // create a new websocket and connect
        // run this client against appx-connector-server-3015-4.js
        try {
            var ws = new WebSocket('ws://127.0.0.1:3013/');

            // when data is comming from the server, this method is called
            ws.onmessage = function (evt) {

                if (debug) {
                    logactivity("svr message:  ");
                    logactivity(evt.data);
                    appendMessage(evt.data + "\n\n");
                }
                ms.handler(evt);

            };

            // when the connection is established, this method is called
            ws.onopen = function (evt) {
                localos_access = true;
                appx_session.localConnectorRunning = true;

                $("#localos_access").removeClass().addClass("connected").html("<a href='" + appxClientRoot + "/" + appx_session.localInstaller + "'>Local+</a>");

                appendMessage('* Connection to local server(localhost:3013)  open<br/>');
                $("#functions").toggleClass("functions_on");

                initialize_localos_session();
            };

            // when the connection is closed, this method is called
            ws.onclose = function (evt) {
                localos_access = false;

                $("#localos_access").removeClass().addClass("disconnected").html("<a href='" + appxClientRoot + "/" + appx_session.localInstaller + "'>Local</a>");

                if (appxLocalRequired == "true" && (!localos_access) && (!localos_session.isUpdating) && navigator.userAgent.indexOf("Mobile") === -1) {
                    showLocalMissing();
                    appxLocalRequired = false;
                    appx_session.localConnectorRunning = false;
                }

                appendMessage('* Connection to local server(localhost:3013) closed<br/>');
                $("#functions").toggleClass("functions_on");
            };

            // when the connection is closed, this method is called
            ws.onerror = function (evt) {
                appendMessage('* Local server(localhost:3013) Error<br/>');
            };

        }
        catch (ex) {
            alert(ex);
            console.log(ex.stack);
        }

        return ws;
    }

    function message() {
        this.handler = handler;

        function handler(msg) {
            if (debug) logactivity("main handler: " + msg);
            try {
                var rtnobj = JSON.parse(msg.data);
                logactivity("data:  " + rtnobj.data);
                switch (rtnobj.type) {
                    case "LOCALOS-RELOAD":
                        setTimeout(function () {
                            localos_session = new LOCALOS();
                            localos_session.isUpdating = false;
                        }, 500);
                        break;
                    case "LOCALOS-AUTH":
			if( rtnobj.data.authStatus === "allow" ) {
			    localStorage.authToken = rtnobj.data.authToken;
			    $("#appx-status-msg").html("");
			}
			else {
			    $("#appx-status-msg").html("Access Denied");
			}
                        break;
                    case "LOCALOS-DND":
                        appx_session.dndData = rtnobj.data;
                        appxwidgetcallback(OPT_DROP);
                        break;
                    case "LOCALOS-HTML":
                        $("#appx-frame").append(rtnobj.data);
                        break;
                    case "LOCALOS-STYLE":
                        localos_style_handler(rtnobj.data);
                        break;
                    case "LOCALOS-SCRIPT":
                        inject_script(rtnobj.data);
                        break;
                    case "LOCALOS-OPENFILE":
                        localos_file_handler(rtnobj);
                        break;
                    case "LOCALOS-OPENIMAGE":
                        localos_image_handler(rtnobj.data);
                        break;
                    case "LOCALOS-RUNCOMMAND":
                        localos_cmd_handler(rtnobj.data);
                        break;
                    case "LOCALOS-EXECOMMAND":
                        localos_exec_handler(rtnobj.data);
                        break;
                    case "LOCALOS-ENVIRONMENT":
                        localos_enviro_handler(rtnobj.data);
                        break;
                    case "LOCALOS-SETCLIPBOARD":
                        localos_setclipboard_handler(rtnobj.data);
                        break;
                    case "LOCALOS-GETCLIPBOARD":
                        localos_getclipboard_handler(rtnobj.data);
                        break;
                    case "LOCALOS-FILE-DIALOG":
                        localos_file_dialog_handler(rtnobj.data);
                        break;
                    case "LOCALOS-ERROR":
                        localos_error_handler(rtnobj);
                        break;
                    case "LOCALOS-CREATEFILE":
                        localos_create_file_handler(rtnobj.data);
                        break;
                    case "LOCALOS-APPENDFILE":
                        localos_append_file_handler(rtnobj.data);
                        break;
                    default:
                        logactivity("No handler for LOCAL OS Data Message:  " + msg.data);
                }
            }
            catch (e) {
                logactivity(e);
                console.log("LOCAL Handler: " + e);
                console.log(e.stack);
            }
        }
    }
};

/*********************************************************************
 ** function handlers
 *********************************************************************/

function localos_file_dialog_handler(data) {
    var el = $(".awaiting_filepath");
    $(el).removeClass("awaiting_filepath");
    if (data && data.length > 0 && data[0].length > 0) {
        $(el).val(data);
        $(el).addClass("dirty");
    }
}

function localos_setclipboard_handler(data) {
    // FIXME: WHERE: public/js/appx-client-local.js localos_setclipboard_handler()
    // FIXME: ISSUE: function is not implemented.  It only logs that it happened.
    logactivity("localos_setclipboard_handler() called...");
    console.log("clipboard data set in localos:  " + data);
}

function localos_getclipboard_handler(data) {
    logactivity("localos_setclipboard_handler() called...");
    console.log("clipboard data got in localos:  " + data);
    var clip = data;
    var ms = {
        cmd: 'appxclipboard',
        args: [clip],
        handler: 'appxsendfilehandler',
        data: null
    };
    appx_session.ws.send(JSON.stringify(ms));
}

function localos_exec_handler(data) {
    logactivity("localos_exec_handler() called...");
    console.log("an exec handler was called:  ");
    console.dir(data);
}

function localos_error_handler(data) {
    logactivity("localos_error_handler() called...");
    console.log("an error occurred on localos connector:  ");
    console.dir(data);

    /*If local connector gives error when trying to open file then we
    **return failure code so engine doesn't hang*/
    if (data.cmd === "openfile") {
        var ms = {
            cmd: 'appxmessage',
            args: [3, 0],
            handler: 'APPXRECEIVEFILE',
            data: null
        };
        appx_session.ws.send(JSON.stringify(ms));
    }
}

function localos_file_handler(data) {
    appx_session.ws.send(JSON.stringify(data));
    logactivity("localos_file_handler() called...");
}
﻿/*********************************************************************
 **
 **   public/js/appx-client-remote.js - Client Remote conenction code
 **
 **   This module handles the connection and data traffic between the
 **   Appx Client running in the browser and the appx connector code
 **   running on the server.  The server connector is our proxy into
 **   the server Appx application.
 **
 *********************************************************************/

// what_str =  "@(#)Appx $Header: /src/cvs/appxHtml5/public/js/appx-client-remote.js,v 1.115 2019/12/18 16:20:38 m.karimi Exp $";
var cMsgCount = 0;

/*********************************************************************
 **  Custom Json formatter that implements and AES encryption cypher
 *********************************************************************/

var JsonFormatter = {
    stringify: function (cipherParams) {
        var jsonObj = {
            ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
        };
        if (cipherParams.iv) {
            jsonObj.iv = cipherParams.iv.toString();
        }
        if (cipherParams.salt) {
            jsonObj.s = cipherParams.salt.toString();
        }
        return JSON.stringify(jsonObj);
    },
    parse: function (jsonStr) {
        var jsonObj = JSON.parse(jsonStr);
        var cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
        });
        if (jsonObj.iv) {
            cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
        }
        if (jsonObj.s) {
            cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
        }
        return cipherParams;
    }
};

/*********************************************************************
 **  APPX() - Main Appx Session object, comm setup, handler mappings
 *********************************************************************/

function APPX(server, port, mongoPort, path, ssl, fontbase, minified) {
    var thisAppx = this;
    this.connectRetryCount = 2;
    this.message = new message();
    this.ws = connectToServer(this.message, server, port, ssl, path, minified);
    this.appxDataCacheUrl = appxProtocol + "://" + appxConnectorHost + ":" + appxConnectorMongoPort + appxConnectorPathHttp + "/getGridData";
    this.appxCacheUrl = appxProtocol + "://" + appxConnectorHost + ":" + appxConnectorMongoPort + appxConnectorPathHttp;
    this.appxResourceUrl = appxProtocol + "://" + appxConnectorHost + ":" + appxConnectorMongoPort + appxConnectorPathHttp + "/getResource/";
    this.current_msg = {
        "header": []
    };
    this.uploadURL = null;
    this.userPrefsURL = null;
    this.init_optimization_flag = null;
    this.override = false;
    this.blur = false;
    this.current_show = null;
    this.clientIds = {};
    this.editorConfigs = {};
    this.widgets = [];
    this.appxTableList = {};
    this.currenttabledata = [];
    this.items = [];
    this.rowtext = [];
    this.lineSeparator;
    this.basefontsize = fontbase;
    this.rowHeightPx = 21;
    this.colWidthPx = 8;
    this.processhelp = false;
    this.processhelpoption = null;
    this.runOnUnlock = [];
    this.scan = false;
    this.screenrows = 35;
    this.screencols = 144;
    this.container_top = 80;
    this.language = {};
    this.image_cache = {
        "keys": [],
        "length": 0
    };
    this.token_cache = {
        "keys": [],
        "length": 0
    };
    this.token_groups = {};
    this.showErrorDialog = null;
    this.pid = 0;
    this.currsendfile = {
        "filename": "",
        "filedata": []
    };
    this.datacachepath = "";
    this.loginTimeout = true;
    this.serverConnectorVersionStr;
    this.serverConnectorVersionNum;
    this.localConnectorRunning = false;
    this.localInstaller = null;
    this.mongoErrorDisplayed = false;
    this.server = server;
    this.port = port;
    this.mongoPort = mongoPort;
    this.user = null;
    this.password = null;
    this.path = path;
    this.protocol = ssl;
    this.crypto = ssl == "aes" ? true : false;
    this.currentmenu = null;
    this.showoptnums = false;
    this.createWidgetTag = {};
    this.optionOverride = {};
    this.globals = {};
    /*Start jqGrid variables*/
    this.gridcache = {};
    this.gridpropscache = {};
    /*End jqGrid variables*/
    this.dndData = [];
    this.connected = false;
    this.interactT = null;
    this.interactTblur = null;
    this.topboxid = null;
    this.objFocus = null;
    this.objEventFired = false;
    this.objItems = null;
    this.signaturePad;
    this.signaturePadID;
    this.signaturePadFail = true;
    this.serverInterrupt = false;
    this.activeDatepicker = null;
    this.locked = false;
    this.keyLeft = null;
    this.msgs = [];
    this.dirtySinceSave = false;
    this.tablist = null;
    this.lastOption;
    this.keyPauseLastPosition;
    this.rawEncoding;
    this.buildingEm = false;
    /*Start logging object creation*/
    this.config = {
        debug: {
            tableLogging: true
        }
    }
    /*End logging object creation*/
    /*Start tables & resources loaded variables*/
    this.rowCallback = false;
    this.pendingResources = { "length": 0 };
    this.pendingTables = 0;
    this.tableOptions;
    this.tableLoaded = true;
    this.tablePreferences = {};
    this.tableDefaults = {};
    /*End tables & resources loaded variables*/
    /*Start browser file upload variables*/
    this.fileRecommendedUploadSize = parseInt($('meta[name=appx-recommended-upload-size]').attr("content"));
    this.fileCount = 0;
    this.mongoFileUpload = [];
    this.mongoURL = "";
    this.dropEvent = null;
    this.filesUploadArray = [];
    /*End browser file upload variables*/
    /*Start screen centering variables*/
    this.centerHorizontalOffset = 76;
    this.centerVerticalOffset = 0;
    /*End screen centering variables*/
    this.valueTimer = null;
    this.valueTimerStart = function (cmdValAdj, $tag) {
        appx_session.valueTimerStop();
        if (cmdValAdj && cmdValAdj != OPT_NULL) {
            var valChgTmr = parseInt(appx_session.getProp("valueChangedTimer"));
            if (valChgTmr > 0) {
                logca("setting timeout");
                appx_session.valueTimer = setTimeout(function (cmd) {
                    if (appx_session.valueTimer) {
                        appx_session.valueTimerStop();
                        appx_session.keyPauseLastPosition = getCursorPosition($tag);
                        logca("keyPause: " + cmd);
                        if (!appxIsLocked()) appxwidgetcallback(cmd);
                        else logca("(locked");
                    }
                    else {
                        logca("keyPause was cancelled");
                    }
                }, valChgTmr, cmdValAdj);
            }
        }
    };
    this.valueTimerStop = function () {
        if (appx_session.valueTimer) {
            clearTimeout(appx_session.valueTimer);
            appx_session.valueTimer = null;
            logca("valueTimer stopped");
        }
    };

    /*Set up local installer file based on operating system and set the line separator
    **character*/
    this.globals["os"] = window.navigator.platform;
    switch (this.globals.os) {
        case "Win32":
        case "Win64":
            this.localInstaller = "localConnector_win.exe";
            this.lineSeparator = "\r \n";
            break;
        case "MacIntel":
            this.localInstaller = "localConnector_osx.dmg";
            this.lineSeparator = "\n";
            break;
        case "Linux x86_64":
            this.localInstaller = "localConnector_linux64.sh";
            this.lineSeparator = "\n";
            break;
        case "Linux i686":
            this.localInstaller = "localConnector_linux32.sh";
            this.lineSeparator = "\n";
            break;
        default:
            this.localInstaller = "System Unknown";
            this.lineSeparator = "\r \n";
    }

    //		FEATURE_RUNNING_GUI_CLIENT      = 0x00000001;
    //		FEATURE_PASS_PROC_ID_ON_INIT    = 0x00000002;
    //		FEATURE_LOAD_KEYMAP_FROM_SERVER = 0x00000004;
    //		FEATURE_RUN_VIA_RT_LOAD         = 0x00000008;
    //		FEATURE_DATA_PALETTE_SUPPORT    = 0x00000010;
    //		FEATURE_DOWNLOAD_FILE           = 0x00000020;
    //		FEATURE_UPLOAD_FILE             = 0x00000040;
    //		FEATURE_ADD_FIELD               = 0x00000080;
    //		FEATURE_GET_LANG_BLK            = 0x00000100;
    //		FEATURE_BUTTONS                 = 0x00000200;
    //		FEATURE_CLI_PRINT               = 0x00000400;
    //		FEATURE_REL41P1_SELECT          = 0x00000800;
    //		FEATURE_REL41P2_TOKENS          = 0x00001000;
    //		FEATURE_FILTER_BOXES            = 0x00002000;
    //		FEATURE_DATE_CHOOSER            = 0x00004000;
    //		FEATURE_AUTO_MENUS              = 0x00008000;
    //		FEATURE_BOX_ITM_WDGT            = 0x00010000;
    //		FEATURE_GUI_EDIT_CMD            = 0x00020000;
    //		FEATURE_LONG_DATA               = 0x00040000;
    //		FEATURE_TOKEN_SCANS             = 0x00080000;
    //		FEATURE_JOE2_GUI_CLIENT         = 0x00100000;
    //		FEATURE_NO_END_PARAG            = 0x00200000;
    //		FEATURE_CLIENT_CLIPBOARD        = 0x00400000;
    //		FEATURE_CONSTANTS_EXCH          = 0x00800000;
    //		FEATURE_SERVER_TOOLBARS         = 0x01000000;
    //		FEATURE_CLIENT_PATH_EXPANSION   = 0x02000000;
    //		FEATURE_ALPHA_CHANNEL_COLORS    = 0x04000000;
    //		FEATURE_LONG_TOKENS             = 0x08000000;
    //		FEATURE_SERVER_PULLDOWNS        = 0x10000000;
    //		FEATURE_LOGIN_FAILURE_MESSAGE   = 0x20000000;
    //		FEATURE_TABLE_WIDGETS           = 0x40000000;
    //		EXTENDED_FEATURES               = 0x80000000;

    var mask = 0xd7d5f6fb;

    mask0 = (mask & 0xFF000000) >> 24;
    mask1 = (mask & 0x00FF0000) >> 16;
    mask2 = (mask & 0x0000FF00) >> 8;
    mask3 = (mask & 0x000000FF);

    this.feature_mask = [parseInt(mask0), parseInt(mask1), parseInt(mask2), parseInt(mask3)];

    //Extended Feature Mask

    //    #define TMNET_FEATURE2_RECONNECT              0x00000001
    //    #define TMNET_FEATURE2_INTERRUPT              0x00000002
    //    #define TMNET_FEATURE2_SCROLLPANE_RESIZE      0x00000004
    //    #define TMNET_FEATURE2_TABLE_SORTDATA         0x00000008
    //    #define TMNET_FEATURE2_NO_SCREEN_DATA         0x00000010
    //    #define TMNET_FEATURE2_SEND_ALL_ITEMS         0x00000020
    //    #define TMNET_FEATURE2_HTML5_VERSION_1        0x00000040
    //    #define TMNET_FEATURE2_PUSH_AND_OPEN          0x00000080
	//	  #define TMNET_FEATURE2_UNICODE_ENGINE         0x00000100
	//	  #define TMNET_FEATURE2_CUSTOMIZABLE_TABLE_HEADERS 0x00000200
	//	  #define TMNET_FEATURE2_CUSTOMIZABLE_TABLE_ROWS    0x00000400

    var exmask = 0x000006fb;

    exmask0 = (exmask & 0xFF000000) >> 24;
    exmask1 = (exmask & 0x00FF0000) >> 16;
    exmask2 = (exmask & 0x0000FF00) >> 8;
    exmask3 = (exmask & 0x000000FF);

    this.extended_feature_mask = [parseInt(exmask0), parseInt(exmask1), parseInt(exmask2), parseInt(exmask3)];

    $("<div id='appx_main_container_wrapper'>")
        .addClass("appx_main_container_wrapper")
        .append($("#appx_main_container"))
        .appendTo("#main");

    /*********************************************************************
     **  connectToServer() - Create a connection to the Appx Server Proxy
     *********************************************************************/

    function connectToServer(ms, server, port, protocol, path, minified) {
        // create a new websocket and connect
        var ws;

        if (server != null && port != null) {
            if (protocol == 'ssl') {
                ws_url = 'wss://' + server + ':' + port + path;
                $("#appxFooterSSL").show();
                $("#appxLoginSSL").show();
            }
            else {
                ws_url = 'ws://' + server + ':' + port + path;
            }
        }
        else {
            ws_url = "ws://localhost:3014/";
        }

        ws = new WebSocket(ws_url);

        // when data is going to the server, this method is called
        ws.send = function (s) {
            var m = s;
            if (appx_session.crypto) {
                m = CryptoJS.AES.encrypt(s, "APPX", {
                    format: JsonFormatter
                });
            }

            return (WebSocket.prototype.send.call(this, m));
        };

        // when data is coming from the server, this method is called
        ws.onmessage = function (evt) {
            var m = evt.data;
            if (appx_session.crypto) {
                m = CryptoJS.AES.decrypt(evt.data, "APPX", {
                    format: JsonFormatter
                })
                    .toString(CryptoJS.enc.Utf8);
            }

            ms.handler(evt, m);
        };

        // This is called if we want to try to keep a connection alive when a firewall wants to time us out
        var heartbeatTimeout;

        function sendHeartbeat() {
            var ms = {
                cmd: 'ping',
                args: [0, 0],
                handler: '',
                data: null
            };
            ws.send(JSON.stringify(ms));

            heartbeatTimeout = setTimeout(sendHeartbeat, 30000);
        }

        // when the connection is established, this method is called
        ws.onopen = function (evt) {
            APPX.access = true;
            appx_access = true;

            sendHeartbeat();

            $("#appx_access")
                .html("Remote+")
                .css({
                    "color": "lime",
                    "font-weight": "bold"
                });

            $("#functions")
                .toggleClass("functions_on");

            initialize_appx_session(minified);
        };

        // when the connection is closed, this method is called
        ws.onclose = function (evt) {
            clearTimeout(heartbeatTimeout);

            APPX.access = false;
            appx_access = false;

            $("#appx_access")
                .html("Remote")
                .css({
                    "color": "#F77",
                    "font-weight": "bold"
                });

            $("#functions")
                .toggleClass("functions_on");

            if (appx_session.connected) {
                var $msghtml = $("<span>")
                    .html("Lost connection to server")
                    .addClass("status-msg")
                    .addClass("status-msg-error");
                $("#appx-status-msg").html($msghtml);
            }
        };

        // when the connection is closed, this method is called
        ws.onerror = function (evt) { 
	    console.log(evt); 
	    if( thisAppx.connectRetryCount > 0 ) {
		thisAppx.connectRetryCount--;
		thisAppx.ws = connectToServer( ms, server, port, protocol, path, minified );
	    }
	};

        return ws;
    };

    /*
    **Function sets timer to check if login has timed out (10 seconds) & if so
    **reloads page
    */
    this.loginTimer = function () {
        setTimeout(function () {
            if (appx_session.loginTimeout) {
                alert(appx_session.language.alerts.serverConnectError);
                location.reload();
            }
        }, 10000);
    }



    /*********************************************************************
     **  message() - Message Handler for Server messages
     *********************************************************************/

    function message() {
        this.handler = handler;

        function handler(msg, data) {
            if (debug) {
                logactivity("main handler: " + msg);
            }
            try {
                var rtnobj = JSON.parse(data);
                if (rtnobj.serverConnectorVersionStr) {
                    appx_session.serverConnectorVersionStr = rtnobj.serverConnectorVersionStr;
                    appx_session.serverConnectorVersionNum = rtnobj.serverConnectorVersionNum;
                }
                if (rtnobj.mongoStatus) {
                    if (rtnobj.mongoStatus === "Error" && !appx_session.mongoErrorDisplayed) {
                        console.log(mongoConnectError);
                        alert(appx_session.language.alerts.mongoConnectError);
                        appx_session.mongoErrorDisplayed = true;
                    }
                }
                appx_session.serverInterrupt = false;
                switch (rtnobj.type) {
                    case "HTML":
                        $("#appx-frame")
                            .append(rtnobj.data);
                        break;
                    case "STYLE":
                        inject_style(rtnobj.data);
                        break;
                    case "UPDATE":
                        appxupdatelocalhandler(rtnobj.data);
                        break;
                    case "SCRIPT":
                        inject_script(rtnobj.data);
                        break;
                    case "APPXLOGIN":
                        appxloginhandler(rtnobj);
                        appx_session.loginTimeout = false;
                        break;
                    case "APPXRECONNECT":
                        appxreconnecthandler(rtnobj);
                        break;
                    case "APPXINIT":
                        appxinithandler(rtnobj);
                        break;
                    case "APPXFEATURES":
                        appxfeatureshandler(rtnobj);
                        break;
                    case "APPXEXTENDEDFEATURES":
                        appxextendedfeatureshandler(rtnobj);
                        break;
                    case "APPXPID":
                        appxpidhandler(rtnobj);
                        break;
                    case "APPXATTACH":
                        appxattachhandler(rtnobj);
                        // binds body keydown events to a function
                        $(document).on('keydown', function (event) {
                            sendkey(event);
                        });
                        $(document).on('keyup', function (event) {
                            sendkey(event);
                        });
                        break;
                    case "APPXKEYMAP":
                        appxkeymaphandler(rtnobj);
                        break;
                    case "APPXITEMS":
                        appxitemshandler(rtnobj);
                        break;
                    case "APPXMSGS":
                        appxmsgshandler(rtnobj);
                        break;
                    case "APPXWIDGETS":
                        appxwidgetshandler(rtnobj);
                        break;
                    case "APPXSHOW":
                        appxshowhandler(rtnobj);
                        break;
                    case "APPXSCREEN":
                        appx_session.blur = false;
                        appxscreenhandler(rtnobj);
                        break;
                    case "APPXATTRIBUTES":
                        appxattributeshandler(rtnobj);
                        break;
                    case "APPXEXTRAATTRIBUTES":
                        appxextraattributeshandler(rtnobj);
                        break;
                    case "APPXPING":
                        appxpinghandler(rtnobj);
                        break;
                    case "APPXTOKEN":
                        appxtokenhandler(rtnobj);
                        break;
                    case "APPXRESOURCE":
                        AppxResource.handler(rtnobj);
                        break;
                    case "APPXSETFIELD":
                        appxsetfieldhandler(rtnobj);
                        break;
                    case "APPXLOADURL":
                        appxloadurlhandler(rtnobj);
                        break;
                    case "APPXRECEIVEFILE":
                        appxreceivefilehandler(rtnobj);
                        break;
                    case "APPXFILEUPLOADPROGRESS":
                        appxfileuploadprogresshandler(rtnobj);
                        break;
                    case "APPXSENDFILE":
                        appxsendfilehandler(rtnobj);
                        break;
                    case "APPXMENU":
                        appxmenuhandler(rtnobj);
                        break;
                    case "APPXCREATEOBJECT":
                        appxobjectcreatehandler(rtnobj);
                        break;
                    case "APPXINVOKEOBJECT":
                        appxobjectinvokehandler(rtnobj);
                        break;
                    case "APPXDESTROYOBJECT":
                        appxobjectdestroyhandler(rtnobj);
                        break;
                    case "APPXFINISH":
                        appxfinishhandler(rtnobj);
                        break;
                    case "APPXCNSTS":
                        appxconstantshandler(rtnobj);
                        break;
                    case "APPXGETCLIPBOARD":
                        appxgetclipboardhandler(rtnobj);
                        break;
                    case "APPXSETCLIPBOARD":
                        appxsetclipboardhandler(rtnobj);
                        break;
                    case "APPXTABLEDATA":
                        appxtabledatahandler(rtnobj);
                        break;
                    case "APPXQUERYTABLEDATA":
                        appxupdatetabledatahandler(rtnobj);
                        break;
                    case "APPXENCODINGERROR":
                        appxEncodingError(rtnobj.data[1]);
                    case "APPXPROCSTACK":
                        appxProcessStack(rtnobj.data);
                    default:
                        logactivity("No handler for APPX Data Message:  " + data);
                }
            }
            catch (e) {
                logactivity(e);
                console.log("REMOTE Handler: " + e);
                console.log(e.stack);
            }
        }
    }
};


function fetchQueryTableRowData(id, el, sortcol, pagenum) {
    var ms = {
        cmd: 'appxquerytabledata',
        args: [id, el],
        handler: 'appxquerytabledata',
        data: null
    };
    appx_session.ws.send(JSON.stringify(ms));
}

function appxupdatetabledatahandler(rtnobj) {
    updateGridMongo(rtnobj.data.rows, rtnobj.data.elid);
}

function appxProcessStack(data) {
    for (var props in appx_session.gridpropscache) {
        var found = false;
        for (var keys in data) {
            if (props.indexOf(keys) > -1) {
                found = true;
            }
        }
        if (!found) {
            debugger;
            delete appx_session.gridpropscache[props];
        }
    }
}

function fetchInitialTableRowData(id, el, sortcol, startrow) {
    var ms = {
        cmd: 'appxtabledata',
        args: [id, el, sortcol, startrow],
        handler: 'appxtabledata',
        data: null
    };
    appx_session.ws.send(JSON.stringify(ms));
}

function appxtabledatahandler(rtnobj) {
    var coldata = appx_session.currenttabledata[rtnobj.data.elid];
    createGridMongo(coldata, rtnobj.data.rows, rtnobj.data.elid);
}


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