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

export const getUserById = async (id: number) => {
  try {
    var response = await axios.get(`http://localhost:5000/api/users/${id}`);
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.error(e);
  }
};

export const getAllUsers = async (name: string, orderBy: string, sortDirection: number, currentPage: number, pageSize: number) => {
  try {
    const response = await axios.get("http://localhost:5000/api/users", {
      params: {
        name,
        orderBy,
        sortDirection,
        currentPage,
        pageSize
      }
    });

    return response.data;
  } catch (e) {
    console.error(e);
    return { data: [], totalCount: 0 };
  }
};