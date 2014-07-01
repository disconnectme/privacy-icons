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
const HOUR_MS = 60 * 60 * 1000;
const TRUSTE_URL = 'https://icons.disconnect.me/truste/check';
const HEARTBLEED_URL = 'https://icons.disconnect.me/bleed/check';
const SSLSUPPORT_URL = 'https://icons.disconnect.me/ssl/check';
const HITS_URL = 'https://hits.disconnect.me';
const WELCOME_URL = 'https://disconnect.me/icons/welcome';

var self = require("sdk/self");
var {Cc, Ci, Cu, Cm, Cr, components} = require("chrome");
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var timer = require("sdk/timers");
var localStorage = require("sdk/simple-storage").storage;
var Request = require("sdk/request").Request;
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

var workers = [];
var ICONS, TLDs;
var get_user_id = function() { return localStorage['pi_user_id'] };

exports.getWorkers = function() { return workers; };
exports.initialize = function(options, icons, tlds) {
  ICONS = icons;
  TLDs = tlds;

  init_variables(options);
  load_events();

  reportUsage();
  timer.setInterval(reportUsage, HOUR_MS);
};

function init_variables(options) {
  var firstInstall = (options.loadReason=="install");
  if (firstInstall) {
    localStorage['pi_new_install'] = "false";

    localStorage['build_version'] = self.version;
    localStorage['pi_group'] = "disconnect";
    localStorage['pi_product'] = "privacyicons";
    localStorage['pi_user_id'] = "0";
    localStorage['turn_all_on'] = "true";
    localStorage['showOption'] = "oneicon";
    localStorage['custom_filters'] = "ExpectedUser ExpectedCollection PreciseLocationData DataRetention ChildrenPrivacyBadge DoNotTrackBadge SSLSupport HeartbleedVulnerable TrusteBadge";
    localStorage['search_total'] = 0;

    tabs.open(WELCOME_URL);
    // tabs.open('about:config');
  }
  return firstInstall;
};

function load_events() {
  pageMod.PageMod({
    include: [/.*www\.google.*/],
    contentScriptWhen: "ready",
    contentStyleFile: [
      self.data.url("stylesheets/google_serp.css"),
      self.data.url("stylesheets/vendor/tipped/tipped.css")
    ],
    contentScriptFile: [
      self.data.url("scripts/vendor/jquery/jquery.js"),
      self.data.url("scripts/vendor/tipped/tipped.js"),
      self.data.url("scripts/google_serp.js")
    ],

    onAttach: function(worker) {
      // Add new worker to the list
      workers.push(worker);
      worker.on('detach', function () {
        // Remove no longer active worker from the list
        var index = workers.indexOf(worker);
        if (index >= 0)
          workers.splice(index, 1);
      });

      // initialize
      worker.port.emit('pi_initialize', {
        icons: ICONS,
        tlds: TLDs,
        resources: self.data.url(""),
        byPopup: false,
        turnAllOn: localStorage['turn_all_on'],
        showOption: localStorage['showOption'],
        customFilters: localStorage['custom_filters']
      });

      worker.port.on('request_from_serp', function(data) {
        //console.log("Listenner: request_from_serp");
        serverRequestV2(data, worker);
      });

      worker.port.on('google-instant', function(data) {
        //console.log("Listenner: google-instant");
        worker.port.emit('google_instant_callback', {
          turnAllOn: localStorage['turn_all_on'],
          showOption: localStorage['showOption'],
          customFilters: localStorage['custom_filters']
        });
      });

      worker.port.on('set_options', function(data) {
        //console.log("Listenner: set_options");

        if (data.showOption) localStorage['showOption']  = data.showOption;
        if (data.customFilters) localStorage['custom_filters'] = data.customFilters;
        if (data.turnAllOn)  localStorage['turn_all_on'] = data.turnAllOn;
        
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
};

function serverRequestV2(request, worker) {
  //console.log("serverRequestV2");

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
  header.urls = request.url

  Request({
    url: url,
    content: JSON.stringify(header),
    contentType: "application/json; charset=utf-8", 
    onComplete: function (response) {
      worker.port.emit("response_from_serp", {
        request: header,
        response: response.json.response,
        type: request.type,
        turnAllOn: localStorage['turn_all_on'],
        showOption: localStorage['showOption'],
        customFilters: localStorage['custom_filters']
      });
    }
  }).post();
};

function deserialize(object) {
  return (typeof object == 'string') ? JSON.parse(object) : object;
};

function getMostRecentWindow() {
  return mediator.getMostRecentWindow('navigator:browser');
};

function reportUsage() {
  const oneDayAsMsec = 24 * HOUR_MS;

  var now = new Date();
  var firstPing   = new Date(localStorage.pi_first_ping || now.getTime());
  var firstUpdate = (firstPing.getTime() == now.getTime());

  var dailyPing      = new Date(localStorage.pi_daily_ping || now.getTime());
  var weeklyPing     = new Date(localStorage.pi_weekly_ping || now.getTime());
  var monthlyPing    = new Date(localStorage.pi_monthly_ping || now.getTime());
  var quarterlyPing  = new Date(localStorage.pi_quarterly_ping || now.getTime());
  var semiannualPing = new Date(localStorage.pi_semiannual_ping || now.getTime());
  var yearlyPing     = new Date(localStorage.pi_yearly_ping || now.getTime());

  var daily      = ((now.getTime() - dailyPing.getTime()) >= oneDayAsMsec);
  var weekly     = ((now.getTime() - weeklyPing.getTime()) >= 7*oneDayAsMsec);
  var monthly    = ((now.getTime() - monthlyPing.getTime()) >= 30*oneDayAsMsec);
  var quarterly  = ((now.getTime() - quarterlyPing.getTime()) >= 90*oneDayAsMsec);
  var semiannual = ((now.getTime() - semiannualPing.getTime()) >= 180*oneDayAsMsec);
  var yearly     = ((now.getTime() - yearlyPing.getTime()) >= 365*oneDayAsMsec);
  var searches_total = localStorage.search_total || 0;

  //yearly|semiannual|quarterly|monthly|weekly|daily
  var report_update_type;
  if      (yearly)     report_update_type = 0x20 | 0x10 | 0x08 | 0x04 | 0x01;
  else if (semiannual) report_update_type = 0x10 | 0x08 | 0x04 | 0x01;
  else if (quarterly)  report_update_type = 0x08 | 0x04 | 0x01;
  else if (monthly)    report_update_type = 0x04 | 0x01;
  else if (weekly)     report_update_type = 0x02 | 0x01;
  else if (daily)      report_update_type = 0x01;
  else                 report_update_type = 0x00; 

  var data = {
    conn: HITS_URL,
    password: 'dirthavepure',
    time: new Date().toUTCString(),
    path: '/partnership_analytics.json?',
    ua: getMostRecentWindow().navigator.userAgent,
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

  Request({
    url: data.conn,
    content: data,
    onComplete: function (response) {
      if (firstUpdate)               localStorage.pi_first_ping      = now.getTime();
      if (daily || firstUpdate)      localStorage.pi_daily_ping      = now.getTime();
      if (weekly || firstUpdate)     localStorage.pi_weekly_ping     = now.getTime();
      if (monthly || firstUpdate)    localStorage.pi_monthly_ping    = now.getTime();
      if (quarterly || firstUpdate)  localStorage.pi_quarterly_ping  = now.getTime();
      if (semiannual || firstUpdate) localStorage.pi_semiannual_ping = now.getTime();
      if (yearly || firstUpdate)     localStorage.pi_yearly_ping     = now.getTime();

      localStorage.search_total = parseInt(localStorage.search_total) - searches_total;
    }
  }).post();
};