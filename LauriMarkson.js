const Discord = require("discord.js");
const LauriMarkson = new Discord.Client();

const writeGood = require("write-good");
const spellchecker = require("spellchecker");

const respond = new Set();
const delay = 60;
const lauriResponses = [
	"No no no no no!",
	"That was funny! Why aren't you laughing?",
	"Isn't that rather naive?",
	"Don't make me take out my pink pen.",
	"Why aren't you writing this down?",
	"Write this down, write this down!",
	"Everyone snap for Lexi!",
	"Why aren't you writing this down?",
	"Why aren't you writing this?",
	"Why aren't you writing?",
	"Are you taking notes?",
	"When I speak, you write.",
	"Please try to enunciate and speak clearly; I want to be able to hear your voice.",
	"Very good!",
	"Shame on you!",
	"Pardon me.",
	"I shouldn't have to tell you to enunciate...",
	"I'm an elitist, and I'm an erudite, and I'm not apologizing."
];

LauriMarkson.login("you wish");

LauriMarkson.on("ready", () => {
	console.log(`No no no no no! Lauri Markson, the true lady, is officially online.`);
});

LauriMarkson.on("message", async msg => {
	if (msg.author.bot) {
		return;
	}

	if (msg.type === "PINS_ADD") {
		msg.channel.send("Why aren't you writing this down? Write this down, write this down!");
		return;
	}
	
	if (msg.content === "") {
		return;
	}

	if (msg.channel.id === "485307611240071189") {
		msg.channel.send("You're still calculating your grade?");
	}
	
	if (!respond.has(msg.author.id)) {
		await respond.add(msg.author.id);
	}

	if (respond.size >= 3) {
		msg.channel.send(lauriResponses[Math.floor(Math.random() * lauriResponses.length)]);
		await respond.clear();
		return;
	}

	setTimeout(() => {
		respond.delete(msg.author.id);
	}, delay * 1000);

	let responseStr = "";

	if (![".", "!", "?"].includes(msg.content.charAt(msg.content.length - 1))) {
		responseStr += "You need to end your sentence with some form of punctuation! -2.\n";
	}

	if (msg.content.charAt(0) !== msg.content.charAt(0).toUpperCase()) {
		responseStr += "You always have to capitalize the first letter of a sentence! -1.\n";
	}

	let suggestions = writeGood(msg.content);
	if (suggestions) {
		let str = "";
		let origLen = str.length;

		for (let i = 0; i < suggestions.length; i++) {
			str += `${suggestions[i].reason}, `;
		}

		str = str.trim();

		if (str.charAt(str.length - 1) === ",") {
			str = str.substring(0, str.length - 1) + ".";
		}

		if (str.length + 1 !== origLen) {
			responseStr += str.charAt(0).toUpperCase() + str.slice(1);
		}
	}

	responseStr += "\n";

	let spellingsuggestions = spellchecker.checkSpelling(msg.content);
	if (spellingsuggestions) {
		let str = `You misspelled `;
		let origLen = str.length;
		let lenOfMissp = spellingsuggestions.length;
		for (let i = 0; i < spellingsuggestions.length; i++) {
			str += `${msg.content.substring(spellingsuggestions[i].start, spellingsuggestions[i].end)}, `;
		}
		str = str.trim();

		if (str.charAt(str.length - 1) === ",") {
			str = str.substring(0, str.length - 1) + ".";
		}

		if (str.length + 1 !== origLen) {
			responseStr += `${str.charAt(0).toUpperCase() + str.slice(1)} -${lenOfMissp}.`;
		}
	}

	msg.channel.send(responseStr)
		.then(s => s.delete(15000))
		.catch(e => { });
});
