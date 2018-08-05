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

    // setting up mail
    const email = new Email({
        views: { root: adapterOptions.templates.templateRoot },
        message: {
            from: adapterOptions.fromAddress
        },
        transport: transportConfig,
        juice: true,
        juiceResources: {
            preserveImportant: true,
            webResources: {
            relativeTo: adapterOptions.templates.templateRoot
            }
        }
    });

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
            template,
            message: {
                to
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
                console.log('sent reset password to', userMail);
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
        if (adapterOptions.templates && adapterOptions.templates.verifyEmail) {
            sendMail({
                template: adapterOptions.templates.verifyEmail.template,
                to: userMail,
                data
            }).then(() => {
                console.log('sent verify email to', userMail);
            });
        } else {
            throw 'Please input yout template for verifyEmail mail'
        }
    };

    return Object.freeze({
        sendMail,
        sendPasswordResetEmail,
        sendVerificationEmail
    });
};

module.exports = SimpleParseSmtpAdapter;
