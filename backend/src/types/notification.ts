export type NotificationListQuery = {
  userId: string
  unreadOnly?: string
}

export type CreateNotificationInput = {
  userId: string
  title: string
  body: string
}
