"use strict";
//TODO: Implement Angular
//implement whenever i need to save a scoped variable that stores the email -- maybe just use chrome storage

//TODO: when somehow firebase doesnt have email, query normally

//Moves.io
//Hit the make moves button on any startup website and get founder's email in an alert

//TODO: make it run as soon as the page loads 
//check firebase first for email
//if not, run it
//always query email from firebase when make moves is hit

//**JS LOADED BEFOREHAND**//
//warning: must declare js files in loading order in manifest
//asyncTracking.js -- linked up to Segment for analytics
//backend.js -- loads Parse/Firebase

//**REAL FUNCTIONS**//

//structure: when you click button, what happens?

//Initialize Firebase
var myFirebaseRef = new Firebase("https://moves-io.firebaseio.com/");

//every time a new tab opens, we want to sync the founders email data
//if its not already in chrome, check firebase
//if its not in firebase, query for the data with parse cloud code
//then update firebase, then store in chrome storage
//**PROBLEM: why does this run multiple times?
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // inject
  console.log('tab onUpdate')
  console.log(tab)
  console.log(changeInfo)

  var hostname = parseUrl(tab.url).hostname;
  //makeMoves(stripSubdomains(hostname), tab.url);

  //check if tab has url attribute
  //if so grab url and makey da moves
  if(tab.url.substring(0, 6) == "chrome") {
    //"chrome://newtab/"
    console.log('chrome tab')
  } else if(tab.url.substring(0, 4) == "http"){
    console.log('http')
    //getting called like 6 times
    // makeMovesOnThisSite(stripSubdomains(hostname), function(result) {
    //   console.log(result)
    // })
    //should i still save site when its just preloading?
  } else {
    console.log('else')
  }
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed! 
  // tab.url is current url
  analytics.track('click', {
    category: 'sitesClicked',
    label: tab.url
  });
  var hostname = parseUrl(tab.url).hostname;
  makeMoves(stripSubdomains(hostname), tab.url);
});

var makeMoves = function(shortURL, fullURL) {
  //just saving to track what URLs people are using moves.io from
  saveSite(shortURL, fullURL)


  makeMovesOnThisSite(shortURL, function(err, result) {
    if (err) {
      console.log(err)
    } else {
      alert(result)
    }
  }) 

    //chrome.extension.getBackgroundPage().console.log('Made Moves');
};

//queries for email -- makes sure 
//problem with alerts -- turned all alerts into callbacks
var makeMovesOnThisSite = function(shortURL, callback) {
  //hackmatch
  var domain = stripTLD(shortURL)

  chrome.storage.sync.get(null, function (result) { 
    //if we find the email in chrome storage, just alert it
    if (result.hasOwnProperty(domain)) {
      callback(null, result[domain])
    } else {  //check firebase
      getFirebaseObj(function(obj) {
        //if we find the email in firebase, save it to chrome, then just alert it
        if (obj.hasOwnProperty(domain)) {
          //if its in firebase but not chrome, save to chrome
          saveFounderObjToChrome(shortURL, obj[domain])
          callback(null, obj[domain])
        } else {  //query parse
          getEmailWithURL(shortURL, function(err, result) {
            if (err) {
              callback(err)
            } else {
              //**might want to move saveFounderObj to here
              callback(null, result)
            }
          })
        }
      })
    }
  })
}

//grab firebaseObj
//store in chrome storage
//**WONT SCALE BC OF ITEM CAPS**//
var getFirebaseObj = function (callback) {
  //grabs and returns full firebase obj
  myFirebaseRef.on("value", function(snapshot) {
    console.log(snapshot.val());  // Alerts "San Francisco"
    callback(snapshot.val());
  });
}

var getEmailWithURL = function (url, callback) {
    //**crunchbase or team page search by url for founders names
    Parse.Cloud.run('getFoundersEmail', {url: url}, {
      success: function(result) {
        saveFounderObj(url, result)
        callback(null, result)
      },
      error: function(error) {
        callback(error)
      }
    });
};

var saveFounderObj = function(url, email) {
  saveFounderObjToFirebase(url, email)
  saveFounderObjToChrome(url, email)
}

var saveFounderObjToFirebase = function(url, email) {
  myFirebaseRef.update(returnFounderObj(url, email))
}

var saveFounderObjToChrome = function(url, email) {
  //watch out for overwriting what's already there every time
  //solved this by just writing a new object at the base level every time
  //may need to have a separate object for storing these values
  chrome.storage.sync.set(returnFounderObj(url, email));
}

//**when new tab opens, check if domain exists in firebase and save to chrome
var syncFromFirebaseToChrome = function() {

}




//STORAGE - Chrome & Parse//
//global startupsArray variable?

var appendToStorage = function(startup) {
  chrome.storage.sync.get(null, function(result) {
    //forsome reason this prints the new results with startup pushed
    if (!result.hasOwnProperty("startupsArray")) {   
      result.startupsArray = [];  
    }
    console.log(result);
    result.startupsArray.push(startup); 

    // var blah = stripTLD(url);
    // var payload = {};
    // payload[blah] = result;

    chrome.storage.sync.set({'startupsArray': result.startupsArray}, function() {});
  });
}
appendToStorage("hackmatch.com")

var saveSiteToParse = function(shortURL, longURL, callback) {
    var Startup = Parse.Object.extend("Startups");
    var startup = new Startup();
    startup.save({url: shortURL, longURL: longURL}).then(function(object) {
      callback('saved startup');
    });
}

var saveSite = function (shortURL, longURL) {
  saveSiteToParse(shortURL, longURL, function () {
    // console.log('saved site to parse');
  })

  //saveSiteToChrome(shortURL, longURL);
  appendToStorage(shortURL);
}


//HELPER FUNCTIONS//

var parseUrl = function (url) {
    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for( i = 0; i < queries.length; i++ ) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    }
};

var numberOfPeriods = function (string) {
  return (string.match(/[.]/g) || []).length;
};

//**doesnt work for .co.uk right now or endings with multiple periods
//could just split the string from the right of 2nd to last period
var stripSubdomains = function (url) {
  if (numberOfPeriods(url) >= 2) {
    //remove one subdomain then call function recursively on that new url
    return stripSubdomains(url.replace(/^[^.]+\./g, ""));
  }
  else {
    return url;
  }
};

//Helper functions to format URLs
var returnFounderObj = function (shortURL, email) {
  var domain = stripTLD(shortURL)
  var founderObj = {}
  founderObj[domain] = email
  return founderObj
}

var stripTLD = function (url) {
  var n = url.indexOf('.');
  var domain = url.substring(0, n != -1 ? n : url.length);
  //console.log(domain);
  return domain
}
//stripTLD(stripSubdomains(parseUrl(tab.url).hostname))

//**NOT SURE WHAT THIS IS BELOW
chrome.runtime.onInstalled.addListener(function(info){
    //    
    // info.reason should contain either "install" or "update"

    var sessionId = localStorage.getItem("session-id");

    if(!sessionId){
      localStorage.setItem("session-id", "random-session-id");
    }
});
