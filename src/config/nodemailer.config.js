import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendPasswordResetEmail = async (email, resetToken) => {
    // Variable BASE_URL utilizada para permitir subir proyecto a Render y no depender de LocalHost.
    const resetLink = `${process.env.BASE_URL}/reset-password/${resetToken}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperación de Contraseña: El Rincón de Coltrane',
        html: `
            <h2>Recuperación de Contraseña</h2>
            <p>Hola! Recibiste este correo porque solicitaste restablecer tu contraseña.</p>
            <p>Hacé click en el siguiente enlace para crear una nueva contraseña:</p>
            <a href="${resetLink}" style="
                display: inline-block;
                padding: 10px 20px;
                background-color: #6366f1;
                color: white;
                text-decoration: none;
                border-radius: 5px;
            ">Restablecer Contraseña</a>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
            <p>Gracias por utilizar nuestros servicios, te deseamos un buen día!</p>
        `
    };
    await transporter.sendMail(mailOptions);
};

export default transporter;