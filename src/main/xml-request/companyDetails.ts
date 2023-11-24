import { tallyRequest } from '../utils'
import { Company, ICompanyDetails } from '../types'

const bodyContent = `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>AllActiveCompanies</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:xml</SVEXPORTFORMAT>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="AllActiveCompanies" ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No">
            <TYPE>Company</TYPE>
            <NATIVEMETHOD>Name, GUID, LastVoucherDate, BooksFrom, LastVoucherAlterID, Destination</NATIVEMETHOD>
          
            </COLLECTION>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>`

export async function companyDetails(url: string): Promise<Company[] | null> {
  const { data, error } = await tallyRequest({
    url,
    method: 'POST',
    bodyContent
  })

  if (error) {
    return null
  }
  return (data as ICompanyDetails).ENVELOPE.BODY.DATA.COLLECTION.COMPANY
}
