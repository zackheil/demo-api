import { 
    object, 
    number, 
    string, 
    ipv4,
    array,
    Output,
    optional
} from "valibot";

export const UserSchema = object({
    ip: string([ipv4()]),
    hash: optional(string()),
    tokens: array(number())
});
export type User = Output<typeof UserSchema>;