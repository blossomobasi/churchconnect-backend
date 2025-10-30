import { ISendMailOptions } from "@nestjs-modules/mailer";

export class EnqueueMailDto<T extends Record<string, any>> {
    options: ISendMailOptions;
    templateFn: string;
    props: T;
}
