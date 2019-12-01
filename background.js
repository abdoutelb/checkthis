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

function findAndReplace(searchText, replacement, searchNode) {
      debugger;
    if (!searchText || typeof replacement === 'undefined') {
        // Throw error here if you want...
        return;
    }
    var regex = typeof searchText === 'string' ?
                new RegExp(searchText, 'g') : searchText,
        childNodes = (searchNode || document.body).childNodes,
        cnLength = childNodes.length,
        excludes = 'html,head,style,title,link,meta,script,object,iframe';
    while (cnLength--) {
        var currentNode = childNodes[cnLength];
        if (currentNode.nodeType === 1 &&
            (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) {
            arguments.callee(searchText, replacement, currentNode);
        }
        if (currentNode.nodeType !== 3 || !regex.test(currentNode.data) ) {
            continue;
        }
        var parent = currentNode.parentNode,
            frag = (function(){
                var html = currentNode.data.replace(regex, replacement),
                    wrap = document.createElement('div'),
                    frag = document.createDocumentFragment();
                wrap.innerHTML = html;
                while (wrap.firstChild) {
                    frag.appendChild(wrap.firstChild);
                }
                return frag;
            })();
        parent.insertBefore(frag, currentNode);
        parent.removeChild(currentNode);
    }
}


chrome.contextMenus.onClicked.addListener(function(info, tab) {

    if (info.menuItemId == "checkMenu") {
        chrome.tabs.executeScript(null, {file: "select.js"});
        
        chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            if(message.type == "notification" && message.options.title == "path"){
                path = message.options.message;
                //copyTextToClipboard(info.pageUrl+"?weber="+info.selectionText+"#"+path);
                copyTextToClipboard(info.pageUrl+"?weber="+path);
            }
        });
        
    }
});

chrome.tabs.onUpdated.addListener( function( tabId,  changeInfo,  tab) {
    if (changeInfo.status == 'complete') {
    var regex = new RegExp("weber=*");
    //chrome.extension.getBackgroundPage();
    if(tab.url.match(regex)){
        var current_div = decodeURIComponent(tab.url.split('weber=')[1]);
        current_div = current_div.replace("?","")
        chrome.tabs.executeScript(null,{code:`
        document.querySelector('${current_div}').style.backgroundColor = 'chartreuse';
        document.querySelector('${current_div}').scrollIntoView({ alignToTop: 'false',behavior: 'smooth', block: 'start', inline: 'start' });
        console.log("still fire");
        `});
    }
}
});