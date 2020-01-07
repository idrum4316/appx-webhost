/**************************************************************************
**@File: appx-client-custom.js
**@Company: APPX Software, Inc. (www.appx.com)
**@Programmer: John Nelson
**@Last Edited By: John Nelson (www.sisolutionsde.com)
**@Date Created: 8 Mar 2018
**@Date Last Modified: 8 Mar 2018
**@Description: Extends widget functionality to allow user defined 
**custom widgets. Also extends option functionality on widgets to allow
**users to override what an option does on widget callback.
**@Function: extendWidget
***************************************************************************/

/*
**Function to extend widget definition to allow user defined widgets
*/
function extendWidget () {

    /******************************************************************************
    *******************************************************************************

    To add widget, use the following format:
    appx_session.createWidgetTag[<widget number>] = function widget_<name of widget>(widget, $tag) {return $tag;}

    #####################IMPORTANT##############################
    WIDGET NUMBERS 1-200 ARE RESEREVED FOR STANDARD APPX WIDGETS
    ############################################################
    
    It receives the widget object and a null variable named $tag and returns the tag you create

    ===============================================================================
    EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE
    ===============================================================================
    appx_session.createWidgetTag[999] = function widget_signature(widget, $tag) {
        $tag = $("<div>");
        $tag.addClass("label");
        $tag.attr("id", addClientId("widget_sac_" + i.toString(), wx.wClientId));
        return $tag
    }
    ===============================================================================
       END EXAMPLE END EXAMPLE END EXAMPLE END EXAMPLE END EXAMPLE END EXAMPLE
    ===============================================================================

    *******************************************************************************
    *******************************************************************************
    ******************************************************************************/
    appx_session.createWidgetTag[999] = function widget_signature(widget, $tag) {
        $tag = $("<canvas>").addClass("signaturepad");
        $(function () {
            /*Need a little delay to let canvas get placed on screen*/
            setTimeout(function () {
                /*Creating global so button clicks have access to signature pad*/
                appx_session.signaturePad = new SignaturePad($(".signaturepad")[0]);
                const data = appx_session.signaturePad.toData();
                setTimeout(function () {
                    var ratio = Math.max(window.devicePixelRatio || 1, 1);
                    $(".signaturepad")[0].width = $(".signaturepad")[0].offsetWidth * ratio;
                    $(".signaturepad")[0].height = $(".signaturepad")[0].offsetHeight * ratio;
                    $(".signaturepad")[0].getContext("2d").scale(ratio, ratio);
                    appx_session.signaturePad.clear();
                }, 0);
                appx_session.signaturePad.onEnd = function () {
                    var fileBlob;
                    appx_session.signaturePadID = $(".signaturepad").attr("id");
                    if (HTMLCanvasElement.prototype.toBlob !== undefined) {
                        /*toBlob for all browsers except IE/Edge... Microsoft likes to create their own standards.*/
                        $(".signaturepad")[0].toBlob(function (blob) {
                            fileBlob = blob;
                        });
                    } else {
                        /*IE/Edge version*/
                        fileBlob = $(".signaturepad")[0].msToBlob();
                    }
                    /*Need slight delay to let blob get built.*/
                    setTimeout(function () {
                        var fileName = "signature.png" + Date.now();
                        uploadFileToMongo(fileBlob, fileName, function () {
                            $("#" + appx_session.signaturePadID).val("$(sendFile)\\" + fileName);
                            $("#" + appx_session.signaturePadID).addClass("appxitem dirty");
                        });
                    }, 50);
                }
            }, 50);
        });
        return $tag;
    }
}

/*
**Function to extend widget option functionality to allow user to
**override callback functionality
*/
function extendOptions() {
    /******************************************************************************
    *******************************************************************************

    To add option override, use the following format:
    appx_session.optionOverrid[<option number>] = function () {return boolean}

    It receives no variables and returns a boolean variable. True === do not run
    widget callback code (you are overriding any appx functionality.
    False === continue running widget callback code (you are adding to the appx
    functionality, while still letting it run).

    ===============================================================================
    EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE EXAMPLE
    ===============================================================================
    appx_session.optionOverride["99999"] = function () {
        window.open(www.appx.com, "_blank");
        return true;
    }
    ===============================================================================
       END EXAMPLE END EXAMPLE END EXAMPLE END EXAMPLE END EXAMPLE END EXAMPLE
    ===============================================================================

    *******************************************************************************
    *******************************************************************************
    ******************************************************************************/
}

/*Allow javascript libraries to get loaded before trying to add to object*/
setTimeout(function () {
    extendWidget();
    extendOptions();
}, 1500);