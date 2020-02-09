class BarcodeDataValidator {
    static validate(barcodeType, data) {
        const rules = this.getBarcodeRules(barcodeType);

        if (!rules) {
            return this.getNotSupportedBarcodeResult(barcodeType);
        }

        const conditions = this.getConditionsByRules(rules);

        return this.checkConditions(conditions, data);
    }

    static getNotSupportedBarcodeResult(notSupportedBarcodeType) {
        return {
            isValid: false,
            message: `barcode in ${notSupportedBarcodeType} format is not supported`
        }
    }

    static getConditionsByRules({ isNonNumericAvailable, maxLength }) {
        return (
            [
                {
                    check: data => isNonNumericAvailable || this.isNumeric(data),
                    geMessage: () => {},
                },
                {
                    check: data => this.isDataLengthLessOrEqual(data, maxLength),
                    geMessage: () => {},
                }
            ]
        );
    }

    static getBarcodeRules(barcodeType) {
        const rulesByType =
        {
            'CODE39': {
                isNonNumericAvailable: true,
                maxLength: 39
            },
            'EAN13': {
                isNonNumericAvailable: false,
                maxLength: 12
            },
            'EAN8': {
                isNonNumericAvailable: false,
                maxLength: 7
            }
        };

        return rulesByType[barcodeType];
    }

    static checkConditions(conditions, data) {
        for (let condition of conditions) {
            if (!condition.check(data)) {
                return {
                    isValid: false,
                    message: condition.getMessage(),
                }
            }
        }
        return {
            isValid: true
        }
    }

    static isNumeric(data) {
        return /^\d+$/.test(data);
    }

    static isDataLengthLessOrEqual(data, maxLength) {
        return !!data && data.length <= maxLength;
    }

    static isDataLengthEqual(data, fixedLength) {
        return !!data && data.length === fixedLength;
    }
}
