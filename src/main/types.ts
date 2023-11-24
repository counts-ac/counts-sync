export interface Company {
  LASTVOUCHERDATE: number
  BOOKSFROM: number
  NAME: string
  GUID: string
  LASTVOUCHERALTERID: number
  DESTINATION: string
}

interface Collection {
  COMPANY: Company[]
}

interface Data {
  COLLECTION: Collection
}

interface Body {
  DATA: Data
}

interface Envelope {
  BODY: Body
}

export interface ICompanyDetails {
  ENVELOPE: Envelope
}
