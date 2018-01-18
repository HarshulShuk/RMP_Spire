chrome.extension.onRequest.addListener(function(feeds, sender, sendResponse){
	chrome.pageAction.show(sender.tab.id);
});

