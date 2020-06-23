/*Enter required parts. If you want non-required options just remove the // from 
**in front of the item you want, then edit between the "", changing value to what 
**you want it to be. The true/false options are already set to the opposite of their
**default so just uncomment them. To reset to defaults just comment out below by using
**the double forward slashes(//).*/

function setMetas(callback) {
    /***************** REQUIRED *********************/
	metas["appx-login-host"]["value"] = ""; 			/** server name or IP where appxLoginMgr is**/
	metas["appx-proxy-host"]["value"] = "localhost";          	/** server name or IP providing reverse web proxy to mask ports 3014 and 3015 (if used) **/
	metas["appx-app-name"  ]["value"] = "APPX";               	/** Application Name that shows up on local connector's security confirmation popup **/

    /***************** NON-REQUIRED ****************/
	metas["title"          ]["value"] = "APPX HTML Client";             	/** Title of browser window **/
	metas["appx-login-host"]["hide" ] = "true";               	/** Do you want to hide the appx host name prompt?  True or False.  Set to false if you want user to be able to modify appx-login-host value **/
	metas["appx-login-user"]["value"] = "{login id here}";    	/** The user name to login to APPX with.  Leave blank if you want user to provide login name **/
	metas["appx-login-user"]["hide" ] = "false";              	/** Do you want to hide the user name prompt? True or False.  Set to False if you want user to provide login name **/
	metas["appx-login-pswd"]["value"] = "{password here}";    	/** Password value to login to APPX.  Leave blank if you want user to provide password **/
	metas["appx-login-pswd"]["hide" ] = "false";              	/** Do you want to hide the password prompt? True or False.  Set to false if you want user to provide password **/
	metas["appx-login-port"]["value"] = "8060";               	/** The port number of the appxLoginMgr you are logging into. **/
	metas["appx-login-port"]["hide" ] = "true";               	/** Do you want to hide the port prompt?  True or False.  Set to false if you want user to be able to change port number **/
	metas["appx-login-rows"]["value"] = "35";                 	/** A numerical value for size of rows for the client window **/
	metas["appx-login-rows"]["hide" ] = "true";               	/** Do you want to hide the rows prompt?  True or False.  Set to false if you want the user to be able to change the rows **/
	metas["appx-login-cols"]["value"] = "144";                	/** A numerical value for size of columns for the client window **/
	metas["appx-login-cols"]["hide" ] = "true";               	/** Do you want to hide the columns prompt?  True or False.  Set to false if you want the user to be able to change the columns **/
	metas["appx-proxy-port"]["value"] = "3014";               	/** The port number that the proxy is accessible to the user on, typically 80 in SSL configuration or 443 for SSL configurations.  If you are not reverse proxying **/
									/** your client you should set to 3014 - the default port number of the appxconnector service **/
	metas["appx-mongo-port"]["value"] = "3015";               	/** The port number that the proxy is accessible to the user on, typically 80 in SSL configuration or 443 for SSL configurations.  If you are not reverse proxying your **/
									/** client you should set to 3015 - the default port number of the appxmongoconnector service **/
	//metas["appx-proxy-path"]["value"] = "/appxws/";		/** If you have configured a reverse proxy, enter the value that triggers the reverse proxy.  Typical values are /appxws/ for Non SSL proxies, and /appxwss/ for SSL**/
									/** configured proxies.  Leave blank if you are not using a proxy.**/
	//metas["appx-minified-files"]["value"] = "min";		/** Use minified versions of the files. Set it to "min" to used minified version or "false" to use non-minified. Default is "min".
	//metas["appx-client-root"]["value"] = ".";			/** location of the appx start up html page. Default is "." **/
	//metas["appx-use-softkeys"]["value"] = "false";		/** Show the softkey bar (useful for tablets)**/
	//metas["appx-auto-connect"]["value"] = "false";		/** Automatically log in to appx. Username and password must be preset via appx-client-settings or query string for this to work **/
	//metas["appx-close-on-exit"]["value"] = "false";		/** What happens when you log out of appx. Valid values: "false": reload the page, "true": close the browser tab if you used new session **/
									/** button otherwise it works like "back", "back": go back to previous page. **/
	//metas["appx-local-required"]["value"] = "false";        	/** Use local connector if available **/ 
	//metas["appx-upload-without-local"]["value"] = "true";   	/** Use local connector to upload files. appx-local-required must be set to true for this to work**/
	//metas["appx-recommended-upload-size"]["value"] = "1000000";  	/** Not used? **/
	//metas["appx-static-tools"]["value"] = "false";		/** Show/Hide appx tools side bar, set it to false if you want to see appx tool side bar **/
	//metas["appx-fill-window"]["value"] = "false";			/** Expand the appx screen size to fit the window screen size? **/
	//metas["appx-encryption"]["value"] = "aes";              	/** Encryption type to use, valid values are "aes", "ssl", or "none".  SSL is most secure, none is least secure.
	//loginText = "{appx login text here}";               		/** if you want a textual description near login prompt, enter it here **/
	
	/* For loging in users automatically and run a specific process see "appx-client-automaticLoginTemplate.js" file **/ 
	    
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
