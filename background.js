let color = '#3aa757';

let tabs = []


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("sent from tab.id=", sender.tab.id);
  tabs.push(sender.tab.id)
  console.log('array is', tabs)
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log(activeInfo.tabId);
  chrome.tabs.sendMessage(activeInfo.tabId, 'refresh')
  
});

// chrome.contextMenus.create({
//   id: 'Addstuff',
//   title: "Add to sources: %s", 
//   contexts:["selection", "image"], 
// });


// chrome.contextMenus.onClicked.addListener(function(info, tab) {
//   console.log('yay got ', info, tab);
//   // if (info.menuItemId == "some-command") {
//   //     console.log("yay!");
//   // }
// });
