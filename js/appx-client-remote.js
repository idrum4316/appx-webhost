/*********************************************************************
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

