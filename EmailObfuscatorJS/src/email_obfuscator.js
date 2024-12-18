/**
 * EmailObfuscatorJS
 * (c) Michael Shapiro
 * @version 1.0
 */

"use strict"

/**
 * Current version of script
 */
const EMAIL_OBFUSCATORJS_VERSION = 1.0;

//MARK: EMAIL TOKENS
const EMAIL_TOKENS = Object.freeze({
    TT_LETTER: 'LETTER',
    TT_AT: 'AT_SYMBOL',
    TT_SYMBOL: 'SYMBOL',
    TT_DOT: 'DOT'
});

/**
 * An email token
 */
class EmailToken {

    /**
     * Initializes with a type and value
     * @param {String} type Required. The token type
     * @param {String} value Required. The token value
     */
    constructor(type, value) {
        this.type = type
        this.value = value
    }
}

/**
 * A lexer for dividing up the email. This is to help identify certain tokens which can be encrypted
 */
class EmailLexer {

    /**
     * Initializes the lexer given an email
     * @param {String} email Required. The email
     */
    constructor(email) {
        this.email = email;
        this.current_token_index = -1;
        this.current_token = null
        this.alpha_num = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'])
    }

    /**
     * Advances the token
     */
    advance() {
        if(this.current_token_index + 1 >= this.email.length) {
            this.current_token = null;
            return;
        }

        this.current_token_index += 1;
        this.current_token = this.email.substring(this.current_token_index, this.current_token_index + 1);
    }
    /**
     * Makes the tokens of this email
     * @returns Array<EmailToken>
     */
    makeTokens() {
        let tokens = [];

        this.advance();
        // we don't have to check for much in lexing
        // just the syntax
        // the whole point of lexing is to quickly identify key tokens

        while(this.current_token !== null) {
            if(this.alpha_num.has(this.current_token.toLowerCase())) {
                tokens.push(new EmailToken(EMAIL_TOKENS.TT_LETTER, this.current_token));
                this.advance()
                continue;
            } else if(this.current_token == '@') {
                tokens.push(new EmailToken(EMAIL_TOKENS.TT_AT, '@'));
                this.advance();
                continue;
            } else if(this.current_token == '.') {
                tokens.push(new EmailToken(EMAIL_TOKENS.TT_DOT, '.'));
                this.advance();
                continue;
            }

            // just symbol
            tokens.push(new EmailToken(EMAIL_TOKENS.TT_SYMBOL, this.current_token));
            this.advance();
        }

        return tokens;
    }
}

/**
 * Core class that manages obfuscating and de-obfuscating the email
 */
class EmailObfuscator {

    /**
     * Encryption methods (these are the ones typically used in email obfuscation)
     */
    ENCRYPTION_METHOD = Object.freeze({
        CAESAR_CYPHER: 'CAESAR_CYPHER',
        ROT13: 'ROT13'
    });

    /**
     * Just an empty constructor to set some properties
     */
    constructor() {
        /**
         * Settings when encoding/decoding
         */
        this.settings = {
            /**
             * Determines if the email obfuscation should stop when it reaches the '.' character
             * In other words, during encrypting, 'example@example.com' could be encrypted into '1rakled(at)1ralked(dot)com' when this is set to true (otherwise 'com' will also be encrypted)
             * It is set to true to trick spam bots more easily into accepting the 'fake' email
             */
            stop_after_dot: true,
            /**
             * Similar to stop_after_dot, except stops after the '@' symbol. This would encrypt everything before that symbol, and nothing after that (except if stop_after_dot is set to true, everything after the dot will be encrypted)
             */
            stop_after_at: false
        }
    }

    /**
     * Simple substitution for encryption
     * @param {String} old_spot Required. The old character
     * @param {Number} shift Required. The shift count
     * @returns String. The substituted character
     */
    substitute(old_spot, shift) {
        const normal = 'abcdefghjiklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPRQSTUVWXYZ'.split('');

        const sp = normal.indexOf(old_spot);
        const np = normal[(sp + shift) % normal.length];

        return np;
    }
    /**
     * Just an encryption with caesar cypher
     * @param {Array<EmailToken>} tokens Required. The tokens to encrypt
     * @returns The encrypted tokens
     */
    caesarCypherEncrypt(tokens) {
        // there are many ways we can approach this
        // we will keep the shift very simple
        
        for(var i = 0; i < tokens.length; i++) {
            if(tokens[i].type == EMAIL_TOKENS.TT_LETTER) {
                // swap off
                // use encryption formula for this
                tokens[i].value = this.substitute(tokens[i].value, 4);
            } else if(tokens[i].type == EMAIL_TOKENS.TT_AT) {
                // lets set if anything after '@' should be encrypted
                if(this.settings.stop_after_at) {
                    // skip over
                    let z = i + 0;
                    while(z < tokens.length && tokens[z].type !== EMAIL_TOKENS.TT_DOT) {
                        z += 1;
                    }

                    i = z - 1;
                }
            } else if(tokens[i].type == EMAIL_TOKENS.TT_DOT) {
                // we can just stop here
                if(this.settings.stop_after_dot) {
                    break;
                }
            }
        }

        return tokens;
    }
    /**
     * For decrypting the tokens
     * @param {Array<EmailToken>} tokens Required. The tokens to decrypt
     * @returns The decrypted tokens
     */
    caesarCypherDecrypt(tokens) {
        // same operation as before
        // just the reverse

        for(var i = 0; i < tokens.length; i++) {
            if(tokens[i].type == TT_LETTER) {
                tokens[i].value = this.substitute(tokens[i].value, -4);
            } else if(tokens[i].type == EMAIL_TOKENS.TT_AT) {
                if(this.settings.stop_after_at) {
                    // skip over
                    let z = i + 0;
                    while(z < tokens.length && tokens[z].type !== EMAIL_TOKENS.TT_DOT) {
                        z += 1;
                    }

                    i = z - 1;
                }
            } else if(tokens[i].type == EMAIL_TOKENS.TT_DOT) {
                if(this.settings.stop_after_dot) {
                    break;
                }
            }
        }

        return tokens;
    }
    /**
     * Encryption with ROT13
     * @param {Array<EmailToken>} tokens Required. The tokens to encrypt
     * @returns The encrypted tokens
     */
    rot13Encrypt(tokens) {
        // this is similar to caesar
        for(var i = 0; i < tokens.length; i++) {
            if(tokens[i].type == EMAIL_TOKENS.TT_LETTER) {
                tokens[i].value = this.substitute(tokens[i].value, 13);
            } else if(tokens[i].type == EMAIL_TOKENS.TT_AT) {
                if(this.settings.stop_after_at) {
                    // skip over
                    let z = i + 0;
                    while(z < tokens.length && tokens[z].type !== EMAIL_TOKENS.TT_DOT) {
                        z += 1;
                    }

                    i = z - 1;
                }
            } else if(tokens[i].type == EMAIL_TOKENS.TT_DOT) {
                if(this.settings.stop_after_dot) {
                    break;
                }
            }
        }

        return tokens;
    }
    /**
     * Description with rot13
     * @param {Array<EmailToken>} tokens Required. The tokens to decrypt
     * The decrypted tokens
     */
    rot13Decrypt(tokens) {
        for(var i = 0; i < tokens.length; i++) {
            if(tokens[i].type == EMAIL_TOKENS.TT_LETTER) {
                tokens[i].value = this.substitute(tokens[i].value, -13);
            } else if(tokens[i].type == EMAIL_TOKENS.TT_AT) {
                if(this.settings.stop_after_at) {
                    // skip over
                    let z = i + 0;
                    while(z < tokens.length && tokens[z].type !== EMAIL_TOKENS.TT_DOT) {
                        z += 1;
                    }

                    i = z - 1;
                }
            } else if(tokens[i].type == EMAIL_TOKENS.TT_DOT) {
                if(this.settings.stop_after_dot) {
                    break;
                }
            }
        }

        return tokens;
    }
    /**
     * Merges the tokens into the email string
     * @param {Array<EmailToken>} tokens Required. The tokens to merge
     * @returns String
     */
    mergeTokens(tokens) {
        let fixed = '';

        for(var i = 0; i < tokens.length; i++) {
            fixed += tokens[i].value;
        }

        return fixed;
    }
    /**
     * Obfuscates the email
     * @param {String} email Required. The email to obfuscate
     * @param {String} [encryption=null] Optional. If an encryption method should be applied. See ENCRYPTION_METHOD for available algorithms
     * @returns String (the obfuscated email)
     */
    obfuscate(email, encryption = null) {
        // lets apply the lexer on this
        const lexer = new EmailLexer(email);
        // make the tokens
        let tokens = lexer.makeTokens();

        // lets apply any kind of encryption first
        if(encryption !== null) {
            // applying encryption first is a fantastic step
            // since the code after that replaces characters like '@' with '(at)',
            // when the obfuscated email is put into something like 'mailto:', the spam bot can assume that the email is valid
            // since all it would have to do is revert the '(at)' back to '@'
            // hence, it may never end up decrypting the text
            if(encryption == this.ENCRYPTION_METHOD.CAESAR_CYPHER) {
                tokens = this.caesarCypherEncrypt(tokens);
            } else if(encryption == this.ENCRYPTION_METHOD.ROT13) {
                tokens = this.rot13Encrypt(tokens);
            } else {
                // strange encryption method
                throw new Error(`Unknown encryption method ${encryption}`);
            }
        } else {
            console.warn('No encryption parameters were passed in. The obfuscated email may be easy for most sophisticated bots to crack..')
        }

        // we can start by fixing up the '@' and '.' here so it is harder for bots to pick up
        for(var i = 0; i < tokens.length; i++) {
            if(tokens[i].type == EMAIL_TOKENS.TT_AT) {
                // swap off
                tokens[i].value = '(at)';
            } else if(tokens[i].type == EMAIL_TOKENS.TT_DOT) {
                // swap off
                tokens[i].value = '(dot)';
            }
        }

        return this.mergeTokens(tokens);
    }
    /**
     * Undoes the obfuscation to the email
     * @param {String} email Required. The emailt to undo ubfuscation on
     * @param {String} [encryption=null] Optional. If encryption was used during the obfuccation process
     * @returns String (the actual email) 
     */
    unobfuscate(email, encryption = null) {
        // make tokens
        const lexer = new EmailLexer(email);
        let tokens = lexer.makeTokens();

        // now we just have to identify all the '@' and '.' symbols and fix them
        for(var i = 0; i < tokens.length; i++) {
            if(tokens[i].value == '(') {
                // we must have at least 3 more tokens present
                if(i + 3 >= tokens.length) {
                    throw new Error('The given text is not an obfuscated email');
                }

                let replace = '';
                let replace_length = 0;
                if(tokens[i + 1].value.toLowerCase() == 'd') {
                    // okay, we need 4 more tokens now
                    if(i + 4 >= tokens.length) {
                        throw new Error('The given text is not an obfuscated email');
                    }
                    const one = tokens[i + 2].value.toLowerCase() + tokens[i + 3].value.toLowerCase() + tokens[i + 4].value.toLowerCase();
                    if(one !== 'ot)') {
                        throw new Error('The given text is not an obfuscated email');
                    }

                    // okay now we have the replacement
                    replace_length = 4;
                    replace = '.';
                } else if(tokens[i + 1].value.toLowerCase() == 'a') {
                    const one = tokens[i + 2].value.toLowerCase() + tokens[i + 3].value.toLowerCase();

                    if(one !== 't)') {
                        throw new Error('The given text is not an obfuscated email');
                    }

                    replace_length = 3;
                    replace = '@';
                }

                // do the remove and fix this token
                tokens.splice(i + 1, replace_length);
                if(replace == '@') {
                    tokens[i].type = EMAIL_TOKENS.TT_AT;
                    tokens[i].value = '@';
                } else {
                    // must be '.'
                    tokens[i].type = EMAIL_TOKENS.TT_DOT;
                    tokens[i].value = '.';
                }
            }
        }

        // if we have some kind of encryption, we have to undo that
        if(encryption !== null) {
            if(encryption == this.ENCRYPTION_METHOD.CAESAR_CYPHER) {
                tokens = this.caesarCypherDecrypt(tokens);
            } else if(encryption == this.ENCRYPTION_METHOD.ROT13) {
                tokens = this.rot13Decrypt(tokens);
            } else {
                throw new Error(`Unknown decryption method: ${encryption}`);
            }
        }

        // we should be done
        return this.mergeTokens(tokens);
    }
}
