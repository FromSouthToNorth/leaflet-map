<template>
  <div id="map-container">
  </div>
  <div @click="clearDraw" class="button-clear-draw" title="清除所以绘制">
    <a class="btn-clear-draw" href="#">
      <svg-icon icon-class="delete" color="#434343" />
    </a>
  </div>
  <div class="map-info">
    <p v-if="mapObj.lng && mapObj.lat">{{ mapObj.lat }}, {{ mapObj.lng }}</p>
  </div>
</template>

<script setup>
import {onMounted, reactive} from 'vue'

const mapObj = reactive({
  map: undefined,
  lat: undefined,
  lng: undefined,
  tileLayer: undefined,
})

function initMap() {
  mapObj.map = L.map('map-container', {
    zoom: 10,
    minZoom: 4,
    center: [30.621833394767293, 104.06472467339864],
    onWrap: true,
    attributionControl: false,
  }).setView([30.621833394767293, 104.06472467339864], 9)

  mapObj.map.on('click', (e) => {
    mapObj.lat = e.latlng.lat
    mapObj.lng = e.latlng.lng
  })

  mapObj.map.pm.setLang('zh')
  mapObj.map.pm.addControls({
    position: 'topleft',
  })

  mapObj.map.addControl(L.control.scale({ imperial: false }))

  mapObj.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapObj.map);

  mapObj.map.on('pm:create', (e) => {
    // 绘制后禁用绘制
    mapObj.map.pm.disableDraw()
  });
}

/** 清除所有绘制 */
function clearDraw() {
  mapObj.map.pm.getGeomanDrawLayers().forEach(e => {
    if (mapObj.map.hasLayer(e)) mapObj.map.removeLayer(e);
  })
}

onMounted(() => {
  initMap()
})
</script>

<style scoped>
#map-container {
  width: 100vw;
  height: 100vh;
}

.map-info {
  z-index: 999;
  position: absolute;
  bottom: 6px;
  right: 6px;
  padding: 6px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 5px;
  color: #fff;
  font-size: 8px;
}

.button-clear-draw {
  z-index: 999;
  position: absolute;
  width: 30px;
  height: 30px;
  display: inline-block;
  left: 0;
  top: 464px;
  margin: 10px 0 0 10px;
  border-radius: 2px;
  border: 2px solid rgba(0,0,0, 0.2);
  text-align: center;
  line-height: 30px;
  background: #fff;
}

.btn {
  display: inline-block;
  width: 100%;
  height: 100%;
}
</style>
