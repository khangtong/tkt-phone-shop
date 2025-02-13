import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			default: '',
		},
		phone: {
			type: String,
			default: null,
		},
		role: {
			type: String,
			enum: ['USER', 'ADMIN'],
			default: 'USER',
		},
		refresh_token: {
			type: String,
			default: '',
		},
		verify_email: {
			type: Boolean,
			default: false,
		},
		shopping_cart: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'cart',
			},
		],
		passwordResetOTP: {
			type: String,
			default: '',
		},
		passwordResetExpires: {
			type: Date,
			default: '',
		},
	},
	{ timestamps: true },
);

// Hash password before saving
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(this.password, salt);
		this.password = hashedPassword;
		return next();
	} catch (err) {
		return next(err); // Corrected this line
	}
});

// Compare password entered
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.model('user', userSchema);

export default userModel;
