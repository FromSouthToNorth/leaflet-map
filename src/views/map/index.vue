<template>
  <div class="map-container">
    <div class="sidebar">
      <div tabindex="0" class="search_forms" @blur="suggestsList = []">
        <el-input
          @input="searchKeyWords"
          @clear="clear"
          v-model="input"
          size="large"
          clearable>
          <template #append>
            <el-button :loading="loading" :icon="Search"/>
          </template>
        </el-input>
        <el-scrollbar>
          <ul class="search-key-words">
            <li :key="index" v-for="(item, index) in suggestsList" @click="search(item.address + item.name)">
              <el-icon>
                <Search/>
              </el-icon>
              <span class="name">{{ item.name }}</span>
              <span class="address">{{ item.address }}</span></li>
          </ul>
        </el-scrollbar>
      </div>
    </div>
    <div class="sidebar-table" v-show="sidebarTable">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="Date" width="180"/>
        <el-table-column prop="name" label="Name" width="180"/>
        <el-table-column prop="address" label="Address"/>
      </el-table>
      <el-pagination layout="prev, pager, next" :total="total"/>
    </div>
    <div id="map-main">
      <div class="map-controls-wrap">
        <div class="map-controls">
          <div class="map-control zoombuttons">
            <button class="zoom-in" :class="zoomInDisabled ? 'disabled' : ''" @click="zoomIn"
                    :disabled="zoomInDisabled">
              <svg-icon :iconClass="'zoom-in'"/>
            </button>
            <button class="zoom-out" :class="zoomOutDisabled ? 'disabled' : ''" @click="zoomOut"
                    :disabled="zoomOutDisabled">
              <svg-icon :iconClass="'zoom-out'"/>
            </button>
          </div>
          <div class="map-control layers">
            <button @click="layersDrawer">
              <svg-icon :iconClass="'layers'"/>
            </button>
          </div>
          <div class="map-control geolocate-control">
            <button :style="isLocation ? { background: 'rgba(47,84,235, 0.6)' } : {}" @click="getLocation">
              <svg-icon :iconClass="'location'"/>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="layer-select-drawer" v-show="drawer" :class="drawer ? 'open' : ''">
      <div class="layer-heading">
        <h2>地图图层</h2>
        <el-icon @click="drawer=!drawer">
          <CloseBold/>
        </el-icon>
      </div>
      <div class="layer-select">
        <div class="layer-map-select-list">
          <h3 @click="layerMapSelectListOpen">
            <a href="#" role="button" title="展开">
              <el-icon v-if="layerMapSelectListIsOpen">
                <CaretTop/>
              </el-icon>
              <el-icon v-else>
                <CaretBottom/>
              </el-icon>
              <span>地图影像</span>
            </a>
          </h3>
          <el-radio-group class="layer-list layer-map-list" @change="layerChange" v-model="baseLayer"
                          v-show="layerMapSelectListIsOpen">
            <el-radio :key="index" v-for="(key, index) in layerKeys" :label="key" size="small">{{ key }}</el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {getCurrentInstance, onMounted, reactive, toRefs, ref} from 'vue'
import {Search} from '@element-plus/icons-vue'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import SvgIcon from '@/components/SvgIcon/index.vue'
import {mapSearch} from '@/api/mapSearch.js'
import {ResultType} from '@/enums/resultType.js'
import markerBlueUrl from '@/assets/img/marker-blue.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
})

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]

const {proxy} = getCurrentInstance()
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
const layerMapSelectListIsOpen = ref(false)
const input = ref('')
const str = reactive({})
const postStr = toRefs(str)
const mapKey = '21cb7300e83d3e5640326c7ccf25226e'
const loading = ref(false)
const suggestsList = ref([])
const markers = toRefs([])
const total = ref(1000)
const sidebarTable = ref(false)

const myIcon = L.Icon.extend({
  options: {
    iconSize:     [24, 26],
    iconAnchor:   [11, 24],
    popupAnchor:  [0, -20]
  }
})

const blueIcon = new myIcon({iconUrl: markerBlueUrl})

function initMap() {

  const layer1_1 = L.tileLayer('https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={key}', {
    key: mapKey,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
  })
  const layer1_2 = L.tileLayer('https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={key}', {
    key: mapKey,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
  })
  const layerGroup1 = L.layerGroup([layer1_1, layer1_2])

  const layer2_1 = L.tileLayer('https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={key}', {
    key: mapKey,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
  })
  const layer2_2 = L.tileLayer('https://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={key}', {
    key: mapKey,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
  })
  const layerGroup2 = L.layerGroup([layer2_1, layer2_2])


  const layer3_1 = L.tileLayer('https://t{s}.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={key}', {
    key: mapKey,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
  })
  const layer3_2 = L.tileLayer('https://t{s}.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={key}', {
    key: mapKey,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
  })
  const layer3_3 = L.tileLayer('https://t0.tianditu.gov.cn/shuishen_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=shuishen&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={key}', {
    key: mapKey,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
  })
  const layerGroup3 = L.layerGroup([layer3_1, layer3_2, layer3_3])

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
    center: [34.3227, 108.5525],
    zoom: 5,
    maxZoom: 18,
    minZoom: 3,
    zoomControl: false,
    attributionControl: false,
    layers: [layerGroup1],
  })

  map.on('click', (e) => {
    lat.value = e.latlng.lat
    lng.value = e.latlng.lng
  })

  map.addControl(L.control.scale({imperial: false}))

  map.on('zoom', e => {
    eventMapZoom()
  })

  rMap.value = map
}

function getLocation() {
  isLocation.value = !isLocation.value
  rMap.value.locate({
    setVies: true,
  })

  rMap.value.on('locationfound', e => {
    if (rLocationMarker.value && rMap.value.hasLayer(rLocationMarker.value)) {
      rMap.value.removeLayer(rLocationMarker.value)
    }
    if (rLocationCircle.value && rMap.value.hasLayer(rLocationCircle.value)) {
      rMap.value.removeLayer(rLocationCircle.value)
    }
    if (isLocation.value) {
      const {latlng} = e
      rMap.value.setView(latlng, 14)
      rLocationMarker.value = L.marker(latlng, {
        icon: L.divIcon({className: 'location-marker'})
      }).addTo(rMap.value)
      rLocationCircle.value = L.circle(latlng, {
        color: 'transparent',
        fillColor: 'rgb(15, 128, 225)',
        fillOpacity: 0.2,
        radius: 600
      }).addTo(rMap.value)
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

function layerMapSelectListOpen() {
  layerMapSelectListIsOpen.value = !layerMapSelectListIsOpen.value
}

function getIconUrl(icon) {
  return new URL(`../../assets/icons/svg/${icon}.svg`, import.meta.url).href
}

/** 关键词搜索 */
const searchKeyWords = () => {
  if (input.value) {
    loading.value = true
    const {_northEast, _southWest} = rMap.value.getBounds()
    const bounds = [_northEast.lng, _northEast.lat, _southWest.lng, _southWest.lat]
    const bound = bounds.join()
    postStr.value = {
      queryType: 4,
      start: 0,
      mapBound: bound,
      yingjiType: 0,
      level: rMap.value.getZoom(),
      keyWord: input.value,
      count: 10,
      sourceType: 0
    }
    mapSearch(postStr.value, mapKey).then(res => {
      const {suggestsKey, suggests} = res
      suggestsList.value = suggests
      loading.value = false
    })
  } else {
    suggestsList.value = []
  }
}

const search = (value) => {
  loading.value = true
  if (markers.value) {
    markers.value.forEach(e => {
      if (rMap.value.hasLayer(e)) {
        rMap.value.removeLayer(e)
      }
    })
  }
  markers.value = []
  if (!value) return
  const {_northEast, _southWest} = rMap.value.getBounds()
  const bounds = [_northEast.lng, _northEast.lat, _southWest.lng, _southWest.lat]
  const bound = bounds.join()
  postStr.value = {
    queryType: 7,
    start: 0,
    mapBound: bound,
    yingjiType: 0,
    level: rMap.value.getZoom(),
    keyWord: value,
    count: 100,
    sourceType: 0
  }
  mapSearch(postStr.value, mapKey).then(res => {
    loading.value = false
    const {resultType} = res
    switch (resultType) {
      case ResultType.pois:
        const {pois} = res
        for (let i = 0; i < pois.length; i++) {
          console.log(pois[i]);
          const {address, hotPointID, lonlat, name, phone} = pois[i]
          createMarker(lonlat, name, address)
        }
        console.log('普通');
        break
      case ResultType.statistics:
        console.log(res.statistics);
        const {priorityCitys, allAdmins} = res.statistics
        for (let i = 0; i < priorityCitys.length; i++) {
          console.log(priorityCitys[i])
          const {adminName, lonlat} = priorityCitys[i]
          createMarker(lonlat, adminName)
        }
        for (let i = 0; i < allAdmins.length; i++) {
          console.log(allAdmins[i])
          const {adminName, lonlat} = allAdmins[i]
          createMarker(lonlat, adminName)
        }
        console.log('统计');
        break
      case ResultType.area:
        console.log('行政区')
        break
      case ResultType.csws:
        console.log('普通建议词搜索')
        break
      case ResultType.lineResult:
        break
    }
  }).catch(e => {
    console.log(e);
  })
}

const createMarker = (lonlat, name, address) => {
  let latLng = lonlat.split(',')
  let center = [latLng[1], latLng[0]]
  let popupContent = `<h2>${name}</h2>`
  if (address) {
    popupContent += `<p><span>地址: </span>${address}</p>`
  }
  let marker = L.marker(center, { icon: blueIcon }).addTo(rMap.value).bindPopup(popupContent)
  markers.value.push(marker)
}

const clear = () => {
  loading.value = false
  if (markers.value) {
    markers.value.forEach(e => {
      if (rMap.value.hasLayer(e)) {
        rMap.value.removeLayer(e)
      }
    })
  }
}

onMounted(() => {
  initMap()
})
</script>

<style scoped>
</style>
