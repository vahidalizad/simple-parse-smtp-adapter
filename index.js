"use strict";
const path = require('path');
const Email = require('email-templates');


let SimpleParseSmtpAdapter = (adapterOptions) => {
    if (!adapterOptions || !adapterOptions.user || !adapterOptions.password || !adapterOptions.host || !adapterOptions.fromAddress ) {
        throw 'SimpleParseSMTPAdapter requires user, password, host, and fromAddress';
    }

    /**
     * Creates trasporter for send emails with OAuth2 SMTP
     */
     let transportConfig = {
        host: adapterOptions.host,
        port: adapterOptions.port,
        secure: adapterOptions.isSSL,
        name: adapterOptions.name || '127.0.0.1',
        auth: {
            user: adapterOptions.user,
            pass: adapterOptions.password
        },
        tls: {
            rejectUnauthorized: adapterOptions.isTlsRejectUnauthorized !== undefined ? adapterOptions.isTlsRejectUnauthorized : true
        }
    };

    /*
        setting up mail
    */
    const email = new Email({
        message: {
            from: adapterOptions.fromAddress
        },
        transport: transportConfig,
        juice: adapterOptions.templates.cssFolder? true : false,
        juiceResources: {
            preserveImportant: true,
            webResources: {
            //
            // this is the relative directory to your CSS/image assets
            // and its default path is `build/`:
            //
            // e.g. if you have the following in the `<head`> of your template:
            // `<link rel="stylesheet" href="style.css" data-inline="data-inline">`
            // then this assumes that the file `build/style.css` exists
            //
            relativeTo: adapterOptions.templates.cssFolder? path.join(adapterOptions.templates.cssFolder): path.resolve('build')
            //
            // but you might want to change it to something like:
            // relativeTo: path.join(__dirname, '..', 'assets')
            // (so that you can re-use CSS/images that are used in your web-app)
            //
            }
        }
    });

    /**
     * When emailField is defined in adapterOptines return that field
     * if not return the field email and if is undefined returns username
     * 
     * @param Parse Object user
     * @return String email
     */
    let getUserEmail = (user) => {
        let email = user.get('email') || user.get('username');

        if (adapterOptions.emailField) {
            email = user.get(adapterOptions.emailField);
        }

        return email;
    };

    /**
     * Parse use this function by default for sends emails
     * @param mail This object contain to address, subject and email text in plain text
     * @returns {Promise}
     */
    let sendMail = (mail) => {
        const {
            template,
            to,
            data
        } = mail;
        return email.send({
            template: template,
            message: {
                to: to,
                from: adapterOptions.fromAddress
            },
            locals: data
        });
    };

    /**
     * When this method is available parse use for send email for reset password
     * @param data This object contain {appName}, {link} and {user} user is an object parse of User class
     * @returns {Promise}
     */
    let sendPasswordResetEmail = (data) => {
        const userMail = getUserEmail(data.user);
        if (adapterOptions.templates && adapterOptions.templates.resetPassword) {
            sendMail({
                template: adapterOptions.templates.resetPassword.template,
                to: userMail,
                data
            }).then(() => {
                console.log('reset password to', userMail);
            });
        } else {
            throw 'Please input yout template for resetPassword mail'
        }
    };

    /**
     * When this method is available parse use for send email for email verification
     * @param data This object contain {appName}, {link} and {user} user is an object parse of User class
     * @returns {Promise}
     */
    let sendVerificationEmail = (data) => {
        const userMail = getUserEmail(data.user);
        if (adapterOptions.templates && adapterOptions.templates.resetPassword) {
            sendMail({
                template: adapterOptions.templates.verifyEmail.template,
                to: userMail,
                data
            }).then(() => {
                console.log('sent verify email to', userMail);
            });
        } else {
            throw 'Please input yout template for verifyPassword mail'
        }
    };

    return Object.freeze({
        sendMail: sendMail,
        sendPasswordResetEmail: sendPasswordResetEmail,
        sendVerificationEmail: sendVerificationEmail
    });
};

module.exports = SimpleParseSmtpAdapter;
