import { FeatureInteractions } from "./domEvents";
export class Template {
    constructor(map, layer, rootElement) {
      this.map = map;
      this.layer = layer;
      this.rootElement = document.getElementById(rootElement);
      this.selectedRow = null;
      this.featureInteractions = new FeatureInteractions(this.map);
    }
    
    addLayer() {
      if (!this.map.getLayers().getArray().includes(this.layer)) {
        this.map.addLayer(this.layer);
        this.layer.set("customId", `layer-${this.layer.ol_uid}`);
      }
      this.createLayerControl(this.layer.get("customId"), this.layer.get("name"));
      
    }
  
    init() {
      this.rootElement.addEventListener("click", (event) => {
        const target = event.target;
  
        if (target.classList.contains("show-attributes")|| target.parentNode.classList.contains("show-attributes")) {
          const layerId = target.getAttribute("data-layer");
          this.showLayerAttributes(layerId);
        }
  
        if (target.id === "zoomToLayer") {
          const layerId = target.getAttribute("data-layer");
          this.zoomToLayer(layerId);
        }
        if(target.classList.contains("layer-control")){
          document.querySelectorAll(".layer-control").forEach((layerControl) => {
            layerControl.style.backgroundColor = "#f9f9f9";
            layerControl.classList.remove("selected");
          });
          target.style.backgroundColor = "#bbeff8";
          target.classList.add("selected");
        }
        if (target.type === "checkbox" && target.id.startsWith("layer-")) {
          const layerId = target.id;
          if(target.checked){
            this.featureInteractions.layerVisibility(layerId, true);
            
          }else{
            this.featureInteractions.layerVisibility(layerId, false);
          }
        }
  
      });
      document.addEventListener("click", (event) => {
        const target = event.target;
        this.rootElement.querySelectorAll(".layer-control").forEach((layerControl) => {
          this.featureInteractions.clearSelection();
         if(layerControl.classList.contains("selected")){
            this.featureInteractions.selectLayerOnClick(layerControl.querySelector("input").id);
          }
        });
      
      })
      document.addEventListener("contextmenu", (event) => {
        const target = event.target;
        this.rootElement.querySelectorAll(".layer-control").forEach((layerControl) => {
          this.featureInteractions.clearSelection();
         if(layerControl.classList.contains("selected")){
            this.featureInteractions.selectLayerOnClick(layerControl.querySelector("input").id);
          }
        });
      
      })
    }
  
    createLayerControl(layerId, layerName) {
      const layerControlHtml = `
        <div class="layer-control" style="display: flex; justify-content: space-between; align-items: center; margin: 5px 0;">
          <div>
            <input type="checkbox" id="${layerId}" checked />
            <label for="${layerId}">${layerName}</label>
          </div>
          <div>
            <button id="zoomToLayer" data-layer="${layerId}" title="Zoom to ${layerName}">
              <svg id="zoomToLayer" data-layer="${layerId}"  width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="7" stroke="black" stroke-width="2" />
                <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="black" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
            <button class="show-attributes" data-layer="${layerId}" title="Show Attributes of ${layerName}">
              📋
            </button>
          </div>
        </div>
      `;
      this.rootElement.innerHTML += layerControlHtml;
    }
  
    zoomToLayer(layerId) {
      const layer = this.map
        .getLayers()
        .getArray()
        .find((l) => l.get("customId") === layerId);
  
      if (!layer) {
        console.error(`Layer with ID ${layerId} not found.`);
        return;
      }
  
      const source = layer.getSource();
      source.once("change", () => {
        if (source.getState() === "ready") {
          this.map.getView().fit(source.getExtent(), { duration: 1000 });
        }
      });
  
      if (source.getState() === "ready") {
        this.map.getView().fit(source.getExtent(), { duration: 1000 });
      }
    }
  
    showLayerAttributes(layerId) {

      const layer = this.map
        .getLayers()
        .getArray()
        .find((l) => l.get("customId") === layerId);
  
      if (!layer) {
        console.error(`Layer with ID ${layerId} not found.`);
        return;
      }
  
      const features = layer.getSource().getFeatures();
  
      if (features.length === 0) {
        alert("No features available for this layer.");
        return;
      }
  
      const data = features.map((feature) => {
        const properties = feature.getProperties();
        return {
          ...properties,
          geometry: undefined, // Remove geometry field
          id: feature.ol_uid // Use feature ol_uid for ID
        };
      });
  
      const fields = [
        {
          name: "Actions",
          type: "control",
          width: 90,
          align: "center",
          itemTemplate: (value, item) => {
            const zoomButton = document.createElement("button");
            zoomButton.className = "zoom-btn";
            zoomButton.title = "Zoom to feature";
            zoomButton.setAttribute("data-feature", item.id);
            zoomButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="7" stroke="black" stroke-width="2" />
              <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="black" stroke-width="2" stroke-linecap="round" />
            </svg>`;
            zoomButton.onclick = () => {
              this.featureInteractions.zoomToFeature(layer.get("customId"), item.id);
              this.featureInteractions.clearSelection();
              this.featureInteractions.SelectFeature(layer.get("customId"), item.id);
              this.selectRowInGrid(item.id);
          };
            console.log(typeof +item.id);
            const attachButton = document.createElement("button");
            attachButton.className = "attach-btn";
            attachButton.setAttribute("data-feature", item.id);
            attachButton.title = "Attach feature";
            attachButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5h10l-5 5z" fill="black" />
            </svg>`;
            attachButton.onclick = () => {
              this.featureInteractions.zoomToFeature(layer.get("customId"), item.id);
              this.attachFeature(item.id);
              this.featureInteractions.clearSelection();
              this.featureInteractions.SelectFeature(layer.get("customId"), item.id);
              this.selectRowInGrid(item.id);
            };
  
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.gap = "5px";
            container.appendChild(zoomButton);
            container.appendChild(attachButton);
            return container;
          },
        },
        ...Object.keys(data[0])
          .filter((key) => key !== "geometry")
          .map((key) => ({
            name: key,
            type: "text",
            width: 150,
          })),
      ];
  
      $("#attributeGrid").jsGrid({
        width: "100%",
        height: "400px",
        inserting: false,
        editing: false,
        sorting: true,
        paging: true,
        filtering: true,
        selecting: true,
        data: data,
        fields: fields,
        rowClass: (item) => `feature-row-${item.id} featureRow`,
        controller: {
          loadData: function (filter) {
            return data.filter((item) => {
              return Object.keys(filter).every((key) => {
                return (
                  filter[key] === "" || // If filter is empty, match all rows
                  (item[key] &&
                    item[key]
                      .toString()
                      .toLowerCase()
                      .indexOf(filter[key].toString().toLowerCase()) !== -1)
                );
              });
            });
          },
        },
      });
  
      const gridContainer = document.getElementById("attributeGridContainer");
      if (gridContainer) {
        gridContainer.style.display = "block";
      } else {
        console.error('Element with id "attributeGridContainer" not found.');
      }
    }
  
    attachFeature(featureId) {
      console.log(`Attach action triggered for feature: ${featureId}`);
      // Add your logic here for the Attach functionality
    }
   
    selectRowInGrid(featureId) {
      const rows = document.querySelectorAll(".featureRow");
      const targetRow = document.querySelector(`.feature-row-${featureId}`);
      if (targetRow) {
        rows.forEach((row) => {
          if(row.classList.contains("highlight")){
            row.classList.remove("highlight")
          }
          else{
            targetRow.classList.add("highlight");
          }
      
        });
        
      }
    }
   
  }
  