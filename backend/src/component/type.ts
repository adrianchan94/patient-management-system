export interface Test {
    name: string;
    value: string;
    comment?: string;
    user?: string;
}

export enum ResultType {
    rtpcr = 'rtpcr',
    antibody = 'antibody',
    rtlamp = 'rtlamp',
    antigen = 'antigen',
    coyote = 'coyote',
}
