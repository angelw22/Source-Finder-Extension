let resetButton = document.getElementById("resetButton");
let collectText = document.getElementById("collectText");
let sourcesList = document.getElementById("sourcesList");


chrome.storage.local.get(['collectActive'], async (data) => {
  if (data && data.collectActive) {
    // collectText.classList.add('active');
    collectText.checked = true;
  } else if (data) {
    // collectText.classList.remove('active');
    collectText.checked = false;
  }
})


chrome.storage.local.get(['SF_sources'], (data) => {
  if (data && data.SF_sources && data.SF_sources !== "undefined") {
    for (let i = 0; i < data.SF_sources.sources.length; i++) {
      let item = data.SF_sources.sources[i]
      var node = document.createElement("li")
      let images = ''
      let text = item.text;
      var len = 400

      for (let x = 0; x < item.images.length; x++) {
        images += `<img src="${item.images[x]}" alt />` 
      }
      if (text.length > len) {
        text = "<span>" + item.text.substring(0, len).replace(/\w+$/, '') + '</span>...<span class="excess">' + item.text.substring(len, text.length) + "</span>";
      }
     
      node.innerHTML = '<div class="imgContainer">' + images + '</div><p class="sourceText">' + text + '</p><p class="sourceTitle">' + item.title + '</p><p class="sourceUrl">'+ item.url +'</p>'
      
      sourcesList.appendChild(node);
    }
  }
});


collectText.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.storage.local.get(['collectActive'], (data) => {
    if (!data.collectActive) {
      // collectText.classList.add('active');
      collectText.checked = true;
      chrome.storage.local.set({'collectActive': true}, () => {
        console.log('set collect active true')
      })
      chrome.tabs.sendMessage(tab.id, 'active')
    } else {
      // collectText.classList.remove('active');
      collectText.checked = false;
      chrome.storage.local.set({'collectActive': false})
      chrome.tabs.sendMessage(tab.id, 'inactive')
    }
  })
})

resetButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: resetSources,
  });
  sourcesList.innerHTML = '';
  chrome.tabs.sendMessage(tab.id, 'reset')
})

async function resetSources () {
  localStorage.setItem('SF_sources', undefined)

  chrome.storage.local.remove(['SF_sources'], function(){
    chrome.storage.local.get('SF_sources');
    console.log('Sources have been resetted');
  });
}
