import "./style.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import { Fill, Stroke, Style } from "ol/style";
import { Vector as VectorSource } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import GeoJSON from "ol/format/GeoJSON";
import { Template } from "./src/Template";


proj4.defs("EPSG:32638", "+proj=utm +zone=38 +datum=WGS84 +units=m +no_defs");
register(proj4);

const geoServerUrl = "http://localhost:8080/geoserver/Georeference/wfs";
const workspace = "	sketchup";

const LayerGeoJson = (ExName, src) =>`${geoServerUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=${workspace}%3A${ExName}&outputFormat=application%2Fjson&srsName=EPSG:${src}`;


function createPattern() {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 8;
  const context = canvas.getContext("2d");
  context.strokeStyle = "#422006";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(canvas.width, canvas.height);
  context.stroke();

  return context.createPattern(canvas, "repeat");
}

const Polygon_default = new Style({
  stroke: new Stroke({
    color: "blue",
    width: 1.5,
  }),
});
const Polygon_Liners = new Style({
  stroke: new Stroke({
    color: "black",
    width: 1.5,
  }),
  fill: new Fill({
    color: createPattern(),
  }),
});

const BasicLayerArray = [
  new VectorLayer({
    source: new VectorSource({
      url: LayerGeoJson("nakveti", 32638),
      format: new GeoJSON(),
    }),
    style: Polygon_default,
    name: "Nakveti",
  }),
  new VectorLayer({
    source: new VectorSource({
      url: LayerGeoJson("shenoba", 32638),
      format: new GeoJSON(),
    }),
    style: Polygon_Liners,
    name: "Shenoba",
  }),
];

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
BasicLayerArray.forEach((layer) => {
  const template = new Template(map, layer, "sidebar");
  template.addLayer();
  template.init();
});
