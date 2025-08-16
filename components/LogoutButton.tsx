// app/components/LogoutButton.tsx
'use client';

import { useUser } from "@/context/UserContext";
import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const { setUser } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove the token
    setUser(null); // Clear the user context
    router.push('/auth/login'); // Redirect to login page
  };

  return (
    <button onClick={handleLogout} className="px-4 pl-1 mx-2 py-2 bg-red-600 text-white rounded hover:cursor-pointer">
      Logout
    </button>
  );
};

export default LogoutButton;
