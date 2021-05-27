//Store last recorded "active" status of SF plugin. Store existing SF sources data.
let lastStatus;
var existing;
//Storage for highlighted text/images.
var text;
var imageLinks = [];
var elemref;


//Retrieve active status and SF sources list/data
chrome.storage.local.get(['collectActive'], (data) => {
  lastStatus = data.collectActive; console.log('added last status', lastStatus) ;
  catchText()
})

chrome.storage.local.get(['SF_sources'], function (data) {
  console.log('getting sources, data is', data.SF_sources)
  if (data) {
    existing = data.SF_sources;
  }
});


//Get messages from background and popup to 1. update source list, 2. update active status & 3. to reset
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  console.log(msg)
  if (msg === 'refresh') {
    console.log('switched tabs1')
    chrome.storage.local.get(['collectActive'], (data) => {
      console.log('switched tabs');
      if (data.collectActive !== lastStatus) {
        lastStatus = data.collectActive;
        console.log('not same, it is', data.collectActive, 'restarting catch text');
        catchText();
      }
    })
  } else if (msg === 'inactive') {
    lastStatus = false
  } else if (msg === 'active') {
    lastStatus = true
  } else if (msg === 'reset') {
    existing = undefined;
  }
  catchText();

});

//If SF_add object does not already exist, create one.
console.log('checking sf object, ', document.getElementById('SF_add'))

function createButton () {
  console.log('sf add object does not exist')
  var elem = document.createElement('div')
  
  elem.id = 'SF_add'
  elem.innerText= '+'
  document.body.appendChild(elem)

  elem.onclick = function () {
    console.log('existing is', existing);
    if (text !== '') {
      //If no existing sources, create new container, else if it returns a string, parse it into an object. Then, append to source list array
      if ((existing === undefined) || (existing == null) || (existing == "undefined")) {
        existing = {"sources": []}
      } 
      else if (existing) {
        console.log('existing exists, ', existing)
        if (typeof existing === 'string') existing = JSON.parse(existing);
      }
      existing.sources.push({"text": text, "images": imageLinks, "url": location.href, "title": document.title});

      //Update storage with new list
      chrome.storage.local.set({'SF_sources': existing}, function() {
        console.log('set sources with data', existing);
        chrome.storage.local.get(['SF_sources'], (data) => {
          if (data) {console.log('data is ', data.SF_sources.sources)}
        });
      })
    }
    elemref = document.getElementById('SF_add');

    //Make button disappear
    // elemref.classList.add('disappear');
    elemref.style.display = "none";
    text = '';
    imageLinks = [];
  }
}



//Function & listener to detect when text is highlighted in the window
function catchText() {
  console.log('catch text run', lastStatus)
  if (lastStatus) {
    console.log('checking sf object, ', document.getElementById('SF_add'))
    if (!document.getElementById('SF_add')) { createButton() };
    if (window.getSelection() !== '') { document.getElementById('SF_add').style.display = "block" }
    window.addEventListener("mouseup", eventListener)
  } 
  else {
    console.log('removing event listener')
    if (document.getElementById('SF_add')) {
      document.getElementById('SF_add').style.display = "none"
    }
    window.removeEventListener("mouseup", eventListener);
  }
}

async function eventListener (ev) {    
  if (ev.target.id !== "SF_add") {
    //Whenever something is clicked that is not the add button, reset previous text and imagelinks
    text = ''
    imageLinks = []

    if (window.getSelection() !== '') {
      var content = window.getSelection().getRangeAt(0).cloneContents();
      console.log('get selection', window.getSelection().toString(), content.toString());
      text = window.getSelection().toString();
      let images =  content.querySelectorAll("img")
      if (images.length > 0) {
        for (let x=0; x < images.length; x++) {
          console.log(images[x])
          imageLinks.push(images[x].currentSrc);
        }
      }
      console.log(imageLinks)
    }
    
    // console.log(content, text);
    // if (content)  {range =};
    // var content = window.getSelection().getStartElement().getOuterHtml();
    // console.log('content', content, '\n text', text, '\n range');
  }

  if (text === '' && imageLinks.length === 0) {
    document.getElementById('SF_add').style.display = "none";
  } else {
    document.getElementById('SF_add').style.top = ev.pageY+'px'
    document.getElementById('SF_add').style.display = "block";
  }
}


