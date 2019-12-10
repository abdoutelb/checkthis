chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({
        id: "checkMenu",
        title: "check this",
        contexts: ["all"]
    }); 
});

function copyTextToClipboard(text) {
    //Create a textbox field where we can insert text to. 
    var copyFrom = document.createElement("textarea");
  
    //Set the text content to be the text you wished to copy.
    copyFrom.textContent = text;
  
    //Append the textbox field into the body as a child. 
    //"execCommand()" only works when there exists selected text, and the text is inside 
    //document.body (meaning the text is part of a valid rendered HTML element).
    document.body.appendChild(copyFrom);
  
    //Select all the text!
    copyFrom.select();
  
    //Execute command
    document.execCommand('copy');
  
    //(Optional) De-select the text using blur(). 
    copyFrom.blur();
  
    //Remove the textbox field from the document.body, so no other JavaScript nor 
    //other elements can get access to this.
    document.body.removeChild(copyFrom);
  }



chrome.contextMenus.onClicked.addListener(function(info, tab) {

    if (info.menuItemId == "checkMenu") {
        chrome.tabs.executeScript(null, {file: "select.js"});
        
        chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            if(message.type == "notification" && message.options.title == "path"){
                path = message.options.message;
                var crypted_path = window.btoa(path);
                copyTextToClipboard(info.pageUrl+"?weber="+crypted_path);
            }
        });
        
    }
});

chrome.tabs.onUpdated.addListener( function( tabId,  changeInfo,  tab) {
    if (changeInfo.status == 'complete') {
    var regex = new RegExp("weber=*");
    //chrome.extension.getBackgroundPage();
    if(tab.url.match(regex)){
        var current_encode_div = decodeURIComponent(tab.url.split('weber=')[1]);
        current_encode_div = current_encode_div.replace("?","")
        current_div = window.atob(current_encode_div);
        chrome.tabs.executeScript(null,{code:`
        document.querySelector('${current_div}').style.backgroundColor = 'chartreuse';
        document.querySelector('${current_div}').scrollIntoView({ alignToTop: 'false',behavior: 'smooth', block: 'start', inline: 'start' });
        console.log("still fire");
        `});
    }
}
});