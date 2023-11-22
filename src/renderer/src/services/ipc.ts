import { TALLY_URL } from '../../../constants'

export const companyDetails = async () => await window.api.getCompanyDetails(TALLY_URL);

