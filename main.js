import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import {LayerTemplate} from './src/LayerTemplate.class';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';



const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

const layers = [
  new VectorLayer({
    source: new VectorSource({
      format: new GeoJSON(),
      url: 'http://localhost:8080/geoserver/tiger/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=tiger:poly_landmarks&maxFeatures=50&outputFormat=application/json',
    }),
    name: 'wfsLayer',
  }),
  new VectorLayer({
    source: new VectorSource({
      format: new GeoJSON(),
      url: 'http://localhost:8080/geoserver/tiger/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=tiger%3Atiger_roads&maxFeatures=50&outputFormat=application%2Fjson',
    }),
    name: 'wfsLayer2',
  })
];






const root = document.getElementById('root');
layers.forEach(layer => {
  const layerTemplate = new LayerTemplate(map, layer, root);
  layerTemplate.createLayer();
})


