
import { Outlet, Navigate } from 'react-router-dom';


function ProtectedRoute() {
  const value = localStorage.getItem('token');

 return value ? (
      <>
      
          <main className="flex-1 pt-8 container mx-auto">
            
            <Outlet />
            
          </main>
    
      </>
    ) : (
      <Navigate to="/" replace />
    );
}

export default ProtectedRoute;
