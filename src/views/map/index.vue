<template>
  <div class="map-container">
    <div id="map-main" />
    <div class="map-controls-wrap">
      <div class="map-controls">
        <div class="map-control zoombuttons">
          <button class="zoom-in" :class="zoomInDisabled ? 'disabled' : ''" @click="zoomIn" :disabled="zoomInDisabled">
            <svg-icon :iconClass="'zoom-in'" />
          </button>
          <button class="zoom-out" :class="zoomOutDisabled ? 'disabled' : ''" @click="zoomOut" :disabled="zoomOutDisabled">
            <svg-icon :iconClass="'zoom-out'" />
          </button>
        </div>
        <div class="map-control layers">
          <button @click="layersDrawer">
            <svg-icon :iconClass="'layers'" />
          </button>
        </div>
        <div class="map-control geolocate-control">
          <button :style="isLocation ? { background: 'rgba(47,84,235, 0.6)' } : {}" @click="getLocation">
            <svg-icon :iconClass="'location'" />
          </button>
        </div>
      </div>
    </div>
    <el-drawer custom-class="layer-select-drawer" :title="'图层选择'" v-model="drawer" :modal="false" :z-index="998">
      <h2 class="layer-select-title">地图</h2>
      <el-radio-group class="layer-group" v-model="baseLayer" @change="layerChange">
        <el-radio :key="key" v-for="key in layerKeys" :label="key">{{ key }}</el-radio>
      </el-radio-group>
    </el-drawer>
  </div>
</template>

<script setup>
import {getCurrentInstance, onMounted, reactive, toRefs, ref} from 'vue'
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
const iconSelectRef = ref({})
const map = reactive({})
const rMap = toRefs(map)
const lat = ref(0)
const lng = ref(0)
const zoomInDisabled = ref(false)
const zoomOutDisabled = ref(false)
const locationMarker = reactive({})
const rLocationMarker = toRefs(locationMarker)
const locationCircle = reactive({})
const rLocationCircle = toRefs(locationCircle)
const isLocation = ref(false)
const tileLayers = reactive({})
const baseLayers = toRefs(tileLayers)
const layerKeys = reactive([])
const drawer = ref(false)
const baseLayer = ref('')
const previousLayer = ref('')

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

  baseLayers.value = {
    '矢量': layerGroup1,
    '影像': layerGroup2,
    '地形': layerGroup3,
  }
  baseLayer.value = '矢量'
  previousLayer.value = '矢量'
  for (const key in baseLayers.value) {
    layerKeys.push(key)
  }

  const map = L.map('map-main', {
    center: [30.621833394767293, 104.06472467339864],
    zoom: 10,
    maxZoom: 16,
    minZoom: 5,
    zoomControl: false,
    attributionControl: false,
    layers: [layerGroup1],
  })

  map.on('click', (e) => {
    lat.value = e.latlng.lat
    lng.value = e.latlng.lng
  })

  map.addControl(L.control.scale({imperial: false}))

  map.on('locationerror', e => {
    console.log("locationerror --> ", e);
  })

  map.on('zoom', e => {
    eventMapZoom()
  })

  rMap.value = map

  getLocation()
}

function getLocation() {
  isLocation.value = !isLocation.value
  rMap.value.locate({
    setVies: true,
  })

  rMap.value.on('locationfound', e => {
    if (rLocationMarker.value &&  rMap.value.hasLayer(rLocationMarker.value)) {
      rMap.value.removeLayer(rLocationMarker.value)
    }
    if (rLocationCircle.value &&  rMap.value.hasLayer(rLocationCircle.value)) {
      rMap.value.removeLayer(rLocationCircle.value)
    }
    if (isLocation.value) {
      const { latlng } = e
      rMap.value.setView(latlng, 12)
      rLocationMarker.value = L.marker(latlng, {
        icon: L.divIcon({ className: 'location-marker'})
      }).addTo( rMap.value)
      rLocationCircle.value = L.circle(latlng, {
        color: 'transparent',
        fillColor: 'rgb(15, 128, 225)',
        fillOpacity: 0.2,
        radius: 6600
      }).addTo( rMap.value)
    }
  })
}

function eventMapZoom() {
  const zoom = rMap.value.getZoom()
  zoomInDisabled.value = zoom >= rMap.value.getMaxZoom()
  zoomOutDisabled.value = zoom <= rMap.value.getMinZoom()
}

function zoomIn() {
  rMap.value.zoomIn()
}

function zoomOut() {
  rMap.value.zoomOut()
}

function layersDrawer() {
  drawer.value = !drawer.value
}

function layerChange() {
  for (const key in baseLayers.value) {
    if (key === previousLayer.value) {
      rMap.value.removeLayer(baseLayers.value[key])
    }
  }
  previousLayer.value = baseLayer.value
  for (const key in baseLayers.value) {
    if (key === baseLayer.value) {
      rMap.value.addLayer(baseLayers.value[key])
    }
  }
}

function getIconUrl(icon) {
  return new URL(`../../assets/icons/svg/${icon}.svg`, import.meta.url).href
}

onMounted(() => {
  initMap()
})
</script>

<style scoped>
</style>
