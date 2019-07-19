/* main function to invoke main visualization view
 * author: Mai Elshehaly
 * Date: 18/09/2018
 */  
(function($Q){
	$Q.mainControl = new $Q.Control();
	window.onbeforeunload = function() {
		$Q.mainControl.writeSessionLog();
		console.log("BYE");
    return "Saving session log. Bye!";
	};
	window.onerror =  function(msg, url, line, col, error) {
   //https://stackoverflow.com/questions/951791/javascript-global-error-handling
   // Note that col & error are new to the HTML 5 spec and may not be 
   // supported in every browser.  It worked for me in Chrome.
   var extra = !col ? '' : '\ncolumn: ' + col;
   extra += !error ? '' : '\nerror: ' + error;

   // You can view the information in an alert to see things working like this:
  // alert("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
  	$Q.mainControl.writeSessionErr("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
   // TODO: Report this error via ajax so you can keep track
   //       of what pages have JS issues

   var suppressErrorAlert = true;
   // If you return true, then error alerts (like in older versions of 
   // Internet Explorer) will be suppressed.
   return suppressErrorAlert;
};

	 
})(QUALDASH);