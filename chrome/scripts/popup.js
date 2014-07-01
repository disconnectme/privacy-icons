// "use strict";
/* Paints the UI. */
window.onload = function() {
  const BG = chrome.extension.getBackgroundPage();
  const HIGHLIGHTED = '-highlighted';
  const PNG_EXTENSION = '.png';
  const INFO_URL = 'https://disconnect.me/icons/info/';
  var hoverOnTime;

  initialize();

  function initialize() {
    define_events();
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

    loadSharing();
    loadDropDown();
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
        $(elm).find(".options").fadeOut();
        $(elm).find("img").css("-moz-transform", "rotate(29deg)");
        $(elm).find("img").css("webkit-transform", "rotate(29deg)");
      } else {
        $(elm).find(".options").fadeIn();
        $(elm).find("img").css("-moz-transform", "rotate(0)");
        $(elm).find("img").css("webkit-transform", "rotate(0)");
      }

      $('#txt_search').focus(); // for firefox
    });

    // click filter option action
    $(elm).find(".options li").click(function() {
      BG.localStorage['showOption'] = $(this).attr("data-icontype");

      if( BG.localStorage['showOption'] == "custom" ) {
        chrome.tabs.create({url: "markup/custom.html"});
      }

      // close filter
      $(".droptop").trigger("click");

      // sendMessage to change filter in page
      chrome.tabs.query({}, function(tabs) {
        var message = {
          action: "change_filter_response",
          showOption: BG.localStorage['showOption'],
          customFilters: localStorage['custom_filters']
        };
        for (var i=0; i<tabs.length; ++i) {
          chrome.tabs.sendMessage(tabs[i].id, message);
        }
      });

      currentOptions(); // reload (display)
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
    $(".dropdown-cp").find(".options li").each(function() {
      if ($(this).attr("data-icontype") == BG.localStorage['showOption'])
        $(this).addClass("active");
      else
        $(this).removeClass("active");
    })
  };

  function supportClick() {
    chrome.tabs.create({
      url: INFO_URL
    });
  };

  function submitSearch(e) {
    e.which = e.which || e.keyCode;
    if (e.which != 13 && e.which != 1) return;
    if ($('#txt_search').val().trim() === "") return;

    var PREFIX_URL = "https://www.google.com/search?pi=t&q=";
    var uri = PREFIX_URL + encodeURIComponent($('#txt_search').val());
    chrome.tabs.create({url: uri});

    window.close();
  };

  function formatNameIcon(name, joIcon) {
    var defaultHtml = '<li id="{0}" class="{1}"><img class="whats_this" src="{2}"></li>';
    var bgIcon = BG.ICONS[name];
    var image = chrome.extension.getURL(bgIcon.image + joIcon.color + ".png");
    //if (name == "HeartbleedVulnerable") image = chrome.extension.getURL(bgIcon.image + "white.gif");
    var html = defaultHtml.format(
      name,
      bgIcon.tag,
      image
    );

    $(".icons ul").append(html);
  };

  function showIcons() {
    $(".icons ul").css("display", "block");

    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tab) {
      var tabUrl = tab[0].url;

      var urls = [];
      urls.push({id:'0', url: BG.parseURL(tabUrl).newUrl});

      // Get Icons
      chrome.runtime.sendMessage({
        action: "request_from_popup",
        type: "truste",
        data: urls
      }, function(response) {
        trusteCallback(response, tabUrl);
      });
    });
  };

  function trusteCallback(response, url) {
    var data = response.data;
    var parsedUrl = BG.parseURL(url);

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
    
    if (url.indexOf("https://") !== -1) {
      getURLSpecificIcon(parsedUrl.protocol + "://" + parsedUrl.host, "heartbleed", heartBleedCallback);
    }
    
    loadCurrentSite();
    loadHelp();
  };

  function getURLSpecificIcon(url, type, callback) {
    var urls = [];
    urls.push({id: '0', url: url});

    chrome.runtime.sendMessage({
      action: "request_from_popup",
      type: type,
      data: urls
    }, callback);
  };

  function heartBleedCallback(response) {
    var data = response.data;
    var bgIcon = BG.ICONS['HeartbleedVulnerable'];

    $(".icons ul").find("#HeartbleedVulnerable img").attr("src", chrome.extension.getURL(bgIcon.image + data[0].icons.HeartbleedVulnerable.color + ".png"));
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
    var obj = BG.ICONS[currentNameId];
    var icon = $(this).parent();

    icon.css("opacity",1)
    icon.siblings().css("opacity", .5);

    hoverOnTime = setTimeout(function() {
      $('#wrapper').css('height', '250px');
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
        $('#wrapper').css('height', '176px');
        $(this).hide();
      });
    }
  };
};

String.prototype.format = String.prototype.f = function() {
  var s = this, i = arguments.length;
  while (i--) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  }
  return s;
};