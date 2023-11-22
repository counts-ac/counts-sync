import { tallyRequest } from '../utils'

const bodyContent = `<ENVELOPE>
    <HEADER>
<VERSION>1</VERSION>
<TALLYREQUEST>Export</TALLYREQUEST>
<TYPE>Collection</TYPE>
<ID>AllActiveCompanies</ID>
</HEADER>
<BODY>
    <DESC>
        <STATICVARIABLES>
    <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
</STATICVARIABLES>
<TDL>
    <TDLMESSAGE>
   <COLLECTION NAME="AllActiveCompanies" ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No">
    <Type>Company</Type>
    <NativeMethod>Name, GUID, LastVoucherDate, BooksFrom</NativeMethod>

   </COLLECTION>
</TDLMESSAGE>
</TDL>
</DESC>
</BODY>
</ENVELOPE>`

export async function companyDetails(url: string) {
  const { data, error } = await tallyRequest({
    url,
    method: 'POST',
    bodyContent
  })

  if (error) {
    return null
  }

  return data?.ENVELOPE?.BODY[0]?.DATA[0]?.COLLECTION?.map((item) => ({
    name: item?.COMPANY[0]?.NAME[0]?._,
    booksfrom: item?.COMPANY[0]?.BOOKSFROM[0]?._,
    guid: item?.COMPANY[0]?.GUID[0]?._,
    lastvoucherdate: item?.COMPANY[0]?.LASTVOUCHERDATE[0]?._
  }))
}
