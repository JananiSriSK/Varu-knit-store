import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";

const UsersList = ({ users = [], onUpdate }) => {
  const [deleting, setDeleting] = useState(null);
  const { addNotification } = useNotification();
  const { user: currentUser } = useAuth();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: "", userRole: "" });

  const handleDeleteClick = (id, userName, userRole) => {
    // Prevent deleting admin users or self
    if (id === currentUser?.id) {
      addNotification('You cannot delete your own account', 'error');
      return;
    }
    
    if (userRole === 'admin') {
      addNotification('Cannot delete admin users', 'error');
      return;
    }
    
    setDeleteModal({ isOpen: true, userId: id, userName, userRole });
  };

  const handleDelete = async () => {
    const { userId } = deleteModal;
    setDeleting(userId);
    try {
      const response = await api.deleteUser(userId);
      const data = await response.json();
      
      if (data.success) {
        addNotification('User deleted successfully', 'success');
        onUpdate(); // Refresh the users list
      } else {
        addNotification(data.message || 'Failed to delete user', 'error');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      addNotification('Failed to delete user', 'error');
    } finally {
      setDeleting(null);
    }
  };



  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Manage Users
      </h2>
      <div className="bg-white rounded-xl shadow-xl p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
          <thead className="bg-gradient-to-r from-[#e8e0ff] to-[#f0ebff]">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Role</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-gray-100/70 hover:bg-gray-50/50 transition-colors duration-200">
                <td className="py-4 px-6 text-gray-800">{user.name}</td>
                <td className="py-4 px-6 text-gray-600">{user.email}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                    user.role === 'admin' ? 'bg-[#e1cffb] text-[#7b5fc4]' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button
                    className={`transition-colors duration-200 disabled:opacity-50 cursor-pointer ${
                      user.role === 'admin' || user._id === currentUser?.id
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#D97878] hover:text-[#c76666]'
                    }`}
                    onClick={() => handleDeleteClick(user._id, user.name, user.role)}
                    disabled={deleting === user._id || user.role === 'admin' || user._id === currentUser?.id}
                    title={user.role === 'admin' ? 'Cannot delete admin users' : user._id === currentUser?.id ? 'Cannot delete yourself' : 'Delete user'}
                  >
                    <Trash2 className="inline h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
