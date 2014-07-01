"use strict";

var localStorage= {};
var resourcePath = "";
var ICONS = {};

var defaultHtml = "";
defaultHtml += '<li>';
defaultHtml += '  <div>';
defaultHtml += '    <input type="checkbox" id="{0}" /><label for="{0}"></label>';
defaultHtml += '    <img width="15px" height="15px" src="{1}" /> ';
defaultHtml += '    <span class="title">{2}</span>';
defaultHtml += '  </div>';
defaultHtml += '  <div class="icon_desc" style="clear:both" >{3}</div>';
defaultHtml += '</li>';

self.port.on("init_custom", function(storage, resource, icons) {
  localStorage = JSON.parse(JSON.stringify(storage));
  resourcePath = resource;
  ICONS = icons;

  initialize();
});

function setLocalStorage(key, value) {
  self.port.emit("setLocalStorage", key, value);
  localStorage[key] = value;
};

function initialize() {
  loadCustomOptions();
  loadUserCustomOptions();
  $('#save').click(save);
};

function loadUserCustomOptions() {
  var custom = localStorage['custom_filters'].split(' ');
  for (var c in custom) {
    $('#'+custom[c]).prop('checked', true);
  }
};

function loadCustomOptions() {
  var ul = $('.dropdown ul');
  ul.append(formatNameDesc('ExpectedUser'));
  ul.append(formatNameDesc('ExpectedCollection'));
  ul.append(formatNameDesc('PreciseLocationData'));
  ul.append(formatNameDesc('DataRetention'));
  ul.append(formatNameDesc('ChildrenPrivacyBadge'));
  ul.append(formatNameDesc('DoNotTrackBadge'));
  ul.append(formatNameDesc('SSLSupport'));
  ul.append(formatNameDesc('HeartbleedVulnerable'));
  ul.append(formatNameDesc('TrusteBadge'));

  $(".dropdown li").on("click", function(){
    var checkbox = $(this).find("input[type=checkbox]");

    if(checkbox.prop("checked")) {
      checkbox.prop("checked",false)
    } else {
      checkbox.prop("checked",true)
    }
  })

  $('.dropdown li input').on("click", function(event){
    event.preventDefault();
    event.stopPropagation();
  })
};

function save() {
  var selected = [];
  $('input:checked').each(function() {
      selected.push($(this).attr('id'));
  });
  localStorage['custom_filters'] = selected.join(' ');
  
  // sendMessage to change filter in page
  setLocalStorage('custom_filters', localStorage['custom_filters']);
  self.port.emit("close_custom");
};

function formatNameDesc(name) {
  var bgIcon = ICONS[name];
  var image = resourcePath + (bgIcon.image + "white.png");
  var html = defaultHtml.format(
    name,
    image,
    bgIcon.name,
    bgIcon.title
  );

  return html;
};

String.prototype.format = String.prototype.f = function() {
  var s = this, i = arguments.length;
  while (i--) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  }
  return s;
};