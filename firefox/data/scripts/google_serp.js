var alreadyInjected, byPopupActived, resourcePath;
var ICONS, TLDs;

var handlerInIcons = function() {
  var src = this.src;
  if (src.indexOf('white') != -1 || src.indexOf('load.png') != -1 ) return;

  var position = src.lastIndexOf(".png");
  src = src.substring(0, position);
  this.src = (src + "-hover.png");
};
var handlerOutIcons = function() {
  var src = this.src;
  src = src.replace("-hover", "");
  this.src = src;
};

self.port.on("pi_initialize", function(data) {
  //console.log("self.port.on(pi_initialize)");

  ICONS = data.icons;
  TLDs = data.tlds;
  resourcePath = data.resources;

  initialize(data);
});

function initialize(data) {
  //console.log("initialize");

  init_variables();
  load_events();

  getTruste(data.turnAllOn);
  activePrivacyIcons(data.turnAllOn);
  switchIconsVisibility(data.showOption, data.customFilters);
};

function init_variables() {
  alreadyInjected = false;
  byPopupActived = (window.document.location.href.indexOf("?pi=t&") > -1);
};

function load_events() {
  self.port.on("response_from_serp", function(data) {
    //console.log("response_from_serp");
    if (data.type === "truste") {
      TrusteCheckCallback(data);
    } else if (data.type === "heartbleed") {
      HeartBleedCheckCallback(data);
    } else if (data.type === "sslsupport") {
      SSLRedirectCheckCallback(data);
    }
  });

  self.port.on("google_instant_callback", function(data) {
    //console.log("google_instant_callback");
    getTruste(data.turnAllOn);
    activePrivacyIcons(data.turnAllOn);
    switchIconsVisibility(data.showOption, data.customFilters);
  });

  self.port.on("change_filter_response", function(data) {
    //console.log("change_filter_response");
    switchIconsVisibility(data.showOption, data.customFilters);
  });

  self.port.on("turn_extension_response", function(data) {
    //console.log("turn_extension_response");
    getTruste(data.turnAllOn);
    activePrivacyIcons(data.turnAllOn);
    switchIconsVisibility(data.showOption, data.customFilters);
  });

  window.addEventListener("message", function(e) {
    if (e.data == 'jrc') {
      //console.log('Google-Instant Callback Done');
      self.port.emit('google-instant', true);
    }
  }, false);
};

function activePrivacyIcons(active) {
  //console.log("activePrivacyIcons: " + active);

  var isShop = ( window.document.location.href.indexOf("&tbm=shop")>-1 && window.document.getElementById("leftnavc")!=undefined );
  var isActive = (active === true || active === "true");
  if (isActive || byPopupActived) {
    if (isShop) $("#subtitles").hide();

    // show D icone
    $('#hdtb_msb').css("display", "block");
    $('#hdtb_msb').css("background-repeat", "no-repeat");
    $('#hdtb_msb').css("background-position", "40px 50%");
    $('#hdtb_msb').css("background-image", "url('" + getResourcePath("images/disconnect/D.png") + "')");

    // left shift google results
    var marginLeft = "0px";
    $("#hdtb_msb").animate({
      marginLeft: marginLeft
    });
    $("#appbar").animate({
      paddingLeft: marginLeft
    });
    $(".mw").animate({
      marginLeft: marginLeft
    }, function() {
      var iresPos = $("#ires").offset(); // google results
      if (iresPos.top > 0) $("#subtitles").css("top", iresPos.top.toString() + "px");
      if (!isShop) $("#subtitles").show();
    });
    $(".privacy_icons").show();
  } else {
    $('#hdtb_msb').css("background-image", "none");

    var marginLeft = "0px";
    $("#hdtb_msb").animate({
      marginLeft: marginLeft
    });
    $("#appbar").animate({
      paddingLeft: marginLeft
    });
    $(".mw").animate({
      marginLeft: marginLeft
    });

    $(".privacy_icons").hide();
    $("#subtitles").hide();
  }
};

function formatNameIcon(name, joIcon, extra) {
  var defaultHtml = '<li name="{0}" class="icons-tooltip {1}"><img class="icon-with-effect {2}" src="{3}"/></li>';
  var oneIconHtml = '<li name="{0}" class="oneicon_btn hide" style="float: left;"><img class="icon-with-effect" src="{1}"/></li>'
  var html = "";

  var bgIcon = ICONS[name];
  var image = getResourcePath(bgIcon.image + "20" + joIcon.color + ".png");
  var title = bgIcon.title;
  var color = bgIcon[joIcon.color];
  var id = bgIcon.name.replace(/ /g, "_").toLowerCase();
  var tag = bgIcon.tag;
  var imgExtraClass = "";

  if (joIcon.color == "white") {
    tag = tag + " faded";
    image = getResourcePath(bgIcon.image + joIcon.color + ".png");
  }

  if (name == "Disconnect") {
    html = oneIconHtml.piFormat(name, image);
    return html;
  }

  if (name == "HeartbleedVulnerable" && extra.isSSL) {
    image = getResourcePath("images/load.png");
    imgExtraClass = 'ajaxLoad';
  } else if (name == "SSLSupport" && !extra.isSSL) {
    image = getResourcePath("images/load.png");
    imgExtraClass = 'ajaxLoad';
  }

  html = defaultHtml.piFormat(name, tag, imgExtraClass, image);
  return html;
};

function getTruste(active) {
  //console.log("getTruste: " + active);

  var isActive = (active === true || active === "true");
  var isGoogle = (window.document.location.href.indexOf("www.google.")>-1);
  var gbqf = window.document.getElementById("gbqf");
  var resultStats = window.document.getElementById("resultStats");
  var isSearch = ( isGoogle && (resultStats!=undefined) && (gbqf!=undefined) && (gbqf.action.indexOf("/search")>-1) ) ? true : false;
  if (!(isSearch && (isActive || byPopupActived))) return;
  
  var urls = [];
  var urlResults = insertNormalResults();
  var urlsAds = insertAdsResults();
  urls = $.merge(urlsAds, urlResults);

  self.port.emit('request_from_serp', {
    action: "request_from_serp",
    type: "truste",
    url: urls
  });
};

function insertAdsResults() {
  var urls = [];
  var defaultHtml = '';
  defaultHtml += '<span class="icons_hover_box" style="width: 100%; left: {0}px;" url="{1}">';
  defaultHtml += '  <ul style="display: block;" class="privacy_icons" id="_{2}"></ul>';
  defaultHtml += '  <div class="main-content-hover"></div>';
  defaultHtml += '</span> ';

  var resultsElm = $("#tads").find("ol li.ads-ad");
  resultsElm.each(function(i, item) {
    var link = $(item).find("h3 a:visible");
    var url_string = $(link).attr("href");
        
    var parsed_url = parseURL(url_string);    // URL
    var elmId = formatId(); // ID
    urls.push({id: elmId, url: parsed_url.newUrl}); // without subdomain
  
    var marginChecker = 0;
    marginChecker = $(item).find("h3 a:visible").outerWidth(true) + marginChecker;

    $(item).find("h3 a:visible").append(
      defaultHtml.piFormat(marginChecker, url_string, elmId)
    );
  });
  return urls;
};

function insertNormalResults() {
  var urls = [];
  var defaultHtml = '';
  
  // to remove any div if it exist and insert again (it duplicates on go back in history) TODO: verify it can be improved
  $('.icons_hover_box').remove();
  
  defaultHtml += '<div class="icons_hover_box" style="width: 100%; left: {0}px; top: -1px;" url="{1}">';
  defaultHtml += '  <ul style="display: block;"" class="privacy_icons" id="_{2}"></ul>';
  defaultHtml += '  <div class="main-content-hover" ></div>';
  defaultHtml += '</div>';

  var resultsElm = $("#search").find("#ires ol li.g");
  resultsElm.each(function(i, item) {
    var url_string = $(item).find("h3 a").attr("href");
    if (!url_string || url_string.indexOf("http") === -1) return;

    var parsed_url = parseURL(url_string);    // URL
    var elmId = formatId(); // ID
    urls.push({id: elmId, url: parsed_url.newUrl}); // without subdomain
   
    var marginChecker = 0;
    // In-Depth Articles custom search, calculating the thumbnail width to increase the icons margin-left
    if( $('.rg-header').text() != "" ) {
      marginChecker = $(item).find("h3 a").parent().parent().parent().find("img").outerWidth(true);
    }
    marginChecker = (marginChecker) ? $(item).find("h3 a").outerWidth(true) + marginChecker : $(item).find("h3 a").outerWidth(true);

    $(item).find(".rc .r").append(
      defaultHtml.piFormat(marginChecker, url_string, elmId)
    );
  });
  return urls;
};

function TrusteCheckCallback(response) {
  //console.log("TrusteCheckCallback");
  var data = response.response;

  for (var i in data) {
    var item = $("#_" + data[i].id);

    var urlWithHttps = false;
    try { urlWithHttps = $(item).parent().attr("url").indexOf("https://") !== -1; } catch (e) {}

    var html = "";
    html += formatNameIcon('Disconnect', {show:true, color:'green'});
    html += formatNameIcon('ExpectedUser', data[i].icons.ExpectedUser);
    html += formatNameIcon('ExpectedCollection', data[i].icons.ExpectedCollection);
    html += formatNameIcon('PreciseLocationData', data[i].icons.PreciseLocationData);
    html += formatNameIcon('DataRetention', data[i].icons.DataRetention);
    html += formatNameIcon('ChildrenPrivacyBadge', data[i].icons.ChildrenPrivacyBadge);
    html += formatNameIcon('DoNotTrackBadge', data[i].icons.DoNotTrackBadge);
    html += formatNameIcon('SSLSupport', data[i].icons.SSLSupport, {isSSL: urlWithHttps});
    html += formatNameIcon('HeartbleedVulnerable', data[i].icons.HeartbleedVulnerable, {isSSL: urlWithHttps});
    html += formatNameIcon('TrusteBadge', data[i].icons.TrusteBadge);

    if ($(item).find(".oneicon_btn").length === 0 && html !== "") {
      $(item).append(html);
    }
  }
  addPISerpMenu(response.showOption);
  switchIconsVisibility(response.showOption, response.customFilters);
  setOneIconTooltip();
  getHeartbleed();
  getSSLRedirect();
};

function getSSLRedirect() {
  //console.log("getSSLRedirect");
  var urls = [];
  var resultsElm = $(".icons_hover_box");
  resultsElm.each(function(i, item) {
    var url_string = $(item).attr("url");
    if (!url_string || url_string.indexOf("https://") !== -1) return;

    var id = $(item).find('ul').attr('id').replace('_', ''); // ID for element
    var parsed_url = parseURL(url_string);
    var url_to_consult = parsed_url.protocol + "://" + parsed_url.host;
    
    urls.push({id:id, url:url_to_consult});
  });

  self.port.emit('request_from_serp', {
    action: "request_from_serp",
    type: "sslsupport",
    url: urls
  });
};

function SSLRedirectCheckCallback(response) {
  //console.log("SSLRedirectCheckCallback", response);
  var data = response.response;
  
  for (var i in data) {
    var item = $("#_" + data[i].id);
    
    var icon = data[i].icons.SSLSupport;
    var imageUrl = getResourcePath(ICONS.SSLSupport.image + "20" + icon.color + ".png");
    if (icon.color == "white" && icon.show) imageUrl = getResourcePath(ICONS.SSLSupport.image + icon.color + ".png");
    var image = $(item).find('li[name="SSLSupport"] img');

    $(item).find('li[name="SSLSupport"] img').attr("src", imageUrl);
    $(image).removeClass("ajaxLoad");
  }
  setOneIconTooltip();
  setIconsTooltip();
  setIconsAnimations();
};

function getHeartbleed() {
  //console.log("getHeartbleed");
  var urls = [];
  var resultsElm = $(".icons_hover_box");
  resultsElm.each(function(i, item) {
    var url_string = $(item).attr("url");
    if (!url_string) return;

    var id = $(item).find('ul').attr('id').replace('_', '');   // ID for element
    var parsed_url = parseURL(url_string); // URL
    var url_to_consult = parsed_url.protocol + "://" + parsed_url.host;
    
    urls.push({id:id, url:url_to_consult});
  });

  self.port.emit('request_from_serp', {
    action: "request_from_serp",
    type: "heartbleed",
    url: urls
  });
};

function HeartBleedCheckCallback(response) {
  //console.log("HeartBleedCheckCallback");
  var data = response.response;
  
  for (var i in data) {
    var item = $("#_" + data[i].id);

    var icon = data[i].icons.HeartbleedVulnerable;
    var imageUrl = getResourcePath(ICONS.HeartbleedVulnerable.image + "20" + icon.color + ".png");
    if (icon.color == "white" && icon.show) imageUrl = getResourcePath(ICONS.HeartbleedVulnerable.image + icon.color + ".png");
    var image = $(item).find('li[name="HeartbleedVulnerable"] img');
    
    $(image).attr("src", imageUrl);
    $(image).removeClass("ajaxLoad");
  }
  setOneIconTooltip();
  setIconsTooltip();
  setIconsAnimations();
};

function setIconsTooltip() {
  //console.log('setIconsTooltip');

  $('.icons-tooltip').each(function() {
    var objIcons = ICONS[$(this).attr('name')]; //ID
    var template = getTemplate(objIcons, 'allIcons');
    var newHTml = template.piFormat(
      objIcons.name,
      objIcons.title,
      objIcons.red,
      objIcons.yellow,
      objIcons.green,
      objIcons.white
    );

    Tipped.create(this, newHTml, {
      skin: 'white',
      hook: 'rightmiddle',
      hideDelay: 0,
      hideOnClickOutside: true,
      hideOthers: true,
      background: {
        color: '#FFFFFF',
        opacity: 1
      },
      hideOn: [{
        element: 'self',
        event: 'mouseleave'
      }, {
        element: 'tooltip',
        event: 'mouseenter'
      }],
      onShow: function(content, element) { },
      onHide: function() { },
      afterUpdate: function(content, element) { }
    });
  });
};

function setOneIconTooltip() {
  //console.log('setOneIconTooltip');

  $('.oneicon_btn').each(function() {
    var content = '<div style="width: 264px; height: 25px;"><ul class="hoversquare"></ul></div>';
    Tipped.create(this, content, {
      skin: 'dark',
      hook: 'rightmiddle',
      hideDelay: 0,
      hideOnClickOutside: true,
      hideOthers: true,
      hideOn: [{
        element: 'self',
        event: 'click'
      }],
      onShow: function(content, element) {
        $(element).parent().find("li").each(function() {
          if ($(this).attr('name') == 'Disconnect') return;

          var clone = $(this).clone();
          $(clone).css("display", "inline");
          $(clone).css("margin-top", "3px");
          $(content).find(".hoversquare").append(clone);
        });

        $(content).find(".hoversquare li").hover(function() {
          var extraBox = $(element).parent().next();
          var objIcons = ICONS[$(this).attr('name')]; //ID
          var template = getTemplate(objIcons);

          $(this.lastChild).unbind('mouseenter mouseleave');
          $(this.lastChild).hover(handlerInIcons, handlerOutIcons);

          extraBox.html(template.piFormat(
            objIcons.name,
            objIcons.title,
            objIcons.red,
            objIcons.yellow,
            objIcons.green,
            objIcons.white
          )).show();
        });
      },
      onHide: function(content, element) {
        $(element).parent().next().empty();
        $(content).find(".hoversquare").empty();
      },
      afterUpdate: function(content, element) { }
    });
  });
};

function getTemplate(obj, type) {
  var defaultHtml = "";
  if (type == 'allIcons') {
    defaultHtml += '<div style="width: 260px; display: block; white-space: normal; color: #00953c;">';
  } else {
    defaultHtml += '<div class="box-content-hover" style="width: 260px; display: block; white-space: normal;">';
  }
  defaultHtml += '  <span class="ih_name" style="font-size: 16px; font-weight:bold;">{0}</span>';
  defaultHtml += '  <p class="ih_description" align="justify" style="font-size: 12px; margin: 0px; padding-top:5px; padding-bottom:5px;">{1}</p>';
  defaultHtml += '  <div style="font-size: 10px;">';
  defaultHtml += (obj.red != "") ? '<div class="clean">' : '<div class="clean hide">'
  defaultHtml += '      <span style="color: #DF613F; font-weight:bold;">Red</span>';
  defaultHtml += '      <span> = </span>';
  defaultHtml += '      <span class="ih_red">{2}</span>';
  defaultHtml += '    </div>';
  defaultHtml += (obj.yellow != "") ? '<div class="clean">' : '<div class="clean hide">'
  defaultHtml += '      <span style="color: #FBC53A; font-weight:bold;">Yellow</span>';
  defaultHtml += '      <span> = </span>';
  defaultHtml += '      <span class="ih_yellow">{3}</span>';
  defaultHtml += '    </div>';
  defaultHtml += (obj.green != "") ? '<div class="clean">' : '<div class="clean hide">'
  defaultHtml += '      <span style="color: #1E9E59; font-weight:bold;">Green</span>';
  defaultHtml += '      <span> = </span>';
  defaultHtml += '      <span class="ih_green">{4}</span>';
  defaultHtml += '    </div>';
  defaultHtml += (obj.white != "") ? '<div class="clean">' : '<div class="clean hide">'
  defaultHtml += '      <span style="color: #777; font-weight:bold;">Gray</span>';
  defaultHtml += '      <span> = </span>';
  defaultHtml += '      <span class="ih_gray">{5}</span>';
  defaultHtml += '    </div>';
  defaultHtml += '  </div>';
  defaultHtml += '</div>';
  return defaultHtml;
};

function switchIconsVisibility(toshow, customFilter) {
  //console.log('switchIconsVisibility: ' + toshow);
 
  var div = '<div id="adsBreakLine" style="clear:both"></div>';
  $("body").find(".privacy_icons").find("li").hide();
  $("body").find("#custom_list").hide();
  
  //to hide button/tooltip before change option.
  $("body").find(".box-content-hover").hide();
  Tipped.hideAll();

  switch (toshow) {
    case 'showall':
      $("body").find(".icons_hover_box").css('z-index', '10000');
      $("body").find(".icons_hover_box").css('position', 'initial');
      $("body").find(".icons_hover_box").css('margin-top', '4px');
      $("body").find(".icons_hover_box").css('margin-left', '0px');
      $("span").find(".privacy_icons").css('margin-top', '6px');
      $("span").find(".privacy_icons").next().append(div);
      $("body").find(".privacy_icons").find("li:not(.oneicon_btn)").show();
      break;

    case 'oneicon':
      $("body").find(".icons_hover_box").css('z-index', '');
      $("body").find(".icons_hover_box").css('position', 'absolute');
      $("body").find(".icons_hover_box").css('margin-top', '0px');
      $("body").find(".icons_hover_box").css('margin-left', '15px');
      $("span").find(".privacy_icons").css('margin-top', '0px');
      $("#adsBreakLine").remove();
      
      $("body").find(".privacy_icons").each(function() {
        var qtd = $(this).find("li").length;
        if (qtd>1) $(this).find("li.oneicon_btn").show();
      });
      break;

    case 'custom':
      $("body").find(".icons_hover_box").css('z-index', '10000');
      $("body").find(".icons_hover_box").css('position', 'initial');
      $("body").find(".icons_hover_box").css('margin-top', '4px');
      $("body").find(".icons_hover_box").css('margin-left', '0px');
      $("span").find(".privacy_icons").css('margin-top', '6px');      
      $("span").find(".privacy_icons").next().append(div);
      
      var custom_list = $("body #custom_list");
      custom_list.show();
      custom_list.find("input[type=checkbox]").prop("checked",false); // Reset inputs
      
      var customArray = customFilter.split(' ');
      for (var i = 0; i < customArray.length; i++) {
        $("body").find(".privacy_icons").find('li[name="'+ customArray[i] + '"]').show();
        custom_list.find('li[name="' + customArray[i] + '"]').find("input[type='checkbox']").prop("checked",true);
      }  
      break;

    case 'noicons':
      $("body").find(".privacy_icons").find("li").hide();
      break;

    default:
      break;
  }

  // update the html options filter
  $("#subtitles").find(".dropdown-cp").find(".options li").each(function() {
    if ($(this).hasClass(toshow))
      $(this).addClass("active");
    else
      $(this).removeClass("active");
  });
};

function setIconsAnimations() {
  $('.icon-with-effect').unbind('mouseenter mouseleave');
  $('.icon-with-effect').hover(handlerInIcons, handlerOutIcons);
};

// This id is to find in google serp where to add response from server.
function formatId() {
  var uniqueId = ((Math.floor((Math.random() * 1000) + 1) ) * new Date().getTime());
  return uniqueId.toString();
};

function showSubtitles() {
  //console.log("showSubtitles");
  
  var html = "";
  html += "<div id='subtitles'>";
  html += "<h2><span>Privacy Icons</span></h2>";
  html += "<div class='options_li clear'><div class='clear header'><h3>Options</h3><span>&#9658;</span></div><br style='clear:both' /><div id='options_div' style='display: block;'></div></div>";
  html += "<ul id='custom_list'></ul>";
  html += "</div>";
  $("body").append(html);
  $('#subtitles h2').css("background-image", "url('" + getResourcePath("images/48.png") + "')");
  $('#subtitles h2').css("background-size", "18px 18px");
  $('#subtitles h2').css("background-position", "3px center");

  var iresTop = $("#ires").offset().top;
  var isShop = ( window.document.location.href.indexOf("&tbm=shop")>-1 && window.document.getElementById("leftnavc")!=undefined );
  if (iresTop > 0) $("#subtitles").css("top", iresTop.toString() + "px");
  (!isShop) ? $("#subtitles").show() : $("#subtitles").hide();
};

function formatCustomList(name) {
  var defaultHtml = "";
  defaultHtml += '<li name="{0}">';
  defaultHtml += '  <input type="checkbox" name="{0}" id="{0}"><label for="{0}"></label>';
  defaultHtml += '  <p>';
  defaultHtml += '    <img src="{1}" width="17px" height="17px" />';
  defaultHtml += '    <span class="truncate">{2}</span>';
  defaultHtml += '  </p>';
  defaultHtml += '  <p class="definition">{3}</p>';
  defaultHtml += '</li>';

  var bgIcon = ICONS[name],
      image = getResourcePath(bgIcon.image + "white.png"),
      html = defaultHtml.piFormat(
        name,
        image,
        bgIcon.name,
        bgIcon.title
      );

  return html;
};

function getResourcePath(value) {
  return resourcePath + value;
};

function addPISerpMenu(defaultOption) {
  if (alreadyInjected) return;
  alreadyInjected = true;
  
  showSubtitles();
  loadIconsDescriptions();
  loadOptions(defaultOption);
};

function loadIconsDescriptions() {
  ul = $("#custom_list");
  ul.append(formatCustomList('ExpectedUser'));
  ul.append(formatCustomList('ExpectedCollection'));
  ul.append(formatCustomList('PreciseLocationData'));
  ul.append(formatCustomList('DataRetention'));
  ul.append(formatCustomList('ChildrenPrivacyBadge'));
  ul.append(formatCustomList('DoNotTrackBadge'));
  ul.append(formatCustomList('SSLSupport'));
  ul.append(formatCustomList('HeartbleedVulnerable'));
  ul.append(formatCustomList('TrusteBadge'));

  $("#custom_list li").on("click", function() {
    $(this).find("input[type=checkbox]").trigger("click");
  });

  $("#custom_list input[type=checkbox]").on("change", function(event) {
    var selected = [];
    $('#custom_list input:checked').each(function() {
      selected.push($(this).attr('name'));
    });
    self.port.emit('set_options', {
      sender: event.target.toString(),
      customFilters: selected.join(' ')
    })
  });
};

function loadOptions(defaultOption){
  var optionsHTML = "";
  optionsHTML += '<div class="clear dropdown-cp">';
  optionsHTML += ' <ul class="clear options">';
  optionsHTML += '   <li class="oneicon">One Icon</li>';
  optionsHTML += '   <li class="showall">All Icons</li>';
  optionsHTML += '   <li class="noicons">No Icons</li>';
  optionsHTML += '   <li class="custom">Customize</li>';
  optionsHTML += ' <ul>';
  optionsHTML += '</div>';

  $('#options_div').append(optionsHTML);

  $("#options_div").hide();
  $(".dropdown-cp").find(".options li").each(function() {
    if ( $(this).hasClass(defaultOption) )
      $(this).addClass("active");
    else
      $(this).removeClass("active");
  });

  $(".options_li").click(function() {
    if ($('#options_div').css('display') == 'none') {
      $('#options_div').slideDown();
      $('#icon_desc_div').slideUp();
      $("#subtitles .options_li span").css("-moz-transform", "rotate(90deg)");
      $("#subtitles .options_li span").css("-webkit-transform", "rotate(90deg)");

      var actions = ['oneicon', 'showall', 'custom', 'noicons'];
      actions.forEach(function(action) {
        loadActions(action);
      });

    } else {
      $('#options_div').slideUp();
      $("#subtitles .options_li span").css("-moz-transform", "rotate(0)");
      $("#subtitles .options_li span").css("-webkit-transform", "rotate(0)");
    }
  });
};

function loadActions(action) {
  $('#options_div').find('.' + action).unbind('click').click(function(event) {
    // console.log("Changed to: ", action);
    self.port.emit('set_options', {
      sender: event.target.toString(),
      showOption: action
    });
  });
};

function wordwrap(str, width, brk, cut) {
  if (!str) return str;

  brk = brk || '\n';
  width = width || 75;
  cut = cut || false;

  var regex = '.{1,' + width + '}(\\s|$)' + (cut ? '|.{' + width + '}|.+$' : '|\\S+?(\\s|$)');
  return str.match(RegExp(regex, 'g')).join(brk);
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
  parseUrl.newHost = parseUrl.host.slice(domainName_i);

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

String.prototype.piFormat = function() {
  var s = this, i = arguments.length;
  while (i--) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  }
  return s;
};