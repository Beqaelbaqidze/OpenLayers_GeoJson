import Select from "ol/interaction/Select";
import Collection from "ol/Collection";

export class FeatureInteractions {
  constructor(map) {
    this.map = map;
  }

  SelectFeature(layerId, featureId) {
    const layer = this.map.getLayers().getArray().find((l) => l.get("customId") === layerId);

    if (!layer) {
      console.error(`Layer with ID ${layerId} not found.`);
      return;
    }

    const feature = layer.getSource().getFeatures().find((f) => f.ol_uid.toString() === featureId);

    if (!feature) {
      console.error(`Feature with ID ${featureId} not found.`);
      return;
    }

    const select = new Select({
      layers: [layer],
      features: new Collection([feature]),
    });

    this.map.addInteraction(select);
  }

  clearSelection() {
    this.map.getInteractions().forEach((interaction) => {
      if (interaction instanceof Select) {
        this.map.removeInteraction(interaction);
      }
    });
  }

  zoomToFeature(layerId, featureId) {
    const layer = this.map.getLayers().getArray().find((l) => l.get("customId") === layerId);

    if (!layer) {
      console.error(`Layer with ID ${layerId} not found.`);
      return;
    }

    const feature = layer.getSource().getFeatures().find((f) => f.ol_uid.toString() === featureId);

    if (!feature) {
      console.error(`Feature with ID ${featureId} not found.`);
      return;
    }

    const geometry = feature.getGeometry();
    this.map.getView().fit(geometry.getExtent(), { duration: 1000 });
  }

  selectLayerOnClick(layerId) {
    const layer = this.map.getLayers().getArray().find((l) => l.get("customId") === layerId);
  
    if (!layer) {
      console.error(`Layer with ID ${layerId} not found.`);
      return;
    }
  
    const select = new Select({
      layers: [layer],
    });
  
    select.on("select", (event) => {
      const selectedFeatures = event.selected;
      if (selectedFeatures.length > 0) {
        const feature = selectedFeatures[0];
        console.log(`Feature with ID ${feature.ol_uid} selected.`);
      }
    });
  
    this.map.addInteraction(select);
  }

layerVisibility(LayerId, trueOrFalse) {
    const layer = this.map.getLayers().getArray().find((l) => l.get("customId") === LayerId);
    if (!layer) {
      console.error(`Layer with ID ${LayerId} not found.`);
      return;
    }
    layer.setVisible(trueOrFalse);
  }
  


}