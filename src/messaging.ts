import { getPlayer, getRandomNumber, MOD_DATA } from "./index";
import { hookFunction, HookPriority } from "./modsApi";

const pendingRequests: Map<string, PendingRequest<any>> = new Map();
const requestListeners: Map<string, (data: any, sender: Character | number) => any> = new Map();

interface PendingRequest<T> {
	message: string
	data: T
	target: number
	resolve: (data: T) => any
	reject: (data: T) => any
}

interface RequestResponse<T> {
	data?: T
	isError: boolean
}

interface PacketRequestData {
	requestId: string
	message: string
	data: any
}

interface BeepRequestData {
	type: string
	requestId: string
	message: string
	data: any
}

type PacketRequestResponseData = PacketRequestData;
type BeepRequestResponseData = BeepRequestData;

export function handlePacketRequestResponse(requestId: string, data: any): void {
	const request = pendingRequests.get(requestId);
	if (!request) return;
	request.resolve({
		data
	});
}

export function handlePacketRequest(requestId: string, message: string, _data: any, sender: Character): void {
	const listener = requestListeners.get(message);
	if (!listener) return;
	const data = listener(_data, sender);
	if (data !== undefined) {
		messagesManager.sendPacket<PacketRequestResponseData>("requestResponse", {
			requestId,
			message,
			data
		}, sender.MemberNumber);
	}
}

export function handleBeepRequestResponse(requestId: string, data: any): void {
	const request = pendingRequests.get(requestId);
	if (!request) return;
	request.resolve({
		data
	});
}

export function handleBeepRequest(requestId: string, message: string, _data: any, senderNumber: number): void {
	const listener = requestListeners.get(message);
	console.log(listener);
	if (!listener) return;
	const data = listener(_data, senderNumber);
	if (data !== undefined) {
		messagesManager.sendBeep<BeepRequestResponseData>({
			type: `${MOD_DATA.key}_requestResponse`,
			requestId,
			message,
			data
		}, senderNumber);
	}
}

class MessagesManager {
	sendBeep<T>(data: T, targetId: number): void {
		const beep = {
			IsSecret: true,
			BeepType: "Leash",
			MemberNumber: targetId,
			Message: JSON.stringify({
				...data
			})
		};
		ServerSend("AccountBeep", beep);
	}

	sendPacket<T>(msg: string, _data?: T, targetNumber?: number): void {
		const data: ServerChatRoomMessage = {
			Content: MOD_DATA.key,
			Dictionary: {
				// @ts-ignore
				msg
			},
			Type: "Hidden",
		};
		// @ts-ignore
		if (_data) data.Dictionary.data = _data;
		if (targetNumber) data.Target = targetNumber;
		ServerSend("ChatRoomChat", data);
	}

	sendAction(msg: string, target: undefined | number = undefined, dictionary: ChatMessageDictionaryEntry[] = []): void {
		if (!msg || !ServerPlayerIsInChatRoom()) return;

		const isFemale = CharacterPronounDescription(Player) === "She/Her";
		const capPossessive = isFemale ? "Her" : "His";
		const capIntensive = isFemale ? "Her" : "Him";
		const capSelfIntensive = isFemale ? "Herself" : "Himself";
		const capPronoun = isFemale ? "She" : "He";

		msg = msg
			.replaceAll("<Possessive>", capPossessive)
			.replaceAll("<possessive>", capPossessive.toLocaleLowerCase())
			.replaceAll("<Intensive>", capIntensive)
			.replaceAll("<intensive>", capIntensive.toLocaleLowerCase())
			.replaceAll("<SelfIntensive>", capSelfIntensive)
			.replaceAll("<selfIntensive>", capSelfIntensive.toLocaleLowerCase())
			.replaceAll("<Pronoun>", capPronoun)
			.replaceAll("<pronoun>", capPronoun.toLocaleLowerCase());

		ServerSend('ChatRoomChat', {
			Content: 'ZC_CUSTOM_ACTION',
			Type: 'Action',
			Target: target ?? undefined,
			Dictionary: [
				{ Tag: 'MISSING TEXT IN "Interface.csv": ZC_CUSTOM_ACTION', Text: msg },
				...dictionary,
			],
		});
	}

	sendRequest<T>({
		message, data = {}, target, type = "packet"
	}: {
		message: string
		data?: unknown
		target: number
		type: "packet" | "beep"
	}): Promise<RequestResponse<T>> {
		const requestId = crypto.randomUUID();
		return new Promise((resolve, reject) => {
			pendingRequests.set(requestId, {
				message,
				data,
				target,
				resolve,
				reject
			});
			if (type === "packet") {
				messagesManager.sendPacket<PacketRequestData>("request", {
					requestId,
					message,
					data
				}, target);
			} else {
				messagesManager.sendBeep<BeepRequestData>({
					type: `${MOD_DATA.key}_request`,
					requestId,
					message,
					data
				}, target);
			}
			setTimeout(() => {
				pendingRequests.delete(requestId);
				resolve({
					isError: true
				});
			}, 6000);
		});
	}

	sendLocal(message: string | Node): void {
		if (!ServerPlayerIsInChatRoom()) return;

		const div = document.createElement("div");
		div.setAttribute("class", "ChatMessage ChatMessageLocalMessage");
		div.setAttribute("data-time", ChatRoomCurrentTime());
		div.setAttribute("data-sender", `${Player.MemberNumber}`);
		div.style.background = MOD_DATA.chatMessageBackground ?? "#55edc095";
		div.style.color = MOD_DATA.chatMessageColor ?? "black";
		div.style.margin = "0.15em 0";

		if (typeof message === "string") div.innerHTML = message;
		else div.appendChild(message);

		document.querySelector("#TextAreaChatLog").appendChild(div);
		ElementScrollToEnd("TextAreaChatLog");
	}

	sendChat(message: string): void {
		ServerSend("ChatRoomChat", { Type: "Chat", Content: message });
	}

	onRequest(message: string, listener: (data: any, sender: Character | number) => unknown): void {
		requestListeners.set(message, listener);
	}

	onPacket(message: string, listener: (data: any, sender: Character) => void): void {
		hookFunction("ChatRoomMessage", HookPriority.ADD_BEHAVIOR, (args, next) => {
			const _message = args[0];
			const sender = getPlayer(_message.Sender);
			if (!sender) return next(args);
			if (
				_message.Content === MOD_DATA.key &&
				_message.Dictionary.msg === message &&
				!sender.IsPlayer()
			) listener(_message.Dictionary.data, sender);
			return next(args);
		});
	}
}

export const messagesManager = new MessagesManager();