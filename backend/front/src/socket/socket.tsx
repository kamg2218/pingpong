import {io} from 'socket.io-client';
import { BACK_SOCKET } from '../types/urlTypes';

const url = BACK_SOCKET;

export const socket = io(url, {
	transportOptions: {
	  polling: { extraHeaders: {  Authorization: `${document.cookie}` } },
  }
});