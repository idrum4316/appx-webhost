function loadLanguage() {
    appx_session.language.id = "en";

    appx_session.language.tooltips = {
        tableReset: "Reset table to defaults",
        tableSave: "Save table preferences",
        tableSaved: "Table Saved",
        tableColumns: "Column Chooser",
        tableCsv: "Download as CSV file",
        tablePaging: "Toggle grid view between scrolling and paging",
        tableOptions: "Table Options",
        clientVersion: "Client Version",
        localVersion: "Local Version",
        clipboardTo: "Copy To Clipboard",
        clipboardFrom: "Copy From Clipboard",
        clipboardToText: "The current program would like to copy information to your clipboard. Please click copy button below",
        clipboardFromText: "The current program would like to copy information from your clipboard. Please paste in element and click OK to continue"
    }

    appx_session.language.alerts = {
        serverConnectError: "Unable to connect to server",
        mongoConnectError: "Unable to connect to MongoDatabase. Make sure MongoDB has been installed and started on the server before continuing. (https://www.mongodb.org/downloads)",
        rootError: "HTML page must define appx-client-root meta tag.",
        webSocketError: "ALERT! WebSockets -- are NOT fully supported in this browser.",
        localCommandOSError: "You must have access to your local OS to run this command: ",
        localPrintOSError: "You must have access to your local OS to Print files: ",
        localOSError: "local os not available...",
        localDisplayOSError: "You must have access to your local OS to display this file: ",
        fileError: "Please select a file.",
        folderSelectedError: "\" is a folder. Uploading folders is not supported by your browser. Uploading folders via drag & drop is currently not supported by any browser. If you used drag & drop you can try clicking on the field and selecting a folder. Selecting multiple files by drag & drop or the file chooser is allowed.",
        keypressError: "$tag keypress: ",
        loginError: "Login Failed, Error: ",
        characterError: "Data contained invalid characters. Invalid characters have been replaced with (???)",
        encodingFrontError: "Text not valid for ",
        encodingBackError: " encoding. Proceeding could result in data loss."
    }

    appx_session.language.buttons = {
        copyText: "Copy Text",
        submit: "Submit",
        cancel: "Cancel",
        ok: "OK",
        help: "Help",
        scan: "Scan",
        select: "Select",
        prev: "Prev",
        next: "Next",
        end: "End",
        add: "Add",
        delete: "Delete",
        inquire: "Inquire",
        change: "Change",
        enter: "Enter",
        showOptions: "Show Opt",
        clearSignature: "Clear Signature",
        closeX: "close(X)",
        finished: "Finished"
    }
}