import path from "path";
import fs from "fs";
import xlsx from "xlsx";

import { Banks_N43 } from "../services/q43_parser.js";
import { sendMovementsFileToFF3DataImporter } from "../services/ff3DataImporterAPI.js";

const IMPORT_PATH = path.join(import.meta.dirname, "imports");

export function uploadController({
	mainAccount,
	ferranCreditCard,
	marionaCreditCard,
}) {
	_processMainAccount(mainAccount);
	_processCreditCard({
		creditCardOwner: "Ferran",
		movements: ferranCreditCard,
	});
	_processCreditCard({
		creditCardOwner: "Mariona",
		movements: marionaCreditCard,
	});
}

function _processMainAccount(mainAccount) {
	if (!mainAccount) return;

	const parser = new Banks_N43();
	parser.parse(mainAccount);

	const headerRow = [
		"office",
		"date",
		"date_value",
		"concept_common",
		"concept_own",
		"type",
		"amount",
		"document",
		"refererence_1",
		"refererence_2",
		"concept",
	];

	const csvRows = [headerRow];
	parser._current_account.entries.forEach((entry) => {
		csvRows.push(headerRow.map((header) => entry[header]));
	});

	const csvData = csvRows.map((row) => row.join(";")).join("\n");

	const pathToFileWithMovements = `${IMPORT_PATH}/mainAccount.csv`;
	const pathToFileWithFF3DataImporterSettings = `${IMPORT_PATH}/mainAccountSettings.json`;

	fs.writeFile(pathToFileWithMovements, csvData, (err) => {
		if (err) throw err;
		console.log("CSV file for mainAccount has been saved.");
	});

	sendMovementsFileToFF3DataImporter({
		pathToFileWithMovements,
		pathToFileWithFF3DataImporterSettings,
	});
}

function _processCreditCard({ creditCardOwner, movements }) {
	if (!movements) return;

	// Leer el archivo directamente del buffer
	var workbook = xlsx.read(movements, { type: "buffer" });

	// Convertir la hoja de cálculo en JSON
	var first_sheet_name = workbook.SheetNames[0];
	var worksheet = workbook.Sheets[first_sheet_name];

	var jsonData = xlsx.utils.sheet_to_json(worksheet, {
		header: 1,
		blankrows: false,
	});
	jsonData.shift();

	const csvData = jsonData.map((row) => row.join(";")).join("\n");

	const pathToFileWithMovements = `${IMPORT_PATH}/credit_${creditCardOwner}.csv`;
	const pathToFileWithFF3DataImporterSettings = `${IMPORT_PATH}/credit${creditCardOwner}Settings.json`;

	fs.writeFile(pathToFileWithMovements, csvData, (err) => {
		if (err) throw err;
		console.log(
			`CSV file for ${creditCardOwner} credit card account has been saved.`
		);
	});

	sendMovementsFileToFF3DataImporter({
		pathToFileWithMovements,
		pathToFileWithFF3DataImporterSettings,
	});
}
