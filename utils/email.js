import nodemailer from 'nodemailer';
const sendEmail = async (options) => {
    try{
    //1. Create the transporter
    const transporter = nodemailer?.createTransport({
        service: 'gmail',
        auth:{
          user:  process.env.EMAIL_USER,
          pass:  process.env.SENDER_APP_PASSWORD
        }
    })

    const mailOptions = {
        from: '"Luonghuy <luonghuy148894@gmail.com>"',
        to: options.email,
        subject: options.subject,
        html: options.message
    };
    await transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.log(err)
        }
        // If the email is sent successfully
        return res.status(200).json({ message: 'Email sent successfully' });
    });
       
} catch (error) {
    throw new AppError('There was an error sending the email. Try again later', 500);
}
}

export {sendEmail};
