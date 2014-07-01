const HOUR_MS = 60 * 60 * 1000;
const TRUSTE_URL = 'https://icons.disconnect.me/truste/check';
const HEARTBLEED_URL = 'https://icons.disconnect.me/bleed/check';
const SSLSUPPORT_URL = 'https://icons.disconnect.me/ssl/check';
const HITS_URL = 'https://hits.disconnect.me';
const WELCOME_URL = 'https://disconnect.me/icons/welcome';

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

var get_user_id = function() {
  return localStorage['pi_user_id'];
};

function deserialize(object) {
  return (typeof object == 'string') ? JSON.parse(object) : object;
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

  return parseUrl
};

function getHostname(href) {
  var l = window.document.createElement("a");
  l.href = href;
  return l.hostname;
};

function getDomainName(url) {
  var parts = url.split('.'), ln = parts.length, i = ln, minLength = parts[parts.length-1].length, part;

  while(part = parts[--i]) {
    if (TLDs.indexOf(part) < 0 || part.length < minLength || i < ln-2 || i === 0) {
      return part;
    }
  }
};

function init_variables() {
  const newInstall = deserialize(localStorage['pi_new_install']);

  var firstInstall = (typeof newInstall === 'undefined');
  if (firstInstall) {
    localStorage['pi_new_install'] = "false";

    localStorage['build_version'] = chrome.app.getDetails().version.toString();
    localStorage['pi_group'] = "disconnect";
    localStorage['pi_product'] = "privacyicons";
    localStorage['pi_user_id'] = "0";
    localStorage['turn_all_on'] = "true";
    localStorage['showOption'] = "oneicon";
    localStorage['custom_filters'] = "ExpectedUser ExpectedCollection PreciseLocationData DataRetention ChildrenPrivacyBadge DoNotTrackBadge SSLSupport HeartbleedVulnerable TrusteBadge";
    localStorage['search_total'] = 0;

    chrome.tabs.create({url: WELCOME_URL});
  }
};

function onWebNavigationCompleted(tab) {
  // Inject js files for current tab, if google
  var tabId = tab.tabId;
  console.log(tab.url);
  try {
    if (tab.url.indexOf("www.google") == -1 || tab.url.indexOf("_/chrome/newtab") != -1 ) return;
  }catch(e){}
  
  chrome.tabs.executeScript(tabId, {file: "scripts/vendor/jquery/jquery.js", allFrames: false, runAt: "document_end"}, function() {
    chrome.tabs.executeScript(tabId, {file: "scripts/vendor/tipped/tipped.js"}, function() {
      chrome.tabs.executeScript(tabId, {file: "scripts/google_serp.js", allFrames: false, runAt: "document_end"}, function() {
        try{
          chrome.tabs.insertCSS(tabId, {file: "stylesheets/google_serp.css"});
          chrome.tabs.insertCSS(tabId, {file: "stylesheets/vendor/tipped/tipped.css"});
          var byPopup = tab.url ? (tab.url.indexOf("?pi=t&") != -1) : false;
          var message = {
            action: "initialize",
            byPopup: byPopup ,
            turnAllOn: localStorage['turn_all_on'],
            showOption: localStorage['showOption'],
            customFilters: localStorage['custom_filters'],
            icons: ICONS,
            tlds: TLDs
          }
          chrome.tabs.sendMessage(tabId, message);
        }catch(ei){}
      });
    });
  });
};

function onRuntimeMessage(request, sender, sendResponse) {
  if (request.action == "request_from_popup") {
    serverRequestV2(request, sender, sendResponse);
  } else if (request.action == "request_from_serp") {
    if (!sender.tab.id) return
    serverRequestV2(request, sender, sendResponse);
  } else if (request.action == "get_options") {
    sendResponse({
      turnAllOn: localStorage['turn_all_on'],
      showOption: localStorage['showOption'],
      customFilters: localStorage['custom_filters']
    });
  } else if (request.action == "set_options") {
    if (request.showOption)
      localStorage['showOption'] = request.showOption;
    if (request.customFilters)
      localStorage['custom_filters'] = request.customFilters;
    if (request.turnAllOn)
      localStorage['turn_all_on'] = request.turnAllOn;

    // send notification for all tabs (filter changed)
    chrome.tabs.query({}, function(tabs) {
      var message = {
        action: "change_filter_response",
        showOption: localStorage['showOption'],
        turnAllOn: localStorage['turn_all_on'],
        customFilters: localStorage['custom_filters']
      };
      for (var i = 0; i < tabs.length; ++i) {
        chrome.tabs.sendMessage(tabs[i].id, message);
      }
    });
  }

  return true;
};

function serverRequestV2(request, sender, sendResponse) {
  var url = "";
  if (request.type == "truste") {
    url = TRUSTE_URL;
    if (request.action == "request_from_serp")
      localStorage.search_total = parseInt(localStorage.search_total) + 1;
  } else if (request.type == "sslsupport") url = SSLSUPPORT_URL;
  else url = HEARTBLEED_URL;
  
  var header = {
    "request_header": {
      "timestamp": new Date().getTime(),
      "protocol_version": "0.2",
      "credential_number": "1A47114EC5EAC20208F1A99FEB10A6D3",
    },
    "urls": []
  };
  header.urls = request.data;

  $.ajax({
    type: 'POST',
    url: url,
    data: JSON.stringify(header),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data) {
      if (request.action == "request_from_popup") {
        sendResponse({
          data: data.response
        });
      } else {
        //console.log("serverRequestV2:" + " Action: " + request.action + " Type: " + request.type + " TabId: " + sender.tab.id + "\n Response" + JSON.stringify(data));
        var action = "";
        if (request.type == "truste") action = "truste_response";
        else if (request.type == "sslsupport") action = "sslsupport_response";
        else action = "bleed_response";
        
        var message = {
          action: action,
          data: data.response,
          turnAllOn: localStorage['turn_all_on'],
          showOption: localStorage['showOption'],
          customFilters: localStorage['custom_filters']
        };
        chrome.tabs.sendMessage(sender.tab.id, message);
      }
    },
    error: function(data) { }
  });
};

function reportUsage() {
  var oneDayAsMsec = 24 * HOUR_MS;

  var now = new Date();
  var firstPing = new Date(localStorage.pi_first_ping || now);
  var firstUpdate = (firstPing.getTime() == now.getTime());

  var dailyPing = new Date(localStorage.pi_daily_ping || now);
  var weeklyPing = new Date(localStorage.pi_weekly_ping || now);
  var monthlyPing = new Date(localStorage.pi_monthly_ping || now);
  var quarterlyPing = new Date(localStorage.pi_quarterly_ping || now);
  var semiannualPing = new Date(localStorage.pi_semiannual_ping || now);
  var yearlyPing = new Date(localStorage.pi_yearly_ping || now);

  var daily = ((now.getTime() - dailyPing.getTime()) >= oneDayAsMsec);
  var weekly = ((now.getTime() - weeklyPing.getTime()) >= 7 * oneDayAsMsec);
  var monthly = ((now.getTime() - monthlyPing.getTime()) >= 30 * oneDayAsMsec);
  var quarterly = ((now.getTime() - quarterlyPing.getTime()) >= 90 * oneDayAsMsec);
  var semiannual = ((now.getTime() - semiannualPing.getTime()) >= 180 * oneDayAsMsec);
  var yearly = ((now.getTime() - yearlyPing.getTime()) >= 365 * oneDayAsMsec);
  var searches_total = localStorage.search_total || 0;

  //yearly|semiannual|quarterly|monthly|weekly|daily
  var report_update_type;
  if (yearly) report_update_type = 0x20 | 0x10 | 0x08 | 0x04 | 0x01;
  else if (semiannual) report_update_type = 0x10 | 0x08 | 0x04 | 0x01;
  else if (quarterly) report_update_type = 0x08 | 0x04 | 0x01;
  else if (monthly) report_update_type = 0x04 | 0x01;
  else if (weekly) report_update_type = 0x02 | 0x01;
  else if (daily) report_update_type = 0x01;
  else report_update_type = 0x00;

  var data = {
    conn: HITS_URL,
    password: 'dirthavepure',
    time: new Date().toUTCString(),
    path: '/partnership_analytics.json?',
    ua: window.navigator.userAgent,
    host: 'disconnect.me',
    method: 'POST',
    status: 200
  };

  data.path = data.path + [
    'group_id=' + localStorage.pi_group,
    'product_id=' + localStorage.pi_product,
    'user_id=' + get_user_id(),
    'build=' + localStorage.build_version
  ].join('&');
  data.path = data.path + '&' + [
    'first_update=' + firstUpdate.toString(),
    'updated_type=' + report_update_type.toString(),
    'searches_total=' + searches_total.toString()
  ].join('&');

  $.ajax(data.conn, {
    type: data.method,
    data: data,
    success: function(data, textStatus, jqXHR) {
      if (firstUpdate) localStorage.pi_first_ping = now;
      if (daily || firstUpdate) localStorage.pi_daily_ping = now;
      if (weekly || firstUpdate) localStorage.pi_weekly_ping = now;
      if (monthly || firstUpdate) localStorage.pi_monthly_ping = now;
      if (quarterly || firstUpdate) localStorage.pi_quarterly_ping = now;
      if (semiannual || firstUpdate) localStorage.pi_semiannual_ping = now;
      if (yearly || firstUpdate) localStorage.pi_yearly_ping = now;
      localStorage.search_total = parseInt(localStorage.search_total) - searches_total;
    }
  });
};

function load_events() {
  var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ? 'runtime' : 'extension';
  chrome[runtimeOrExtension].onMessage.addListener(onRuntimeMessage);
  chrome.webNavigation.onTabReplaced.addListener(onWebNavigationCompleted);
  chrome.webNavigation.onCompleted.addListener(onWebNavigationCompleted, {
    url: [{hostContains: 'www.google'}]
  });
};

function initialize() {
  init_variables();
  load_events();

  reportUsage();
  setInterval(reportUsage, HOUR_MS);
};

initialize();