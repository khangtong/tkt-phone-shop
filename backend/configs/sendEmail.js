import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const sendEmail = async (data, req, res) => {
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			// TODO: replace `user` and `pass` values from <https://forwardemail.net>
			user: process.env.MAIL_ID,
			pass: process.env.MAIL_PW,
		},
	});

	// async..await is not allowed in global scope, must use a wrapper
	async function main() {
		// send mail with defined transport object
		const info = await transporter.sendMail({
			from: 'TKT-Phone-Shop <tktshop@gmail.com>', // sender address
			to: data.to, // list of receivers
			subject: data.subject, // Subject line
			text: data.text, // plain text body
			html: data.html, // html body
		});
	}

	main().catch(console.error);
};

export default sendEmail;
