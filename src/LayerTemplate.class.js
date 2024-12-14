import Target from 'ol/events/Target';
import { Style, Fill, Stroke } from 'ol/style';

export class LayerTemplate {
  constructor(map, layer, root) {
    this.map = map;
    this.layer = layer;
    this.root = root;

    // Set default style
    this.currentStyle = layer.getStyle() || this.getDefaultStyle();
    this.layer.setStyle(this.currentStyle);
  }

  getDefaultStyle() {
    return new Style({
      fill: new Fill({ color: 'rgba(0, 0, 255, 0.5)' }),
      stroke: new Stroke({ color: 'blue', width: 2 }),
    });
  }

  createLayer() {
    this.addLayer();

    const layerId = `layer-${this.layer.ol_uid}`;
    this.root.innerHTML += this.template(layerId);

    // Delegate click events for better performance
    this.root.addEventListener('click', (event) => {
      const target = event.target;
      const layerId = target.getAttribute('data-id');

      if (target.classList.contains('visual')) {
        this.openStyleModal(this.findLayerById(layerId));
      } else if (target.classList.contains('remove')) {
        this.remove(this.findLayerById(layerId));
      } else if (target.classList.contains('zoom')) {
        this.zoomToLayer(this.findLayerById(layerId));
      }
    });
  }

  findLayerById(id) {
    if (!id) {
      console.warn('Invalid layer ID provided');
      return null;
    }
  
    const layer = this.map.getLayers().getArray().find((layer) => `layer-${layer.ol_uid}` === id);
  
    if (!layer) {
      console.warn(`Layer with ID ${id} not found`);
    }
  
    return layer;
  }
  

  addLayer() {
    this.map.addLayer(this.layer);

    // Update template when features are ready
    const source = this.layer.getSource();
    if (source) {
      source.once('change', () => {
        if (source.getState() === 'ready') {
          this.updateTemplate(this.layer);
        }
      });
    }
  }

  getGeometryType(layer = this.layer) {
    const features = layer?.getSource()?.getFeatures();
    return features?.[0]?.getGeometry()?.getType() || null;
  }

  template(layerId) {
    const geometryType = this.getGeometryType();
    const visual = this.createVisual(geometryType);

    return `
      <div id="${layerId}" class="layer">
        ${visual}
        <p>${this.layer.get('name') || 'Unnamed Layer'}</p>
        <button class="remove" data-id="${layerId}">Remove</button>
        <button class="zoom" data-id="${layerId}">Zoom</button>
      </div>
    `;
  }

  createVisual(geometryType) {
    if (this.isTitleSubscription()) {
      return `<span class="icon-title">📜</span>`;
    }
  
    let style = this.layer.getStyle();
  
    // Handle style as a function
    if (typeof style === 'function') {
      const dummyFeature = this.layer.getSource()?.getFeatures()?.[0] || null;
      style = dummyFeature ? style(dummyFeature) : null;
    }
  
    // Safely extract fill and stroke colors
    const fillColor = style?.getFill?.()?.getColor() || this.getDefaultFillColor();
    const strokeColor = style?.getStroke?.()?.getColor() || this.getDefaultStrokeColor();
  
    console.log('Geometry type:', geometryType);
    console.log('Derived Fill Color:', fillColor);
    console.log('Derived Stroke Color:', strokeColor);
  
    switch (geometryType) {
      case 'Polygon':
      case 'MultiPolygon':
        return `<div class="visual polygon" data-id="layer-${this.layer.ol_uid}" style="background: ${fillColor}; border: 2px solid ${strokeColor}; width: 12px; height: 12px; transform: skewX(-20deg);"></div>`;
      case 'LineString':
      case 'MultiLineString':
        return `<div class="visual line" data-id="layer-${this.layer.ol_uid}" style="border-top: 2px solid ${strokeColor}; width: 12px; height: 2px;"></div>`;
      case 'Point':
      case 'MultiPoint':
        return `<div class="visual point" data-id="layer-${this.layer.ol_uid}" style="background: ${strokeColor}; border-radius: 50%; width: 12px; height: 10px;"></div>`;
      default:
        return `<div class="visual unknown">?</div>`;
    }
  }
  

  getDefaultFillColor() {
    return 'rgba(0, 0, 255, 0.5)';
  }

  getDefaultStrokeColor() {
    return 'blue';
  }

  isTitleSubscription() {
    return this.layer.get('type') === 'title';
  }

  updateTemplate(layer = this.layer) {
    const layerId = `layer-${layer.ol_uid}`;
    const layerElement = this.root.querySelector(`#${layerId}`);
    if (layerElement) {
      const geometryType = this.getGeometryType(layer);
      const visual = this.createVisual(geometryType);

      const visualElement = layerElement.querySelector('.visual');
      if (visualElement) {
        visualElement.outerHTML = visual;
      }
    }
  }

  remove(TLayer) {
    if (!TLayer) {
      console.warn('Layer not found for removal');
      return;
    }
  
    // Remove the layer from the map
    this.map.removeLayer(TLayer);
  
    // Remove the corresponding DOM element
    const layerElement = this.root.querySelector(`#layer-${TLayer.ol_uid}`);
    if (layerElement) {
      layerElement.remove();
    } else {
      console.warn('Layer DOM element not found for removal');
    }
  }
  

  zoomToLayer(layer) {
    const source = layer.getSource();
    const fitView = () => this.map.getView().fit(source.getExtent(), { duration: 1000 });
    if (source.getState() === 'ready') {
      fitView();
    } else {
      source.once('change', fitView);
    }
  }

  openStyleModal(layer) {
    if (this.root.querySelector('.modal')) {
      console.warn('Modal is already open');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Edit Layer Style</h2>
        <label for="fill-color">Fill Color:</label>
        <input type="color" id="fill-color" value="#0000ff">
        <label for="stroke-color">Stroke Color:</label>
        <input type="color" id="stroke-color" value="#0000ff">
        <label for="stroke-width">Stroke Width:</label>
        <input type="number" id="stroke-width" value="2" min="1">
        <label for="fill-opacity">Fill Opacity:</label>
        <input type="number" id="fill-opacity" value="1" step="0.1" min="0" max="1">
        <button id="apply-style">Apply</button>
        <button id="close-modal">Close</button>
      </div>
    `;

    this.root.appendChild(modal);

    modal.querySelector('#apply-style').addEventListener('click', () => this.applyStyle(modal, layer));
    modal.querySelector('#close-modal').addEventListener('click', () => modal.remove());
  }

  applyStyle(modal, layer) {
    const fillColor = modal.querySelector('#fill-color').value;
    const strokeColor = modal.querySelector('#stroke-color').value;
    const strokeWidth = parseFloat(modal.querySelector('#stroke-width').value);
    const fillOpacity = parseFloat(modal.querySelector('#fill-opacity').value) || 1;

    const fillColorWithOpacity = this.hexToRgba(fillColor, fillOpacity);

    const newStyle = new Style({
      fill: new Fill({ color: fillColorWithOpacity }),
      stroke: new Stroke({ color: strokeColor, width: strokeWidth }),
    });

    layer.setStyle(newStyle);
    modal.remove();
    this.updateTemplate(layer);
  }

  hexToRgba(hex, opacity) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}
