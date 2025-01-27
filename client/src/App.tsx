import { useEffect } from "react";
import { fetchUsers } from "./servieces/users";

function App() {
  useEffect(() => { 
    const fetchData = async () => {
      await fetchUsers();
    } 

    fetchData();
  }, [])
  
  return([])
}

export default App
