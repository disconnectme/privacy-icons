"use strict";

// Paints the UI.
const HIGHLIGHTED = '-highlighted';
const PNG_EXTENSION = '.png';
const INFO_URL = 'https://disconnect.me/icons/info/';

var localStorage = {};
var resourcePath;
var ICONS;
var TLDs = [];
var hoverOnTime;

// Destringifies an object.
function deserialize(object) {
  return (typeof object == 'string') ? JSON.parse(object) : object; 
};

function setLocalStorage(key, value) {
  self.port.emit("setLocalStorage", key, value);
  localStorage[key] = value;
};

self.port.on("show", function(storage, resource, icons, tlds) {
  localStorage = JSON.parse(JSON.stringify(storage));
  resourcePath = resource;
  ICONS = icons;
  TLDs = tlds;
  hoverOnTime = false;
  
  defaults_values();
});

self.port.on("response_from_popup", function(request, response, type) {
  if (type === "truste") {
    trusteCallback(request, response);
  } else if (type === "heartbleed") {
    heartBleedCallback(response);
  }
});

function initialize() {
  define_events();

  showIcons();
  currentOptions();
  setTimeout( function() { $('#txt_search').focus(); }, 50 ) ;
};

function defaults_values() {
  $(".current-site").html("");
  $(".icons ul").html("");
  $('#txt_search').val("");

  showIcons();
  currentOptions();
  setTimeout( function() { $('#txt_search').focus(); }, 50 ) ;
};

function define_events() {
  $('#support').click(supportClick);
  $('#help').click(supportClick);
  $('#txt_search').keyup(submitSearch);
  $('#txt_search').attr('placeholder', 'Google search with Privacy Icons');

  $('.highlighted').off('mouseenter').mouseenter(function() {
    this.src = this.src.replace(PNG_EXTENSION, HIGHLIGHTED + PNG_EXTENSION);
  }).off('mouseleave').mouseleave(function() {
    this.src = this.src.replace(HIGHLIGHTED + PNG_EXTENSION, PNG_EXTENSION);
  });
  //$(".dropdown-cp").find("img").css("-moz-transform", "rotate(29deg)"); //hard

  loadSharing();
  loadDropDown();
};

function trusteCallback(request, response) {
  //console.log("trusteCallback" + JSON.stringify(response));
  var data = response;
  var parsedUrl = parseURL(request.urls[0].url);

  $(".current-site").html(parsedUrl.newUrlWithOutProtocol.slice(0, 42));
  formatNameIcon('ExpectedUser', data[0].icons.ExpectedUser);
  formatNameIcon('ExpectedCollection', data[0].icons.ExpectedCollection);
  formatNameIcon('PreciseLocationData', data[0].icons.PreciseLocationData);
  formatNameIcon('DataRetention', data[0].icons.DataRetention);
  formatNameIcon('ChildrenPrivacyBadge', data[0].icons.ChildrenPrivacyBadge);
  formatNameIcon('DoNotTrackBadge', data[0].icons.DoNotTrackBadge);
  formatNameIcon('SSLSupport', data[0].icons.SSLSupport);
  formatNameIcon('HeartbleedVulnerable', data[0].icons.HeartbleedVulnerable);
  formatNameIcon('TrusteBadge', data[0].icons.TrusteBadge);

  if (parsedUrl.url.indexOf("https://") !== -1) {
    getHeartBleed(parsedUrl.protocol + "://" + parsedUrl.host);
  }

  loadCurrentSite();
  loadHelp();
};

function heartBleedCallback(response) {
  //console.log("heartBleedCallback");
  var data = response;
  var bgIcon = ICONS['HeartbleedVulnerable'];

  $(".icons ul").find("#HeartbleedVulnerable img").attr("src", getResourcePath(bgIcon.image + data[0].icons.HeartbleedVulnerable.color + ".png"));
};

function loadSharing() {
  Tipped.create('#share', $('.sharing.disconnect')[0], {
    skin: 'tiny',
    shadow: {
      color: '#fff',
      opacity: .1
    },
    stem: {
      spacing: -1
    },
    background: {
      color: '#333',
      opacity: .9
    },
    onShow: function() {},
    fadeIn: 400,
    fadeOut: 400
  });

  $($('.sharing a')[0]).off('click').click(function() {
    const URL = 'https://www.facebook.com/sharer.php?s=100&p[images][0]=https://disconnect.me/images/thumbnail.png&p[title]=Make the web fast, private, %26 secure&p[url]=https://disconnect.me/&p[summary]=Share Disconnect Privacy Icons...'
    window.open(URL, null, 'width=500,height=316');
    return false;
  });

  $($('.sharing a')[1]).off('click').click(function() {
    const URL = 'https://twitter.com/share?url=https://disconnect.me/&text=%23PrivacyIcons on disconnect.me:'
    window.open(URL, null, 'width=500,height=300');
    return false;
  });
};

function loadDropDown() {
  var elm = $(".dropdown-cp");

  // click colapse action
  $(elm).find(".droptop").click(function() {
    if ($(elm).find(".options").is(':visible')) {
      self.port.emit("ui_resize", "collapse_dropdown");
      $(elm).find(".options").fadeOut();
      $(elm).find("img").css("-moz-transform", "rotate(29deg)");
      $(elm).find("img").css("webkit-transform", "rotate(29deg)");
    } else {
      self.port.emit("ui_resize", "expand_dropdown");
      $(elm).find(".options").fadeIn();
      $(elm).find("img").css("-moz-transform", "rotate(0)");
      $(elm).find("img").css("webkit-transform", "rotate(0)");
    }

    $('#txt_search').focus(); // for firefox
  });

  // click filter option action
  $(elm).find(".options li").click(function() {
    setLocalStorage('showOption', $(this).attr("data-icontype"));

    if( localStorage['showOption'] == "custom" ) {
      self.port.emit("createCustomTab");
    }

    // close filter
    $(".droptop").trigger("click");

    // sendMessage to change filter in page
    self.port.emit("notify_workers", {
      action: "change_filter_response",
      turnAllOn: localStorage['turn_all_on'],
      showOption: localStorage['showOption'],
      customFilters: localStorage['custom_filters']
    });

    currentOptions(); // reload (display)
    $('#txt_search').focus(); // for firefox
  });
};

function loadCurrentSite() {
  Tipped.create('.current-site', 'Icons for the site you are currently on', {
    skin: 'tiny',
    shadow: {
      color: '#fff',
      opacity: .1
    },
    stem: {
      spacing: -1
    },
    background: {
      color: '#333',
      opacity: .9
    },
    onShow: function() {},
    fadeIn: 400,
    fadeOut: 400
  });
};

function currentOptions() {
  var dropdown = $(".dropdown-cp");
  self.port.emit("ui_resize", "collapse_dropdown");
  dropdown.find(".options").fadeOut();
  dropdown.find("img").css("-moz-transform", "rotate(29deg)");
  dropdown.find("img").css("webkit-transform", "rotate(29deg)");

  $(".dropdown-cp").find(".options li").each(function() {
    if ($(this).attr("data-icontype") == localStorage['showOption'])
      $(this).addClass("active");
    else
      $(this).removeClass("active");
  })
};

function supportClick() {
  self.port.emit("createTab", INFO_URL);
};

function submitSearch(e) {
  //console.log("submitSearch");
  e.which = e.which || e.keyCode;
  if (e.which != 13 && e.which != 1) return;
  if ($('#txt_search').val().trim() === "") return;

  var PREFIX_URL = "https://www.google.com/search?pi=t&q=";
  var uri = PREFIX_URL + encodeURIComponent($('#txt_search').val());
  self.port.emit("createTab", uri);

  window.close();
};

function formatNameIcon(name, joIcon) {
  if (ICONS == null) return;
  var defaultHtml = '<li id="{0}" class="{1}"><img class="whats_this" src="{2}"></li>';
  var bgIcon = ICONS[name];
  var image = getResourcePath(bgIcon.image + joIcon.color + ".png");
  var html = defaultHtml.format(
    name,
    bgIcon.tag,
    image
  );

  $(".icons ul").append(html);
};

function showIcons() {
  $(".icons ul").css("display", "block");

  self.port.emit("request_from_popup", {
    action: "request_from_popup",
    type: "truste",
    url: ""
  });
};

function getResourcePath(value) {
  //return chrome.extension.getURL(value);
  return resourcePath + value;
};

function getHeartBleed(url) {
  self.port.emit("request_from_popup", {
    action: "request_from_popup",
    type: "heartbleed",
    url: url
  });
};

function loadHelp() {
  $('body').bind({mouseleave: hideHelpImage});
  $('#toolbar').bind({mouseenter: hideHelpImage});
  $('#search-input').bind({mouseenter: hideHelpImage});
  $('#icons_help').bind({mouseenter: hideHelpImage});
  $('.whats_this').bind({mouseenter: showHelpImage});
};

function showHelpImage() {
  var start_position = { opacity: 2, marginTop: '9px' };
  var currentNameId = $(this).parent().attr('id');
  var obj = ICONS[currentNameId];
  var icon = $(this).parent();

  icon.css("opacity",1)
  icon.siblings().css("opacity", .5);

  hoverOnTime = setTimeout(function() {
    self.port.emit("ui_resize", "expand_tooltip");
    //$('#wrapper').css('height', '238px');
    //$('#icons_help .ih_image').attr('src', chrome.extension.getURL(obj.image + 'green.png'));
    $('#icons_help .ih_name').text(obj.name);
    $('#icons_help .ih_description').text(obj.title);

    $('#icons_help .ih_red').parent().hide();
    if (obj.red != "") {
      $('#icons_help .ih_red').text(obj.red);
      $('#icons_help .ih_red').parent().show();
    }

    $('#icons_help .ih_yellow').parent().hide();
    if (obj.yellow != "") {
      $('#icons_help .ih_yellow').text(obj.yellow);
      $('#icons_help .ih_yellow').parent().show();
    }

    $('#icons_help .ih_green').parent().hide();
    if (obj.green != "") {
      $('#icons_help .ih_green').text(obj.green);
      $('#icons_help .ih_green').parent().show();
    }

    $('#icons_help .ih_gray').parent().hide();
    if (obj.white != "") {
      $('#icons_help .ih_gray').text(obj.white);
      $('#icons_help .ih_gray').parent().show();
    }

    if (!$('#icons_help').is(":visible")) {
      $('#icons_help').show().css("opacity", 0).animate(start_position);  
    }
  }, 200);
};

function hideHelpImage() {
  clearTimeout(hoverOnTime);
  var stop_position = { opacity: 0, marginTop: '0px' };

  $("#black li").css("opacity",1)

  if ($('#icons_help').is(":visible")) {
    $('#icons_help').animate(stop_position, function() {
      //$('#wrapper').css('height', '176px');
      self.port.emit("ui_resize", "collapse_tooltip");
      $(this).hide();
    });
  }
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

String.prototype.format = String.prototype.f = function() {
  var s = this, i = arguments.length;
  while (i--) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  }
  return s;
};

initialize();