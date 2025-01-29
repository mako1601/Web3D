import axios from 'axios';

export const registerUser = async (
  login: string,
  password: string,
  lastName: string,
  firstName: string,
  middleName: string,
  role: number,
  rememberMe: boolean
) => {
  try {
    var response = await axios.post("http://localhost:5000/api/auth/register", {
      login,
      password,
      lastName,
      firstName,
      middleName,
      role,
      rememberMe
    });
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.error(e);
  }
};

export const loginUser = async (
  login: string,
  password: string,
  rememberMe: boolean
) => {
  try {
    var response = await axios.post("http://localhost:5000/api/auth/login", {
      login,
      password,
      rememberMe
    });
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.error(e);
  }
};

export const fetchUsers = async () => {
  try {
    var response = await axios.get("http://localhost:5000/api/users");
    console.log(response);
  } catch (e) {
    console.error(e);
  }
};