const ACCOUNT_TYPE = {
	DEBIT: "debit",
	CREDIT: "credit",
	UNKNOWN: "unknown",
};

const MOVEMENT_TYPE = {
	DEPOSIT: "deposit",
	WITHDRAW: "withdraw",
	UNKNOWN: "unknown",
};

const CURRENCIES = {
	EUR: 978,
	USD: 840,
	GBP: 426,
	JPY: 392,
	CNY: 156,
};

export class Banks_N43 {
	constructor() {
		this.accounts = [];
		this._current_account = null;
		this._current_entry = null;
		this._record_count = 0;
	}

	parse(content) {
		content = content.replace(/ISO-8859-1/g, "UTF-8");

		this._record_count = 0;
		content.split("\n").forEach((line) => {
			if (!line.trim()) {
				return;
			}

			const code = parseInt(line.substr(0, 2));
			const method_name = `_parse_record_${code}`;

			if (typeof this[method_name] === "function") {
				this[method_name](line);
			} else {
				throw new Error(
					`Invalid record type '${code}' in line ${this._record_count}`
				);
			}

			this._record_count++;
		});
	}

	/**
	 * Entrada 11 - Registro cabecera de cuenta (obligatorio)
	 */
	_parse_record_11(line) {
		const account = {
			bank: line.substr(2, 4),
			office: line.substr(6, 4),
			account: line.substr(10, 10),
			number: line.substr(2, 18),
			date_start: this._parse_date(line.substr(20, 6)),
			date_end: this._parse_date(line.substr(26, 6)),
			type:
				line.substr(32, 1) == 1
					? ACCOUNT_TYPE.DEBIT
					: line.substr(32, 1) == 2
					? ACCOUNT_TYPE.CREDIT
					: ACCOUNT_TYPE.UNKNOWN,
			balance_initial: parseFloat(
				line.substr(33, 12) + "." + line.substr(45, 2)
			),
			currency: Banks_Helper.currency_number2code(line.substr(47, 3)),
			mode: line.substr(50, 1),
			owner_name: line.substr(51, 26).trim(),
			entries: [],
		};

		if (account.type === ACCOUNT_TYPE.DEBIT) {
			account.balance_initial *= -1;
		}

		this._current_account = account;
		this.accounts.push(account);
		return account;
	}

	/**
	 * Entrada 22 - Registro principal de movimiento (obligatorio)
	 */
	_parse_record_22(line) {
		const type =
			line.substr(27, 1) == 1
				? MOVEMENT_TYPE.WITHDRAW
				: line.substr(27, 1) == 2
				? MOVEMENT_TYPE.DEPOSIT
				: MOVEMENT_TYPE.UNKNOWN;

		let amount = parseFloat(line.substr(28, 12) + "." + line.substr(40, 2));
		if (type === MOVEMENT_TYPE.WITHDRAW) amount *= -1;

		const entry = {
			office: line.substr(6, 4).replace(/^0+/, ""),
			date: this._parse_date(line.substr(10, 6)),
			date_raw: line.substr(10, 6),
			date_value: this._parse_date(line.substr(16, 6)),
			concept_common: line.substr(22, 2),
			concept_own: line.substr(24, 3),
			type,
			amount,
			document: line.substr(42, 10).replace(/^0+/, "").trim(),
			refererence_1: line.substr(52, 12).replace(/^0+/, "").trim(),
			refererence_2: line.substr(64, 16).trim(),
			raw: line,
			concepts: [],
			concept: "",
		};

		this._current_entry = entry;
		this._current_account.entries.push(entry);
		return entry;
	}

	/**
	 * Entrada 23 - Registros complementarios de concepto, opcionales y hasta un máximo de 5.
	 * En Kutxa siempre viene 1, por lo que lo pondremos en `entry.concept`
	 */
	_parse_record_23(line) {
		const concept = line.substr(4).trim();
		this._current_entry.concepts.push(concept);
		this._current_entry.concept = concept;
		return this._current_entry;
	}

	/**
	 * Entrada 24 - Registro complementario de información de equivalencia del importe (opcional y sin valor contable)
	 */
	_parse_record_24(line) {
		this._current_entry.currency_eq = Banks_Helper.currency_number2code(
			line.substr(4, 3)
		);
		this._current_entry.amount_eq = parseFloat(
			line.substr(7, 12) + "." + line.substr(19, 2)
		);
		return this._current_entry;
	}

	/**
	 * Entrada 33 - Registro final de cuenta
	 */
	_parse_record_33(line) {
		this._current_account.balance_end = parseFloat(
			line.substr(59, 12) + "." + line.substr(71, 2)
		);

		return this._current_account;
	}

	/**
	 * Entrada 88 - Registro de fin de archivo
	 */
	_parse_record_88(line) {
		const record_count = line.substr(20, 6);

		if (record_count != this._record_count) {
			throw new Error(
				`Number of records (${this._record_count}) doesn't match with the defined in the last record (${record_count}).`
			);
		}
	}

	_parse_date(date) {
		return date.replace(/(\d{2})(\d{2})(\d{2})/, "$3/$2/$1");
	}
}

class Banks_Helper {
	static currency_code2number(code) {
		const currencyName = code.toUpperCase();
		if (!CURRENCIES[currencyName]) {
			throw new Error(`Unrecognized currency '${code}'`);
		}

		return CURRENCIES[currencyName];
	}

	static currency_number2code(number) {
		const code = Object.keys(CURRENCIES).find(
			(key) => CURRENCIES[key] === parseInt(number, 10)
		);
		if (!code) {
			throw new Error(`Unrecognized currency '${number}'`);
		}

		return code;
	}
}
