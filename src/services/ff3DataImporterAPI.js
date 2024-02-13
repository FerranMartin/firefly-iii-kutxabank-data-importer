import FormData from "form-data";
import http from "http";
import fs from "fs";

export function sendMovementsFileToFF3DataImporter({
	pathToFileWithMovements,
	pathToFileWithFF3DataImporterSettings,
}) {
	const form = new FormData();
	form.append("importable", fs.createReadStream(pathToFileWithMovements));
	form.append(
		"json",
		fs.createReadStream(pathToFileWithFF3DataImporterSettings)
	);

	const options = {
		hostname: "importer",
		port: "8080",
		path: `/autoupload?secret=${process.env.AUTO_IMPORT_SECRET}`,
		method: "POST",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${process.env.FIREFLY_III_ACCESS_TOKEN}`,
			...form.getHeaders(),
		},
	};

	const req = http.request(options, (res) => {
		res.on("data", (chunk) => {
			console.log(`BODY: ${chunk}`);
		});
		res.on("end", () => {
			console.log("No more data in response.");
		});
	});

	req.on("error", (error) => {
		console.error(`problem with request: ${error.message}`);
	});

	form.pipe(req);
}
