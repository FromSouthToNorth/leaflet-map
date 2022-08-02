import request from '@/utils/request.js'

export function mapSearch(search, key) {
  return request({
    url: 'https://api.tianditu.gov.cn/v2/search?type=query&postStr=' + JSON.stringify(search) + '&tk=' + key,
    method: 'get',
  })
}
