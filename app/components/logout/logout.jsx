import React from 'react'
import { signOut } from 'firebase/auth';
import { auth } from '../configs/config';

const Logout = () => {
      // Функция для выхода из системы
      const logout = async () => {
        try {
          await signOut(auth);
        } catch (error) {
          console.log("Error logging out:", error);
        }
      };

  return (


    <div>
          <button onClick={logout}>Logout</button>

    </div>
  )
}

export default Logout