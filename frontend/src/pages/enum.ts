export const ElementTypeName = {
    TEXTBOX_NUMERIC: 'textbox_numeric',
    TEXTBOX_ALPHANUMERIC: 'textbox_alphanumeric',
    DROPDOWN_SINGLE: 'dropdown_single',
    DROPDOWN_MULTI: 'dropdown_multi',
} as const;

export type ElementTypeName = typeof ElementTypeName[keyof typeof ElementTypeName];
