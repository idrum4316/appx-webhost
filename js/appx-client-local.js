/*********************************************************************
 **
 **   public/js/appx-client-local.js - Client Local connection code
 **
 **   This module handles the connection and data traffic between the
 **   Appx Client running in the browser and the appx connector code
 **   running on the desktop.  The local connector is our proxy into
 **   the desktop OS.
 **
 *********************************************************************/

// what_str =  "@(#)Appx $Header$";

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
