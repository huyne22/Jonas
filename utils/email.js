import nodemailer from 'nodemailer';
import pug from 'pug';
import htmlToText from 'html-to-text';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Luonghuy <${process.env.EMAIL_FROM}>`;
      }
      newTransport(){
        if(process.env.NODE_ENV === "production"){
            //sendgrid
            return 1;
        }

        //1. Create the transporter
        return nodemailer?.createTransport({
            service: 'gmail',
            auth:{
              user:  process.env.EMAIL_USER,
              pass:  process.env.SENDER_APP_PASSWORD
            }
        })
      }
      async send(template, subject) {
    console.log(__dirname);

        // 1) Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
          firstName: this.firstName,
          url: this.url,
          subject
        });
    
        // 2) Define email options
        const mailOptions = {
          from: this.from,
          to: this.to,
          subject,
          html,
          text: htmlToText.fromString(html)
        };

        await this.newTransport().sendMail(mailOptions);
    }
    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
      }
      async sendPasswordReset() {
        await this.send(
          'passwordReset',
          'Your password reset token (valid for only 10 minutes)'
        );
      }

    //  sendEmail = async (options) => {
    //     try{
    //     // const mailOptions = {
    //     //     from: '"Luonghuy <luonghuy148894@gmail.com>"',
    //     //     to: options.email,
    //     //     subject: options.subject,
    //     //     html: options.message
    //     // };
    //     await transporter.sendMail(mailOptions, (err) => {
    //         if (err) {
    //             console.log(err)
    //         }
    //         // If the email is sent successfully
    //         return res.status(200).json({ message: 'Email sent successfully' });
    //     });
           
    // } catch (error) {
    //     throw new AppError('There was an error sending the email. Try again later', 500);
    // }
    // }
}

