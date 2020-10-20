const Discord = require("discord.js");
const LauriMarkson = new Discord.Client();

const writeGood = require("write-good");
const spellchecker = require("spellchecker");

const respond = new Set();
const talked = {};
const delay = 60;

const lauriResponses = [
	"No no no no no!",
	"That was funny! Why aren't you laughing?",
	"Isn't that rather naive?",
	"Don't make me take out my pink pen.",
	"Why aren't you writing this down?",
	"Write this down, write this down!"
];

const membersToCorrect = [
	"422560967293927424"
];

LauriMarkson.login("NTYzNTQ5NDE1NzA1NDExNTg0.XKa8Sg.ZpIyv1uffE-V8wu2FxV1HizhWfo");

LauriMarkson.on("ready", () => {
	console.log(`No no no no no! Lauri Markson, the true lady, is officially online.`);
});

LauriMarkson.on("message", msg => {
	if (msg.author.bot || !msg.guild || !membersToCorrect.includes(msg.author.id)) {
		return;
	}

	if (msg.type === "PINS_ADD") {
		msg.channel.send("Why aren't you writing this down? Write this down, write this down!")
			.then(x => x.delete({ timeout: 5000 }));
		return;
	}

	if (!respond.has(msg.author.id)) {
		respond.add(msg.author.id);
		setTimeout(() => {
			respond.delete(msg.author.id);
		}, delay * 1000);
	}

	if (respond.size >= 5) {
		msg.channel.send(lauriResponses[Math.floor(Math.random() * lauriResponses.length)])
			.then(x => x.delete({ timeout: 5000 }));
		respond.clear();
		return;
	}

	let isFound = false;
	for (let users in talked) {
		if (users === msg.author.id) {
			isFound = true;
			break;
		}
	}

	if (isFound) {
		talked[msg.author.id]["amt"] += 1;
		if (talked[msg.author.id]["amt"] === 6) {
			msg.channel.send(new Discord.MessageEmbed()
				.setColor("RED")
				.setDescription("When I talk, you write. -2")
			).then(x => x.delete({ timeout: 5000 }));
		}
		return;
	}

	// probably an image
	if (msg.content.length === 0) {
		return;
	}

	let responseStr = "";
	let penalty = 0;

	// begin annoying members
	if (![".", "!", "?"].includes(msg.content.charAt(msg.content.length - 1))) {
		responseStr += "You need to end your sentence with some form of punctuation! -2.\n";
		penalty += 2;
	}

	if (msg.content.charAt(0) !== msg.content.charAt(0).toUpperCase()) {
		responseStr += "You always have to capitalize the first letter of a sentence! -1.\n";
		penalty += 1;
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


	let spellingsuggestions = spellchecker.checkSpelling(msg.content);
	let lenOfMissp = spellingsuggestions.length;
	if (spellingsuggestions) {
		responseStr += "\n";
		let str = `You misspelled `;
		let origLen = str.length;
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
		penalty += lenOfMissp;
	}

	if (responseStr.length === 1) {
		return;
	}

	const embed = new Discord.MessageEmbed()
		.setAuthor("Lauri Markson", "https://cdn.discordapp.com/attachments/520019296936525834/520019481096093697/lauri.png")
		.setTitle("No no no no no!")
		.setDescription(responseStr)
		.setFooter(`You lost ${penalty} points. ${penalty >= 2 && penalty < 5 ? "I am disappointed in you." : (penalty >= 5 && penalty < 8) ? "Why are you in my classroom?" : (penalty >= 8) ? "Get out of my classroom." : ""}`)
		.setColor(0xfc0303);

	msg.channel.send(embed)
		.then(s => s.delete({ timeout: 5000 }))
		.catch(e => { });

	talked[msg.author.id] = {
		"amt": 1
	};

	setTimeout(() => {
		delete talked[msg.author.id];
	}, 15000);
});