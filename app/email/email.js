const nodemailer = require("nodemailer");

exports.sendEmail = async (to,from,subject,text,body) => {
    
    let response = {
        status: false,
        message: "",
    }

    try
    {
        

        let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth:{
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            }, 
        });
    
        let mailOptions = {
            from,
            to,
            subject,
            text,
            html: body,
        };

        let info = await transporter.sendMail(mailOptions);

        let sendMailResponse = info && info.response ? info.response : "Send Email Error";

        console.log("Email Sent => ", info.response);

        response = {
            ...response,
            status: true,
            message: sendMailResponse, 
        };
        
        return response;
    }
    catch(err)
    {
        console.log("Email Sent Error - Try Catch => ",err.message);
        response = {
            ...response,
            status: false,
            message: err.message, 
        };
        return response;
    }

    


};