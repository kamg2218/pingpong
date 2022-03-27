import {io} from "socket.io-client";

const url = "http://localhost:4242";

export const socket = io(url, {
	transportOptions: {
	  polling: { extraHeaders: {  Authorization: `${document.cookie}` } },
  }
});