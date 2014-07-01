/*
  The script for a background page that handles request blocking and the
  visualization thereof.

  Copyright 2010-2014 Disconnect, Inc.

  This program is free software: you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  this program. If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";
const TRUSTE_URL = 'https://icons.disconnect.me/truste/check';
const HEARTBLEED_URL = 'https://icons.disconnect.me/bleed/check';
const UI_SIZE = { W: 308, H: 178, EXPD: 340, EXPD_TP: 265 };

var {Cc, Ci, Cu, Cm, Cr, components} = require("chrome");
var self = require("sdk/self");
var panel = require("sdk/panel");
var tabs = require("sdk/tabs");
var windows = require("sdk/windows");
var pageMod = require("sdk/page-mod");
var localStorage = require("sdk/simple-storage").storage;
var toolbarbutton = require("toolbar/toolbarbutton");
var privateBrowsing = require("sdk/private-browsing");
var Request = require("sdk/request").Request;
var iOService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
var BG = require("background.js");

var ICONS = {
  ExpectedUser: {
    name: 'Expected Use',
    tag: "icon",
    image: "images/icons/ExpectedUse/",
    title: "Does this website’s privacy policy disclose whether data it collects about you is used in ways other than you would reasonably expect given the site’s service?",
    red: "Yes, without choice to opt-out. Or, undisclosed.",
    yellow: "Yes, with choice to opt-out.",
    green: "No.",
    white: "Info unavailable."
  },
  ExpectedCollection: {
    name: 'Expected Collection',
    tag: "icon",
    image: "images/icons/ExpectedCollection/",
    title: "Does this website’s privacy policy disclose whether it allows other companies like ad providers and analytics firms to track users on the site?",
    red: "Yes, without choice to opt-out. Or, undisclosed.",
    yellow: "Yes, with choice to opt-out.",
    green: "No.",
    white: "Info unavailable."
  },
  PreciseLocationData: {
    name: 'Precise Location',
    tag: "icon",
    image: "images/icons/PreciseLocationData/",
    title: "Does this website’s privacy policy disclose whether the site or service tracks a user’s actual geolocation?",
    red: "Yes, possibly without choice.",
    yellow: "Yes, with choice.",
    green: "No.",
    white: "Info unavailable."
  },
  DataRetention: {
    name: 'Data Retention',
    tag: "icon",
    image: "images/icons/DataRetention/",
    title: "Does this website's privacy policy disclose how long they retain your personal data?",
    red: "No data retention policy.",
    yellow: "12+ months.",
    green: "0-12 months.",
    white: "Info unavailable."
  },
  TrusteBadge: {
    name: 'TRUSTe Certified',
    tag: "badge",
    image: "images/icons/Truste/",
    title: "Has this website received TRUSTe’s Privacy Certification?",
    red: "",
    yellow: "",
    green: "Yes.",
    white: "No."
  },
  ChildrenPrivacyBadge: {
    name: 'Children Privacy',
    tag: "badge",
    image: "images/icons/ChildrenPrivacy/",
    title: "Has this website received TRUSTe’s Children’s Privacy Certification?",
    red: "",
    yellow: "",
    green: "Yes.",
    white: "No."
  },
  DoNotTrackBadge: {
    name: 'Do Not Track',
    tag: "badge",
    image: "images/icons/DoNotTrack/",
    title: "Does this website comply with a user’s Do Not Track browser preference?",
    red: "",
    yellow: "",
    green: "Yes.",
    white: "Info unavailable."
  },
  SSLSupport: {
    name: 'SSL Support',
    tag: "icon",
    image: "images/icons/SSL/",
    title: "Does this website support secure communications over HTTPS by default?",
    red: "No.",
    yellow: "",
    green: "Yes.",
    white: ""
  },
  HeartbleedVulnerable: {
    name: 'Heartbleed',
    tag: "icon",
    image: "images/icons/Heartbleed/",
    title: "Is this website vulnerable to the heartbleed bug?",
    red: "Vulnerable.",
    yellow: "Unknown.",
    green: "Safe.",
    white: "N/A, not HTTPS."
  },
  Disconnect: {
    name: 'Privacy Icons',
    tag: "oneicon",
    image: "images/icons/Disconnect/",
    title: "",
    red: "",
    yellow: "",
    green: "",
    white: "No."
  }
};

// A list of TLDs can be found here: http://mxr.mozilla.org/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1
var TLDs = ["ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "arpa", "as", "asia", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "biz", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cat", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "com", "coop", "cr", "cu", "cv", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "info", "int", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jobs", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mil", "mk", "ml", "mm", "mn", "mo", "mobi", "mp", "mq", "mr", "ms", "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name", "nc", "ne", "net", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "org", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "pro", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "su", "sv", "sy", "sz", "tc", "td", "tel", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "travel", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "xn--0zwm56d", "xn--11b5bs3a9aj6g", "xn--3e0b707e", "xn--45brj9c", "xn--80akhbyknj4f", "xn--90a3ac", "xn--9t4b11yi5a", "xn--clchc0ea0b2g2a9gcd", "xn--deba0ad", "xn--fiqs8s", "xn--fiqz9s", "xn--fpcrj9c3d", "xn--fzc2c9e2c", "xn--g6w251d", "xn--gecrj9c", "xn--h2brj9c", "xn--hgbk6aj7f53bba", "xn--hlcj6aya9esc7a", "xn--j6w193g", "xn--jxalpdlp", "xn--kgbechtv", "xn--kprw13d", "xn--kpry57d", "xn--lgbbat1ad8j", "xn--mgbaam7a8h", "xn--mgbayh7gpa", "xn--mgbbh1a71e", "xn--mgbc0a9azcg", "xn--mgberp4a5d4ar", "xn--o3cw4h", "xn--ogbpf8fl", "xn--p1ai", "xn--pgbs0dh", "xn--s9brj9c", "xn--wgbh1c", "xn--wgbl6a", "xn--xkc2al3hye2a", "xn--xkc2dl3a5ee0h", "xn--yfro4i67o", "xn--ygbi2ammx", "xn--zckzah", "xxx", "ye", "yt", "za", "zm", "zw"].join();

var pi_panel = panel.Panel({
  width: UI_SIZE.W,
  height: UI_SIZE.H,
  contentURL: self.data.url("markup/popup.html"),
  contentScriptFile: [
    self.data.url("scripts/vendor/jquery/jquery.js"),
    self.data.url("scripts/vendor/tipped/tipped.js"),
    self.data.url("scripts/popup.js")
  ]
});

var pi_button = toolbarbutton.ToolbarButton({
  id: "disconnect-privacy-icons",
  label: "Disconnect Privacy Icons",
  tooltiptext: "Disconnect Privacy Icons",
  image: self.data.url("images/19.png"),
  panel: pi_panel,
  onCommand: function() { }
});

//Begin - Custom page
var custom = pageMod.PageMod({
  include: self.data.url("markup/custom.html"),
  contentScriptFile: [
    self.data.url("scripts/vendor/jquery/jquery.js"),
    self.data.url("scripts/custom.js")
  ],
  onAttach: function(worker) {
    worker.port.emit("init_custom", localStorage, self.data.url(""), ICONS);
    worker.port.on("setLocalStorage", function setLocalStorage(key, value) {
      localStorage[key] = value;
    });
    worker.port.on("close_custom", function () {
      tabs.activeTab.close();
      var workers = BG.getWorkers();
      
      // send notification for all tabs (filter changed)
      for (var i = 0; i < workers.length; i++) {
        workers[i].port.emit('change_filter_response', {
          turnAllOn: localStorage['turn_all_on'],
          showOption: localStorage['showOption'],
          customFilters: localStorage['custom_filters']
        });
      }
    });
  }
});

pi_panel.port.on("createCustomTab", function() {
  pi_panel.hide();
  tabs.open(self.data.url("markup/custom.html"));
});
//End - Custom Page.

/* 
 * Panel Events 
 */
pi_panel.on("show", function() {
  pi_panel.port.emit("show", localStorage, self.data.url(""), ICONS, TLDs);
});

pi_panel.port.on("setLocalStorage", function setLocalStorage(key, value) {
 localStorage[key] = value;
});

pi_panel.port.on("createTab", function(url) {
  pi_panel.hide();
  
  if (url.indexOf("mailto:")>=0) {
    windows.browserWindows.activeWindow.tabs.activeTab.url = url;
  } else {
    var isPrivateBrowsing = privateBrowsing.isPrivate(windows.browserWindows.activeWindow);
    var objTab = { url: url, isPrivate: isPrivateBrowsing };
    tabs.open(objTab);
  }
});

pi_panel.port.on("ui_resize", function(data) {
  if (data === "expand_dropdown") {
    pi_panel.height = UI_SIZE.EXPD;
  } else if (data === "collapse_dropdown") {
    pi_panel.height = UI_SIZE.H;
  } else if (data === "expand_tooltip") {
    pi_panel.height = UI_SIZE.EXPD_TP;
  } else if (data === "collapse_tooltip") {
    pi_panel.height = UI_SIZE.H;
  }
});

pi_panel.port.on("request_from_popup", function(data) {
  //console.log("request_from_popup" + JSON.stringify(data));

  if (data.type === "truste") {
    var activeUrl = tabs.activeTab.url;
    if ( (activeUrl.indexOf("chrome://") > -1) || (activeUrl.indexOf("about:") > -1) ) {
      data.url = 'about:blank';
    } else {
      data.url = parseURL(activeUrl).newUrl;
    }
  } else if (data.type === "heartbleed") { }

  serverRequestV2({
    action: data.action,
    type: data.type,
    url: data.url
  });
});

pi_panel.port.on("notify_workers", function(data) {
  //console.log("notify_workers");

  var workers = BG.getWorkers();
  for (var i = 0; i < workers.length; i++) {
    try {
      workers[i].port.emit(data.action, data);
    }
    catch(err) {
      console.log("ERROR: workers port emit");
    }
  }
});

function serverRequestV2(request) {
  //console.log("serverRequestV2");

  var url = (request.type == "truste") ? TRUSTE_URL : HEARTBLEED_URL;
  var header = {
    "request_header": {
      "timestamp": new Date().getTime(),
      "protocol_version": "0.2",
      "credential_number": "1A47114EC5EAC20208F1A99FEB10A6D3",
    },
    "urls": []
  };
  header.urls.push({id:'0', url: request.url});

  Request({
    url: url,
    content: JSON.stringify(header),
    contentType: "application/json; charset=utf-8", 
    onComplete: function (response) {
      pi_panel.port.emit("response_from_popup", header, response.json.response, request.type);
    }
  }).post();
};

function parseURL(url) {
  var parseUrl = {};

  parseUrl.url = url;
  parseUrl.host = getHostname(parseUrl.url);
  parseUrl.domainName = getDomainName(parseUrl.host);

  var protocol_i = parseUrl.url.indexOf('://');
  parseUrl.protocol = parseUrl.url.substr(0, protocol_i);

  var domainName_i = parseUrl.host.indexOf(parseUrl.domainName);
  parseUrl.newUrl = parseUrl.protocol + '://' + parseUrl.host.slice(domainName_i);
  parseUrl.newUrlWithOutProtocol = parseUrl.host.slice(domainName_i);

  return parseUrl;
};

function getHostname(href) {
  var uri = iOService.newURI(href, "UTF-8", null);
  return uri.host.toString();
};

function getDomainName(url) {
  var parts = url.split('.'), ln = parts.length, i = ln, minLength = parts[parts.length-1].length, part;

  while(part = parts[--i]) {
    if (TLDs.indexOf(part) < 0 || part.length < minLength || i < ln-2 || i === 0) {
      return part;
    }
  }
};

exports.main = function(options, callbacks) {
  if (options.loadReason == "install") {
    pi_button.moveTo({
      toolbarID: "nav-bar",
      forceMove: false
    });
  }

  BG.initialize(options, ICONS, TLDs);
};