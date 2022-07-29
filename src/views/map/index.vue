<template>
  <div class="map-container">
    <div id="map-main" />
    <div class="map-controls-wrap">
      <div class="map-controls">
        <div class="map-control zoombuttons">
          <button class="zoom-in"></button>
          <button class="zoom-out">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from 'vue'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
})

const {proxy} = getCurrentInstance()

const iconSelectRef = ref(null)

const mapObj = reactive({
  map: undefined,
  lat: undefined,
  lng: undefined,
  tileLayer: undefined,
  drawLayer: undefined,
})

function initMap() {

  const layer = L.tileLayer('https://t{s}.tianditu.gov.cn/ibo_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ibo&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})

  const layer1_1 = L.tileLayer('https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layer1_2 = L.tileLayer('https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layerGroup1 = L.layerGroup([layer1_1, layer1_2, layer])

  const layer2_1 = L.tileLayer('https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layer2_2 = L.tileLayer('https://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layerGroup2 = L.layerGroup([layer2_1, layer2_2, layer])


  const layer3_1 = L.tileLayer('https://t{s}.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layer3_2 = L.tileLayer('https://t{s}.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layerGroup3 = L.layerGroup([layer3_1, layer3_2, layer])

  const baseLayers = {
    '矢量': layerGroup1,
    '影像': layerGroup2,
    '地形': layerGroup3,
  }

  // mapObj.
  const map = L.map('map-main', {
    center: [30.621833394767293, 104.06472467339864],
    zoom: 10,
    maxZoom: 16,
    minZoom: 5,
    zoomControl: false,
    attributionControl: false,
    layers: [layerGroup1],
  })

  const layerControl = L.control.layers(baseLayers).addTo(map)

  map.on('click', (e) => {
    mapObj.lat = e.latlng.lat
    mapObj.lng = e.latlng.lng
  })

  map.addControl(L.control.scale({imperial: false}))

  map.locate({
    setVies: true
  })
  map.on('locationfound', e => {
    console.log("locationfound", e.latlng);
    L.marker(e.latlng).addTo(map).bindPopup("你就在这个圈内")
  })

  map.on('locationerror', e => {
    console.log("locationerror --> ", e);
  })

  // map.pm.setLang('zh')
  // map.pm.addControls({
  //   position: 'topleft',
  // })


  // map.on('pm:create', (e) => {
  //   setDrawData(e)
  //   // 绘制后禁用绘制
  //   map.pm.disableDraw()
  // })

  mapObj.map = map
}

function setDrawData(e) {
  mapObj.drawLayer = e
}

/** 清除所有绘制 */
function clearDraw() {
  mapObj.map.pm.getGeomanDrawLayers().forEach(e => {
    if (mapObj.map.hasLayer(e)) mapObj.map.removeLayer(e);
  })
}

function getIconUrl(icon) {
  return new URL(`../../assets/icons/svg/${icon}.svg`, import.meta.url).href
}

const onCancel = () => {
  if (mapObj.drawLayer
      && mapObj.map.hasLayer(mapObj.drawLayer.layer)) {
    mapObj.map.removeLayer(mapObj.drawLayer.layer)
    mapObj.drawLayer = undefined
  }
}

onMounted(() => {
  initMap()
})
</script>

<style scoped>
</style>
