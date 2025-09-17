export type LogEntry = {
  level: string;
  timestamp: string;
  message: string;
};

export type ClientInfo = {
  ipAddr: string;
  viewportWidth: number;
  viewportHeight: number;
};

export type ClientsUpdatedEvent = ClientInfo[];
