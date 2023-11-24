import { dialog, net } from 'electron'
import { TallyRequestParams, TallyResponse } from '../types'
import { XMLParser } from 'fast-xml-parser'
import chokidar from 'chokidar'

function normalizeXmlString(xmlStr: string): string {
  return (
    xmlStr
      .replace(/&#(.+?);/g, (match: string, p1: string) => {
        const codePoint = p1.startsWith('x')
          ? Number.parseInt(p1.substring(1), 16)
          : Number.parseInt(p1)

        if (
          (codePoint >= 0x00 && codePoint <= 0x08) ||
          (codePoint >= 0x0b && codePoint <= 0x0c) ||
          (codePoint >= 0x0e && codePoint <= 0x1f) ||
          (codePoint >= 0xd800 && codePoint <= 0xdfff) ||
          (codePoint >= 0xfffe && codePoint <= 0xffff)
        ) {
          return ''
        } else {
          return match
        }
      })
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\ud800-\udfff\ufffe-\uffff]/g, () => {
        return ''
      })
  )
}

export async function tallyRequest({
  url,
  method,
  bodyContent
}: TallyRequestParams): Promise<TallyResponse> {
  try {
    const response = await net.fetch(url, {
      method,
      ...(bodyContent && { body: bodyContent }),
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/xml'
      }
    })
    if (response.ok) {
      const xmlStr = await response.text()
      const normalizedXmlString = normalizeXmlString(xmlStr)
      const parser = new XMLParser()
      const data = parser.parse(normalizedXmlString)
      return { data, error: null }
    }
    return { data: null, error: response.statusText }
  } catch (error) {
    dialog.showErrorBox('Tally Error : ', "Tally's server is not running")
    return { data: null, error }
  }
}

export function fileWatcher(
  filePath: string,
  callback: (file: string, type: string) => void
): void {
  // Initialize watcher.
  const watcher = chokidar.watch(filePath, {
    ignored: /(^|[/\\])\../,
    persistent: true
  })

  // Add event listeners.
  watcher
    .on('add', (path) => callback(path, 'add'))
    .on('change', (path) => callback(path, 'change'))
    .on('unlink', (path) => callback(path, 'unlink'))
}

export function debounce<F extends (...args: unknown[]) => unknown>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => func(...args), waitFor)
  }
}
