export interface UserNotification {
    type: string; // One of: 'success', 'error', 'info', 'warning'
    title: string;
    message: string;
    options: { [id: string]: any };
  }
