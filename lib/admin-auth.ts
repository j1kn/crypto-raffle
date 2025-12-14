// Helper function to check if user is authenticated as admin (PIN-based)
export const checkAdminAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('admin_authenticated') === 'true';
};

// Helper function to redirect to login if not authenticated
export const requireAdminAuth = (router: any) => {
  if (!checkAdminAuth()) {
    router.push('/superman');
    return false;
  }
  return true;
};

