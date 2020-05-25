const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'anvyat19@gmail.com',
        subject: 'Sign up complete',
        text: `Welcome to the app, ${name}`
    })
}

module.exports = {
    sendWelcomeEmail
}