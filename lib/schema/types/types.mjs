/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

class LogicalType {

}

export class LBoolean extends LogicalType {
}

export class LNumber extends LogicalType {
}

export class LInteger extends Number {
}

export class LFloat extends Number {
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
