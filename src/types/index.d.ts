export declare type NotificationProps = {
  title: string
  body: string
}

interface TallyRequestParams {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  bodyContent: string
}
