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

/// GUARDS

class StringGuards {
    static isNonEmptyString(strData) {
        return typeof strData === 'string' && !!strData;
    }

    static isStringOfLength(strData, length) {
        return typeof strData === 'string' && strData.length === length;
    }

    static isNumericString(strData) {
        return /^\d+$/.test(strData);
    }

    static isCode39String(strData) {
        return /^[A-Z0-9\x20.$/+%-]+$/.test(strData);
    }
}

/////// GENERAL

class Result {
    static success() {
        return new Result();
    }

    static fail(message) {
        return new Result(message);
    }

    constructor(message = '') {
        this.isValid = !message;
        
        this.message = message;
    }
}

function checkConditions(conditions, data) {
    for (let condition of conditions) {
        if (!condition.check(data)) {
            return Result.fail(condition.getMessage());
        }
    }
    return Result.success();
}

///// Barcode

class Barcode {
    static create(barcodeType) {
        return new Barcode(barcodeType);
    }

    constructor(barcodeType) {
        this.barcodeType = barcodeType;
        this.conditions = [];
    }

    addRule(onCheckCallback, onErrorMessageCallback) {
        this.conditions.push({
            check: data => onCheckCallback(data),
            getMessage: () => onErrorMessageCallback(this.barcodeType),
        })
        return this;
    }

    validate(data) {
        return checkConditions(this.conditions, data);
    }
}

const code39 = () => Barcode.create(barcodes.CODE39)
    .addRule(StringGuards.isNonEmptyString, ruleMessages.TOO_SHORT_DATA)
    .addRule(StringGuards.isCode39String, ruleMessages.UNSUPPORTED_SYMBOL);

const ean13 = () => Barcode.create(barcodes.EAN13)
    .addRule((data => StringGuards.isStringOfLength(data, 12)), ruleMessages.TOO_SHORT_DATA)
    .addRule(StringGuards.isNumericString, ruleMessages.NON_NUMERIC);

const ean8 = () => Barcode.create(barcodes.EAN8)
    .addRule((data => StringGuards.isStringOfLength(data, 7)), ruleMessages.TOO_SHORT_DATA)
    .addRule(StringGuards.isNumericString, ruleMessages.NON_NUMERIC);

const unSupportedType = () => Barcode.create('UNDEFINED')
    .addRule(() => false, ruleMessages.UNSUPPORTED_BARCODE);

const createBarcode = barcodeType => {
    const supportedTypes = {
        [barcodes.CODE39]: code39,
        [barcodes.EAN13]: ean13,
        [barcodes.EAN8]: ean8,
    };

    return (supportedTypes[barcodeType] || unSupportedType)();
}

/// Example

const barCode = 'CODE39';
const data = 'ABC-123';

const validator = createBarcode(barCode);

console.log(validator.validate(data));

/// Exports

// module.exports = createBarcodeValidator;
