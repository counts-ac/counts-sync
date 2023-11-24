export interface NotificationProps {
  title: string
  body: string
}

export interface TallyRequestParams {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  bodyContent?: string
}

export interface TallyResponse {
  data: unknown | null
  error: unknown | null
}
