import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { baseURL } from "@/lib/api/axios";

const DEFAULT_URL = baseURL;

interface CreateSocketOptions {
  url?: string;
  token?: string;
}

interface SocketClient {
  socket: Socket;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, ...args: unknown[]) => void;
}

const createSocket = ({ url = DEFAULT_URL, token }: CreateSocketOptions = {}): SocketClient => {
  const authToken = token || Cookies.get("authToken") || Cookies.get("token");
  const bearerToken = authToken ? `Bearer ${authToken}` : undefined;

  const socket = io(url, {
    autoConnect: false,
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    auth: {
      token: bearerToken,
    },
    transportOptions: {
      polling: {
        extraHeaders: bearerToken ? { Authorization: bearerToken } : {},
      },
    },
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connect error:", error.message);
  });
  socket.on("connect", () => {
    console.log("Socket connected successfully");
  });

  return {
    socket,
    connect: () => socket.connect(),
    disconnect: () => socket.disconnect(),
    emit: (event: string, ...args: unknown[]) => {
      if (socket.connected) socket.emit(event, ...args);
    },
  };
};

let socketClient: SocketClient | null = null;
let activeToken: string | null = null;

export const getSocket = (): Socket | null => {
  if (typeof window === "undefined") return null;
  const token = Cookies.get("authToken") || Cookies.get("token") || null;
  if (!token) return null;

  if (socketClient && activeToken === token) {
    return socketClient.socket;
  }

  if (socketClient && activeToken !== token) {
    socketClient.disconnect();
    socketClient = null;
  }

  socketClient = createSocket({ token });
  activeToken = token;
  return socketClient.socket;
};

export const ensureSocketConnection = (): Socket | null => {
  const socket = getSocket();
  if (socket && !socket.connected) {
    socket.connect();
  }
  return socket;
};
