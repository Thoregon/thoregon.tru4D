/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

class LogicalType {
    get name() {
        return "type";
    }

    /**
     * return a formatting function
     * with value and format as params
     *
     * @return {function(*,string)}
     */
    get formater() {
        return (value, format) => value != null ? value.toString() : '';
    }

    get formatPattern() {

    }
}

export class LBoolean extends LogicalType {
}

export class LNumber extends LogicalType {
}

export class LInteger extends LNumber {
}

export class LFloat extends LNumber {
}

export class LString extends LogicalType {
}

export class LStream extends LogicalType {
}

export class LLink extends LogicalType {
}

// ? specialzed Date and Time ?
export class LDateTime extends LogicalType {
}

export class LDuration extends LogicalType {
}

export class LImage extends LogicalType {
}

export class LCollection extends LogicalType {
}

export class LMap extends LogicalType {
}

export class LSet extends LogicalType {
}

export class Reference extends LogicalType {
}

export class SchemaReference extends Reference {
}
