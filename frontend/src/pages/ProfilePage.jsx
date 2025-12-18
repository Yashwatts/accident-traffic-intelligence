import { useAuthStore } from '../store/authStore';

function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      <p className="text-gray-600 mt-2">Manage your account settings</p>

      <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900">{user?.fullName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <p className="text-gray-900 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
