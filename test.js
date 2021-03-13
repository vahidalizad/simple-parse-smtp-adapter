const dotenv = require('dotenv');
dotenv.config();
const Email = require('email-templates');

const data = {
    appName: 'TestTest',
    link: 'https://www.test.com'
}

const userMail = process.env.EMAIL_TO;

let transportConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
};

// setting up mail
const email = new Email({
    views: { root: './' },
    message: {
        from: process.env.EMAIL_FROM
    },
    transport: transportConfig,
    send: true,
    juice: true,
    // preview: true,
    juiceResources: {
        preserveImportant: true,
        webResources: {
            relativeTo: './'
        }
    }
});

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


sendMail({
    template: 'reset',
    to: userMail,
    data
}).then(() => {
    console.log('sent reset password to', userMail);
}).catch((e) => {
    console.log('Test Error: ', e)
});