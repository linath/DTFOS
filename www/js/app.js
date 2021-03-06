// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

define(function (require) {
    // Receipt verification (https://github.com/mozilla/receiptverifier)
    require('receiptverifier');

    // Installation button
    require('./install-button');

    // Install the layouts
    require('layouts/layouts');

    // Require webl10n
    require('l10n');

    // Require proj4js
    require('proj4js');

    // Write your app here.

    Proj4js.defs["EPSG:32632"] = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";

    var source = new Proj4js.Proj("EPSG:4326");    //source coordinates will be in Longitude/Latitude
    var dest = new Proj4js.Proj('EPSG:32632');     //destination coordinates in UTM ZONE 32

    document.webL10n.setLanguage(navigator.language);

    // List view

    var list = $('.stationlist').get(0);
    list.nextView = '.departurelist';

    list.renderRow = function (item) {

        $(this).html(item.get('stationname') + ' <span class="rightinfo">'+ item.get('distance') + 'm</span>');

    };

    // Daten abfragen
    navigator.geolocation.getCurrentPosition(function (position) {

        console.log('got position', position);

        var p = new Proj4js.Point(position.coords.longitude, position.coords.latitude);
        Proj4js.transform(source, dest, p);
        p.x = p.x.toFixed();
        p.y = p.y.toFixed();

        $.getJSON('http://terachat.de:8080/efa/coordinate?' + $.param({'x': p.x, 'y': p.y, 'radius': 3000}), function (data) {
            //console.log('got data', data);
            var stations = data.response.stations;
            _.each(stations, function (station) {
                //console.log(station.name,station.id);
                list.add({
                    title: station.name,
                    stationname: station.name,
                    distance: station.distance,
                    stationid: station.id
                });

            })
        });
    }, function (error) {
        console.log('error on getting position:', error.code, error.message);

    }, { enableHighAccuracy: true});

    var departurelist = $('.departurelist').get(0);

    departurelist.renderRow = function(item) {
        //console.log('departurelist renderRow', item);
        $(this).html('<div class="tostation"></div>' +
            '<div class="rightinfo"><div class="mean"></div>' +
            '<div class="countdown"></div></div>');
        $('.tostation', this).html(item.get('to').station.direction);
        $('.mean', this).html(item.get('line').train.name + ' ' + item.get('line').number);
        $('.countdown', this).text('in ' + item.get('datetime').countdown + 'min');
    };

    var currentStation;
    var getAndDisplayDeparture = function(){
        departurelist.clear();

        $.getJSON('http://terachat.de:8080/efa/departures?' + $.param({'station': currentStation.stationid, 'time': new Date().getTime()}), function (data) {

            var departures = data.response.departures;
            _.each(departures, function (departure) {

                departurelist.add(departure);
            })
        });
    };

    departurelist.onOpen = function (item) {
        currentStation = item.model.attributes;
        getAndDisplayDeparture();


    };



    $('button.refresh', departurelist).click(function() {
        console.log('bla');
        getAndDisplayDeparture();
    });

    // Liste einfügen

    /*list.add({ title: 'Learn this template',
     desc: 'This is a list-detail template. Learn more ' +
     'about it at its ' +
     '<a href="https://github.com/mozilla/mortar-list-detail">project page!</a>',
     date: new Date() });
     list.add({ title: 'Make things',
     desc: 'Make this look like that',
     date: new Date(12, 9, 5) });
     for (var i = 0; i < 8; i++) {
     list.add({ title: 'Move stuff',
     desc: 'Move this over there',
     date: new Date(12, 10, 1) });
     }*/

    /*// Detail view

     var detail = $('.detail').get(0);
     detail.render = function(item) {
     $('.title', this).html(item.get('title'));
     $('.desc', this).html(item.get('desc'));
     $('.date', this).text(formatDate(item.get('date')));
     };

     // Edit view

     var edit = $('.edit').get(0);
     edit.render = function(item) {
     item = item || { id: '', get: function() { return ''; } };

     $('input[name=id]', this).val(item.id);
     $('input[name=title]', this).val(item.get('title'));
     $('input[name=desc]', this).val(item.get('desc'));
     };

     edit.getTitle = function() {
     var model = this.view.model;

     if(model) {
     return model.get('title');
     }
     else {
     return 'New';
     }
     };*/

    /*$('button.add', edit).click(function() {
     var el = $(edit);
     var title = el.find('input[name=title]');
     var desc = el.find('input[name=desc]');
     var model = edit.model;

     if(model) {
     model.set({ title: title.val(), desc: desc.val() });
     }
     else {
     list.add({ title: title.val(),
     desc: desc.val(),
     date: new Date() });
     }

     edit.close();
     });*/
});