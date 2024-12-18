# EmailObfuscatorJS

A simple email obfuscator written in JavaScript.

## Table of Contents

- About
- Installation
- API Usage
- Extra Notes
- License

## About

The goal of any email obfuscator is quite straight forward; to scramble an email address in a way where a bot cannot understand it.

But why is this important? Well, believe it or not, just putting in an email address as plain html like in the example below is not quite safe.

```html
<a href="mailto:example@example.com">Example...</a>
```

Doing this (even just be inserting the email into the text content of the a-tag) allows bots to quickly pick up this address and spam your email inbox. Along with that, there are some security issues including, [email address harvesting](https://en.wikipedia.org/wiki/Email-address_harvesting), spam, phising attacks, bot traffic, and the list goes on. You can find many websites that talk about the risks, but hopefully you get the point, there are security risks behind it.

So to combat this, email addresses are obfuscated. In other words, the email string is manipulated in a way where it _is going to be harder_ for a bot to figure out if the email is even real (but the real user, or human, should be able to see the real address).

In this repository is a simple obfuscator written in JavaScript. You can easily include it in your website, and safely display any emails.

## Installation

Just download the single email_obfuscator.js file and include that with the rest of your website files.

## API Usage

Before we get started, you need to already obfuscate the email address. So **before** you go any further, make sure you already have the email obfuscated. This can be done by executing the following example below **in the console** of a browser (just make sure the main email_obfuscator.js file is included in the sources).

```js
const obfuscator = new EmailObfuscator();
const obfuscated_email = obfuscator.obfuscate('example@example.com');
```

You can also optionally include any encryption to help scramble the email even more. The exampe below shows how to acieve this.

```js
const obfuscator = new EmailObfuscator();
const obfuscated_email1 = obfuscator.obfuscate('example@example.com', obfuscator.ENCRYPTION_METHOD.CAESAR_CYPHER); // obfuscates using caesar cipher
const obfuscated_email2 = obfuscator.obfuscate('example@example.com', obfuscator.ENCRYPTION_METHOD.ROT13); // obfuscates using ROT13 encryption

// there are also many ways you can mess around with the bots with the settings property
obfuscator.settings.stop_after_dot = false; // these are just a few rules the obfuscator should follow when encrypting/decrypting
obfuscator.settings.stop_after_at = false;
// when stop_after_dot is set to true, everything will be encrypting until the '.' token is reached in the email (and the ending part of the email e.g. "com" won't be encrypted)
// the same goes with stop_after_at which doesn't encrypt the host name (in "@example.com" the text between the '@' and '.' won't be encrypted with this property set to true)
```

Finally, execute the following JavaScript in your html.

```html
<a id="email" href="#">Some Email...</a>

<script src="email_obfuscator.js"></script>
<script>
    document.body.onload = function() {
        // now unobfuscate the email address and insert into the a-tag
        const obfuscator = new EmailObfuscator();
        const encryption_used = null; // if you used encryption for your email, insert that here: EmailObfuscator.ENCRYPTION_METHOD.CAESAR_CYPHER | EmailObfuscator.ENCRYPTION_METHOD.ROT13
        const readable = obfuscator.unobfuscate('example(at)example(dot)com', encryption_used);
        document.getElementById("email").href = 'mailto:' + readable;
    }
</script>
```

## Extra Notes

To start with, no email obfuscator is full-proof. Bots which are smart may find ways around the obfuscated address, even if the address is encrypted. However, do take note that I implemented the most commonly used methods for obfuscating an email address, and it should stop bots from picking up the email about 90% of the time.

There are some other ways of obfuscating an email address. Based on my research, sometimes the address is obfuscated, and then converted to base64. Typically [Caesar Cipher](https://en.wikipedia.org/wiki/Caesar_cipher) and [Rot13](https://en.wikipedia.org/wiki/ROT13) are the most commonly used encryption methods for scrambling in email address. Note that while these encryptions are known not to be strong, they are more than enough to make it harder for a bot to pick up the actual address.

I do reccomend that one of the above encryption methods is used for obfuscating an email address. Email addresses without it are usually obfuscated to "example(at)example(dot)com" which may stop some bots for learning the address, but it may not stop the smarter ones.

You may also be wondering, if no email obfuscator is full-proof, what other measures can be taken to ensure a much more secure secure web page? Based on my research, the next best thing you can try is implementing bot detection methods. This can include forcing [CAPTCHA](https://en.wikipedia.org/wiki/CAPTCHA) or making simple [honeypots](https://en.wikipedia.org/wiki/Honeypot_(computing)). The most common honeypots I found was making a hidden form element (with some fields), and watching how the bot reacts to the form field. Since the form field is hidden, the user (human) won't see it. The bot may try filling it up and submitting it. Especially if the bot submits that "fake" form quickly (or scrolls through the content very fast in a way where it is noticable and doesn't compare to how fast a human would do it), thats a sign that a bot could be reading the page.

## License

EmailObfuscatorJS is open source! It is licensed under the MIT license.