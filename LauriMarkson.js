const Discord = require("discord.js");
const LauriMarkson = new Discord.Client();
const stats = require("./stats.json");
const fs = require("fs");

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

LauriMarkson.login("NTYzNTQ5NDE1NzA1NDExNTg0.XWNKqQ.wZIiO_sQCYuWhK9hb3lKy1XnL9M");

LauriMarkson.on("ready", () => {
	console.log(`No no no no no! Lauri Markson, the true lady, is officially online.`);
});

LauriMarkson.on("message", msg => {
	if (msg.author.bot || !msg.guild) {
		return;
	}

	if (msg.type === "PINS_ADD") {
		msg.channel.send("Why aren't you writing this down? Write this down, write this down!")
			.then(x => x.delete(5000));
		return;
	}

	if (msg.content.toLowerCase().includes("lauri, who are your least favorite students") || msg.content.startsWith(">score")) {
		msg.delete().catch(e => { });
		let arr = [];
		for (let id in stats) {
			arr.push([id, stats[id]["pts"]]);
		}

		if (arr.length === 0) {
			msg.channel.send("No one has been penalized yet.")
				.then(x => x.delete(5000));
			return;
		}

		arr.sort((a, b) => {
			let avalue = a[1],
				bvalue = b[1];
			if (avalue > bvalue) {
				return -1;
			}
			if (avalue < bvalue) {
				return 1;
			}
			return 0;
		});

		let length;
		if (arr.length < 15) {
			length = arr.length;
		} else {
			length = 15;
		}

		let str = "";
		for (let i = 0; i < length; i++) {
			str += `**[${i + 1}]** <@!${arr[i][0]}> (${arr[i][1]} Points)\n`;
		}

		const f = new Discord.RichEmbed()
			.setAuthor("Lauri Markson", "https://cdn.discordapp.com/attachments/520019296936525834/520019481096093697/lauri.png")
			.setTitle("❌ My Least Favorite Students ❌")
			.setDescription(str)
			.setColor("RED");
		if (msg.content.toLowerCase().includes("lauri, who are your least favorite students")) {
			msg.channel.send(`Well, ${msg.author}...`, f);
			return;
		}
		msg.channel.send(f);
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
			.then(x => x.delete(5000));
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
			msg.channel.send(new Discord.RichEmbed()
				.setColor("RED")
				.setDescription("When I talk, you write. -2")
			).then(x => x.delete(5000));
			updateScore(msg, -2, 0);
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

	const embed = new Discord.RichEmbed()
		.setAuthor("Lauri Markson", "https://cdn.discordapp.com/attachments/520019296936525834/520019481096093697/lauri.png")
		.setTitle("No no no no no!")
		.setDescription(responseStr)
		.setFooter(`You lost ${penalty} points. ${penalty >= 2 && penalty < 5 ? "I am disappointed in you." : (penalty >= 5 && penalty < 8) ? "Why are you in my classroom?" : (penalty >= 8) ? "Get out of my classroom." : ""}`)
		.setColor(0xfc0303);

	msg.channel.send(embed)
		.then(s => s.delete(5000))
		.catch(e => { });

	updateScore(msg, penalty);

	talked[msg.author.id] = {
		"amt": 1
	};

	setTimeout(() => {
		delete talked[msg.author.id];
	}, 15000);
});

/**
 * @param {Discord.Message} msg 
 * @param {number} penalty 
 */
function updateScore(msg, penalty) {
	let userFound = false;
	for (let id in stats) {
		if (id === msg.author.id) {
			userFound = true;
			break;
		}
	}

	if (userFound) {
		stats[msg.author.id]["pts"] = parseInt(stats[msg.author.id]["pts"]) + penalty;
	} else {
		stats[msg.author.id] = {
			"pts": Math.abs(penalty)
		};
	}
	fs.writeFile("./stats.json", JSON.stringify(stats), (err) => console.error);
}
