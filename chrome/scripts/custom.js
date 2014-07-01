window.onload = function() {
  const BG = chrome.extension.getBackgroundPage();

  var defaultHtml = "";
  defaultHtml += '<li>';
  defaultHtml += '  <div>';
  defaultHtml += '    <input type="checkbox" id="{0}" /><label for="{0}"></label>';
  defaultHtml += '    <img width="15px" height="15px" src="{1}" /> ';
  defaultHtml += '    <span class="title">{2}</span>';
  defaultHtml += '  </div>';
  defaultHtml += '  <div class="icon_desc" style="clear:both" >{3}</div>';
  defaultHtml += '</li>';
  
  initialize();

  function initialize() {
    loadCustomOptions();
    loadUserCustomOptions();
    $('#save').click(save);
  };
  
  function loadUserCustomOptions() {
    var custons = BG.localStorage['custom_filters'].split(' ');
    for (c in custons) {
      $('#'+custons[c]).prop('checked', true);
    }
  };

  function save() {
    var selected = [];
    $('input:checked').each(function() {
        selected.push($(this).attr('id'));
    });
    BG.localStorage['custom_filters'] = selected.join(' ');
    
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
      window.close();
    });
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

    $('.dropdown li input').on("click", function(){
      event.preventDefault();
      event.stopPropagation();
    })
  };
  
  function formatNameDesc(name) {
    var bgIcon = BG.ICONS[name];
    var image = chrome.extension.getURL(bgIcon.image + "white.png");
    var html = defaultHtml.format(
      name,
      image,
      bgIcon.name,
      bgIcon.title
    );

    return html;
  };
};

String.prototype.format = String.prototype.f = function() {
  var s = this, i = arguments.length;
  while (i--) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  }
  return s;
};