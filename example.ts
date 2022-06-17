import * as L from 'leaflet';
import { LeafletMouseEvent } from 'leaflet';
import { FeatureCollection, LineString } from 'geojson';
import glify from './src/index';

const map = L.map('map')
  .setView([50.00, 14.44], 7);

L.tileLayer('http://{s}.sm.mapstack.stamen.com/(toner-background,$fff[difference],$fff[@23],$fff[hsl-saturation@20],toner-lines[destination-in])/{z}/{x}/{y}.png')
  .addTo(map);

Promise.all([
  wget<FeatureCollection<Point>>('data/lampujalankab.js'),
  wget<FeatureCollection<Point>>('data/lampujalankota.js'),
  wget<FeatureCollection<Point>>('data/kwh.js'),
  wget<FeatureCollection<Point>>('data/titiklampurencanaapbd2021.js'),
  wget<FeatureCollection<LineString>>('data/ruaskab.js'),
  wget<FeatureCollection<LineString>>('data/ruaskota.js')
])
  .then(([lampukab, lampukota, app, lampurencana, ruaskab, ruaskota]) => {
    glify.lines({
      map,
      latitudeKey: 1,
      longitudeKey: 0,
      weight: 2,
      click: (e: LeafletMouseEvent, feature) => {
        L.popup()
          .setLatLng(e.latlng)
          .setContent(`clicked on Line ${feature.properties.ruas}`)
          .openOn(map);

        console.log('clicked on Line', feature, e);
      },
      hover: (e: LeafletMouseEvent, feature) => {
        console.log('hovered on Line', feature, e);
      },
      hoverOff: (e: LeafletMouseEvent, feature) => {
        console.log('hovered off Line', feature, e);
      },
      data: ruaskab
    });

    glify.points({
      map: map,
      size: function(i) {
        return (Math.random() * 17) + 3;
      },
      hover: (e: LeafletMouseEvent, feature) => {
        console.log('hovered on Point', feature, e);
      },
      click: (e: LeafletMouseEvent, feature) => {
        //set up a standalone popup (use a popup as a layer)
        L.popup()
          .setLatLng(feature)
          .setContent(`You clicked the point at longitude:${ e.latlng.lng }, latitude:${ e.latlng.lat }`)
          .openOn(map);

        console.log('clicked on Point', feature, e);
      },
      data: lampukab
    });
  });

function wget<T>(url: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = () => {
      if (request.status < 200 && request.status > 400) {
        return reject(new Error('failure'));
      }
      resolve(JSON.parse(request.responseText) as T);
    };
    request.send();
  });
}
