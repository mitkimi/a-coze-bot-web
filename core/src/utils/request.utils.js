import axios from 'axios'

export function request(
  url,
  params = {},
  method = 'get',
  headers = {}
) {
  return new Promise((resolve, reject) => {
    axios[method](
      encodeURI(url),
      method === 'get' ? { params, headers } : params,
      {
        headers
      })
      .then((response) => {
        resolve(response.data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
