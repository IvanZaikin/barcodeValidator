const ruleMessages = Object.freeze({
    TOO_SHORT_DATA: barcodeType => `barcode in ${barcodeType} format could not be printed because length of data is less than that supported by the format`,
    UNSUPPORTED_SYMBOL: barcodeType => `barcode in ${barcodeType} format could not be printed because data contains unsupported symbol(s)`,
    NON_NUMERIC: barcodeType => `barcode in ${barcodeType} format could not be printed for non-numeric data`,
    UNSUPPORTED_BARCODE: barcodeType => `barcode in ${barcodeType} format could not be ptinted because the format is unsupported`,
});

const barcodes = Object.freeze({
    CODE39: 'CODE39',
    EAN13: 'EAN13',
    EAN8: 'EAN8',
});

class BarcodeDataValidator {
    static validate(barcodeType, data) {
        const rules = this.getBarcodeRules(barcodeType);

        if (!rules) {
            return this.fail(`barcode in ${barcodeType} format could not be ptinted because the format is unsupported`);
        }

        return this.checkRules(rules, data);
    }

    // STATIC RULES

    static getBarcodeRules(barcodeType) {
        const rulesByType =
        {
            [barcodes.CODE39]: [
                {
                    check: strData => this.isNonEmptyString(data),
                    getMessage: () => ruleMessages.TOO_SHORT_DATA(barcodeType),
                },
                {
                    check: strData => this.isCode39String(strData),
                    getMessage: () => ruleMessages.UNSUPPORTED_SYMBOL(barcodeType),
                },
            ], 
            [barcodes.EAN13]: [
                {
                    check: strData => this.isStringOfLength(data, 12),
                    getMessage: () => ruleMessages.TOO_SHORT_DATA(barcodeType),
                },
                {
                    check: strData => this.isNumericString(data),
                    getMessage: () => ruleMessages.NON_NUMERIC(barcodeType),
                }
            ],
            [barcodes.EAN8]: [
                {
                    check: strData => isStringOfLength(data, 7),
                    getMessage: () => ruleMessages.TOO_SHORT_DATA(barcodeType),
                },
                {
                    check: strData => this.isNumericString(data),
                    getMessage: () => ruleMessages.NON_NUMERIC(barcodeType),
                }
            ]
        };

        return rulesByType[barcodeType];
    }

    static checkRules(rules, data) {
        for (let rule of rules) {
            if (!rule.check(data)) {
                return this.fail(rule.getMessage());
            }
        }
        return this.success();
    }

    // RESULT UTILS

    static success() {
        return this.result(true);
    }

    static fail(message) {
        return this.result(false, message);
    }

    static result(isValid, message) {
        return {
            isValid,
            ...message && {
                message
            }
        }
    }


    // STRING UTILS

    static isNumericString(data) {
        return /^\d+$/.test(data);
    }

    static isStringOfLength(data, length) {
        return typeof data === 'string' && data.length === length;
    }

    static isCode39String(data) {
        return /^[A-Z0-9\x20.$/+%-]+$/.test(data);
    }

    static isNonEmptyString(data) {
        return typeof data === 'string' && !!data;
    }
}


const barCode = 'CODE39';
const data = 'ABC-123';

console.log(BarcodeDataValidator.validate(barCode, data));
