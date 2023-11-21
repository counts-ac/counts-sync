import { parseString } from 'xml2js'

export function parseXml<T>(xml: string): Promise<T> {
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
