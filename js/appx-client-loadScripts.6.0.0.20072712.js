/**************************************************************************
**@File: appx-client-loadScripts.js
**@Company: APPX Software, Inc.
**@Programmer: John Nelson
**@Last Edited By: John Nelson
**@Date Created: 16 December 2015
**@Date Last Modified: 14 Feb 2017
**@Description: Dynamically loads css and script required for appx to run.
**@Function: loadLinkScriptFile
**@Function: getRootContent
**@Function: loadScripts
***************************************************************************/

var arrayScripts;
var min = "";
var userLibraries = [];
/*Login text that user can dynamicially change*/
var loginText = "APPX Login";

/*Array of meta elements to be added to document.*/
var metas = {
    "title": { "value": "Appx Template" },
    "appx-login-user": { "value": "", "hide": "false" },
    "appx-login-pswd": { "value": "", "hide": "false" },
    "appx-login-host": { "value": "{appx server}", "hide": "false" },
    "appx-proxy-host": { "value": "{node server}" },
    "appx-login-port": { "value": "8060", "hide": "true" },
    "appx-login-rows": { "value": "35", "hide": "true" },
    "appx-login-cols": { "value": "144", "hide": "true" },
    "appx-proxy-port": { "value": "3014" },
    "appx-mongo-port": { "value": "3015" },
    "appx-proxy-path": { "value": "/appxws/" },
    "appx-minified-files": { "value": "min" },
    "appx-client-root": { "value": "." },
    "appx-use-softkeys": { "value": "false" },
    "appx-auto-connect": { "value": "false" },
    "appx-local-required": { "value": "true" },
    "appx-upload-without-local": { "value": "false" },
    "appx-recommended-upload-size": { "value": "1000000" },
    "appx-static-tools": { "value": "true" },
    "appx-fill-window": { "value": "false" },
    "appx-encryption": { "value": "aes" },
    "appx-app-name": { "value": "APPX" },
	"appx-close-on-exit": { "value": "false"}
}

/*
**Function to create the array of scripts for processing
**{ "nameLoc": root + "/css/smoothness/jquery-ui-1.11.4.min.css", "type": "css" },
**@param root: string containing the root path
*/
function createScriptsArray(root) {
    var version = "6.0.0.20072712";
    arrayScripts = [
        { "nameLoc": root + "/js/libraries/jquery-1.10.2.min.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/ckeditor/ckeditor.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/jquery-ui-1.11.4.min.js", "type": "js" },
        { "nameLoc": root + "/css/smoothness/jquery-ui-1.11.4.min.css", "type": "css" },
        { "nameLoc": root + "/css/jquery-ui-1.12.icon-font.min.css", "type": "css" },
        { "nameLoc": root + "/css/colpick.css", "type": "css" },
        { "nameLoc": root + "/css/nouislider.min.css", "type": "css" },
        { "nameLoc": root + "/css/nouislider.tooltips.css", "type": "css" },
        { "nameLoc": root + "/js/libraries/jqgrid-5_3_1/ui.jqgrid.css", "type": "css" },
        { "nameLoc": root + "/js/libraries/contextMenu/jquery.contextMenu.min.css", "type": "css" },
        { "nameLoc": root + "/css/APPX" + min + ".css", "type": "css" },
        { "nameLoc": root + "/js/libraries/crypto/rollups/aes.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/nouislider.min.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/jquery.blockUI.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/jquery.inputmask.bundle.js", "type": "js" },
        { "nameLoc": root + "/css/CUSTOM.css", "type": "css" },
        { "nameLoc": root + "/js/libraries/ckeditor/config.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/ckeditor/adapters/jquery.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/colpick.js", "type": "js" },
        { "nameLoc": root + "/css/ui.multiselect.css", "type": "css" },
        { "nameLoc": root + "/js/libraries/ui.multiselect.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/jqgrid-5_3_1/i18n/grid.locale-en.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/jqgrid-5_3_1/jquery.jqGrid.min.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/FileSaver.min.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/clipboard.min.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/contextMenu/jquery.contextMenu.min.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/contextMenu/jquery.ui.position.min.js", "type": "js" },
        { "nameLoc": root + "/js/libraries/signature_pad.min.js", "type": "js" },
        { "nameLoc": "css/CUSTOM.css", "type": "css" },
        { "nameLoc": root + "/js/appx-public." +version + "" + min + ".js", "type": "js" },
        { "nameLoc": root + "/js/appx-client-custom.js", "type": "js" },
        { "nameLoc": root + "/js/appx-client-noload.js", "type": "js" } // If the last item in this list loads successfully
	                                                                // then jqGrid throws a CRITICAL ERROR!!!.  So this
                                                                        // last item in the list must point to a missing file.

    ]
}
/*
**Function to take an object and create the html element required and
**attach it to the html page.
**
**@param script: Object containing filepath and filetype information.
*/
function loadLinkScriptFile(script, callback) {
    if (script.type == "css") {
        var element = document.createElement('link');
        element.setAttribute("rel", "stylesheet");
        element.setAttribute("type", "text/css");
        element.setAttribute("href", script.nameLoc);
        callback();
    } else {
        var element = document.createElement('script');
        element.setAttribute("type", "text/javascript");
        element.setAttribute("defer", true);
        element.setAttribute("src", script.nameLoc);
        element.setAttribute("async", false);

        if (element.readyState) {
            element.onreadystatechange = function element_onreadystatechange() {
                if (element.readyState == "loaded" || element.readyState == "complete") {
                    element.onreadstatechange = null;
                    callback();
                }
            }
        } else {
            element.onload = function element_onload() {
                callback();
            }
        }
    }
    document.getElementsByTagName("head")[0].appendChild(element);
}

/*
**Recursive function to load scripts in order. We use a callback function
**to make sure that the previous script is fully loaded before calling the
**next script to allow for scripts to be dependent on previously loaded
**scripts
**
**@param mArrayScripts: Array of script objects
**@param i: counter for script array elements
**
*/
function loadScripts(mArrayScripts, i, callback) {
    if (i < mArrayScripts.length) {
        loadLinkScriptFile(mArrayScripts[i], function loadLinkScriptFile_callback() {
            loadScripts(mArrayScripts, ++i);
        });
    } else if (callback) {
        callback();
    }
}

/*
**Function to get the content of the appx-client-root meta tag in an html page.
**
**@return mRoot: content of appx-client-root meta tag or "." if no tag found.
*/
function getRootContent() {
    var metas = document.getElementsByTagName('meta');
    var mRoot = ".";
    for (var i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute("name") === "appx-client-root") {
            mRoot = metas[i].getAttribute("content");
            return mRoot;
        }
    }
    return mRoot;
}

/*
**Function to get the content of the appx-client-root meta tag in an html page.
**
**@return mRoot: content of appx-client-root meta tag or "." if no tag found.
*/
function loadMetas(callback) {
    loadLinkScriptFile({ "nameLoc": "./js/appx-client-settings.js", "type": "js" }, function loadLinkScriptFile_callback() {
        setMetas(function setMetas_callback() {
            for (var tags in metas) {
                if (tags === "title") {
                    document.title = metas[tags].value;
                } else {
                    var mTag = document.createElement("meta");
                    mTag.name = tags;
                    mTag.content = metas[tags].value;
                    if (Object.prototype.hasOwnProperty.call(metas[tags], "hide")) {
                        mTag.setAttribute("hide", metas[tags].hide);
                    }
                    document.getElementsByTagName("head")[0].appendChild(mTag);
                }
            }
            /*If client.html file contains the meta tag for using minified appx .js files
            **then we load the minimized files*/
            if (document.querySelector("meta[content='min']")) {
                min = ".min";
            }
            createScriptsArray(getRootContent());
        });
        /*Push any user defined javascript libraries*/
        for (var i = 0; i < userLibraries.length; i++) {
            arrayScripts.push({ "nameLoc": getRootContent() + "/js/" + userLibraries[i], "type": "js" });
        }
        /*Call loadScripts function to start processing arrayScripts*/
        loadScripts(arrayScripts, 0);
        callback();
    });
}

/*Call loadMetas function to start processing meta tags*/
loadMetas(function loadMetas_callback() {
    document.getElementById("appx-login-text").innerHTML = loginText;
});

