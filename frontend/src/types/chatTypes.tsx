export type ChatUser = {
	userid: string,
	nickname: string,
	profile: number,
}
export type chatRoom = {
	title: string,
	chatid: string,
	owner: string,
	manager: Array<string>,
	members: Array<ChatUser>,
	lock: boolean,
	type: string,
	max: number,
}
export type InputChatRoom = {
	chatid: string,
	title?: string,
	addManager?: Array<string>,
	deleteManager?: Array<string>,
	enterUser?: Array<ChatUser>,
	exitUser?: Array<string>,
	lock?: boolean,
	type?: string,
	switchOwner?: string,
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
export type ChatRequest = {
	chatid: string,
	password?: string,
}
export type message = {
	message: string,
};
export type ChatResult = {
	chatid: string,
	result: string,
}