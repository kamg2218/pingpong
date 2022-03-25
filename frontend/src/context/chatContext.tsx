import {useState, createContext} from "react"

export const ChatContext = createContext<any>(null);

export function ChatVariables(){
	const [chatroom, setChatRoom] = useState<ChatData>();
	const [history, setHistory] = useState<ChatHistory>();
	const [publicroom, setPublic] = useState<ChatData>();

	const variable = {
		chatroom: [chatroom, setChatRoom],
		history: [history, setHistory],
		publicroom: [publicroom, setPublic],
	};
	return variable;
}

export type User = {
	userid: string,
	nickname: string,
	profile: number,
}
export type chatRoom = {
	title: string,
	chatid: string,
	owner: string,
	manager: Array<string>,
	members: Array<User>,
	lock: boolean,
	type: string,
	max: number,
}
export type InputChatRoom = {
	chatid: string,
	title: string,
	addManager: Array<string>,
	deleteManager: Array<string>,
	enterUser: Array<User>,
	exitUser: Array<string>,
	lock: boolean,
	type: string,
}
export type ChatData = {
	order: Array<string>,
	chatroom: Array<chatRoom>,
}
export type ChatBlock = {
	userid: string,
	contents: string,
	createDate: Date,
}
export type ChatHistory = {
	chatid: string,
	list: Array<ChatBlock>,
}