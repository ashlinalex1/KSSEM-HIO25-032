import axios from "axios";

export const sendEmail = async (email: string) => {
        try {
            
            if (email) {
                // Send to a specific email if provided
                const res = await axios.post("http://localhost:5000/api/email", { 
                    recipient_email: email,
                    subject: "Emergency Alert: Disaster Warning",
                    message: "This is an important alert regarding an ongoing disaster situation. Please take necessary precautions and follow official guidelines."
                });
                console.log(res.data);
            }
        } catch (error) {
            console.log("Error in sendEmail:", error);
        }
    }