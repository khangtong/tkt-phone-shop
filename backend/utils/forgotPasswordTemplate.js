const forgotPasswordTemplate = ({ name, otpCode }) => {
	return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello ${name},</h2>
        <p>We received a request to reset your password. Use the OTP code below to reset your    password:</p>
        <div style="text-align:center;font-size:30px;font-weight:bold">
            ${otpCode}
        </div>
        </p>
        <p> This code is valid for 30 minutes. Please do not share this code with anyone.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        <p>	Thanks you,</p>
        <p>	Team TKT-Shop</p>
    </div>
    `;
};

export default forgotPasswordTemplate;
