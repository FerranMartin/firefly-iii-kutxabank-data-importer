import Server from "./src/server.js";

(async function () {
	const server = new Server();
	server.start();
})();
