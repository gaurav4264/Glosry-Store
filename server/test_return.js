
import axios from 'axios';
import FormData from 'form-data';

const testReturn = async () => {
    try {
        const form = new FormData();
        form.append('orderId', '67b384f51e36093158c563e4'); // Dummy valid-looking ID
        form.append('reason', 'Test Reason');
        form.append('userId', 'userOfSomeSort');

        console.log("Sending request...");
        const response = await axios.post('http://localhost:4000/api/order/return', form, {
            headers: {
                ...form.getHeaders(),
                'token': 'some_jwt_token_if_needed' // Auth middleware might block if invalid
            },
            validateStatus: () => true // Allow all status codes
        });

        console.log("Status:", response.status);
        console.log("Data:", response.data);
    } catch (error) {
        console.error("Error:", error.message);
    }
};

testReturn();
