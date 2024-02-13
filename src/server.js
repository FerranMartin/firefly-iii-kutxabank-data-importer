import path from "path";
import express from "express";
import multer from "multer";

import { uploadController } from "./controllers/uploadController.js";

export default class Server {
	#port = process.env.PORT;
	#app = express();

	start() {
		const upload = multer({ storage: multer.memoryStorage() });

		this.#app.use(express.static(path.join(import.meta.dirname, "public")));

		this.#app.post(
			"/upload",
			upload.fields([
				{ name: "file1", maxCount: 1 },
				{ name: "file2", maxCount: 1 },
				{ name: "file3", maxCount: 1 },
			]),
			(req, res) => {
				const mainAccount = req.files["file1"]
					? req.files["file1"][0].buffer.toString("utf8")
					: null;
				const ferranCreditCard = req.files["file2"]
					? req.files["file2"][0].buffer
					: null;
				const marionaCreditCard = req.files["file3"]
					? req.files["file3"][0].buffer
					: null;

				const processResult = uploadController({
					mainAccount,
					ferranCreditCard,
					marionaCreditCard,
				});

				// Enviar una respuesta válida
				res.json({
					message: "Received files",
					uploadedFiles: {
						mainAccount: mainAccount ? "Received" : "Not delivered",
						ferranCreditCard: ferranCreditCard
							? "Received"
							: "Not delivered",
						marionaCreditCard: marionaCreditCard
							? "Received"
							: "Not delivered",
					},
					processResult,
				});
			}
		);

		this.#app.listen(this.#port, () => {
			console.log(`Example app listening on port ${this.#port}`);
		});
	}
}
