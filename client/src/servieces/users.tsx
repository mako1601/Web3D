import axios from 'axios';

export const fetchUsers = async () => {
    try {
        var response = await axios.get("http://localhost:5000/api/users");
        console.log(response);
    } catch (e) {
        console.error(e);
    }
};