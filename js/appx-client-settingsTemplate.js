/*Enter required parts. If you want non-required options just remove the // from 
**in front of the item you want, then edit between the "", changing value to what 
**you want it to be. The true/false options are already set to the opposite of their
**default so just uncomment them. To reset to defaults just comment out below by using
**the double forward slashes(//).*/

function setMetas(callback) {
    /***************** REQUIRED *********************/
    metas["appx-login-host"]["value"] = "{appx server}";
    metas["appx-proxy-host"]["value"] = "localhost";

    /***************** NON-REQUIRED ****************/
    //metas["title"]["value"] = "{page title here}";
    //metas["appx-login-host"]["hide"] = "true";
    //metas["appx-login-user"]["value"] = "{login id here}";
    //metas["appx-login-user"]["hide"] = "true";
    //metas["appx-login-pswd"]["value"] = "{password here}";
    //metas["appx-login-pswd"]["hide"] = "true";
    //metas["appx-login-port"]["value"] = "8061";
    //metas["appx-login-port"]["hide"] = "false";
    //metas["appx-login-rows"]["value"] = "40";
    //metas["appx-login-rows"]["hide"] = "false";
    //metas["appx-login-cols"]["value"] = "200";
    //metas["appx-login-cols"]["hide"] = "false";
    //metas["appx-proxy-port"]["value"] = "80";
    //metas["appx-mongo-port"]["value"] = "80";
    //metas["appx-proxy-path"]["value"] = "{proxy path here}";
    //metas["appx-minified-files"]["value"] = "{SHOULD NOT BE CHANGED}";
    //metas["appx-client-root"]["value"] = "../";
    //metas["appx-use-softkeys"]["value"] = "true";
    //metas["appx-auto-connect"]["value"] = "true";
    //metas["appx-local-required"]["value"] = "false";
    //metas["appx-upload-without-local"]["value"] = "true";
    //metas["appx-recommended-upload-size"]["value"] =  "1000000";
    //metas["appx-static-tools"]["value"] = "false";
    //metas["appx-fill-window"]["value"] = "false";
    //metas["appx-encryption"]["value"] = "ssl";

    //loginText = "{new appx login text here}";
    callback();
}


/**
**Javascript libraries that you want to inject must be placed in the
**webhost/js folder. Use the following format below to add the libraries:
**  userLibraries.push("name-of-file.js");
**/

/*This entry loads the jqgrid language library. This can be modified to the langauge of the users choice. List of 
**libraries provided can be found in the webhost/js/libraries/i18n folder.*/
userLibraries.push("libraries/i18n/grid.locale-en.js");