import { dialog, net } from 'electron'
import { parseString } from 'xml2js'
import { TALLY_URL } from '../constants'
import { TallyRequestParams } from '../types'

export function parseXml(xml: string) {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

export async function tallyRequest({ url = TALLY_URL, method, bodyContent }: TallyRequestParams) {
  try {
    const response = await net.fetch(url, {
      method,
      body: bodyContent,
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/xml'
      }
    })
    if (response.ok) {
      const xmlData = await response.text()
      const data = await parseXml(xmlData)
      return { data, error: null }
    }
    return { data: null, error: response.statusText }
  } catch (error) {
    dialog.showErrorBox('Tally Error : ', "Tally's server is not running")
    return { data: null, error }
  }
}
